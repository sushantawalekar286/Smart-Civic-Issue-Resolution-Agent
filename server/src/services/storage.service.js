const cloudinary = require('cloudinary').v2;
const fs = require('fs');

/**
 * Storage Service
 * Handles image uploads to Cloudinary in production, with fallback for local dev/testing.
 */
class StorageService {
  constructor() {
    this.configured = false;
    this.init();
  }

  init() {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      this.configured = true;
    }
  }

  async uploadImage(filePath) {
    if (!this.configured) {
      this.init();
    }

    if (this.configured) {
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'smart-civic-complaints',
        });
        // Clean up temporary local file
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        throw err;
      }
    }

    console.log(`Mock upload of ${filePath}`);
    return {
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      publicId: "sample"
    };
  }
}

module.exports = new StorageService();
