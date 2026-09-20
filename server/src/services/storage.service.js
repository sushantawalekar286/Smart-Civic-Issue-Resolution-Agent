/**
 * Cloudinary Storage Abstraction (Placeholder)
 * To be implemented in a future step.
 */
class StorageService {
  async uploadImage(filePath) {
    // throw new Error('Not implemented');
    console.log(`Mock upload of ${filePath}`);
    return {
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      publicId: "sample"
    };
  }
}

module.exports = new StorageService();
