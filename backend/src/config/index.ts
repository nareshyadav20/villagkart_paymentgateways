import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || '',
  
  // Payment Provider: 'icici' (Live UAT / Prod) or 'mock' (local simulator)
  paymentProvider: process.env.PAYMENT_PROVIDER || 'icici',
  isTestEnvironment: process.env.IS_TEST_ENVIRONMENT === 'true' || process.env.NODE_ENV !== 'production',

  // ICICI Credentials & URLs
  icici: {
    merchantId: process.env.ICICI_MERCHANT_ID || '100000000007164',
    aggregatorId: process.env.ICICI_AGGREGATOR_ID || 'A100000000007164',
    secretKey: process.env.ICICI_SECRET_KEY || 'db06cca0-838b-4e01-8b20-6ac446ffb6bd',
    apiBaseUrl: process.env.ICICI_API_BASE_URL || 'https://pgpayuat.icicibank.com/tsp/pg/api/v2',
    commandUrl: process.env.ICICI_COMMAND_URL || 'https://pgpayuat.icicibank.com/tsp/pg/api/command',
    settlementUrl: process.env.ICICI_SETTLEMENT_URL || 'https://pgpayuat.icicibank.com/tsp/pg/api/settlementDetails',
    returnUrl: process.env.ICICI_RETURN_URL || 'http://localhost:5000/api/payment/callback',
    adviceUrl: process.env.ICICI_ADVICE_URL || 'http://localhost:5000/api/payment/advice',
    settlementAdviceUrl: process.env.ICICI_SETTLEMENT_ADVICE_URL || 'http://localhost:5000/api/payment/settlement-advice',
    currencyCode: '356', // INR
    payType: '0',
    transactionType: 'SALE'
  }
};
