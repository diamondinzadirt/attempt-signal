# Attempt Signal

Attempt Signal is a market intelligence and watchlist application built with Next.js. It combines user authentication, real-time stock data, TradingView embeds, AI-assisted email workflows, and a mobile-aware watchlist experience.

## Overview

Users can:
- create an account and sign in with Better Auth
- search stocks and open symbol detail pages
- build and manage a personal watchlist
- get related stock suggestions
- view charts and market widgets powered by TradingView
- receive welcome emails and AI-generated daily market summaries

## Core Features

### Authentication
- email/password sign up and sign in
- auto sign-in after successful registration
- forgot password and reset password flows
- Better Auth dashboard support through `/api/auth`

### Dashboard
- top ticker widget and market widgets
- stock discovery and market context
- responsive desktop and mobile layouts

### Watchlist
- user-specific watchlist stored in MongoDB
- add/remove flows with toast feedback
- mobile-friendly watchlist UI
- related stock suggestions
- swipe-based suggestion interaction on mobile

### Stock Detail Pages
- stock chart widgets
- watchlist actions
- broker-modal placeholder for future buy/sell integration

### Background Workflows
- Inngest event and cron functions
- welcome email after sign-up
- AI-generated daily market news summary emails

### Email System
- Nodemailer-based transactional email delivery
- branded HTML templates
- password reset emails
- welcome emails
- daily summary emails

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI primitives
- Better Auth
- MongoDB + Mongoose
- Finnhub API
- TradingView widgets
- Inngest
- Nodemailer
- Sonner

## Project Structure

```text
app/
  (auth)/                  auth pages and guest-facing auth layout
  (root)/                  dashboard, watchlist, stock pages
  api/auth/[...all]/       Better Auth route handler
  api/inngest/             Inngest route handler
components/                shared UI and feature components
database/                  mongoose connection and models
hooks/                     client hooks
lib/
  actions/                 server actions
  better-auth/             Better Auth server config
  inngest/                 Inngest client, prompts, functions
  nodemailer/              email sending and templates
  utils.ts                 shared helpers
public/                    static assets
scripts/                   utility scripts
types/                     global project types
```

## Environment Variables

Create a `.env` file in the project root.

```env
NODE_ENV=development

MONGODB_URI=

BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=
BETTER_AUTH_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3001

FINNHUB_API_KEY=
FINNHUB_BASE_URL=https://finnhub.io/api/v1

GEMINI_API_KEY=

NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
```

## Environment Notes

- `BETTER_AUTH_URL` should match the actual app origin in the current environment.
- `NEXT_PUBLIC_APP_URL` is used for browser-facing auth URLs such as reset password links.
- `BETTER_AUTH_API_KEY` is required for Better Auth dashboard/infra endpoints.
- `FINNHUB_API_KEY` is required for stock search, quotes, profiles, and news.
- `GEMINI_API_KEY` is required for AI email generation in Inngest functions.
- `NODEMAILER_EMAIL` and `NODEMAILER_PASSWORD` are required for transactional email delivery.

## Local Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

App URL:

```bash
http://localhost:3001
```

Run Inngest locally in a separate terminal when testing event/cron flows:

```bash
npx inngest-cli@latest dev
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test:db
```

## Validation Before Deploy

Recommended checks:

```bash
npm run lint -- --max-warnings=0
npx tsc --noEmit
npm run build
```

Additional utility tests that exist in `scripts/`:

```bash
npx ts-node --transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node"}' scripts/test-format-market-cap.ts
npx ts-node --transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node"}' scripts/test-news-distribution.ts
```

## Important Runtime Notes

- Better Auth is mounted through `/api/auth/[...all]`.
- Inngest is exposed through `/api/inngest`.
- SMTP/email setup is lazy-loaded at send time to avoid build-time connection failures.
- This app depends on outbound access to MongoDB, Finnhub, Gemini, Nodemailer/SMTP, and Inngest.

## Deployment Notes

- Set all required environment variables in your hosting platform. Local `.env` values are not used automatically in production.
- `BETTER_AUTH_URL` must use the deployed app URL in production.
- If using Vercel, confirm your deployment can reach external services used by Better Auth, Inngest, Finnhub, Gemini, and SMTP.
- If builds fail while resolving Google fonts, either allow font fetching or switch to local fonts.

## Current Product Behavior

- auth pages are optimized differently for mobile and desktop
- the watchlist experience is responsive and mobile-aware
- TradingView widgets are reused across the app
- watchlist actions and auth flows use toast notifications for user feedback
- buy/sell buttons currently open a broker-connection modal only; no trading execution is implemented

## License

Private project.
