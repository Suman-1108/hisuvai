const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');
const { protectAdmin } = require('../middleware/authMiddleware');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../utils/cloudinary');

// Storage for hero banners
const bannerUploadDir = path.join(__dirname, '..', 'uploads', 'banners');
if (!fs.existsSync(bannerUploadDir)) {
  fs.mkdirSync(bannerUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bannerUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `banner-slot-${uniqueSuffix}${ext}`);
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
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});

// @route   GET /api/banners
// @desc    Get all hero banners
// @access  Public
router.get('/', async (req, res) => {
  try {
    let banners = await Banner.find({ isActive: true }).sort({ slot: 1 });

    // If no banners seeded, seed default 3 slots
    if (banners.length === 0) {
      const defaultBanners = [
        {
          slot: 1,
          title: 'Cereals & Pluses Health Mix',
          subtitle: 'Wholesome, natural & nutritious 24 grain instant cereal mix.',
          image: 'assets/hero-cereals-dy3wvrdu.webp',
          mobileImage: 'assets/hero-mobile-1.webp',
          link: '#products',
          isActive: true,
          deviceType: 'desktop'
        },
        {
          slot: 2,
          title: '16 Variety Traditional Rice Porridge Mix',
          subtitle: 'A perfect blend of 16 traditional Tamil rice varieties.',
          image: 'assets/hero-banner-2.webp',
          mobileImage: 'assets/hero-mobile-2.webp',
          link: '#products',
          isActive: true,
          deviceType: 'desktop'
        },
        {
          slot: 3,
          title: 'Traditional Products Catalogue',
          subtitle: 'Authentic heritage grains, mixes, sooji, podi and traditional foods.',
          image: 'assets/hero-banner-3.webp',
          mobileImage: 'assets/mobile_portait_hero22.webp',
          link: '#products',
          isActive: true,
          deviceType: 'desktop'
        }
      ];
      banners = await Banner.insertMany(defaultBanners);
    }

    return res.status(200).json({
      success: true,
      banners
    });
  } catch (error) {
    console.error('Fetch Banners Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
});

// @route   POST /api/banners/upload
// @desc    Upload or update slot banner (Admin only)
// @access  Private (Admin)
router.post('/slot/:slotNumber', protectAdmin, upload.fields([{ name: 'bannerImage', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), async (req, res) => {
  try {
    const slotNumber = parseInt(req.params.slotNumber, 10);
    if (![1, 2, 3].includes(slotNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid slot number (1, 2, 3 only)' });
    }

    let banner = await Banner.findOne({ slot: slotNumber });
    if (!banner) {
      banner = new Banner({ slot: slotNumber });
    }

    const { title, subtitle, link, isActive } = req.body;
    if (title) banner.title = title;
    if (subtitle) banner.subtitle = subtitle;
    if (link) banner.link = link;
    if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;

    if (req.files) {
      if (req.files.bannerImage && req.files.bannerImage.length > 0) {
        if (isCloudinaryConfigured()) {
          const cRes = await uploadToCloudinary(req.files.bannerImage[0].path, 'hisuvai/banners');
          banner.image = cRes.url;
        } else {
          banner.image = `/uploads/banners/${req.files.bannerImage[0].filename}`;
        }
      }
      if (req.files.mobileImage && req.files.mobileImage.length > 0) {
        if (isCloudinaryConfigured()) {
          const cRes = await uploadToCloudinary(req.files.mobileImage[0].path, 'hisuvai/banners');
          banner.mobileImage = cRes.url;
        } else {
          banner.mobileImage = `/uploads/banners/${req.files.mobileImage[0].filename}`;
        }
      }
    } else if (req.file) {
      // Fallback for older single upload
      if (isCloudinaryConfigured()) {
        const cRes = await uploadToCloudinary(req.file.path, 'hisuvai/banners');
        banner.image = cRes.url;
      } else {
        banner.image = `/uploads/banners/${req.file.filename}`;
      }
    }

    await banner.save();

    return res.status(200).json({
      success: true,
      message: `Banner Slot ${slotNumber} updated successfully!`,
      banner
    });
  } catch (error) {
    console.error('Update Banner Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update banner' });
  }
});

module.exports = router;
