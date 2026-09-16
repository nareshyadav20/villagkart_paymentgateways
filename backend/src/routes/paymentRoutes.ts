import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';

const router = Router();

// 1. Initiate Sale
router.post('/initiate', PaymentController.initiate);

// 2. Seamless OTP Flow
router.get('/generate-otp', PaymentController.generateOTP);
router.post('/verify-otp', PaymentController.verifyOTP);
router.post('/authorize', PaymentController.authorize);

// 3. Gateway Callback / Return URL
router.post('/callback', PaymentController.callback);
router.get('/callback', PaymentController.callback);

// 4. Transaction Status Query
router.post('/status', PaymentController.status);

// 5. Refund
router.post('/refund', PaymentController.refund);

// 6. Service Charges
router.post('/service-charges', PaymentController.serviceCharges);

// 7. Dynamic QR
router.post('/qr', PaymentController.generateQR);

// 8. Payment Advice Webhook
router.post('/advice', PaymentController.advice);

// 9. Developer Transaction Logs
router.get('/transactions', PaymentController.getTransactions);

export default router;
