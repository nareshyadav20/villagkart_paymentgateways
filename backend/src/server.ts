import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Both JSON and URL-encoded bodies supported for ICICI PG callbacks & Advice
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, _res, next) => {
  const start = Date.now();
  const { method, url } = req;
  _res.on('finish', () => {
    const duration = Date.now() - start;
    if (!url.includes('/health')) {
      console.log(`[HTTP] ${method} ${url} ${_res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'PRASANTH BAZAR API',
    timestamp: new Date().toISOString(),
    paymentProvider: config.paymentProvider,
    isTestEnvironment: config.isTestEnvironment,
    iciciMerchantId: config.icici.merchantId
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 PRASANTH BAZAR BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`📦 Database: PostgreSQL (Supabase)`);
  console.log(`💳 Payment Mode: ${config.paymentProvider.toUpperCase()} (Test Mode: ${config.isTestEnvironment})`);
  console.log(`🔗 ICICI Gateway URL: ${config.icici.apiBaseUrl}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});

export default app;
