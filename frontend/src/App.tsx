import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Toast } from './components/Toast';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OTPVerificationPage } from './pages/OTPVerificationPage';
import { QRPaymentPage } from './pages/QRPaymentPage';
import { PaymentResultPage } from './pages/PaymentResultPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { DevTransactionsPage } from './pages/DevTransactionsPage';
import { MockBankRedirectPage } from './pages/MockBankRedirectPage';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />
      <CartDrawer />
      <Toast />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/otp" element={<OTPVerificationPage />} />
          <Route path="/payment/qr" element={<QRPaymentPage />} />
          <Route path="/payment/result" element={<PaymentResultPage />} />
          <Route path="/orders/:orderNumber" element={<OrderDetailsPage />} />
          <Route path="/dev/transactions" element={<DevTransactionsPage />} />
          <Route path="/mock-bank-redirect" element={<MockBankRedirectPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
