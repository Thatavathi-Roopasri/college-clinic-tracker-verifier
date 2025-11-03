Quick steps to deploy the frontend on Vercel

1) What this does
- The frontend in the `cctv/` folder is static (HTML/JS/CSS). The code was updated so that in production the frontend calls `/api/...` for backend requests. Vercel will proxy `/api/*` to your hosted backend (see below).

2) Replace the backend placeholder
- Open `vercel.json` in the repo root and replace `https://REPLACE_WITH_YOUR_BACKEND_DOMAIN` with the public URL where your Node backend is hosted (for example: `https://clinic-backend.example.com`).
- Example route after replacement:
  {
    "src": "/api/(.*)",
    "dest": "https://clinic-backend.example.com/api/$1"
  }

3) How to deploy
- Push this branch to GitHub (or your fork). On Vercel, create a new project from your GitHub repo.
- In the Vercel project settings leave the Root directory as the repository root (the `vercel.json` routes the app to `cctv/`). Vercel will serve the static files under `cctv/`.

4) Local development
- When you run the app locally (open `cctv/index.html` or run the local server), the frontend uses `http://localhost:7070/api` automatically so it continues to work with your local backend.

5) Backend note
- Vercel routes simply proxy API calls to your backend. You must host the Node/Express backend separately (e.g., Render, Heroku, Azure App Service, a VM). The backend must be reachable from the internet at the URL you configured in `vercel.json`.

6) Optional: Deploy backend to Vercel Functions (advanced)
- Converting the existing Express app to Vercel serverless functions requires splitting endpoints into `/api/*.js` function files and adjusting DB connection handling. If you want that, I can help plan/migrate.

7) After deployment
- Test the deployed site: visit the Vercel URL and try submitting a gatepass; verify the backend receives the requests and that HOD/attendance flows operate.

If you'd like, I can:
- Replace the placeholder in `vercel.json` with your backend URL if you provide it now, commit and create a branch ready to push.
- Or prepare a small guide to migrate the Express server into Vercel serverless functions.
