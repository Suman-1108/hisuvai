const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Setting = require('../models/Setting');
const { protectAdmin } = require('../middleware/authMiddleware');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../utils/cloudinary');

// Storage for store logo and settings uploads
const settingsUploadDir = path.join(__dirname, '..', 'uploads', 'settings');
if (!fs.existsSync(settingsUploadDir)) {
  fs.mkdirSync(settingsUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, settingsUploadDir);
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const prefix = file.fieldname === 'offerImage' ? 'offer' : 'logo';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, JPEG, PNG, and WEBP images are supported.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// @route   GET /api/settings
// @desc    Get public store settings (Social links, contact info, logo)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne({ key: 'store_config' });
    if (!settings) {
      settings = await Setting.create({
        key: 'store_config',
        storeName: 'Hi Suvai',
        storeLogo: 'assets/logo.png',
        supportPhone: '6381926567',
        contactEmail: 'contact@hisuvai.com',
        storeAddress: '15A, Madasamy Kovil Street, Pettai, Tirunelveli - 627004. Tamil Nadu, India.',
        aboutText: 'Pure Traditional Taste & Ancient Roots — Handcrafted Foods from Tamil Nadu.',
        facebookUrl: 'https://facebook.com/hisuvai',
        instagramUrl: 'https://instagram.com/hisuvai',
        youtubeUrl: 'https://youtube.com/@hisuvai',
        whatsappNumber: '916381926567'
      });
    }

    return res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Fetch Settings Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// @route   PUT /api/settings
// @desc    Update store settings (Admin only)
// @access  Private (Admin)
router.put('/', protectAdmin, upload.single('storeLogo'), async (req, res) => {
  try {
    let settings = await Setting.findOne({ key: 'store_config' });
    if (!settings) {
      settings = new Setting({ key: 'store_config' });
    }

    const {
      storeName,
      supportPhone,
      contactEmail,
      storeAddress,
      aboutText,
      facebookUrl,
      instagramUrl,
      youtubeUrl,
      whatsappNumber,
      customCategories,
      priceRanges,
      proprietorName,
      googleMapUrl,
      specialOffers
    } = req.body;

    if (storeName) settings.storeName = storeName;
    if (supportPhone) settings.supportPhone = supportPhone;
    if (contactEmail) settings.contactEmail = contactEmail;
    if (storeAddress) settings.storeAddress = storeAddress;
    if (aboutText) settings.aboutText = aboutText;
    if (proprietorName) settings.proprietorName = proprietorName;
    if (googleMapUrl) settings.googleMapUrl = googleMapUrl;
    if (facebookUrl !== undefined) settings.facebookUrl = facebookUrl;
    if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl;
    if (youtubeUrl !== undefined) settings.youtubeUrl = youtubeUrl;
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;

    if (customCategories) {
      try {
        settings.customCategories = typeof customCategories === 'string' ? JSON.parse(customCategories) : customCategories;
      } catch (err) {
        console.warn('Error parsing customCategories:', err);
      }
    }

    if (priceRanges) {
      try {
        settings.priceRanges = typeof priceRanges === 'string' ? JSON.parse(priceRanges) : priceRanges;
      } catch (err) {
        console.warn('Error parsing priceRanges:', err);
      }
    }

    if (specialOffers) {
      try {
        settings.specialOffers = typeof specialOffers === 'string' ? JSON.parse(specialOffers) : specialOffers;
      } catch (err) {
        console.warn('Error parsing specialOffers:', err);
      }
    }

    if (req.file) {
      if (isCloudinaryConfigured()) {
        const cRes = await uploadToCloudinary(req.file.path, 'hisuvai/settings');
        settings.storeLogo = cRes.url;
      } else {
        settings.storeLogo = `/uploads/settings/${req.file.filename}`;
      }
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'Store settings updated successfully!',
      settings
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update settings' });
  }
});

// @route   POST /api/settings/upload-offer-image
// @desc    Upload an image for Special Offers & Combo packs (Admin only)
// @access  Private (Admin)
router.post('/upload-offer-image', protectAdmin, upload.single('offerImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    let imageUrl;
    if (isCloudinaryConfigured()) {
      const cRes = await uploadToCloudinary(req.file.path, 'hisuvai/settings');
      imageUrl = cRes.url;
    } else {
      imageUrl = `/uploads/settings/${req.file.filename}`;
    }
    return res.status(200).json({
      success: true,
      message: 'Offer image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Offer Image Upload Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload offer image' });
  }
});

module.exports = router;
