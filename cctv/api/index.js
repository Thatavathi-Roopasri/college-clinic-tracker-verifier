import serverless from 'serverless-http';
import { app } from '../server.js';
import { connectToMongo } from '../db.js';

// Ensure environment variables from Vercel are available. For local testing
// with .env, server.js already loads dotenv when imported.

// Connect to MongoDB once and reuse connection between invocations when
// possible. The connectToMongo implementation is careful to reuse an existing
// mongoose connection when readyState === 1.
let _connected = false;
async function ensureConnected() {
  if (_connected) return;
  try {
    await connectToMongo();
    _connected = true;
  } catch (e) {
    // For serverless we typically want to surface an error so invocations fail
    // rather than silently continue in a broken state.
    console.error('Failed to connect to MongoDB in serverless wrapper', e && e.message ? e.message : e);
    throw e;
  }
}

const handler = serverless(async (req, res) => {
  // Ensure DB connection before handling any request that needs it.
  // connectToMongo is fast / no-op if already connected.
  await ensureConnected();
  return app(req, res);
});

export default handler;
