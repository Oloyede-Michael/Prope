# Prope Frontend

React + Vite + Tailwind CSS SPA for the Prope real estate escrow platform.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

App starts at `http://localhost:5173`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Environment

See `.env.example` for required variables — API base URL and optional NVIDIA NIM keys for AI features.

## Key files

| File | Purpose |
|------|---------|
| `src/main.jsx` | App entry point |
| `src/App.jsx` | Root component with routing logic |
| `src/components/LandingPage.jsx` | Landing page layout |
| `src/components/Hero.jsx` | Hero section |
| `src/components/Dashboard.jsx` | User dashboard |
| `src/components/Onboarding.jsx` | Sign-up / login flow |
| `src/components/Marketplace.jsx` | Property marketplace |
| `src/components/Navbar.jsx` | Navigation bar |
| `src/components/Footer.jsx` | Site footer |
| `src/components/HowItWorks.jsx` | How it works section |
| `src/components/WhyPrope.jsx` | Value proposition section |
| `src/components/FAQ.jsx` | Frequently asked questions |
| `src/nim_api.js` | NVIDIA NIM API client |

## Dependencies

- `react` + `react-dom` — UI framework
- `lucide-react` — Icons
- `tailwindcss` + `@tailwindcss/vite` — Styling
- `vite` — Dev server and bundler
