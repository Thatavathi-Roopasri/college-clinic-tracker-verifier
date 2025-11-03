// Seed script to insert sections and rolls directly into MongoDB Atlas
// Usage:
// 1) npm install mongodb
// 2) node seed/seedSections.js

import { MongoClient } from 'mongodb';

// Use MONGO_URI env var if present, otherwise fallback to provided Atlas URI
const DEFAULT_URI = 'mongodb+srv://Project01:Welcome12345@project01.bmejhvq.mongodb.net/clinicdb?retryWrites=true&w=majority';
const uri = process.env.MONGO_URI || DEFAULT_URI;

const sections = [
  {
    name: 'CSE-A1',
    rolls: ['2410030001', '2410030002', '2410030003', '2410030004', '2410030005']
  },
  {
    name: 'CSE-A2',
    rolls: ['2410030101', '2410030102', '2410030103', '2410030104', '2410030105']
  },
  {
    name: 'CSE-A3',
    rolls: ['2410030201', '2410030202', '2410030203', '2410030204', '2410030205']
  },
  {
    name: 'CSE-A4',
    rolls: ['2410030301', '2410030302', '2410030303', '2410030304', '2410030305']
  },
  {
    name: 'CSE-A5',
    rolls: ['2410030401', '2410030402', '2410030403', '2410030404', '2410030405']
  }
];

async function seed() {
  console.log('Connecting to', uri.replace(/:.+@/, ':*****@'));
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // uses database encoded in URI (clinicdb)
    const col = db.collection('sections');

    for (const s of sections) {
      // Upsert section by name
      const res = await col.updateOne(
        { name: s.name },
        { $set: { name: s.name, rolls: s.rolls } },
        { upsert: true }
      );
      if (res.upsertedId) {
        console.log(`Inserted section ${s.name} (${s.rolls.length} rolls)`);
      } else if (res.modifiedCount > 0) {
        console.log(`Updated section ${s.name} (${s.rolls.length} rolls)`);
      } else {
        console.log(`Section ${s.name} already up-to-date`);
      }
    }

    console.log('\nSeed complete. You can verify in MongoDB Atlas (clinicdb.sections) or via the backend GET /api/sections if running.');
  } catch (err) {
    console.error('Failed to seed sections:', err.message || err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

// Run
seed().catch(err => {
  console.error('Unhandled error in seed script:', err);
  process.exit(2);
});
