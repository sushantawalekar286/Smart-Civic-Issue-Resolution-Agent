// Fix Jest cross-realm Map serialization issue for MongoDB client metadata handshake
try {
  const clientMetadata = require('mongodb/lib/cmap/handshake/client_metadata');
  if (clientMetadata) {
    clientMetadata.makeClientMetadata = async function() {
      return {
        driver: { name: 'nodejs', version: '7.6.0' },
        platform: `Node.js ${process.version || 'v24.15.0'}, LE`,
        os: {
          name: process.platform || 'win32',
          architecture: process.arch || 'x64',
          version: '10.0',
          type: 'Windows_NT'
        }
      };
    };
  }
} catch (e) {
  // Ignore if mongodb package layout changes
}

require('dotenv').config();
const mongoose = require('mongoose');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';

jest.setTimeout(30000);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-civic-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    } catch (err) {
      // Ignore
    }
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        if (key === 'users') {
          await collection.deleteMany({ email: { $not: /_intake@test\.local$/ } });
        } else {
          await collection.deleteMany();
        }
      }
    } catch (err) {
      // Ignore
    }
  }
});
