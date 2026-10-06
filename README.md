# Shortly

A full-stack URL shortener with click analytics. Paste a long URL, get a short link, and see how many people clicked it, on which days, and where they came from.

**Live demo:** [your-app.vercel.app](https://your-app.vercel.app) <!-- replace with your Vercel URL -->

## Features

- Shorten any `http://` or `https://` URL into a 6-character code
- Choose a custom alias (for example `/promo`)
- Every visit to a short link is recorded before redirecting
- Dashboard listing all links with their total clicks
- Stats page with a 7-day clicks chart and top referrers
- Delete links along with their click history

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| Database | SQLite with Prisma ORM |
| Hosting | Vercel (frontend), Render (backend) |

## Project structure

```text
shortly/
├── server/                 Express API
│   ├── prisma/
│   │   ├── schema.prisma   Database models (Link, Click)
│   │   └── migrations/     Database change history
│   ├── index.js            All API routes and the redirect
│   └── package.json
└── client/                 React frontend
    ├── src/
    │   ├── pages/          Home, Dashboard, Stats
    │   ├── api.js          Functions that call the backend
    │   ├── App.jsx         Layout and routes
    │   └── main.jsx        Entry point
    ├── vercel.json         Lets page refreshes work on Vercel
    └── vite.config.js
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 22 or newer
- npm (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/shortly.git
cd shortly
```

### 2. Start the backend

```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

The API runs at `http://localhost:3000`. Open `http://localhost:3000/api/links` to check it; you should see `[]`.

### 3. Start the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

> Use `http://`, not `https://`, for both addresses when running locally.

### Useful commands

| Command (run in `server`) | What it does |
| --- | --- |
| `npm run dev` | Start the API and restart it on every save |
| `npx prisma studio` | Browse and edit the database in your browser |
| `npx prisma migrate dev --name <change>` | Apply changes made to `schema.prisma` |

## API reference

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| `POST` | `/api/links` | `{ "url": "https://...", "customCode": "promo" }` (`customCode` optional) | `201` with the new link and its `shortUrl` |
| `GET` | `/api/links` | none | `200` with all links, newest first, including `clicks` |
| `GET` | `/api/links/:code/stats` | none | `200` with `totalClicks`, `daily` (last 7 days, UTC) and `topReferrers` |
| `DELETE` | `/api/links/:code` | none | `204` with an empty body |
| `GET` | `/:code` | none | `302` redirect to the original URL, after recording a click |

Errors return JSON in the form `{ "error": "message" }`:

| Status | When |
| --- | --- |
| `400` | Invalid URL, or alias not 3 to 30 letters, numbers, dashes or underscores |
| `404` | Short code doesn't exist |
| `409` | Custom alias is already taken |
| `500` | Unexpected server error |

### Example

```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.wikipedia.org", "customCode": "wiki"}'
```

```json
{
  "id": 1,
  "code": "wiki",
  "url": "https://www.wikipedia.org",
  "createdAt": "2026-10-06T03:12:45.000Z",
  "shortUrl": "http://localhost:3000/wiki"
}
```

## Environment variables

| Variable | Where | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | server | `3000` | Port the API listens on (set automatically by Render) |
| `BASE_URL` | server | `http://localhost:3000` | Address used to build each `shortUrl` |
| `VITE_API_URL` | client | `http://localhost:3000` | Address of the backend API |

## Deployment

**Backend on Render** (Web Service):

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Build Command | `npm install && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `npm start` |
| Environment | `BASE_URL` = your Render URL |

**Frontend on Vercel**: set Root Directory to `client` and add `VITE_API_URL` = your Render URL (no trailing slash).

> **Note:** On Render's free plan the SQLite file is reset whenever the server restarts or redeploys, so data isn't permanent. For lasting data, switch the Prisma datasource to a hosted PostgreSQL database such as Neon.

## Roadmap

- [ ] QR code for each short link
- [ ] Link expiry dates
- [ ] User accounts so each person sees only their own links
- [ ] Rate limiting on link creation
- [ ] Clicks broken down by device type
- [ ] PostgreSQL for permanent storage in production

## License

MIT
