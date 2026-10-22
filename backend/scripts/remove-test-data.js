const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

const isApply = process.argv.includes('--apply');

// Common test patterns used in verification suites
const TEST_NAMES = [
  'Admin Test Buyer',
  'Customer A',
  'Customer B',
  'Hacker Tamper',
  'Overbuyer',
  'Test Customer',
  'Proxy Tester',
  'Test User'
];

const TEST_PHONES = [
  '9876543210',
  '9811111111',
  '9822222222',
  '9988776655',
  '9840012345',
  '9123456789',
  '9000000000'
];

const TEST_EMAIL_REGEX = /(@example\.com|test_|cust_a_|cust_b_|tamper_|buyer_|stocktest_|proxy_)/i;

async function runCleanup() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hi_suvai';
  console.log(`\n==================================================`);
  console.log(`Hi Suvai Test Data Cleanup Tool`);
  console.log(`Mode: ${isApply ? '🚀 APPLY (Live Cleanup & Restock)' : '🔍 DRY-RUN (Preview Only, pass --apply to execute)'}`);
  console.log(`==================================================\n`);

  try {
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}\n`);

    // 1. Locate Test Orders
    const orderQuery = {
      $or: [
        { 'customer.name': { $in: TEST_NAMES } },
        { 'customer.phone': { $in: TEST_PHONES } },
        { 'customer.email': { $regex: TEST_EMAIL_REGEX } },
        { notes: { $regex: /test/i } }
      ]
    };

    const testOrders = await Order.find(orderQuery);
    console.log(`Found ${testOrders.length} test order(s) matching criteria:`);
    
    const restockPlan = new Map();

    for (const order of testOrders) {
      console.log(` - Order #${order.orderId} [${order.orderStatus}] | Name: "${order.customer?.name}" | Phone: ${order.customer?.phone} | Total: ₹${order.pricing?.grandTotal || 0}`);
      
      // If order was placed and not yet cancelled, its stock should be restored upon cleanup
      if (order.orderStatus !== 'Cancelled') {
        for (const item of (order.items || [])) {
          const prodId = (item.product && item.product._id) ? String(item.product._id) : String(item.product || item._id);
          const qty = Number(item.quantity) || 1;
          const current = restockPlan.get(prodId) || { name: item.name, quantity: 0 };
          current.quantity += qty;
          restockPlan.set(prodId, current);
        }
      }
    }

    // 2. Locate Test Customers
    const customerQuery = {
      $or: [
        { name: { $in: TEST_NAMES } },
        { phone: { $in: TEST_PHONES } },
        { email: { $regex: TEST_EMAIL_REGEX } },
        { username: { $regex: /^(cust_a|cust_b|tamper|test|buyer|overbuyer)/i } }
      ]
    };

    const testCustomers = await Customer.find(customerQuery);
    console.log(`\nFound ${testCustomers.length} test customer(s) matching criteria:`);
    for (const cust of testCustomers) {
      console.log(` - Customer "${cust.name}" | Email: ${cust.email} | Phone: ${cust.phone || 'N/A'}`);
    }

    // 3. Planned Inventory Restocks
    console.log(`\nInventory Restock Plan (${restockPlan.size} product(s)):`);
    if (restockPlan.size === 0) {
      console.log(` - None (all matched orders were already cancelled or had no items)`);
    } else {
      for (const [prodId, data] of restockPlan.entries()) {
        console.log(` - Product [${prodId}] "${data.name}": +${data.quantity} units`);
      }
    }

    if (!isApply) {
      console.log(`\n--------------------------------------------------`);
      console.log(`[DRY-RUN COMPLETE] No database modifications made.`);
      console.log(`To restore stock and delete these test records, rerun with:`);
      console.log(`  node backend/scripts/remove-test-data.js --apply`);
      console.log(`--------------------------------------------------\n`);
      await mongoose.disconnect();
      return;
    }

    // Execution with --apply
    console.log(`\n>>> Executing Inventory Restock...`);
    let restockedCount = 0;
    for (const [prodId, data] of restockPlan.entries()) {
      if (mongoose.Types.ObjectId.isValid(prodId)) {
        const updateRes = await Product.updateOne(
          { _id: prodId },
          { $inc: { stock: data.quantity } }
        );
        if (updateRes.modifiedCount > 0) {
          console.log(`  ✔ Restocked ${data.quantity} units for "${data.name}" (${prodId})`);
          restockedCount += data.quantity;
        }
      }
    }

    console.log(`\n>>> Deleting Test Orders...`);
    const deleteOrdersRes = await Order.deleteMany(orderQuery);
    console.log(`  ✔ Deleted ${deleteOrdersRes.deletedCount} test order(s)`);

    console.log(`\n>>> Deleting Test Customers...`);
    const deleteCustRes = await Customer.deleteMany(customerQuery);
    console.log(`  ✔ Deleted ${deleteCustRes.deletedCount} test customer(s)`);

    console.log(`\n==================================================`);
    console.log(`Cleanup Complete!`);
    console.log(` - Orders Removed: ${deleteOrdersRes.deletedCount}`);
    console.log(` - Customers Removed: ${deleteCustRes.deletedCount}`);
    console.log(` - Total Product Units Restocked: ${restockedCount}`);
    console.log(`==================================================\n`);

  } catch (err) {
    console.error('Error during cleanup script:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runCleanup();
