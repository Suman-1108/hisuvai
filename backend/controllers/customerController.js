const Customer = require('../models/Customer');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Helper to generate customer JWT
const generateCustomerToken = (customer) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }
  return jwt.sign(
    { id: customer._id, role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new customer
// @route   POST /api/customers/register
// @access  Public
exports.registerCustomer = async (req, res) => {
  try {
    const { name, username, email, phone, password, fname, lname } = req.body;

    const finalName = (name || ((fname || '') + ' ' + (lname || '')).trim() || username || '').trim();
    const finalEmail = (email || '').toLowerCase().trim();
    const finalUsername = (username || '').toLowerCase().trim();
    const finalPhone = (phone || '').trim();

    if (!finalEmail) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long.'
      });
    }

    // Check if customer already exists by email, username, or phone
    const conflictOr = [{ email: finalEmail }];
    if (finalUsername) conflictOr.push({ username: finalUsername });
    if (finalPhone) conflictOr.push({ phone: finalPhone });

    const existingCustomer = await Customer.findOne({ $or: conflictOr });

    if (existingCustomer) {
      // "Claim Account" flow: If customer exists with the same email but has NO password, set their password
      if (existingCustomer.email === finalEmail && (!existingCustomer.password || existingCustomer.password.trim() === '')) {
        existingCustomer.password = password; // pre-save hook will hash it
        if (finalName && !existingCustomer.name) existingCustomer.name = finalName;
        if (finalPhone && !existingCustomer.phone) existingCustomer.phone = finalPhone;
        if (finalUsername && !existingCustomer.username) existingCustomer.username = finalUsername;
        existingCustomer.status = 'active';

        const savedCustomer = await existingCustomer.save();
        const token = generateCustomerToken(savedCustomer);

        return res.status(200).json({
          success: true,
          message: 'Account claimed and password set successfully! Welcome to Hi Suvai.',
          token,
          customer: {
            id: savedCustomer._id,
            name: savedCustomer.name,
            username: savedCustomer.username,
            email: savedCustomer.email,
            phone: savedCustomer.phone,
            role: 'customer'
          }
        });
      }

      let conflictField = 'Email';
      if (existingCustomer.email === finalEmail) {
        conflictField = 'Email address';
      } else if (finalUsername && existingCustomer.username === finalUsername) {
        conflictField = 'Username';
      } else if (finalPhone && existingCustomer.phone === finalPhone) {
        conflictField = 'Phone number';
      }

      return res.status(409).json({
        success: false,
        message: `${conflictField} is already registered. Please sign in or use a different ${conflictField.toLowerCase()}.`
      });
    }

    // Create new customer account
    const customer = new Customer({
      name: finalName || finalUsername || finalEmail.split('@')[0],
      username: finalUsername || finalEmail.split('@')[0],
      email: finalEmail,
      phone: finalPhone,
      password: password,
      lastLoginAt: new Date()
    });

    await customer.save();

    const token = generateCustomerToken(customer);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        username: customer.username,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        lastLoginAt: customer.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Customer register error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during customer registration.',
      error: error.message
    });
  }
};

// @desc    Customer login / sign in
// @route   POST /api/customers/login
// @access  Public (Rate-limited)
exports.loginCustomer = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = (email || username || '').toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your Username/Email and Password.'
      });
    }

    const customer = await Customer.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier }
      ]
    }).select('+password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    if (customer.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact customer support.'
      });
    }

    // Secure password comparison
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    customer.lastLoginAt = new Date();
    await customer.save();

    const token = generateCustomerToken(customer);

    return res.status(200).json({
      success: true,
      message: 'Sign in successful.',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        username: customer.username,
        email: customer.email,
        phone: customer.phone,
        addresses: customer.addresses,
        status: customer.status,
        lastLoginAt: customer.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during customer login.',
      error: error.message
    });
  }
};

// @desc    Get currently authenticated customer profile
// @route   GET /api/customers/me
// @access  Private (Customer)
exports.getCustomerMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      customer: req.customer
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving customer profile.'
    });
  }
};

// @desc    Sync profile updates (address, phone, name)
// @route   PUT /api/customers/profile
// @access  Private (Customer)
exports.updateCustomerProfile = async (req, res) => {
  try {
    const customer = req.customer;
    const { name, phone, addresses, username } = req.body;

    if (name) customer.name = name.trim();
    if (phone) customer.phone = phone.trim();
    if (username) customer.username = username.toLowerCase().trim();
    if (addresses && Array.isArray(addresses)) customer.addresses = addresses;

    customer.lastLoginAt = new Date();
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      customer: {
        id: customer._id,
        name: customer.name,
        username: customer.username,
        email: customer.email,
        phone: customer.phone,
        addresses: customer.addresses,
        status: customer.status,
        lastLoginAt: customer.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile.',
      error: error.message
    });
  }
};

// @desc    Get all customers with orders summary (FOR ADMIN)
// @route   GET /api/customers
// @access  Private (Admin)
exports.getAllCustomers = async (req, res) => {
  try {
    const { search, sort } = req.query;

    const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let matchStage = {};
    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      matchStage.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { username: searchRegex }
      ];
    }

    const pipeline = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: 'orders',
          let: {
            cEmail: { $toLower: { $ifNull: ['$email', ''] } },
            cPhone: { $ifNull: ['$phone', ''] }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $ne: ['$$cEmail', ''] },
                        { $eq: [{ $toLower: { $ifNull: ['$customer.email', ''] } }, '$$cEmail'] }
                      ]
                    },
                    {
                      $and: [
                        { $ne: ['$$cPhone', ''] },
                        { $eq: [{ $ifNull: ['$customer.phone', ''] }, '$$cPhone'] }
                      ]
                    }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpend: { $sum: { $ifNull: ['$pricing.grandTotal', 0] } },
                lastOrderDate: { $max: '$createdAt' }
              }
            }
          ],
          as: 'orderSummary'
        }
      },
      {
        $addFields: {
          summary: { $arrayElemAt: ['$orderSummary', 0] }
        }
      },
      {
        $addFields: {
          totalOrders: { $ifNull: ['$summary.totalOrders', 0] },
          totalSpend: { $ifNull: ['$summary.totalSpend', 0] },
          lastOrderDate: '$summary.lastOrderDate'
        }
      },
      {
        $project: {
          password: 0,
          orderSummary: 0,
          summary: 0
        }
      }
    ];

    let sortStage = { createdAt: -1 };
    if (sort === 'orders_desc') {
      sortStage = { totalOrders: -1, createdAt: -1 };
    } else if (sort === 'spend_desc') {
      sortStage = { totalSpend: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortStage = { createdAt: 1 };
    }
    pipeline.push({ $sort: sortStage });

    const customers = await Customer.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      count: customers.length,
      registeredCount: customers.length,
      customers
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving customers.',
      error: error.message
    });
  }
};

// @desc    Get single customer details + orders
// @route   GET /api/customers/:id
// @access  Private (Admin)
exports.getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    let customer = await Customer.findById(id).lean();
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    const custEmail = (customer.email || '').toLowerCase().trim();
    const custPhone = (customer.phone || '').trim();

    const orders = await Order.find({
      $or: [
        { 'customer.email': custEmail },
        { 'customer.phone': custPhone }
      ]
    }).sort({ createdAt: -1 }).lean();

    const totalSpend = orders.reduce((sum, o) => sum + (Number(o.pricing?.grandTotal) || 0), 0);

    return res.status(200).json({
      success: true,
      customer: {
        ...customer,
        totalOrders: orders.length,
        totalSpend,
        orders
      }
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving customer details.',
      error: error.message
    });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin)
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Customer ${customer.name} deleted successfully.`
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting customer.',
      error: error.message
    });
  }
};
