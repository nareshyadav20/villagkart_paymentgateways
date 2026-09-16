# PRASANTH BAZAR - ICICI Payment Gateway API Testing Guide

This document contains comprehensive `curl` commands and payload structures to test every backend endpoint of **PRASANTH BAZAR** and the **ICICI Bank Payment Gateway** integration.

---

## Base URL
```
http://localhost:5000/api
```

---

## 1. Initiate Sale (Server-to-Server)

Initiates an ICICI sale transaction. Generates `merchantTxnNo`, computes SecureHash V1/V2, and determines whether direct OTP (`showOTPCapturePage: Y`) or 3DS Redirect (`redirectURI`) is returned.

### cURL Request:
```bash
curl -X POST http://localhost:5000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "<YOUR_ORDER_ID>",
    "paymentMode": "CARD",
    "paymentOption": "ICICI"
  }'
```

### Response Example:
```json
{
  "success": true,
  "data": {
    "transactionId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "merchantTxnNo": "PBL1M7D8A1B",
    "orderId": "6c4e09f1-d57b-4b2e-a590-9f5b6e3f22c1",
    "orderNumber": "PB-2026-894215",
    "amount": 1299.00,
    "paymentMode": "CARD",
    "responseCode": "R1000",
    "responseDescription": "Request initiated successfully",
    "showOTPCapturePage": "Y",
    "tranCtx": "CTX_1742361289123_4A9F2E",
    "status": "PENDING_OTP"
  }
}
```

---

## 2. Generate OTP (Direct OTP Flow)

Requests an authentication OTP for the active `tranCtx`.

### cURL Request:
```bash
curl -X GET "http://localhost:5000/api/payment/generate-otp?tranCtx=CTX_1742361289123_4A9F2E"
```

### Response Example:
```json
{
  "success": true,
  "data": {
    "responseCode": "000",
    "responseDescription": "OTP generated and sent to mobile",
    "tranCtx": "CTX_1742361289123_4A9F2E",
    "maskedMobileNo": "XXXXXX4321",
    "secureHash": "b53f6087b927f84742a1975e5cb5883658f8448ec62916b7ff0399bf3ce669b2"
  }
}
```

---

## 3. Verify OTP

Submits the 6-digit numeric OTP with `tranCtx`. *(In sandbox mode, enter `123456`)*.

### cURL Request:
```bash
curl -X POST http://localhost:5000/api/payment/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "tranCtx": "CTX_1742361289123_4A9F2E",
    "otp": "123456"
  }'
```

### Response Example:
```json
{
  "success": true,
  "data": {
    "responseCode": "000",
    "responseDescription": "OTP verified successfully",
    "tranCtx": "CTX_1742361289123_4A9F2E",
    "verificationStatus": "SUCCESS",
    "secureHash": "f86b4a2c091d3106d3969966d5fa957eb03cf81b17a1f592c300fa039ec14bf2"
  }
}
```

---

## 4. Authorize Payment

Finalizes transaction authorization after OTP verification.

### cURL Request:
```bash
curl -X POST http://localhost:5000/api/payment/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "tranCtx": "CTX_1742361289123_4A9F2E"
  }'
```

### Response Example:
```json
{
  "success": true,
  "data": {
    "success": true,
    "transactionId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "merchantTxnNo": "PBL1M7D8A1B",
    "orderNumber": "PB-2026-894215",
    "amount": 1299.00,
    "responseCode": "000",
    "responseDescription": "Transaction Authorized Successfully",
    "txnId": "ICICI_TXN_4829104821",
    "status": "SUCCESS"
  }
}
```

---

## 5. Query Transaction Status (Server-to-Server)

Checks real-time gateway status using `merchantTxnNo`.

### cURL Request:
```bash
curl -X POST http://localhost:5000/api/payment/status \
  -H "Content-Type: application/json" \
  -d '{
    "merchantTxnNo": "PBL1M7D8A1B"
  }'
```

### Response Example:
```json
{
  "success": true,
  "data": {
    "responseCode": "000",
    "responseDescription": "Transaction Successful",
    "merchantTxnNo": "PBL1M7D8A1B",
    "originalTxnNo": "PBL1M7D8A1B",
    "txnId": "ICICI_TXN_4829104821",
    "paymentId": "PAY_9J2F8",
    "amount": "1299.00",
    "status": "SUCCESS",
    "paymentMode": "CARD",
    "secureHash": "..."
  }
}
```

---

## 6. Process Refund (Server-to-Server)

Issues a refund for a previously captured transaction.

### cURL Request:
```bash
curl -X POST http://localhost:5000/api/payment/refund \
  -H "Content-Type: application/json" \
  -d '{
    "merchantTxnNo": "PBL1M7D8A1B",
    "amount": 1299.00,
    "reason": "Customer cancellation test"
  }'
```

### Response Example:
```json
{
  "success": true,
  "data": {
    "refundId": "5f1a9b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
    "refundTxnNo": "REFL1M8912A",
    "amount": 1299.00,
    "status": "SUCCESS",
    "responseCode": "000",
    "responseDescription": "Refund Processed Successfully"
  }
}
```

---

## 7. Service Charges Calculation

Calculates applicable payment mode surcharges using `application/x-www-form-urlencoded`.

### cURL Request:
```bash
curl -X POST http://localhost:5000/api/payment/service-charges \
  -H "Content-Type: application/json" \
  -d '{
    "merchantTxnNo": "PB_CHARGE_CHECK",
    "amount": 5000.00,
    "paymentMode": "CARD",
    "paymentOption": "ICICI"
  }'
```

### Response Example:
```json
{
  "success": true,
  "data": {
    "responseCode": "000",
    "responseDescription": "Service charges retrieved successfully",
    "amount": "5000",
    "serviceCharge": "75",
    "totalPayableAmount": "5075",
    "paymentMode": "CARD"
  }
}
```

---

## 8. Dynamic UPI QR Generation

Generates dynamic UPI QR payload for scan & pay.

### cURL Request:
```bash
curl -X POST http://localhost:5000/api/payment/qr \
  -H "Content-Type: application/json" \
  -d '{
    "merchantTxnNo": "PB_QR_99182",
    "amount": 499.00
  }'
```

---

## 9. Gateway Return Callback

Receives redirect callback from 3DS authentication.

### cURL Request:
```bash
curl -X POST http://localhost:5000/api/payment/callback \
  -H "Content-Type: application/json" \
  -d '{
    "merchantTxnNo": "PBL1M7D8A1B",
    "responseCode": "000",
    "responseDescription": "Payment Successful",
    "txnId": "ICICI_TXN_4829104821",
    "amount": "1299.00",
    "secureHash": "..."
  }'
```

---

## 10. Payment Advice Webhook

Accepts server-to-server payment advice notifications from ICICI Bank.

### cURL Request:
```bash
curl -X POST http://localhost:5000/api/payment/advice \
  -H "Content-Type: application/json" \
  -d '{
    "merchantTxnNo": "PBL1M7D8A1B",
    "responseCode": "000",
    "responseDescription": "Transaction Authorized"
  }'
```

---

## 11. Developer Transaction Logs

Inspects backend transaction attempts, response payloads, and hash verification flags.

### cURL Request:
```bash
curl -X GET "http://localhost:5000/api/payment/transactions?limit=20"
```
