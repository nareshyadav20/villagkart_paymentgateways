# PRASANTH BAZAR

A modern, production-grade dynamic e-commerce web application and testing platform for **ICICI Bank Payment Gateway** APIs.

Designed for frictionless Indian online shopping with **Zero Login / Zero Signups required** (anyone can open the store and checkout immediately), featuring comprehensive implementation of the ICICI Bank Payment Gateway Interface Specifications.

---

## 🚀 Key Highlights

- **Direct Shopping (No Login / No Password)**: Anyone can browse, add to cart, and checkout in seconds.
- **ICICI Bank Payment Gateway**:
  - **SecureHash V1**: Key-value alphabetical sorting + HMAC-SHA256 lowercase hex.
  - **SecureHash V2**: Minified JSON serialization + HMAC-SHA256 lowercase hex.
  - **Direct Seamless Card Flow**: `Initiate Sale` → `Generate OTP` → `Verify OTP` (`tranCtx`) → `Authorize`.
  - **3D Secure / NetBanking Redirect Flow**: `Initiate Sale` → `redirectURI` → Bank 3DS Authentication → Merchant Callback (`/api/payment/callback`).
  - **Dynamic UPI QR Code**: `Generate QR` → Real-time status polling → Instant confirmation.
  - **Server-to-Server Status Query**: Real-time reconciliation via `POST /api/payment/status`.
  - **Refund Processing**: Safe partial & full refund execution via `POST /api/payment/refund`.
  - **Payment Surcharge Calculator**: Form-urlencoded inquiry via `POST /api/payment/service-charges`.
  - **Payment Advice Webhook**: Acknowledges gateway notifications via `POST /api/payment/advice`.
  - **Developer Inspector**: Audit console showing gateway request logs, response codes, and hash verification statuses.
- **Rich Catalog**: 32 realistic Indian products across 8 categories (Mobiles, Electronics, Fashion, Home & Kitchen, Grocery, Beauty, Accessories, Daily Essentials) with Indian Rupee (₹) pricing.
- **Database Persistence**: PostgreSQL via **Prisma ORM** (Supabase connection pooler & direct session support).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v7 |
| **Backend** | Node.js, Express, TypeScript, Axios, Native `crypto` |
| **Database** | PostgreSQL, Prisma ORM (Supabase) |
| **Payment Gateway** | ICICI Bank Payment Gateway Specification (Dual Mock/Live mode) |

---

## 📁 Project Structure

```
prasanth-bazar/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma models for Orders, Items, Transactions, Refunds
│   │   └── seed.ts              # Seeds 32 products and 8 categories
│   ├── src/
│   │   ├── config/index.ts      # Environment validation
│   │   ├── controllers/         # Product, Order, and Payment controllers
│   │   ├── middleware/          # Express error handling
│   │   ├── routes/              # Express REST routes
│   │   ├── services/
│   │   │   ├── icici/
│   │   │   │   ├── iciciClient.ts   # Live ICICI HTTP client
│   │   │   │   └── mockGateway.ts   # ICICI Sandbox simulator
│   │   │   └── paymentService.ts    # High-level payment orchestrator
│   │   ├── utils/
│   │   │   └── iciciHash.ts     # SecureHash V1 and V2 generation & verification
│   │   └── server.ts            # Main backend server
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Header, Hero, ProductCard, CategoryGrid, Toast, etc.
│   │   ├── context/             # CartContext with localStorage persistence
│   │   ├── pages/               # Home, Products, ProductDetail, Cart, Checkout, OTP, QR, Result, Order, Dev
│   │   ├── services/            # Axios API client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Router definitions
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── API_TESTING.md               # Curl commands for all endpoints
├── README.md
└── .gitignore
```

---

## ⚙️ Environment Variables (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.dhhllyugetdmslekdggs:X5FEAtEgddnGpEq9@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.dhhllyugetdmslekdggs:X5FEAtEgddnGpEq9@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# Mode: "mock" for built-in sandbox simulator, "icici" for live gateway
PAYMENT_PROVIDER=mock
IS_TEST_ENVIRONMENT=true

# ICICI Bank Credentials
ICICI_MERCHANT_ID=TEST_MERCHANT_01
ICICI_AGGREGATOR_ID=
ICICI_SECRET_KEY=TEST_SECRET_KEY_1234567890ABCDEF
ICICI_API_BASE_URL=https://pgpaytest.icicibank.com/pg/api/v2
ICICI_RETURN_URL=http://localhost:5000/api/payment/callback
ICICI_ADVICE_URL=http://localhost:5000/api/payment/advice
ICICI_SETTLEMENT_ADVICE_URL=http://localhost:5000/api/payment/settlement-advice
```

---

## 📦 Setup & Running Locally

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push      # Syncs schema to Supabase PostgreSQL
npm run prisma:seed    # Seeds 32 Indian products
npm run dev            # Starts backend on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev            # Starts Vite dev server on http://localhost:5173
```

---

## 🔒 ICICI SecureHash Logic

Implemented in `backend/src/utils/iciciHash.ts`:

### Hash V1:
1. Filter non-empty / non-null request parameters (exclude `secureHash`).
2. Sort parameters alphabetically by key.
3. Concatenate format: `key1value1key2value2...`.
4. Generate `HMAC-SHA256(concatenatedString, secretKey)`.
5. Convert output to lowercase hexadecimal string.

### Hash V2:
1. Serialize JSON payload into minified JSON string (no whitespace or formatting).
2. Generate `HMAC-SHA256(minifiedJson, secretKey)`.
3. Convert output to lowercase hexadecimal string.

---

## 🧪 Testing Scenarios

1. **Seamless Card OTP Flow**:
   - Add product to cart → Checkout → Select **Card** → Place Order.
   - You will be redirected to `/payment/otp`.
   - Use the auto-fill test OTP `123456` → Click **Verify & Authorize** → Receive Payment Success screen!
2. **Dynamic UPI QR Code Flow**:
   - Add product to cart → Checkout → Select **Dynamic QR** → Place Order.
   - Dynamic QR code will load with a live 5-minute countdown.
   - Click **Simulate Instant UPI Payment** → Status updates instantly!
3. **Refund Test**:
   - On the `/payment/result` page of any successful transaction, click **Test Gateway Refund API**.
   - Enter refund amount (up to total captured amount) → Confirm refund.
4. **Developer Payment Inspector**:
   - Navigate to `/dev/transactions` to inspect real-time transaction logs, masked payloads, response codes, and SecureHash verification.

---

## 📄 License
MIT. PRASANTH BAZAR.
