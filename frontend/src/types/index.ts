export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  bannerUrl?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  categorySlug: string;
  category?: Category;
  imageUrl: string;
  images?: string[];
  rating: number;
  ratingCount: number;
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  brand?: string;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  merchantTxnNo: string;
  txnId?: string;
  paymentId?: string;
  amount: number;
  currencyCode: string;
  paymentMode: string;
  paymentOption?: string;
  responseCode?: string;
  responseDescription?: string;
  status: 'INITIATED' | 'PENDING_OTP' | 'PENDING_REDIRECT' | 'PENDING_QR' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  tranCtx?: string;
  redirectURI?: string;
  qrData?: string;
  showOTPCapturePage?: string;
  hashVerified: boolean;
  rawRequest?: any;
  rawResponse?: any;
  createdAt: string;
}

export interface RefundItem {
  id: string;
  refundTxnNo: string;
  amount: number;
  reason?: string;
  status: string;
  responseCode?: string;
  responseDescription?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  items: OrderItem[];
  transactions?: PaymentTransaction[];
  refunds?: RefundItem[];
  createdAt: string;
}
