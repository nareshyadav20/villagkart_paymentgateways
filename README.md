# PRASANTH BAZAR - ICICI Bank Payment Gateway Integration

A modern, production-grade dynamic e-commerce shopping platform and testing suite for **ICICI Bank Payment Gateway** APIs.

Designed for frictionless Indian online shopping with **Zero Login / Zero Signups required** (anyone can open the store and checkout immediately), fully configured and verified with the **ICICI Bank UAT Environment**.

---

## 🔑 Configured ICICI Bank UAT Credentials

| Parameter | Configured Value |
|---|---|
| **Merchant ID (MID)** | `100000000007164` |
| **Aggregator ID (Agg ID)** | `A100000000007164` |
| **Secret Key** | `db06cca0-838b-4e01-8b20-6ac446ffb6bd` |
| **Initiate Sale Endpoint** | `https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale` |
| **Status / Refund Command** | `https://pgpayuat.icicibank.com/tsp/pg/api/command` |
| **Settlement Details** | `https://pgpayuat.icicibank.com/tsp/pg/api/settlementDetails` |
| **Currency Code** | `356` (INR) |
| **Transaction Type** | `SALE` |
| **Pay Type** | `0` |

---

## 🚀 Key Highlights

- **Direct Shopping (No Login / No Password)**: Anyone can browse, add to cart, and checkout in seconds.
- **ICICI Bank Payment Gateway Integration**:
  - **SecureHash Algorithm**: Dynamic alphabetical key sorting + values concatenation + HMAC-SHA256 lowercase hex (as specified in ICICI Direct integration guide).
  - **Direct Seamless Card Flow**: `Initiate Sale` → `Generate OTP` → `Verify OTP` (`tranCtx`) → `Authorize`.
  - **3D Secure / NetBanking Redirect Flow**: `Initiate Sale` → `redirectURI?tranCtx=...` → Bank 3DS Authentication → Merchant Return Callback (`/api/payment/callback`).
  - **Dynamic UPI QR Code**: `Generate QR` → Real-time status polling → Instant confirmation.
  - **Server-to-Server Status Query**: Real-time reconciliation via `POST /api/payment/status`.
  - **Refund Processing**: Safe partial & full refund execution via `POST /api/payment/refund`.
  - **Payment Surcharge Calculator**: Form-urlencoded inquiry via `POST /api/payment/service-charges`.
  - **Payment Advice Webhook**: Acknowledges gateway notifications via `POST /api/payment/advice`.
  - **Developer Inspector**: Audit console at `/dev/transactions` showing live gateway request logs, response codes, and hash verification statuses.
- **Rich Catalog**: 32 realistic Indian products across 8 categories (Mobiles, Electronics, Fashion, Home & Kitchen, Grocery, Beauty, Accessories, Daily Essentials) with Indian Rupee (₹) pricing.
- **Database Persistence**: PostgreSQL via **Prisma ORM** on Supabase.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v7 |
| **Backend** | Node.js, Express, TypeScript, Axios, Native `crypto` |
| **Database** | PostgreSQL, Prisma ORM (Supabase) |
| **Payment Gateway** | ICICI Bank Payment Gateway UAT / Production API Suite |

---

## 📁 Project Structure

```
prasanth-bazar/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma models for Orders, Items, Transactions, Refunds
│   │   └── seed.ts              # Seeds 32 products and 8 categories
│   ├── src/
│   │   ├── config/index.ts      # ICICI UAT credentials & URLs
│   │   ├── controllers/         # Product, Order, and Payment controllers
│   │   ├── middleware/          # Express error handling
│   │   ├── routes/              # Express REST routes
│   │   ├── services/
│   │   │   ├── icici/
│   │   │   │   ├── iciciClient.ts   # Live ICICI HTTP client
│   │   │   │   └── mockGateway.ts   # ICICI Sandbox simulator
│   │   │   └── paymentService.ts    # High-level payment orchestrator
│   │   ├── utils/
│   │   │   └── iciciHash.ts     # SecureHash generation & verification
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
├── API_TESTING.md               # Ready-to-use cURL requests
├── README.md
└── .gitignore
```

---

## 📦 Setup & Running Locally

### 1. Backend
```bash
cd backend
npm install
npx prisma db push      # Syncs schema with Supabase PostgreSQL
npm run prisma:seed    # Seeds 32 realistic products
npm run dev            # Starts backend on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev            # Starts Vite dev server on http://localhost:5173
```

---

## 🔒 ICICI SecureHash Calculation Flow

As per `Step Wise Document for PG Direct integration.txt`:

1. **Sort keys alphabetically** in ascending order.
2. **Concatenate all parameter values** in that sorted order (omitting `secureHash`, null, and empty strings).
3. **Compute HMAC-SHA256**:
   ```typescript
   const hmac = crypto.createHmac('sha256', secretKey);
   hmac.update(concatenatedValues, 'utf8');
   const secureHash = hmac.digest('hex').toLowerCase();
   ```
4. Transmit `secureHash` in the request body.

---

## 💳 Test Card Details for ICICI UAT

- **Card Number**: `4761 3400 0000 0035`
- **Expiry**: `12/25`
- **CVV**: `123`
- **Name**: `Test Customer`
- **Sandbox OTP**: `123456`
