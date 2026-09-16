import { generateSecureHash } from '../../utils/iciciHash.js';
import { config } from '../../config/index.js';

interface MockTransactionState {
  merchantTxnNo: string;
  amount: number;
  paymentMode: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  tranCtx: string;
  otp?: string;
  otpVerified: boolean;
  status: 'INITIATED' | 'PENDING_OTP' | 'PENDING_REDIRECT' | 'PENDING_QR' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  txnId: string;
  paymentId: string;
  createdAt: number;
}

// In-memory store for mock gateway transactions
const mockStore = new Map<string, MockTransactionState>();

export class MockICICIGateway {
  static initiateSale(params: Record<string, any>) {
    const {
      merchantId,
      merchantTxnNo,
      amount,
      currencyCode = '356',
      paymentMode,
      customerName,
      customerMobileNo,
      customerEmailID
    } = params;

    const tranCtx = `CTX_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const txnId = `ICICI_TXN_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const paymentId = `PAY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    let showOTPCapturePage = 'N';
    let redirectURI = '';
    let qrData = '';

    if (paymentMode === 'CARD') {
      showOTPCapturePage = 'Y';
    } else if (paymentMode === 'QR' || paymentMode === 'UPI_QR') {
      qrData = `upi://pay?pa=prasanthbazar@icici&pn=PRASANTH+BAZAR&mc=5411&tr=${merchantTxnNo}&am=${amount}&cu=INR&invoiceDate=${new Date().toISOString()}`;
    } else {
      redirectURI = `${config.frontendUrl}/mock-bank-redirect?merchantTxnNo=${merchantTxnNo}&amount=${amount}&mode=${paymentMode}`;
    }

    const state: MockTransactionState = {
      merchantTxnNo,
      amount: Number(amount),
      paymentMode,
      customerName,
      customerMobile: customerMobileNo,
      customerEmail: customerEmailID,
      tranCtx,
      otp: '123456',
      otpVerified: false,
      status: showOTPCapturePage === 'Y' ? 'PENDING_OTP' : (qrData ? 'PENDING_QR' : 'PENDING_REDIRECT'),
      txnId,
      paymentId,
      createdAt: Date.now()
    };

    mockStore.set(tranCtx, state);
    mockStore.set(merchantTxnNo, state);

    const responsePayload: Record<string, any> = {
      responseCode: 'R1000',
      responseDescription: 'Request initiated successfully',
      merchantId: merchantId || config.icici.merchantId,
      merchantTxnNo,
      tranCtx,
      txnId,
      amount: String(amount),
      currencyCode,
      showOTPCapturePage,
      redirectURI: redirectURI || undefined,
      qrData: qrData || undefined,
      generateOTPURI: `/api/payment/generate-otp?tranCtx=${tranCtx}`,
      authorizeURI: `/api/payment/authorize`
    };

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'values');
    return responsePayload;
  }

  static generateOTP(tranCtx: string) {
    const state = mockStore.get(tranCtx);
    if (!state) {
      return {
        responseCode: '999',
        responseDescription: 'Invalid transaction context (tranCtx)'
      };
    }

    state.otp = '123456';
    state.otpVerified = false;

    const responsePayload: Record<string, any> = {
      responseCode: '000',
      responseDescription: 'OTP generated and sent to mobile',
      tranCtx,
      maskedMobileNo: `XXXXXX${state.customerMobile?.slice(-4) || '9999'}`
    };

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'values');
    return responsePayload;
  }

  static verifyOTP(tranCtx: string, otp: string) {
    const state = mockStore.get(tranCtx);
    if (!state) {
      return {
        responseCode: '999',
        responseDescription: 'Invalid transaction context'
      };
    }

    if (otp === '123456' || (otp && otp.length === 6 && /^\d+$/.test(otp))) {
      state.otpVerified = true;
      const responsePayload: Record<string, any> = {
        responseCode: '000',
        responseDescription: 'OTP verified successfully',
        tranCtx,
        verificationStatus: 'SUCCESS'
      };
      responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'values');
      return responsePayload;
    } else {
      return {
        responseCode: '001',
        responseDescription: 'Invalid OTP. Please enter 123456 for testing.',
        tranCtx
      };
    }
  }

  static authorize(tranCtx: string) {
    const state = mockStore.get(tranCtx);
    if (!state) {
      return {
        responseCode: '999',
        responseDescription: 'Transaction context not found'
      };
    }

    state.status = 'SUCCESS';

    const responsePayload: Record<string, any> = {
      responseCode: '000',
      responseDescription: 'Transaction Authorized Successfully',
      merchantTxnNo: state.merchantTxnNo,
      txnId: state.txnId,
      paymentId: state.paymentId,
      amount: String(state.amount),
      currencyCode: '356',
      paymentMode: state.paymentMode,
      status: 'SUCCESS',
      authCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
      tranCtx
    };

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'values');
    return responsePayload;
  }

  /**
   * Returns exact ICICI Status Check response format
   */
  static getStatus(merchantTxnNo: string) {
    const state = mockStore.get(merchantTxnNo);
    if (!state) {
      return {
        responseCode: '999',
        txnResponseCode: '9999',
        txnStatus: 'FAIL',
        respDescription: 'Transaction not found',
        merchantTxnNo
      };
    }

    const isSuccess = state.status === 'SUCCESS';

    const responsePayload: Record<string, any> = {
      txnRespDescription: isSuccess ? 'Transaction successful' : 'Transaction in progress',
      amount: Number(state.amount).toFixed(2),
      txnResponseCode: isSuccess ? '0000' : 'R1000',
      txnAuthID: state.txnId,
      authCode: `AUTH_${Math.floor(10000000 + Math.random() * 90000000)}`,
      respDescription: 'Request processed successfully',
      paymentMode: state.paymentMode,
      customerEmailID: state.customerEmail || 'customer@prasanthbazar.com',
      TransmissionDateTime: new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
      oth_charge: false,
      paymentInstId: `${state.customerMobile || '9876543210'}@upi`,
      responseCode: isSuccess ? '000' : 'R1000',
      customerMobileNo: state.customerMobile || '9876543210',
      txnStatus: isSuccess ? 'SUC' : 'PENDING',
      merchantId: config.icici.merchantId,
      merchantTxnNo: state.merchantTxnNo,
      paymentDateTime: new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
      txnID: state.txnId
    };

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'values');
    return responsePayload;
  }

  static refund(params: Record<string, any>) {
    const { merchantTxnNo, originalTxnNo, amount, refundTxnNo } = params;
    const lookupKey = originalTxnNo || merchantTxnNo;
    const state = mockStore.get(lookupKey);

    const refNo = refundTxnNo || `REF_${Date.now()}`;
    const refundAmount = Number(amount);

    if (state && refundAmount > state.amount) {
      return {
        responseCode: '003',
        txnResponseCode: '0003',
        responseDescription: 'Refund amount cannot exceed captured transaction amount',
        refundTxnNo: refNo
      };
    }

    if (state) {
      state.status = 'REFUNDED';
    }

    const responsePayload: Record<string, any> = {
      responseCode: '000',
      txnResponseCode: '0000',
      responseDescription: 'Refund Processed Successfully',
      refundTxnNo: refNo,
      originalTxnNo: lookupKey,
      refundAmount: String(refundAmount),
      status: 'SUCCESS',
      refundDate: new Date().toISOString()
    };

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'values');
    return responsePayload;
  }

  static getServiceCharges(params: Record<string, any>) {
    const { amount, paymentMode } = params;
    const numAmount = Number(amount) || 0;
    
    let chargePercent = 0;
    if (paymentMode === 'CARD') chargePercent = 0.015;
    else if (paymentMode === 'NB') chargePercent = 0.012;
    else if (paymentMode === 'WALLET') chargePercent = 0.018;
    else if (paymentMode === 'UPI' || paymentMode === 'QR') chargePercent = 0.00;

    const serviceCharge = Math.round(numAmount * chargePercent * 100) / 100;
    const totalPayable = numAmount + serviceCharge;

    const responsePayload: Record<string, any> = {
      responseCode: '000',
      responseDescription: 'Service charges retrieved successfully',
      amount: String(numAmount),
      serviceCharge: String(serviceCharge),
      totalPayableAmount: String(totalPayable),
      paymentMode
    };

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'values');
    return responsePayload;
  }

  /**
   * Generates exact ICICI Generate QR response structure
   */
  static generateQR(params: { merchantTxnNo: string; amount: number | string }) {
    const { merchantTxnNo, amount } = params;
    const formattedAmount = Number(amount).toFixed(2);
    const invoiceDate = new Date().toISOString();
    
    const upiQR = `upi://pay?pa=prasanthbazar@icici&pn=PRASANTH+BAZAR&mc=5411&tr=${merchantTxnNo}&am=${formattedAmount}&cu=INR&invoiceDate=${invoiceDate}`;

    const state: MockTransactionState = {
      merchantTxnNo,
      amount: Number(amount),
      paymentMode: 'QR',
      customerName: 'Customer',
      customerMobile: '9876543210',
      customerEmail: 'customer@prasanthbazar.com',
      tranCtx: `CTX_QR_${Date.now()}`,
      otpVerified: true,
      status: 'PENDING_QR',
      txnId: `ICICI_QR_${Date.now()}`,
      paymentId: `PAY_QR_${Date.now()}`,
      createdAt: Date.now()
    };

    mockStore.set(merchantTxnNo, state);

    return {
      respHeader: {
        returnCode: 200,
        desc: 'Success',
        upiRespDesc: 'SUC'
      },
      respBody: {
        merchantID: config.icici.merchantId,
        aggregatorID: config.icici.aggregatorId,
        merchantRefNo: merchantTxnNo,
        bharatQR: null,
        upiQR,
        expiry: null,
        serviceChargeUPI: '0',
        serviceChargeBharatQR: null
      },
      qrString: upiQR,
      amount: formattedAmount,
      responseCode: '000',
      status: 'SUCCESS'
    };
  }
}
