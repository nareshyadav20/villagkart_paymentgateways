import { PrismaClient, PaymentStatus, OrderStatus } from '@prisma/client';
import { ICICIClient } from './icici/iciciClient.js';
import { verifySecureHash, maskSensitiveData } from '../utils/iciciHash.js';
import { config } from '../config/index.js';

const prisma = new PrismaClient();

/**
 * Generate unique merchant transaction number:
 * Alphanumeric, max 20 characters, unique per transaction
 */
export function generateMerchantTxnNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase(); // ~8 chars
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // ~6 chars
  const txnNo = `PB${timestamp}${random}`.substring(0, 20);
  return txnNo;
}

export class PaymentService {
  /**
   * Initiate Payment for an existing Order
   */
  static async initiatePayment(params: {
    orderId: string;
    paymentMode: 'CARD' | 'NB' | 'WALLET' | 'UPI' | 'QR' | string;
    paymentOption?: string;
  }) {
    const { orderId, paymentMode, paymentOption } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.PAID) {
      throw new Error('This order has already been paid for.');
    }

    // Backend-verified amount
    const verifiedAmount = order.totalAmount;
    const merchantTxnNo = generateMerchantTxnNo();

    // Create PaymentTransaction in database
    const transaction = await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        merchantTxnNo,
        amount: verifiedAmount,
        currencyCode: config.icici.currencyCode,
        paymentMode,
        paymentOption: paymentOption || undefined,
        status: PaymentStatus.INITIATED
      }
    });

    try {
      const gatewayResponse = await ICICIClient.initiateSale({
        merchantTxnNo,
        amount: verifiedAmount,
        paymentMode,
        paymentOption,
        customerName: order.customerName,
        customerEmailID: order.customerEmail,
        customerMobileNo: order.customerMobile,
        billingData: {
          address: order.shippingAddress,
          city: order.city,
          state: order.state,
          pincode: order.pincode
        }
      });

      const responseCode = gatewayResponse.responseCode;
      const responseDesc = gatewayResponse.responseDescription || '';
      const tranCtx = gatewayResponse.tranCtx;
      const redirectURI = gatewayResponse.redirectURI;
      const qrData = gatewayResponse.qrData;
      const showOTPCapturePage = gatewayResponse.showOTPCapturePage;

      let nextStatus: PaymentStatus = PaymentStatus.INITIATED;
      if (showOTPCapturePage === 'Y') {
        nextStatus = PaymentStatus.PENDING_OTP;
      } else if (qrData || paymentMode === 'QR') {
        nextStatus = PaymentStatus.PENDING_QR;
      } else if (redirectURI) {
        nextStatus = PaymentStatus.PENDING_REDIRECT;
      }

      // Update transaction with gateway info
      const updatedTxn = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          responseCode,
          responseDescription: responseDesc,
          tranCtx,
          redirectURI,
          qrData,
          showOTPCapturePage,
          status: nextStatus,
          rawResponse: maskSensitiveData(gatewayResponse),
          hashVerified: !!gatewayResponse.secureHash
        }
      });

      // Record attempt
      await prisma.paymentAttempt.create({
        data: {
          transactionId: transaction.id,
          attemptType: 'INITIATE',
          requestPayload: maskSensitiveData({ orderId, merchantTxnNo, paymentMode, amount: verifiedAmount }),
          responsePayload: maskSensitiveData(gatewayResponse),
          statusCode: 200
        }
      });

      return {
        transactionId: updatedTxn.id,
        merchantTxnNo,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: verifiedAmount,
        paymentMode,
        responseCode,
        responseDescription: responseDesc,
        showOTPCapturePage,
        redirectURI,
        qrData,
        tranCtx,
        status: nextStatus
      };
    } catch (err: any) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: PaymentStatus.FAILED,
          responseDescription: err.message
        }
      });
      throw err;
    }
  }

  /**
   * Request OTP generation for an active transaction
   */
  static async generateOTP(tranCtx: string) {
    if (!tranCtx) {
      throw new Error('tranCtx parameter is required');
    }

    const transaction = await prisma.paymentTransaction.findFirst({
      where: { tranCtx }
    });

    if (!transaction) {
      throw new Error('Transaction not found for provided tranCtx');
    }

    const res = await ICICIClient.generateOTP(tranCtx);

    await prisma.paymentAttempt.create({
      data: {
        transactionId: transaction.id,
        attemptType: 'OTP_GENERATE',
        requestPayload: { tranCtx },
        responsePayload: maskSensitiveData(res),
        statusCode: 200
      }
    });

    return res;
  }

  /**
   * Verify 6-digit OTP
   */
  static async verifyOTP(tranCtx: string, otp: string) {
    if (!tranCtx || !otp) {
      throw new Error('tranCtx and otp are required');
    }

    const transaction = await prisma.paymentTransaction.findFirst({
      where: { tranCtx }
    });

    if (!transaction) {
      throw new Error('Transaction context not found');
    }

    const res = await ICICIClient.verifyOTP({ tranCtx, otp });

    await prisma.paymentAttempt.create({
      data: {
        transactionId: transaction.id,
        attemptType: 'OTP_VERIFY',
        requestPayload: { tranCtx, otp: '******' },
        responsePayload: maskSensitiveData(res),
        statusCode: 200
      }
    });

    return res;
  }

  /**
   * Authorize payment after OTP verification
   */
  static async authorize(tranCtx: string) {
    if (!tranCtx) {
      throw new Error('tranCtx parameter is required');
    }

    const transaction = await prisma.paymentTransaction.findFirst({
      where: { tranCtx },
      include: { order: true }
    });

    if (!transaction) {
      throw new Error('Transaction context not found');
    }

    const res = await ICICIClient.authorize({ tranCtx });

    const isSuccess = res.responseCode === '000' || res.responseCode === '0000';

    const updatedTxn = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
        responseCode: res.responseCode,
        responseDescription: res.responseDescription || (isSuccess ? 'Authorized Successfully' : 'Authorization Failed'),
        txnId: res.txnId || transaction.txnId,
        paymentId: res.paymentId || transaction.paymentId,
        rawResponse: maskSensitiveData(res)
      }
    });

    if (isSuccess) {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: OrderStatus.PAID }
      });
    }

    await prisma.paymentAttempt.create({
      data: {
        transactionId: transaction.id,
        attemptType: 'AUTHORIZE',
        requestPayload: { tranCtx },
        responsePayload: maskSensitiveData(res),
        statusCode: 200
      }
    });

    return {
      success: isSuccess,
      transactionId: updatedTxn.id,
      merchantTxnNo: updatedTxn.merchantTxnNo,
      orderNumber: transaction.order.orderNumber,
      amount: updatedTxn.amount,
      responseCode: res.responseCode,
      responseDescription: res.responseDescription,
      txnId: updatedTxn.txnId,
      status: updatedTxn.status
    };
  }

  /**
   * Handle Gateway Return Callback (Merchant Return URL)
   */
  static async handleCallback(payload: Record<string, any>, ipAddress?: string) {
    const merchantTxnNo = payload.merchantTxnNo || payload.originalTxnNo;
    const secureHash = payload.secureHash || payload.hash;

    // Record callback payload
    let hashVerified = false;
    if (secureHash && config.icici.secretKey) {
      hashVerified = verifySecureHash(payload, secureHash, config.icici.secretKey);
    }

    if (merchantTxnNo) {
      await prisma.paymentCallback.create({
        data: {
          merchantTxnNo,
          payload: maskSensitiveData(payload),
          hashVerified,
          ipAddress
        }
      });
    }

    if (!merchantTxnNo) {
      throw new Error('Callback payload missing merchantTxnNo');
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { merchantTxnNo },
      include: { order: true }
    });

    if (!transaction) {
      throw new Error(`Transaction ${merchantTxnNo} not found for callback`);
    }

    const responseCode = payload.responseCode || payload.respCode || '999';
    const isSuccess = responseCode === '000' || responseCode === '0000';

    const updatedTxn = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
        responseCode,
        responseDescription: payload.responseDescription || payload.respDesc || (isSuccess ? 'Payment Successful' : 'Payment Failed'),
        txnId: payload.txnId || transaction.txnId,
        paymentId: payload.paymentId || transaction.paymentId,
        hashVerified,
        rawResponse: maskSensitiveData(payload)
      }
    });

    if (isSuccess) {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: OrderStatus.PAID }
      });
    }

    return {
      merchantTxnNo: updatedTxn.merchantTxnNo,
      orderNumber: transaction.order.orderNumber,
      status: updatedTxn.status,
      responseCode: updatedTxn.responseCode
    };
  }

  /**
   * Query Transaction Status
   */
  static async queryTransactionStatus(merchantTxnNo: string) {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { merchantTxnNo },
      include: { order: true }
    });

    if (!transaction) {
      throw new Error(`Transaction ${merchantTxnNo} not found`);
    }

    const gatewayRes = await ICICIClient.queryStatus({
      merchantTxnNo,
      originalTxnNo: merchantTxnNo
    });

    const isSuccess = gatewayRes.responseCode === '000' || gatewayRes.responseCode === '0000' || gatewayRes.status === 'SUCCESS';

    if (isSuccess && transaction.status !== PaymentStatus.SUCCESS) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: PaymentStatus.SUCCESS,
          responseCode: gatewayRes.responseCode,
          responseDescription: gatewayRes.responseDescription || 'Success from status query',
          txnId: gatewayRes.txnId || transaction.txnId,
          paymentId: gatewayRes.paymentId || transaction.paymentId
        }
      });

      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: OrderStatus.PAID }
      });
    }

    return gatewayRes;
  }

  /**
   * Refund Transaction
   */
  static async processRefund(params: {
    merchantTxnNo: string;
    amount: number;
    reason?: string;
  }) {
    const { merchantTxnNo, amount, reason } = params;

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { merchantTxnNo },
      include: { order: true, refunds: true }
    });

    if (!transaction) {
      throw new Error(`Transaction ${merchantTxnNo} not found`);
    }

    if (transaction.status !== PaymentStatus.SUCCESS) {
      throw new Error('Only successful transactions can be refunded');
    }

    const totalRefunded = transaction.refunds.reduce((sum, r) => sum + r.amount, 0);
    if (totalRefunded + amount > transaction.amount) {
      throw new Error(`Total refund (${totalRefunded + amount}) exceeds captured amount (${transaction.amount})`);
    }

    const refundTxnNo = `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const gatewayRes = await ICICIClient.refund({
      merchantTxnNo: refundTxnNo,
      originalTxnNo: merchantTxnNo,
      amount,
      refundTxnNo
    });

    const isSuccess = gatewayRes.responseCode === '000' || gatewayRes.responseCode === '0000' || gatewayRes.status === 'SUCCESS';

    const refund = await prisma.refund.create({
      data: {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        refundTxnNo,
        amount,
        reason: reason || 'Customer requested test refund',
        responseCode: gatewayRes.responseCode,
        responseDescription: gatewayRes.responseDescription,
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        rawResponse: maskSensitiveData(gatewayRes)
      }
    });

    if (isSuccess) {
      const isFullRefund = totalRefunded + amount >= transaction.amount;
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED
        }
      });

      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: isFullRefund ? OrderStatus.REFUNDED : OrderStatus.PARTIALLY_REFUNDED
        }
      });
    }

    return {
      refundId: refund.id,
      refundTxnNo,
      amount,
      status: refund.status,
      responseCode: gatewayRes.responseCode,
      responseDescription: gatewayRes.responseDescription
    };
  }

  /**
   * Fetch developer transaction logs
   */
  static async getTransactionLogs(limit: number = 25) {
    const transactions = await prisma.paymentTransaction.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        order: true,
        refunds: true,
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    return transactions;
  }
}
