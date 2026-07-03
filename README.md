# NDRS Ghana

National Disaster Response System demo for citizen emergency reporting, EOC incident management, live maps, media uploads, and admin user management.

## Stack

- Frontend: React, Vite, Tailwind utilities, MapLibre, Socket.io client
- Backend: Node.js, Express, Socket.io, JWT auth, JSON-file persistence
- Deployment: Vercel for frontend, Render for backend

## Local Setup

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev
```

Frontend runs on `http://localhost:3000`; backend runs on `http://localhost:5000`.

## Production Environment

Backend variables on Render:

- `NODE_ENV=production`
- `JWT_SECRET`: long random secret
- `SUPER_ADMIN_EMAIL`: first super admin email
- `SUPER_ADMIN_PASSWORD`: first super admin password
- `FRONTEND_URL`: deployed Vercel URL, for example `https://ndrs.vercel.app`
- `DATABASE_FILE=/var/data/database.json` when using the Render persistent disk

Frontend variables on Vercel:

- `VITE_API_URL`: deployed Render backend URL, for example `https://ndrs-backend.onrender.com`

## Deploy To Render

1. Push this repo to GitHub.
2. In Render, create a new Blueprint or Web Service from `lioneladom/ndrs`.
3. If using the included `render.yaml`, Render will create the backend service from `/backend`.
4. Add the backend environment variables listed above.
5. Keep the included persistent disk mounted at `/var/data` so the JSON database survives deploys.
6. Deploy and copy the public Render URL.

Render start command is `npm start` from the `backend` root.

## Deploy To Vercel

1. Import the same GitHub repo in Vercel.
2. Set Root Directory to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add `VITE_API_URL` with your Render backend URL.
6. Deploy.
7. Return to Render and set `FRONTEND_URL` to the final Vercel URL.

## Database Options

The current app uses a JSON file through `backend/db.js`. That is acceptable for a demo when paired with a Render persistent disk.

Use Neon or Supabase when you need real production durability, backups, SQL querying, multiple backend instances, or safer concurrent writes. To do that:

1. Create a Postgres project in Neon or Supabase.
2. Copy the pooled connection string.
3. Add it to Render as `DATABASE_URL`.
4. Replace the JSON-file functions in `backend/db.js` with Postgres queries.
5. Add migrations for `users`, `incidents`, `resources`, and `dispatches`.

Until that migration is done, do not expect `DATABASE_URL` alone to change storage behavior.
