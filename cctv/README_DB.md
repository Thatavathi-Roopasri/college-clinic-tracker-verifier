MongoDB connection guide

This project uses Mongoose to store users, visits, sections and sign-in logs in MongoDB.

Quick setup

1. Copy `.env.example` to `.env` and fill in `MONGO_URI` with your connection string.

   - For a local MongoDB server: `mongodb://localhost:27017/clinicdb`
   - For Atlas: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/clinicdb?retryWrites=true&w=majority`

2. (Optional) If you want to override the database name encoded in the URI, set `DB_NAME`.
3. Run the app:

   - Install deps: `npm install`
   - Start: `npm run start` (or `npm run dev` during development)

Notes

- The server will refuse to start when `MONGO_URI` is missing unless `SKIP_DB=true` in `.env`.
- To run without MongoDB (UI-only testing), set `SKIP_DB=true` in `.env`. In that mode the server will start but any API endpoints that require persistence will not work as intended.
- There are convenience endpoints for development under `/api/dev/*` (e.g. seed demo users). These endpoints are blocked when `NODE_ENV=production`.

Seed data

- There is a `cctv/scripts/seed/` and `cctv/scripts` that include seeding helpers. You can also POST to `/api/dev/seed-demo-users` to create demo users.

Troubleshooting

- If the app exits with a missing `MONGO_URI` message, copy `.env.example` and provide a valid URI.
- If you see permission/auth errors, verify your username/password and network access rules in Atlas.
- If the connection is slow or transient errors occur, make sure your network permits outgoing connections to MongoDB Atlas or your local MongoDB is running.
