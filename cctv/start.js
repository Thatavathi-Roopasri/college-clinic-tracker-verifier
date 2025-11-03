import { startServer } from './server.js';

// Small entrypoint kept for local runs (`npm start`) so behaviour remains.
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
