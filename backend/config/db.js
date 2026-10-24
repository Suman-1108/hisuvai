const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI;

  // In production: connect to MONGO_URI ONLY and crash on failure (no local/in-memory fallback, no Windows .exe logic)
  if (isProduction) {
    if (!mongoUri) {
      console.error('❌ FATAL: MONGO_URI environment variable is required in production.');
      process.exit(1);
    }

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
      console.log('✅ MongoDB Connected Successfully (Production MONGO_URI)');
      return;
    } catch (err) {
      console.error(`❌ FATAL: Production MongoDB connection to MONGO_URI failed: ${err.message}`);
      process.exit(1);
    }
  }

  // Development / Non-production mode
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
      console.log('✅ MongoDB Connected Successfully (Configured MONGO_URI)');
      return;
    } catch (err) {
      console.warn(`⚠️ Warning: Configured MONGO_URI failed in dev (${err.message}). Trying local fallback...`);
    }
  }

  const defaultLocalUri = 'mongodb://127.0.0.1:27017/hi_suvai';
  try {
    await mongoose.connect(defaultLocalUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB Connected Successfully (Local MongoDB Service)');
    return;
  } catch (localErr) {
    console.log('ℹ️ Local MongoDB service not active. Starting dev MongoMemoryServer fallback...');
  }

  // Development in-memory fallback
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create({
      instance: { dbName: 'hi_suvai' }
    });
    const memUri = memoryServerInstance.getUri();
    await mongoose.connect(memUri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ MongoDB Connected Successfully (Dev MongoMemoryServer)');
  } catch (memErr) {
    console.error('❌ Failed to connect to any MongoDB instance in development:', memErr.message);
    throw memErr;
  }
};

// Cleanup on exit for development memory server
const cleanupProcesses = async () => {
  if (memoryServerInstance) {
    try {
      await memoryServerInstance.stop();
    } catch (e) { }
  }
};

process.on('SIGINT', async () => {
  await cleanupProcesses();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanupProcesses();
  process.exit(0);
});

module.exports = connectDB;
