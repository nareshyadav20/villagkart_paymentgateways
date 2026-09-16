import axios from 'axios';
import { Product, Category, Order } from '../types';

const API_BASE = '/api';

export const api = {
  // Products & Categories
  async getProducts(params?: Record<string, any>): Promise<{ products: Product[]; pagination: any }> {
    const res = await axios.get(`${API_BASE}/products`, { params });
    return {
      products: res.data.data,
      pagination: res.data.pagination
    };
  },

  async getProductById(id: string): Promise<Product & { related: Product[] }> {
    const res = await axios.get(`${API_BASE}/products/${id}`);
    return res.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await axios.get(`${API_BASE}/products/categories`);
    return res.data.data;
  },

  // Orders
  async createOrder(data: {
    customerName: string;
    customerEmail: string;
    customerMobile: string;
    shippingAddress: string;
    city: string;
    state: string;
    pincode: string;
    items: { productId: string; quantity: number }[];
  }): Promise<Order> {
    const res = await axios.post(`${API_BASE}/orders`, data);
    return res.data.data;
  },

  async getOrder(idOrOrderNumber: string): Promise<Order> {
    const res = await axios.get(`${API_BASE}/orders/${idOrOrderNumber}`);
    return res.data.data;
  },

  // Payment Gateway Endpoints
  async initiatePayment(data: {
    orderId: string;
    paymentMode: string;
    paymentOption?: string;
  }) {
    const res = await axios.post(`${API_BASE}/payment/initiate`, data);
    return res.data.data;
  },

  async generateOTP(tranCtx: string) {
    const res = await axios.get(`${API_BASE}/payment/generate-otp`, { params: { tranCtx } });
    return res.data.data;
  },

  async verifyOTP(data: { tranCtx: string; otp: string }) {
    const res = await axios.post(`${API_BASE}/payment/verify-otp`, data);
    return res.data.data;
  },

  async authorizePayment(data: { tranCtx: string }) {
    const res = await axios.post(`${API_BASE}/payment/authorize`, data);
    return res.data.data;
  },

  async checkStatus(merchantTxnNo: string) {
    const res = await axios.post(`${API_BASE}/payment/status`, { merchantTxnNo });
    return res.data.data;
  },

  async requestRefund(data: { merchantTxnNo: string; amount: number; reason?: string }) {
    const res = await axios.post(`${API_BASE}/payment/refund`, data);
    return res.data.data;
  },

  async getServiceCharges(data: {
    merchantTxnNo: string;
    amount: number;
    paymentMode: string;
    paymentOption?: string;
  }) {
    const res = await axios.post(`${API_BASE}/payment/service-charges`, data);
    return res.data.data;
  },

  async generateQR(data: { merchantTxnNo: string; amount: number }) {
    const res = await axios.post(`${API_BASE}/payment/qr`, data);
    return res.data.data;
  },

  async getTransactionLogs(limit: number = 25) {
    const res = await axios.get(`${API_BASE}/payment/transactions`, { params: { limit } });
    return res.data;
  },

  async getHealth() {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  }
};
