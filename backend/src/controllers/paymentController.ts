import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService.js';
import { ICICIClient } from '../services/icici/iciciClient.js';
import { verifySecureHash } from '../utils/iciciHash.js';
import { config } from '../config/index.js';

export class PaymentController {
  /**
   * POST /api/payment/initiate
   * Starts payment initiation flow with ICICI Bank Gateway
   */
  static async initiate(req: Request, res: Response) {
    try {
      const { orderId, paymentMode, paymentOption } = req.body;

      if (!orderId || !paymentMode) {
        return res.status(400).json({
          success: false,
          message: 'orderId and paymentMode are required'
        });
      }

      const result = await PaymentService.initiatePayment({
        orderId,
        paymentMode,
        paymentOption
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:INITIATE_ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Payment initiation failed'
      });
    }
  }

  /**
   * GET /api/payment/generate-otp?tranCtx=...
   */
  static async generateOTP(req: Request, res: Response) {
    try {
      const tranCtx = (req.query.tranCtx || req.body.tranCtx) as string;

      if (!tranCtx) {
        return res.status(400).json({
          success: false,
          message: 'tranCtx is required'
        });
      }

      const result = await PaymentService.generateOTP(tranCtx);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:GENERATE_OTP_ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate OTP'
      });
    }
  }

  /**
   * POST /api/payment/verify-otp
   */
  static async verifyOTP(req: Request, res: Response) {
    try {
      const { tranCtx, otp } = req.body;

      if (!tranCtx || !otp) {
        return res.status(400).json({
          success: false,
          message: 'tranCtx and 6-digit numeric otp are required'
        });
      }

      const result = await PaymentService.verifyOTP(tranCtx, otp);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:VERIFY_OTP_ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'OTP verification failed'
      });
    }
  }

  /**
   * POST /api/payment/authorize
   */
  static async authorize(req: Request, res: Response) {
    try {
      const { tranCtx } = req.body;

      if (!tranCtx) {
        return res.status(400).json({
          success: false,
          message: 'tranCtx is required'
        });
      }

      const result = await PaymentService.authorize(tranCtx);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:AUTHORIZE_ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Authorization failed'
      });
    }
  }

  /**
   * POST /api/payment/callback
   * Gateway Merchant Return URL webhook / redirect handler
   */
  static async callback(req: Request, res: Response) {
    try {
      const payload = { ...req.body, ...req.query };
      const clientIp = req.ip || req.socket.remoteAddress;

      console.log('[PAYMENT_CONTROLLER:CALLBACK_RECEIVED]', payload);

      const result = await PaymentService.handleCallback(payload, clientIp);

      // If browser request from gateway redirect, redirect to frontend result page
      const isJsonRequest = req.is('json') || (req.headers.accept && !req.headers.accept.includes('text/html'));
      if (!isJsonRequest && req.accepts('html')) {
        const redirectUrl = `${config.frontendUrl}/payment/result?merchantTxnNo=${result.merchantTxnNo}&status=${result.status}&code=${result.responseCode}`;
        return res.redirect(redirectUrl);
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:CALLBACK_ERROR]', error);
      const isJsonRequest = req.is('json') || (req.headers.accept && !req.headers.accept.includes('text/html'));
      if (!isJsonRequest && req.accepts('html')) {
        return res.redirect(`${config.frontendUrl}/payment/result?status=FAILED&message=${encodeURIComponent(error.message)}`);
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Callback processing failed'
      });
    }
  }

  /**
   * POST /api/payment/status
   * Server-to-server transaction status query
   */
  static async status(req: Request, res: Response) {
    try {
      const { merchantTxnNo } = req.body;

      if (!merchantTxnNo) {
        return res.status(400).json({
          success: false,
          message: 'merchantTxnNo is required'
        });
      }

      const result = await PaymentService.queryTransactionStatus(merchantTxnNo);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:STATUS_ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Transaction status query failed'
      });
    }
  }

  /**
   * POST /api/payment/refund
   * Server-to-server refund endpoint
   */
  static async refund(req: Request, res: Response) {
    try {
      const { merchantTxnNo, amount, reason } = req.body;

      if (!merchantTxnNo || !amount || isNaN(Number(amount))) {
        return res.status(400).json({
          success: false,
          message: 'merchantTxnNo and valid refund amount are required'
        });
      }

      const result = await PaymentService.processRefund({
        merchantTxnNo,
        amount: Number(amount),
        reason
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:REFUND_ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Refund processing failed'
      });
    }
  }

  /**
   * POST /api/payment/service-charges
   */
  static async serviceCharges(req: Request, res: Response) {
    try {
      const { merchantTxnNo, amount, paymentMode, paymentOption } = req.body;

      if (!merchantTxnNo || !amount || !paymentMode) {
        return res.status(400).json({
          success: false,
          message: 'merchantTxnNo, amount, and paymentMode are required'
        });
      }

      const result = await ICICIClient.getServiceCharges({
        merchantTxnNo,
        amount,
        paymentMode,
        paymentOption
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:SERVICE_CHARGES_ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to calculate service charges'
      });
    }
  }

  /**
   * POST /api/payment/qr
   */
  static async generateQR(req: Request, res: Response) {
    try {
      const { merchantTxnNo, amount } = req.body;

      if (!merchantTxnNo || !amount) {
        return res.status(400).json({
          success: false,
          message: 'merchantTxnNo and amount are required'
        });
      }

      const result = await ICICIClient.generateQR({
        merchantTxnNo,
        amount
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:QR_ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'QR generation failed'
      });
    }
  }

  /**
   * POST /api/payment/advice
   * Server-to-server gateway payment advice webhook
   */
  static async advice(req: Request, res: Response) {
    try {
      const payload = req.body;
      console.log('[PAYMENT_CONTROLLER:PAYMENT_ADVICE_RECEIVED]', payload);

      const secureHash = payload.secureHash || payload.hash;
      if (secureHash) {
        const isValid = verifySecureHash(payload, secureHash, config.icici.secretKey);
        if (!isValid) {
          return res.status(400).json({ responseCode: '999', responseDescription: 'Invalid SecureHash' });
        }
      }

      // Return HTTP 200 acknowledging receipt as per specification
      res.status(200).json({
        responseCode: '000',
        responseDescription: 'Payment Advice Received Successfully'
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:ADVICE_ERROR]', error);
      res.status(500).json({ responseCode: '999', responseDescription: 'Failed to process advice' });
    }
  }

  /**
   * GET /api/payment/transactions
   * Developer Payment Inspector
   */
  static async getTransactions(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const transactions = await PaymentService.getTransactionLogs(limit);
      res.json({
        success: true,
        data: transactions,
        gatewayConfig: {
          provider: config.paymentProvider,
          isTest: config.isTestEnvironment,
          merchantId: config.icici.merchantId,
          apiBaseUrl: config.icici.apiBaseUrl
        }
      });
    } catch (error: any) {
      console.error('[PAYMENT_CONTROLLER:TRANSACTIONS_ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to fetch transaction logs' });
    }
  }
}
