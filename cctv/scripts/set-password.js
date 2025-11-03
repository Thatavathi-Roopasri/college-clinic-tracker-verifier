#!/usr/bin/env node
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/set-password.js <email> <password>');
  process.exit(1);
}
const [email, password] = args;

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection;
  try {
    const usersCol = db.collection('users');
    const user = await usersCol.findOne({ email: email });
    if (!user) {
      console.error('User not found:', email);
      process.exit(2);
    }
    const hash = await bcrypt.hash(password, 10);
    await usersCol.updateOne({ _id: user._id }, { $set: { passwordHash: hash }, $unset: { password: '' } });
    console.log('Password updated for', email);
  } catch (e) {
    console.error('Failed to set password:', e);
    process.exit(3);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(e => { console.error(e); process.exit(4); });
