const cloudinary = require('cloudinary').v2;
const fs = require('fs');

/**
 * Cloudinary Storage Service
 * Handles uploading files to Cloudinary and removing local temporary files.
 */
class StorageService {
  constructor() {
    this.configure();
  }

  configure() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      });
    }
  }

  /**
   * Upload an image file to Cloudinary and clean up the local temp file.
   * @param {string} filePath - Absolute or relative path to the local temporary file
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async uploadImage(filePath) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // Clean up local temp file before throwing
      if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
      throw new Error('Cloudinary configuration missing. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in environment.');
    }

    // Ensure config is fresh in case env vars were loaded dynamically
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'smart-civic-issues',
        resource_type: 'image'
      });

      // Remove temp file from local filesystem
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn(`Failed to clean up temporary file ${filePath}:`, unlinkErr.message);
        }
      }

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      // Clean up temp file on upload error
      if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
      console.error('Cloudinary upload error:', error.message);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }
}

module.exports = new StorageService();
