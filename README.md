# MyShop BD — Vite + React + Tailwind starter

## What's included
- Frontend: Vite + React + Tailwind (src/)
- Firebase client helpers (src/firebase.js)
- Simple Express server (server/) with endpoints:
  - POST /api/orders
  - POST /api/payments/create
  - POST /api/payments/webhook

## How to run locally
1. Copy `.env.example` to `.env` and fill Firebase values.
2. Install dependencies:
   - `npm install`
   - `cd server && npm install`
3. Run dev frontend: `npm run dev`
4. Run server: `node server/index.js` (or deploy separately)

## Deploy to Vercel
- Push repo to Git.
- On Vercel, set project to use `npm run build` for build and `npm run preview` for preview.
- Add environment variables in Vercel dashboard from `.env.example`.
