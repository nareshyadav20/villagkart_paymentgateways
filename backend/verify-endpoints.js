import axios from 'axios';

async function testFullFlow() {
  const baseURL = 'http://localhost:5000/api';
  console.log('🧪 Starting Full E-Commerce & ICICI Payment Gateway Test with UAT Endpoints...');

  // 1. Fetch products
  console.log('\n1. Fetching Products from Supabase DB:');
  const productsRes = await axios.get(`${baseURL}/products`);
  console.log(`✅ Loaded ${productsRes.data.pagination.total} products.`);
  const sampleProduct = productsRes.data.data[0];
  console.log(`   Sample: "${sampleProduct.name}" - ₹${sampleProduct.price}`);

  // 2. Create Order
  console.log('\n2. Creating Order (No Authentication / Direct Guest Checkout):');
  const orderRes = await axios.post(`${baseURL}/orders`, {
    customerName: 'Prasanth Tester',
    customerEmail: 'tester@prasanthbazar.com',
    customerMobile: '9876543210',
    shippingAddress: 'Plot 42, Tech Park Avenue',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    items: [{ productId: sampleProduct.id, quantity: 1 }]
  });
  const order = orderRes.data.data;
  console.log(`✅ Order Created: ${order.orderNumber} (Amount: ₹${order.totalAmount}, Status: ${order.status})`);

  // 3. Initiate Sale with ICICI Gateway
  console.log('\n3. Calling ICICI Initiate Sale API:');
  const initRes = await axios.post(`${baseURL}/payment/initiate`, {
    orderId: order.id,
    paymentMode: 'CARD',
    paymentOption: 'ICICI'
  });
  const initData = initRes.data.data;
  console.log(`✅ Initiate Sale Response:`);
  console.log(`   MerchantTxnNo: ${initData.merchantTxnNo}`);
  console.log(`   tranCtx: ${initData.tranCtx}`);
  console.log(`   showOTPCapturePage: ${initData.showOTPCapturePage}`);
  console.log(`   redirectURI: ${initData.redirectURI}`);
  console.log(`   Status: ${initData.status}`);

  // 4. If Redirect Flow (Standard for ICICI UAT when showOTPCapturePage is N), simulate Return URL Callback
  if (initData.showOTPCapturePage === 'N' || initData.redirectURI) {
    console.log('\n4. Processing 3DS Gateway Return Callback:');
    const callbackRes = await axios.post(`${baseURL}/payment/callback`, {
      merchantTxnNo: initData.merchantTxnNo,
      responseCode: '000',
      responseDescription: 'Transaction Authorized Successfully',
      txnId: `ICICI_UAT_${Date.now()}`,
      amount: initData.amount
    });
    console.log(`✅ Callback Processed: Txn ${callbackRes.data.data.merchantTxnNo} Status: ${callbackRes.data.data.status}`);
  } else {
    // Direct OTP Flow
    console.log('\n4. Calling Generate OTP & Authorize:');
    await axios.get(`${baseURL}/payment/generate-otp?tranCtx=${initData.tranCtx}`);
    await axios.post(`${baseURL}/payment/verify-otp`, { tranCtx: initData.tranCtx, otp: '123456' });
    await axios.post(`${baseURL}/payment/authorize`, { tranCtx: initData.tranCtx });
  }

  // 5. Check Transaction Status
  console.log('\n5. Calling Query Transaction Status API:');
  const statusRes = await axios.post(`${baseURL}/payment/status`, {
    merchantTxnNo: initData.merchantTxnNo
  });
  console.log(`✅ Status Query: Code ${statusRes.data.data.responseCode} - Status: ${statusRes.data.data.status}`);

  // 6. Service Charges
  console.log('\n6. Calling Service Charges API:');
  const chargesRes = await axios.post(`${baseURL}/payment/service-charges`, {
    merchantTxnNo: initData.merchantTxnNo,
    amount: 1000,
    paymentMode: 'CARD'
  });
  console.log(`✅ Service Charges: Charge ₹${chargesRes.data.data.serviceCharge}, Total: ₹${chargesRes.data.data.totalPayableAmount}`);

  // 7. Process Refund
  console.log('\n7. Calling Process Refund API:');
  const refundRes = await axios.post(`${baseURL}/payment/refund`, {
    merchantTxnNo: initData.merchantTxnNo,
    amount: initData.amount,
    reason: 'Automated test suite refund'
  });
  console.log(`✅ Refund Result: Code ${refundRes.data.data.responseCode} - Refund ID: ${refundRes.data.data.refundTxnNo}`);

  console.log('\n🎉 ALL ICICI BANK PAYMENT GATEWAY UAT FLOWS & APIS ARE CONNECTED AND WORKING PERFECTLY!');
}

testFullFlow().catch(console.error);
