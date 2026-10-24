const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  getFeaturedProducts,
  getProductsByCategory,
  updateProductStock
} = require('../controllers/productController');

const { protectAdmin } = require('../middleware/authMiddleware');
const { uploadProductMedia } = require('../middleware/uploadMiddleware');

// Specific sub-path routes first
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/stats', protectAdmin, getProductStats);
router.get('/admin/stats', protectAdmin, getProductStats);

// Stock adjustment routes (Admin only)
router.patch('/:id/stock', protectAdmin, updateProductStock);
router.put('/:id/stock', protectAdmin, updateProductStock);

// General ID routes
router.get('/:id', getProductById);
router.post('/', protectAdmin, uploadProductMedia, createProduct);
router.put('/:id', protectAdmin, uploadProductMedia, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

module.exports = router;
