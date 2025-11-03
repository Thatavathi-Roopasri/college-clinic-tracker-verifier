#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env. Aborting.');
  process.exit(1);
}

async function run() {
  console.log('Connecting to', MONGO_URI.replace(/:.+@/, ':*****@'));
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection;
  try {
    const usersCol = db.collection('users');
    const cursor = usersCol.find({}, { projection: { email: 1, password: 1, passwordHash: 1, role: 1 } });
    const rows = [];
    while (await cursor.hasNext()) {
      const d = await cursor.next();
      rows.push({ email: d.email, role: d.role, hasPlainPassword: d.password !== undefined, hasPasswordHash: d.passwordHash !== undefined });
    }
    console.log('Total users:', rows.length);
    const withPlain = rows.filter(r => r.hasPlainPassword).length;
    const withHash = rows.filter(r => r.hasPasswordHash).length;
    console.log(`Users with plain password field: ${withPlain}`);
    console.log(`Users with passwordHash field: ${withHash}`);
    console.log('\nSample (first 50):');
    console.table(rows.slice(0, 50));
  } catch (err) {
    console.error('Error querying users:', err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(e => { console.error('Unhandled:', e); process.exit(3); });
