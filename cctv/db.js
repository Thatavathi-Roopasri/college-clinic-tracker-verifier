import mongoose from 'mongoose';

// db.js - small helper to centralize MongoDB connection logic.
// Read environment variables at call time so the caller can load dotenv
// before invoking this helper (avoids capture-at-import ordering issues).
export async function connectToMongo() {
  const SKIP_DB = process.env.SKIP_DB === 'true';
  const MONGO_URI = process.env.MONGO_URI;

  if (SKIP_DB) {
    console.warn('SKIP_DB=true — skipping MongoDB connection.');
    return null;
  }

  if (!MONGO_URI || typeof MONGO_URI !== 'string' || MONGO_URI.trim() === '') {
    throw new Error('Missing MONGO_URI. Set environment variable MONGO_URI to your MongoDB connection string.');
  }

  const dbOptions = {};
  if (process.env.DB_NAME && process.env.DB_NAME.trim() !== '') dbOptions.dbName = process.env.DB_NAME;

  await mongoose.connect(MONGO_URI, dbOptions);
  console.log('MongoDB connected (db:', mongoose.connection?.name || 'unknown', ')');
  return mongoose.connection;
}

export { mongoose };
