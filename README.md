# Student Library Portal

React 19 + Vite + Tailwind 4 frontend with an Express server (optional Gemini-powered reading recommendations).

## Features
Catalog search, barcode scan check-in/out, reservations, fines & payments, reading streaks/timer, AI advisor, admin dashboard.
Mobile-first (safe-area aware bottom nav), installable PWA, state persisted in `localStorage`.

## Run
```bash
npm install
cp .env.example .env   # add GEMINI_API_KEY (optional; falls back to catalog matching)
npm run dev            # http://localhost:3000  (PORT env supported)
```

## Production
```bash
npm run build && npm start
```

## Scripts
`npm run lint` (type-check) · `npm test` (unit tests)

## Mobile screenshots (390×844)
| Home | Search | AI Advisor | Borrowed |
|---|---|---|---|
| ![](docs/screenshots/01-home.png) | ![](docs/screenshots/02-search.png) | ![](docs/screenshots/03-ai-advisor.png) | ![](docs/screenshots/04-borrowed.png) |

| Holds | Streak | Fines | Scan |
|---|---|---|---|
| ![](docs/screenshots/05-reservations.png) | ![](docs/screenshots/06-streak.png) | ![](docs/screenshots/07-fines.png) | ![](docs/screenshots/08-scan.png) |

| Alerts | Profile | Admin | Menu |
|---|---|---|---|
| ![](docs/screenshots/09-notifications.png) | ![](docs/screenshots/10-profile.png) | ![](docs/screenshots/11-admin.png) | ![](docs/screenshots/12-drawer.png) |

| Book detail | Camera scanner |
|---|---|
| ![](docs/screenshots/13-book-detail.png) | ![](docs/screenshots/14-camera-scanner-modal.png) |
