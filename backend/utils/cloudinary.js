const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary from environment variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'oobmqhzb',
    api_key: process.env.CLOUDINARY_API_KEY || '343613677646888',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'oF881uWaTqjZACE-Xw6C3NRHrxM'
  });
}

/**
 * Check if Cloudinary is configured with valid credentials
 */
function isCloudinaryConfigured() {
  const config = cloudinary.config();
  return Boolean(config.cloud_name && config.api_key && config.api_secret);
}

/**
 * Upload a local file or buffer to Cloudinary
 * @param {string} filePath - Absolute path to local file
 * @param {string} folder - Destination folder on Cloudinary (e.g. 'hisuvai/products')
 * @param {string} [publicId] - Optional public ID
 * @returns {Promise<{success: boolean, url: string, public_id: string}>}
 */
async function uploadToCloudinary(filePath, folder = 'hisuvai/uploads', publicId = null) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found on disk: ${filePath}`);
    }

    const options = {
      folder: folder,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      overwrite: false
    };

    if (publicId) {
      options.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(filePath, options);

    // Clean up temporary local file once uploaded to Cloudinary
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.warn('[Cloudinary] Could not delete temp file:', cleanupErr.message);
    }

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error.message);
    throw error;
  }
}

/**
 * Delete an asset from Cloudinary by public ID or URL
 * @param {string} urlOrPublicId
 */
async function deleteFromCloudinary(urlOrPublicId) {
  if (!urlOrPublicId) return;
  try {
    // If it's a full Cloudinary URL, extract public ID
    let publicId = urlOrPublicId;
    if (urlOrPublicId.includes('cloudinary.com')) {
      const parts = urlOrPublicId.split('/upload/');
      if (parts[1]) {
        // remove version part e.g. v12345/
        const withoutVersion = parts[1].replace(/^v\d+\//, '');
        // remove extension
        publicId = withoutVersion.replace(/\.[^/.]+$/, '');
      }
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[Cloudinary Delete Error]:', err.message);
  }
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary
};
