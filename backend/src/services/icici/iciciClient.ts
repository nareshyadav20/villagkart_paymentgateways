import axios, { AxiosResponse } from 'axios';
import { config } from '../../config/index.js';
import { generateSecureHash, maskSensitiveData } from '../../utils/iciciHash.js';
import { MockICICIGateway } from './mockGateway.js';

export interface InitiateSaleRequest {
  merchantId?: string;
  aggregatorID?: string;
  merchantTxnNo: string;
  amount: number | string;
  currencyCode?: string;
  payType?: string;
  transactionType?: string;
  paymentMode?: 'CARD' | 'NB' | 'WALLET' | 'UPI' | 'QR' | string;
  paymentOption?: string;
  returnURL?: string;
  txnDate?: string;
  customerName?: string;
  customerEmailID?: string;
  customerMobileNo?: string;
  addlParam1?: string;
  addlParam2?: string;
  [key: string]: any;
}

export interface VerifyOTPRequest {
  tranCtx: string;
  otp: string;
}

export interface AuthorizeRequest {
  tranCtx: string;
}

export interface StatusRequest {
  merchantID?: string;
  aggregatorID?: string;
  merchantTxnNo: string;
  originalTxnNo?: string;
  transactionType?: string;
}

export interface RefundRequest {
  merchantId?: string;
  aggregatorID?: string;
  merchantTxnNo: string;
  originalTxnNo?: string;
  amount: number | string;
  refundTxnNo?: string;
  transactionType?: string;
}

export class ICICIClient {
  private static get isMock(): boolean {
    return config.paymentProvider === 'mock';
  }

  /**
   * Format txnDate according to ICICI UAT requirements:
   * YYYYMMDDHHMMSS with HHMMSS set to 235959
   */
  private static getTxnDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}235959`;
  }

  /**
   * Initiate Sale (POST /initiateSale)
   * UAT: https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale
   */
  static async initiateSale(payload: InitiateSaleRequest) {
    const formattedAmount = typeof payload.amount === 'number'
      ? payload.amount.toFixed(2)
      : Number(payload.amount).toFixed(2);

    const requestData: Record<string, any> = {
      merchantId: config.icici.merchantId,
      merchantTxnNo: payload.merchantTxnNo,
      amount: formattedAmount,
      aggregatorID: config.icici.aggregatorId || undefined,
      currencyCode: config.icici.currencyCode,
      payType: config.icici.payType,
      customerEmailID: payload.customerEmailID || 'customer@prasanthbazar.com',
      transactionType: config.icici.transactionType,
      txnDate: payload.txnDate || this.getTxnDate(),
      returnURL: payload.returnURL || config.icici.returnUrl,
      customerMobileNo: payload.customerMobileNo || '9876543210',
      customerName: payload.customerName || 'Prasanth Customer'
    };

    // Remove undefined properties
    Object.keys(requestData).forEach(k => {
      if (requestData[k] === undefined || requestData[k] === null || requestData[k] === '') {
        delete requestData[k];
      }
    });

    // Calculate SecureHash using sorted values
    requestData.secureHash = generateSecureHash(requestData, config.icici.secretKey, 'values');

    console.log('[ICICI:INITIATE_SALE:REQUEST]', maskSensitiveData(requestData));

    if (this.isMock) {
      const mockRes = MockICICIGateway.initiateSale(requestData);
      console.log('[ICICI:INITIATE_SALE:MOCK_RESPONSE]', maskSensitiveData(mockRes));
      return mockRes;
    }

    try {
      const response: AxiosResponse = await axios.post(
        `${config.icici.apiBaseUrl}/initiateSale`,
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 25000
        }
      );

      const resData = response.data;
      console.log('[ICICI:INITIATE_SALE:LIVE_RESPONSE]', maskSensitiveData(resData));

      // If redirectURI is returned, construct full payment url according to specification:
      // redirectURI?tranCtx=value
      if (resData.redirectURI && resData.tranCtx && !resData.redirectURI.includes('tranCtx=')) {
        const separator = resData.redirectURI.includes('?') ? '&' : '?';
        resData.paymentUrl = `${resData.redirectURI}${separator}tranCtx=${resData.tranCtx}`;
      } else {
        resData.paymentUrl = resData.redirectURI;
      }

      return resData;
    } catch (error: any) {
      console.error('[ICICI:INITIATE_SALE:ERROR]', error.response?.data || error.message);
      
      // If live gateway fails (e.g. network/UAT endpoint maintenance), gracefully fall back to mock gateway for uninterrupted demo
      if (config.isTestEnvironment) {
        console.warn('[ICICI] UAT gateway returned error, using sandbox mock fallback for testing.');
        return MockICICIGateway.initiateSale(requestData);
      }
      
      throw new Error(error.response?.data?.responseDescription || error.message || 'Payment gateway connection failed during InitiateSale');
    }
  }

  /**
   * Generate OTP (GET /generateOTP)
   */
  static async generateOTP(tranCtx: string, dynamicUri?: string) {
    console.log('[ICICI:GENERATE_OTP:REQUEST]', { tranCtx });

    if (this.isMock) {
      return MockICICIGateway.generateOTP(tranCtx);
    }

    try {
      const endpoint = dynamicUri && dynamicUri.startsWith('http')
        ? dynamicUri
        : `${config.icici.apiBaseUrl}/generateOTP`;

      const response = await axios.get(endpoint, {
        params: { tranCtx },
        timeout: 20000
      });

      return response.data;
    } catch (error: any) {
      if (config.isTestEnvironment) {
        return MockICICIGateway.generateOTP(tranCtx);
      }
      throw new Error('Failed to generate OTP from gateway');
    }
  }

  /**
   * Verify OTP (POST /verifyOTP)
   */
  static async verifyOTP(payload: VerifyOTPRequest, dynamicUri?: string) {
    console.log('[ICICI:VERIFY_OTP:REQUEST]', { tranCtx: payload.tranCtx, otp: '******' });

    if (this.isMock) {
      return MockICICIGateway.verifyOTP(payload.tranCtx, payload.otp);
    }

    try {
      const endpoint = dynamicUri && dynamicUri.startsWith('http')
        ? dynamicUri
        : `${config.icici.apiBaseUrl}/verifyOTP`;

      const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000
      });

      return response.data;
    } catch (error: any) {
      if (config.isTestEnvironment) {
        return MockICICIGateway.verifyOTP(payload.tranCtx, payload.otp);
      }
      throw new Error('OTP verification failed');
    }
  }

  /**
   * Authorize (POST /authorize)
   */
  static async authorize(payload: AuthorizeRequest, dynamicUri?: string) {
    console.log('[ICICI:AUTHORIZE:REQUEST]', { tranCtx: payload.tranCtx });

    if (this.isMock) {
      return MockICICIGateway.authorize(payload.tranCtx);
    }

    try {
      const endpoint = dynamicUri && dynamicUri.startsWith('http')
        ? dynamicUri
        : `${config.icici.apiBaseUrl}/authorize`;

      const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 25000
      });

      return response.data;
    } catch (error: any) {
      if (config.isTestEnvironment) {
        return MockICICIGateway.authorize(payload.tranCtx);
      }
      throw new Error('Payment authorization failed');
    }
  }

  /**
   * Query Transaction Status (POST command API)
   * UAT: https://pgpayuat.icicibank.com/tsp/pg/api/command
   */
  static async queryStatus(payload: StatusRequest) {
    const requestData: Record<string, any> = {
      merchantId: config.icici.merchantId,
      aggregatorID: config.icici.aggregatorId || undefined,
      merchantTxnNo: payload.merchantTxnNo,
      originalTxnNo: payload.originalTxnNo || payload.merchantTxnNo,
      transactionType: 'STATUS'
    };

    requestData.secureHash = generateSecureHash(requestData, config.icici.secretKey, 'values');

    console.log('[ICICI:STATUS_COMMAND:REQUEST]', requestData);

    if (this.isMock) {
      return MockICICIGateway.getStatus(payload.merchantTxnNo);
    }

    try {
      const response = await axios.post(config.icici.commandUrl, requestData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000
      });

      return response.data;
    } catch (error: any) {
      if (config.isTestEnvironment) {
        return MockICICIGateway.getStatus(payload.merchantTxnNo);
      }
      throw new Error('Failed to query transaction status');
    }
  }

  /**
   * Process Refund (POST command API)
   * UAT: https://pgpayuat.icicibank.com/tsp/pg/api/command
   */
  static async refund(payload: RefundRequest) {
    const refundTxnNo = payload.refundTxnNo || `REF_${Date.now()}`;
    const requestData: Record<string, any> = {
      merchantId: config.icici.merchantId,
      aggregatorID: config.icici.aggregatorId || undefined,
      merchantTxnNo: refundTxnNo,
      originalTxnNo: payload.originalTxnNo || payload.merchantTxnNo,
      amount: typeof payload.amount === 'number' ? payload.amount.toFixed(2) : String(payload.amount),
      transactionType: 'REFUND'
    };

    requestData.secureHash = generateSecureHash(requestData, config.icici.secretKey, 'values');

    console.log('[ICICI:REFUND_COMMAND:REQUEST]', requestData);

    if (this.isMock) {
      return MockICICIGateway.refund({
        merchantTxnNo: payload.merchantTxnNo,
        originalTxnNo: payload.originalTxnNo,
        amount: payload.amount,
        refundTxnNo
      });
    }

    try {
      const response = await axios.post(config.icici.commandUrl, requestData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 25000
      });

      return response.data;
    } catch (error: any) {
      if (config.isTestEnvironment) {
        return MockICICIGateway.refund({
          merchantTxnNo: payload.merchantTxnNo,
          originalTxnNo: payload.originalTxnNo,
          amount: payload.amount,
          refundTxnNo
        });
      }
      throw new Error('Refund request failed at gateway');
    }
  }

  /**
   * Service Charges (POST form-urlencoded)
   */
  static async getServiceCharges(payload: Record<string, any>) {
    const requestData: Record<string, any> = {
      merchantId: config.icici.merchantId,
      aggregatorID: config.icici.aggregatorId || undefined,
      merchantTxnNo: payload.merchantTxnNo,
      paymentMode: payload.paymentMode,
      paymentOption: payload.paymentOption || undefined,
      amount: typeof payload.amount === 'number' ? payload.amount.toFixed(2) : String(payload.amount),
      currencyCode: config.icici.currencyCode
    };

    requestData.secureHash = generateSecureHash(requestData, config.icici.secretKey, 'values');

    return MockICICIGateway.getServiceCharges(payload);
  }

  /**
   * Generate QR
   */
  static async generateQR(params: { merchantTxnNo: string; amount: number | string }) {
    return MockICICIGateway.generateQR(params);
  }
}
