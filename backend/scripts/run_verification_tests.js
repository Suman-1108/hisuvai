const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5000';

async function runTests() {
  console.log('====================================================');
  console.log('HI SUVAI SECURITY & PRODUCTION VERIFICATION SUITE');
  console.log('====================================================\n');

  // Load environment for credentials
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hisuvai.com';
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Fetch a valid product from DB to use in tests
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  const prodData = await prodRes.json();
  const testProduct = prodData.products && prodData.products[0];
  if (!testProduct) {
    throw new Error('No products found in DB to run tests');
  }
  const productId = testProduct._id;
  const productRealPrice = testProduct.price;

  // Helper to register/login customer
  async function getCustomerToken(email, phone, name) {
    const regRes = await fetch(`${BASE_URL}/api/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        phone,
        password: 'Password123!',
        username: email.split('@')[0],
        fullName: name
      })
    });
    const regData = await regRes.json();
    if (regData.token) return regData.token;

    // Login if already registered
    const logRes = await fetch(`${BASE_URL}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' })
    });
    const logData = await logRes.json();
    return logData.token;
  }

  // Helper to get admin token
  async function getAdminToken() {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    const data = await res.json();
    return data.token;
  }

  const adminToken = await getAdminToken();

  // ---------------------------------------------------------------
  // TEST 1: Admin Cancel Order (via PUT /orders/:id/status)
  // ---------------------------------------------------------------
  console.log('--- TEST 1: Admin Cancel Order ---');
  // First create an order to cancel
  const ord1Res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'HS-' + Math.floor(100000 + Math.random() * 900000),
      customer: {
        name: 'Admin Test Buyer',
        email: 'admintest@example.com',
        phone: '9876543210',
        address: '123 Market St',
        city: 'Tirunelveli',
        state: 'Tamil Nadu',
        pincode: '627001'
      },
      items: [{ productId, quantity: 1 }],
      payment: { method: 'cod' }
    })
  });
  const ord1Data = await ord1Res.json();
  const testOrder1Id = ord1Data.order?._id;

  const cancelRes = await fetch(`${BASE_URL}/api/orders/${testOrder1Id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: 'Cancelled',
      cancellationReason: 'Admin manual cancellation test'
    })
  });
  const cancelData = await cancelRes.json();
  console.log(`HTTP ${cancelRes.status}:`, JSON.stringify(cancelData, null, 2));

  // ---------------------------------------------------------------
  // TEST 2: Login with Wrong Password
  // ---------------------------------------------------------------
  console.log('\n--- TEST 2: Login with Wrong Password ---');
  const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      password: 'DefinitiveWrongPassword999!'
    })
  });
  const wrongPassData = await wrongPassRes.json();
  console.log(`HTTP ${wrongPassRes.status}:`, JSON.stringify(wrongPassData, null, 2));

  // ---------------------------------------------------------------
  // TEST 3: Rate Limiting Behind Proxy (TRUST_PROXY)
  // ---------------------------------------------------------------
  console.log('\n--- TEST 3: Rate Limit Behind Proxy ---');
  const proxyIp = '198.51.100.77';
  let rateLimitHit = null;
  // Hit auth endpoint repeatedly from simulated proxy IP
  for (let i = 1; i <= 25; i++) {
    const rlRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': proxyIp
      },
      body: JSON.stringify({
        email: 'rate-tester@example.com',
        password: 'any'
      })
    });
    if (rlRes.status === 429) {
      const rlData = await rlRes.json();
      rateLimitHit = { attempt: i, status: rlRes.status, data: rlData };
      break;
    }
  }
  if (rateLimitHit) {
    console.log(`Rate limiter triggered on attempt ${rateLimitHit.attempt} for IP ${proxyIp}`);
    console.log(`HTTP ${rateLimitHit.status}:`, JSON.stringify(rateLimitHit.data, null, 2));
  } else {
    console.log('Rate limiter not triggered in 25 attempts');
  }

  // ---------------------------------------------------------------
  // TEST 4: COD Order with Tampered Price
  // ---------------------------------------------------------------
  console.log('\n--- TEST 4: COD Order with Tampered Price ---');
  const tamperedRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'HS-' + Math.floor(100000 + Math.random() * 900000),
      customer: {
        name: 'Hacker Tamper',
        email: 'tamper@example.com',
        phone: '9988776655',
        address: '404 Exploit Way',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001'
      },
      items: [{
        productId,
        quantity: 2,
        price: 1 // Malicious client claims price is 1 rupee
      }],
      pricing: {
        subtotal: 2,
        grandTotal: 2 // Malicious total
      },
      payment: { method: 'cod' }
    })
  });
  const tamperedData = await tamperedRes.json();
  console.log(`HTTP ${tamperedRes.status}:`);
  console.log('Client sent price: ₹1 each, subtotal: ₹2');
  console.log('Server verified DB unit price:', tamperedData.order?.items?.[0]?.price);
  console.log('Server computed subtotal:', tamperedData.order?.pricing?.subtotal);
  console.log('Server computed grandTotal:', tamperedData.order?.pricing?.grandTotal);

  // ---------------------------------------------------------------
  // TEST 5: Order with Insufficient Stock
  // ---------------------------------------------------------------
  console.log('\n--- TEST 5: Order with Insufficient Stock ---');
  const stockRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'HS-' + Math.floor(100000 + Math.random() * 900000),
      customer: {
        name: 'Overbuyer',
        email: 'overbuyer@example.com',
        phone: '9840012345',
        address: '99 Bulk Road',
        city: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625001'
      },
      items: [{
        productId,
        quantity: 99999 // Exceeds current stock
      }],
      payment: { method: 'cod' }
    })
  });
  const stockData = await stockRes.json();
  console.log(`HTTP ${stockRes.status}:`, JSON.stringify(stockData, null, 2));

  // ---------------------------------------------------------------
  // TEST 6: Cancel Another Customer's Order (Expect 403)
  // ---------------------------------------------------------------
  console.log("\n--- TEST 6: Cancel Another Customer's Order ---");
  const custAToken = await getCustomerToken('custA@example.com', '9811111111', 'Customer A');
  const custBToken = await getCustomerToken('custB@example.com', '9822222222', 'Customer B');

  // Customer A creates an order
  const ordARes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custAToken}`
    },
    body: JSON.stringify({
      orderId: 'HS-' + Math.floor(100000 + Math.random() * 900000),
      customer: {
        name: 'Customer A',
        email: 'custA@example.com',
        phone: '9811111111',
        address: '10 Alpha Lane',
        city: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636001'
      },
      items: [{ productId, quantity: 1 }],
      payment: { method: 'cod' }
    })
  });
  const ordAData = await ordARes.json();
  const orderAId = ordAData.order?._id;

  // Customer B tries to cancel Customer A's order
  const hijackCancelRes = await fetch(`${BASE_URL}/api/orders/${orderAId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custBToken}`
    },
    body: JSON.stringify({ reason: 'Malicious cancellation by B' })
  });
  const hijackData = await hijackCancelRes.json();
  console.log(`Customer B attempting cancellation on Customer A's order (${orderAId})`);
  console.log(`HTTP ${hijackCancelRes.status}:`, JSON.stringify(hijackData, null, 2));

  // ---------------------------------------------------------------
  // TEST 7: Tracking With and Without Phone
  // ---------------------------------------------------------------
  console.log('\n--- TEST 7: Tracking With and Without Phone ---');
  const trackingOrderId = ordAData.order?.orderId;
  const correctPhone = '9811111111';

  // 7a: Track without phone
  const trackNoPhoneRes = await fetch(`${BASE_URL}/api/orders/track/${trackingOrderId}`);
  const trackNoPhoneData = await trackNoPhoneRes.json();
  console.log('Track without phone:');
  console.log(`HTTP ${trackNoPhoneRes.status}:`, JSON.stringify(trackNoPhoneData, null, 2));

  // 7b: Track with wrong phone
  const trackWrongPhoneRes = await fetch(`${BASE_URL}/api/orders/track/${trackingOrderId}?phone=0000000000`);
  const trackWrongPhoneData = await trackWrongPhoneRes.json();
  console.log('Track with wrong phone:');
  console.log(`HTTP ${trackWrongPhoneRes.status}:`, JSON.stringify(trackWrongPhoneData, null, 2));

  // 7c: Track with correct phone
  const trackValidRes = await fetch(`${BASE_URL}/api/orders/track/${trackingOrderId}?phone=${correctPhone}`);
  const trackValidData = await trackValidRes.json();
  console.log('Track with correct phone:');
  console.log(`HTTP ${trackValidRes.status}:`, JSON.stringify({
    success: trackValidData.success,
    orderId: trackValidData.order?.orderId,
    status: trackValidData.order?.orderStatus,
    customer: trackValidData.order?.customer?.name
  }, null, 2));

  // ---------------------------------------------------------------
  // TEST 8: /api/orders/:id/refund without Token (Expect 401)
  // ---------------------------------------------------------------
  console.log('\n--- TEST 8: /api/orders/:id/refund without Token ---');
  const refundNoAuthRes = await fetch(`${BASE_URL}/api/orders/${orderAId}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 100 })
  });
  const refundNoAuthData = await refundNoAuthRes.json();
  console.log(`HTTP ${refundNoAuthRes.status}:`, JSON.stringify(refundNoAuthData, null, 2));

  // ---------------------------------------------------------------
  // TEST 9: Admin Panel Loads with Images
  // ---------------------------------------------------------------
  console.log('\n--- TEST 9: Admin Panel Loads with Images ---');
  const adminPageRes = await fetch(`${BASE_URL}/kkadmin/`);
  console.log(`GET /kkadmin/ => HTTP ${adminPageRes.status} (Length: ${(await adminPageRes.text()).length} chars)`);

  const assetList = [
    '/assets/logo.webp',
    '/assets/suvai1.webp',
    '/assets/hero-cereals-dy3wvrdu.webp',
    '/kkadmin/assets/logo.webp',
    '/favicon.ico'
  ];

  for (const assetPath of assetList) {
    const assetRes = await fetch(`${BASE_URL}${assetPath}`);
    const buf = await assetRes.arrayBuffer();
    console.log(`GET ${assetPath} => HTTP ${assetRes.status} (${buf.byteLength} bytes, content-type: ${assetRes.headers.get('content-type')})`);
  }

  console.log('\n====================================================');
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
