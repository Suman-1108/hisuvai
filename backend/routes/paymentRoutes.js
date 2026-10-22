const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protectAdmin } = require('../middleware/authMiddleware');

// Helper to instantiate Razorpay instance dynamically from process.env
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay API keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured in environment variables.');
  }

  return new Razorpay({ key_id, key_secret });
};

// @route   GET /api/payment/razorpay-key
// @desc    Get configured Razorpay Public Key ID (Safe for frontend checkout script)
// @access  Public
router.get('/razorpay-key', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  return res.status(200).json({
    success: true,
    keyId,
    configured: Boolean(keyId && process.env.RAZORPAY_KEY_SECRET)
  });
});

// @route   POST /api/payment/create-razorpay-order
// @desc    Create a Razorpay order before opening frontend popup
// @access  Public
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount specified.'
      });
    }

    const razorpay = getRazorpayInstance();

    // Amount in Razorpay must be an integer in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(numAmount * 100),
      currency: currency.toUpperCase(),
      receipt: orderId ? `rcpt_${orderId}` : `rcpt_${Date.now()}`,
      notes: {
        orderId: orderId || ''
      }
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('[Razorpay Create Order Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating Razorpay order.'
    });
  }
});

// @route   POST /api/payment/verify-razorpay-signature
// @desc    Verify Razorpay payment signature after successful checkout popup
// @access  Public
router.post('/verify-razorpay-signature', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment response parameters.'
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay secret key is missing on the server.'
      });
    }

    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: 'Razorpay payment verified successfully.'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Razorpay payment verification failed: Invalid signature.'
      });
    }
  } catch (error) {
    console.error('[Razorpay Signature Verification Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during Razorpay payment verification.'
    });
  }
});

// @route   GET /api/payment/razorpay-stats
// @desc    Get Razorpay dashboard metrics and online payment transactions
// @access  Private (Admin)
router.get('/razorpay-stats', protectAdmin, async (req, res) => {
  try {
    const Order = require('../models/Order');

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const isConfigured = Boolean(keyId && keySecret);
    const isLive = keyId.startsWith('rzp_live');

    // Aggregate online paid revenue
    const onlinePaidAgg = await Order.aggregate([
      {
        $match: {
          'payment.status': 'paid',
          'payment.method': { $in: ['razorpay', 'upi'] }
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$pricing.grandTotal' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Aggregate total refunds processed
    const refundsAgg = await Order.aggregate([
      {
        $match: {
          'payment.refundStatus': 'processed'
        }
      },
      {
        $group: {
          _id: null,
          totalRefunded: { $sum: '$payment.refundAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalCollected = onlinePaidAgg.length > 0 ? onlinePaidAgg[0].totalCollected : 0;
    const paidCount = onlinePaidAgg.length > 0 ? onlinePaidAgg[0].count : 0;
    const totalRefunded = refundsAgg.length > 0 ? refundsAgg[0].totalRefunded : 0;
    const refundCount = refundsAgg.length > 0 ? refundsAgg[0].count : 0;

    // Fetch recent online orders (razorpay / upi OR paid)
    const onlineOrders = await Order.find({
      $or: [
        { 'payment.method': { $in: ['razorpay', 'upi'] } },
        { 'payment.status': 'paid' },
        { 'payment.refundStatus': { $ne: 'none' } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      config: {
        isConfigured,
        mode: isLive ? 'Live Production' : (isConfigured ? 'Test Mode' : 'Not Configured'),
        maskedKeyId: keyId ? (keyId.substring(0, 8) + '••••••••') : 'Not Set'
      },
      stats: {
        totalCollected,
        paidCount,
        totalRefunded,
        refundCount,
        netRevenue: Math.max(0, totalCollected - totalRefunded)
      },
      transactions: onlineOrders
    });
  } catch (error) {
    console.error('[Razorpay Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching Razorpay stats.'
    });
  }
});

module.exports = router;
