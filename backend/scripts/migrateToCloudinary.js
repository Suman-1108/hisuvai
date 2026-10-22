require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { cloudinary } = require('../utils/cloudinary');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Setting = require('../models/Setting');

const backendDir = path.join(__dirname, '..');
const publicDir = path.join(backendDir, '..', 'public');

async function uploadLocalFileToCloudinary(relativePath, folder) {
  if (!relativePath) return null;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath; // Already remote
  }

  // Resolve absolute path
  let absPath = null;
  const cleanPath = relativePath.replace(/^\/+/, '');

  if (cleanPath.startsWith('uploads/')) {
    absPath = path.join(backendDir, cleanPath);
  } else if (cleanPath.startsWith('assets/')) {
    absPath = path.join(publicDir, cleanPath);
  } else {
    // Try both
    const tryUploads = path.join(backendDir, 'uploads', cleanPath);
    const tryAssets = path.join(publicDir, 'assets', cleanPath);
    if (fs.existsSync(tryUploads)) absPath = tryUploads;
    else if (fs.existsSync(tryAssets)) absPath = tryAssets;
  }

  if (!absPath || !fs.existsSync(absPath)) {
    console.warn(`[Skip] File not found on disk: ${relativePath}`);
    return null;
  }

  try {
    const res = await cloudinary.uploader.upload(absPath, {
      folder: folder,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true
    });
    console.log(`✓ Uploaded ${path.basename(absPath)} -> ${res.secure_url}`);
    return res.secure_url;
  } catch (err) {
    console.error(`✗ Cloudinary upload failed for ${absPath}:`, err.message);
    return null;
  }
}

async function runMigration() {
  console.log('🚀 Starting Cloudinary Media Migration...');
  console.log('Cloud Name:', cloudinary.config().cloud_name);

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB Atlas\n');

  // 1. MIGRATE HERO BANNERS
  console.log('--- Migrating Banners ---');
  const banners = await Banner.find();
  for (const b of banners) {
    let updated = false;
    if (b.image && !b.image.startsWith('http')) {
      const cUrl = await uploadLocalFileToCloudinary(b.image, 'hisuvai/banners');
      if (cUrl) { b.image = cUrl; updated = true; }
    }
    if (b.mobileImage && !b.mobileImage.startsWith('http')) {
      const cUrl = await uploadLocalFileToCloudinary(b.mobileImage, 'hisuvai/banners');
      if (cUrl) { b.mobileImage = cUrl; updated = true; }
    }
    if (updated) {
      await b.save();
      console.log(`Saved Banner Slot ${b.slot}`);
    }
  }

  // 2. MIGRATE SPECIAL OFFERS & SETTINGS
  console.log('\n--- Migrating Settings & Offers ---');
  const settings = await Setting.findOne({ key: 'store_config' });
  if (settings) {
    let updated = false;
    if (settings.storeLogo && !settings.storeLogo.startsWith('http')) {
      const cUrl = await uploadLocalFileToCloudinary(settings.storeLogo, 'hisuvai/settings');
      if (cUrl) { settings.storeLogo = cUrl; updated = true; }
    }
    if (settings.specialOffers && Array.isArray(settings.specialOffers)) {
      for (const off of settings.specialOffers) {
        if (off.image && !off.image.startsWith('http')) {
          const cUrl = await uploadLocalFileToCloudinary(off.image, 'hisuvai/settings');
          if (cUrl) { off.image = cUrl; updated = true; }
        }
      }
    }
    if (updated) {
      await settings.save();
      console.log('Saved Store Settings with Cloudinary URLs');
    }
  }

  // 3. MIGRATE PRODUCTS
  console.log('\n--- Migrating Products ---');
  const products = await Product.find();
  for (const p of products) {
    let updated = false;
    if (p.image && !p.image.startsWith('http')) {
      const cUrl = await uploadLocalFileToCloudinary(p.image, 'hisuvai/products');
      if (cUrl) { p.image = cUrl; updated = true; }
    }
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      const newImages = [];
      for (const img of p.images) {
        if (!img.startsWith('http')) {
          const cUrl = await uploadLocalFileToCloudinary(img, 'hisuvai/products');
          if (cUrl) { newImages.push(cUrl); updated = true; }
          else newImages.push(img);
        } else {
          newImages.push(img);
        }
      }
      p.images = newImages;
    }
    if (updated) {
      await p.save();
      console.log(`Saved Product: ${p.name} -> ${p.image}`);
    }
  }

  console.log('\n🎉 Cloudinary Migration Completed Successfully!');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
