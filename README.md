# FinLedger

Production-ready personal finance tracker built with **Next.js 15 App Router**, **Bun**, **Auth0**, and **MongoDB Atlas**.

## Features

- Auth0 login/signup/logout (email/password + social providers configured in Auth0)
- Protected app routes (everything except landing page)
- Multi-ledger system (unlimited ledgers, per-ledger currency + starting balance)
- Transaction CRUD with filters/search/pagination
- Quick Add modal + keyboard shortcut (`Cmd/Ctrl + K`)
- Recurring entries (daily, weekly, bi-weekly, monthly, quarterly, yearly)
- On-demand recurring generation when dashboard loads
- Dashboard stats + mini charts (Recharts)
- Monthly/yearly reports + CSV export
- Dark mode and responsive UI
- Zod validation + strict TypeScript

## 1) Prerequisites

- Bun `>=1.2`
- MongoDB Atlas database
- Auth0 tenant + application

## 2) Install dependencies

```bash
bun install
```

## 3) Environment setup

Create `.env.local`:

```env
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_SECRET=long_32+_byte_random_value
AUTH0_AUDIENCE=
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/finledger
```

## 4) Auth0 configuration

In **Auth0 Dashboard → Applications → Your App**:

- Allowed Callback URLs: `http://localhost:3000/auth/callback`
- Allowed Logout URLs: `http://localhost:3000`
- Allowed Web Origins: `http://localhost:3000`

For social login, enable providers under **Authentication → Social** and turn on the connection for this app.

## 5) Seed default categories

```bash
bun run seed
```

## 6) Run

```bash
bun run dev
```

Open `http://localhost:3000`.

## Project Structure

- `app/` App Router pages/layouts
- `lib/db` Mongo connection
- `lib/models` Mongoose models
- `lib/actions` Server Actions (all mutations)
- `components/` UI and feature components
- `scripts/seed-categories.ts` seed script

## Notes

- Mutations are implemented via Server Actions (`"use server"`).
- Recurring entries are generated on-demand when dashboard is loaded. For cron, call `generateRecurringTransactionsAction` from a scheduled job.
