const fs = require('fs');
const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary Storage Service
 * Handles secure image uploads to Cloudinary and cleans up local temporary files.
 */
class StorageService {
  constructor() {
    this._configured = false;
  }

  _ensureConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    this._configured = true;
  }

  /**
   * Upload an image file to Cloudinary and remove the local temporary file.
   * @param {string} filePath - Absolute or relative path to the local file
   * @param {Object} [options] - Additional Cloudinary upload options
   * @returns {Promise<{url: string, publicId: string, format: string, resourceType: string, bytes: number}>}
   */
  async uploadImage(filePath, options = {}) {
    this._ensureConfig();

    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'civic-complaints',
        resource_type: 'image',
        ...options
      });

      return {
        url: result.secure_url || result.url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes
      };
    } finally {
      // Always remove local temporary file after processing
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (cleanupErr) {
        console.error(`Failed to clean up temporary file ${filePath}:`, cleanupErr.message);
      }
    }
  }

  /**
   * Delete an image from Cloudinary by public ID.
   * @param {string} publicId
   */
  async deleteImage(publicId) {
    if (!publicId) return;
    this._ensureConfig();
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error(`Failed to delete image ${publicId} from Cloudinary:`, err.message);
    }
  }
}

module.exports = new StorageService();
