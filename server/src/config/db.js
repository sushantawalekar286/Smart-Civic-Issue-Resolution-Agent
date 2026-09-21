const mongoose = require('mongoose');
const dns = require('dns');

/**
 * Safely configures public DNS resolvers if default system DNS fails SRV lookup
 */
const setPublicDnsFallback = () => {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (err) {
    console.warn(`[DNS_FALLBACK_WARN] Could not set custom DNS servers: ${err.message}`);
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MongoDB configuration: missing');
    throw new Error('MONGODB_URI is not configured.');
  }

  console.log('MongoDB configuration: configured');

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (error.message && error.message.includes('querySrv ECONNREFUSED')) {
      console.warn('[DNS_RETRY] SRV query refused. Retrying MongoDB Atlas connection using public DNS resolvers...');
      setPublicDnsFallback();
      try {
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (retryErr) {
        console.error(`MongoDB Connection Error: ${retryErr.message}`);
        process.exit(1);
      }
    }

    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
