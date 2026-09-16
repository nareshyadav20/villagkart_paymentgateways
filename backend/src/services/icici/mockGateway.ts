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
      customerEmailID,
      returnURL
    } = params;

    const tranCtx = `CTX_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const txnId = `ICICI_TXN_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const paymentId = `PAY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Decide if direct OTP or redirect based on paymentMode
    let showOTPCapturePage = 'N';
    let redirectURI = '';
    let qrData = '';

    if (paymentMode === 'CARD') {
      showOTPCapturePage = 'Y';
    } else if (paymentMode === 'QR' || paymentMode === 'UPI_QR') {
      qrData = `upi://pay?pa=prasanthbazar@icici&pn=PRASANTH+BAZAR&tr=${merchantTxnNo}&am=${amount}&cu=INR&tn=Order+${merchantTxnNo}`;
    } else {
      // NB, UPI intent, or WALLET redirect
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
      otp: '123456', // standard test OTP
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
      merchantId,
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

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'v1');
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

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'v1');
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

    // Accept 123456 or any 6-digit number in test mode
    if (otp === '123456' || (otp && otp.length === 6 && /^\d+$/.test(otp))) {
      state.otpVerified = true;
      const responsePayload: Record<string, any> = {
        responseCode: '000',
        responseDescription: 'OTP verified successfully',
        tranCtx,
        verificationStatus: 'SUCCESS'
      };
      responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'v1');
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

    if (!state.otpVerified && state.paymentMode === 'CARD') {
      return {
        responseCode: '002',
        responseDescription: 'OTP has not been verified'
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

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'v1');
    return responsePayload;
  }

  static getStatus(merchantTxnNo: string) {
    const state = mockStore.get(merchantTxnNo);
    if (!state) {
      return {
        responseCode: '999',
        responseDescription: 'Transaction not found',
        merchantTxnNo
      };
    }

    const responsePayload: Record<string, any> = {
      responseCode: state.status === 'SUCCESS' ? '000' : 'R1000',
      responseDescription: state.status === 'SUCCESS' ? 'Transaction Successful' : 'Transaction in Progress',
      merchantTxnNo: state.merchantTxnNo,
      originalTxnNo: state.merchantTxnNo,
      txnId: state.txnId,
      paymentId: state.paymentId,
      amount: String(state.amount),
      status: state.status,
      paymentMode: state.paymentMode
    };

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'v1');
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
        responseDescription: 'Refund amount cannot exceed captured transaction amount',
        refundTxnNo: refNo
      };
    }

    if (state) {
      state.status = 'REFUNDED';
    }

    const responsePayload: Record<string, any> = {
      responseCode: '000',
      responseDescription: 'Refund Processed Successfully',
      refundTxnNo: refNo,
      originalTxnNo: lookupKey,
      refundAmount: String(refundAmount),
      status: 'SUCCESS',
      refundDate: new Date().toISOString()
    };

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'v1');
    return responsePayload;
  }

  static getServiceCharges(params: Record<string, any>) {
    const { amount, paymentMode } = params;
    const numAmount = Number(amount) || 0;
    
    // Realistic Indian payment gateway charges
    let chargePercent = 0;
    if (paymentMode === 'CARD') chargePercent = 0.015; // 1.5%
    else if (paymentMode === 'NB') chargePercent = 0.012; // 1.2%
    else if (paymentMode === 'WALLET') chargePercent = 0.018; // 1.8%
    else if (paymentMode === 'UPI' || paymentMode === 'QR') chargePercent = 0.00; // 0% UPI

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

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'v1');
    return responsePayload;
  }

  static generateQR(params: Record<string, any>) {
    const { merchantTxnNo, amount } = params;
    const qrString = `upi://pay?pa=prasanthbazar@icici&pn=PRASANTH+BAZAR&tr=${merchantTxnNo}&am=${amount}&cu=INR&tn=Order+${merchantTxnNo}`;
    
    const state: MockTransactionState = {
      merchantTxnNo,
      amount: Number(amount),
      paymentMode: 'QR',
      customerName: 'Customer',
      customerMobile: '9999999999',
      customerEmail: 'customer@prasanthbazar.com',
      tranCtx: `CTX_QR_${Date.now()}`,
      otpVerified: true,
      status: 'PENDING_QR',
      txnId: `ICICI_QR_${Date.now()}`,
      paymentId: `PAY_QR_${Date.now()}`,
      createdAt: Date.now()
    };

    mockStore.set(merchantTxnNo, state);

    const responsePayload: Record<string, any> = {
      responseCode: '000',
      responseDescription: 'QR generated successfully',
      merchantTxnNo,
      qrString,
      amount: String(amount),
      status: 'SUCCESS'
    };

    responsePayload.secureHash = generateSecureHash(responsePayload, config.icici.secretKey, 'v1');
    return responsePayload;
  }
}
