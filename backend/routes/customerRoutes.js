const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  getCustomerMe,
  updateCustomerProfile,
  getAllCustomers,
  getCustomerDetails,
  deleteCustomer
} = require('../controllers/customerController');
const { protectAdmin, protectCustomer } = require('../middleware/authMiddleware');

// Public customer registration & login (rate limiting applied at app level)
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Authenticated Customer Profile routes
router.get('/me', protectCustomer, getCustomerMe);
router.put('/profile', protectCustomer, updateCustomerProfile);

// Admin-only customer management routes
router.get('/', protectAdmin, getAllCustomers);
router.get('/:id', protectAdmin, getCustomerDetails);
router.delete('/:id', protectAdmin, deleteCustomer);

module.exports = router;
