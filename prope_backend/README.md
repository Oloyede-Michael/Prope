# Prope Backend

Express + Apollo GraphQL API for the Prope real estate escrow platform.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Server starts at `http://localhost:8080`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the server |
| `npm start` | Start the server (production) |

## Environment

See `.env.example` for all required variables — Monnify API keys, Supabase PostgreSQL connection, Redis URL.

## Key files

| File | Purpose |
|------|---------|
| `src/server.js` | Entry point, Express + Apollo setup |
| `src/schema.js` | GraphQL type definitions |
| `src/resolvers.js` | GraphQL query/mutation resolvers |
| `src/db.js` | PostgreSQL connection (pg) |
| `src/redis.js` | Redis connection (ioredis) |
| `src/monnify.js` | Monnify API client (auth, virtual accounts, payouts) |
| `src/webhook.js` | Monnify payment webhook handler |
| `src/reconciliation.js` | Escrow reconciliation logic |
| `src/sync.js` | Cron-style sync tasks |
| `src/sandbox.js` | Sandbox test utilities |
| `src/seed.js` | Database seed script |
| `src/schema.sql` | PostgreSQL table definitions |

## API

GraphQL endpoint: `POST /graphql`

Webhook endpoint: `POST /webhook` (Monnify payment callbacks)

## Dependencies

- `express` + `@apollo/server` — HTTP + GraphQL
- `pg` — PostgreSQL driver
- `ioredis` — Redis client
- `dotenv` — env var loading
- `cors` — cross-origin support
