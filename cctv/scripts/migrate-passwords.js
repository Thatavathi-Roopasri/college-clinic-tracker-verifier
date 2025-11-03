#!/usr/bin/env node
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env. Aborting.');
  process.exit(1);
}

async function migrate() {
  console.log('Connecting to', MONGO_URI.replace(/:.+@/, ':*****@'));
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection;

  try {
    const usersCol = db.collection('users');
    const docs = await usersCol.find({ password: { $exists: true } }).toArray();
    console.log('Found', docs.length, 'users with plain password field');
    let migrated = 0;
    for (const d of docs) {
      if (!d.password) continue;
      const hash = await bcrypt.hash(d.password.toString(), 10);
      await usersCol.updateOne({ _id: d._id }, { $set: { passwordHash: hash }, $unset: { password: '' } });
      migrated++;
      console.log(`Migrated ${d.email || d._id}`);
    }
    console.log(`Migration complete. Migrated ${migrated} of ${docs.length}`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

migrate().catch((e) => { console.error('Unhandled error:', e); process.exit(2); });
