# Medizen Backend

Backend for the Medizen project — Node.js + Express + TypeScript + MongoDB.
Provides APIs for users (Admin / Pharmacist / Customer), medicines, carts, orders,
quotations, file uploads, payments (Razorpay), email notifications and websockets.

## Features (high level)

- User authentication & role-based authorization (JWT)
- Address, Cart, Order, Quotation, Medicine, Pharmacy management
- Razorpay payment callbacks and redirects
- Generates PDF invoices (puppeteer/html-pdf-node)
- Socket.IO support for realtime features
- Winston logging and optional MongoDB transport

## Repo structure

src/

- controllers/ — Express request handlers
- models/ — Mongoose schemas & models
- routes/ — API route definitions
- middlewares/ — auth, validation, file upload etc.
- services/ — email, invoice, utilities
- config/ — configuration and env loader
- app.ts / server.ts — app bootstrap

## Prerequisites

- Node.js (recommended 18+)
- npm
- MongoDB (local or cloud)
- (Production) a headless Chromium/Chrome for Puppeteer or use a container that provides it

## Environment variables

Create a `.env` in project root. Common variables used by the project:

- PORT
- URL (MongoDB connection string)
- ACCESS_SECRET_KEY
- REFRESH_SECRET_KEY
- EMAIL_USER, EMAIL_PASSWORD (email transport)
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- FRONTEND_URL
- API_BASE_URL
- NODE_ENVIRONMENT (development | production)
- FILE_SIZE_MULTIPLE
- OTP_LENGTH

Adjust as needed depending on your deployment.

## Install

## Medizen Backend

Backend for the Medizen project — Node.js + Express + TypeScript + MongoDB.
Provides APIs for Admin / Pharmacist / Customer, medicines, carts, orders,
quotations, file uploads, payments (Razorpay), email notifications and websockets.

---

## Table of Contents

- [Features](#features)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running with Infisical](#running-with-infisical)
- [Scripts](#scripts)
- [Puppeteer in Production](#puppeteer-in-production)
- [Troubleshooting](#troubleshooting)
- [Deployment Notes](#deployment-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- JWT authentication and role-based authorization (Admin / Pharmacist / Customer)
- Manage addresses, carts, orders, quotations, medicines and pharmacy data
- Razorpay integration for payments
- Generate PDF invoices (Puppeteer)
- Real-time features via Socket.IO
- Email notifications with templates (Handlebars)

## Repository Structure

```
src/
  controllers/
  models/
  routes/
  middleware/
  services/
  config/
  validator/
  websocket/
  server.ts
```

## Prerequisites

- Node.js 18+ recommended
- npm (or yarn)
- MongoDB (local or cloud)
- For PDF generation: a headless Chromium/Chrome available in production (or run inside a container that provides it)

## Environment Variables

Create a `.env` file in the project root. Typical variables used by this project:

- `PORT` — port the server listens on
- `URL` — MongoDB connection string
- `ACCESS_SECRET_KEY`, `REFRESH_SECRET_KEY` — JWT secrets
- `EMAIL_USER`, `EMAIL_PASSWORD` — email transport credentials
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — Razorpay credentials
- `FRONTEND_URL` — frontend base URL (used for redirects)
- `API_BASE_URL` — base URL for APIs
- `NODE_ENVIRONMENT` — `development` or `production`

Adjust as needed for your environment.

## Installation

```bash
git clone <repo-url>
cd pharmacy-backend
npm install
```

## Secrets & Environment (recommended)

This project expects runtime configuration via environment variables. You can provide those using any secret manager or by creating a local `.env` file during development.

Options:

- Create a `.env` file in the project root and load it with a tool like `dotenv` or `nodemon --exec "node -r dotenv/config"`.
- Use a secrets manager (AWS Parameter Store, AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, or Infisical). If you use Infisical, the correct CLI package is `@infisical/cli`.
- In containerized deployments, pass env vars via the container runtime or the orchestration platform (Docker, ECS, Kubernetes).

Example (local `.env`):

```bash
# .env
PORT=4000
URL=mongodb://username:password@host:port/db
ACCESS_SECRET_KEY=...
```

Start app using environment variables directly:

```bash
NODE_ENV=production PORT=4000 URL="<mongo-uri>" nodemon index.js
```

## Scripts

- `npm run dev` — development
- `npm run prod` — production start
- `npm run build` — compile TypeScript
- `npm start` — run built code

If you provide secrets from a secrets manager, adapt your start scripts to load them before launching the server. Otherwise set the required environment variables or use a local `.env` file.

## Puppeteer in Production

When running Puppeteer in Linux environments (EC2, containers), use these flags for stability:

```
--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage
```

Make sure a compatible Chromium binary is available (Puppeteer downloads one by default during install, or provide `PUPPETEER_EXECUTABLE_PATH`).

## Troubleshooting

-- `502 Bad Gateway` or WebSocket errors — verify backend processes are running and nginx is configured to proxy and upgrade websockets.
-- Mongo duplicate index errors (e.g. `quotation` unique index) — check DB indexes; consider using a partial index (`{ quotation: 1 }` with `partialFilterExpression: { quotation: { $ne: null } }`) or remove the unique constraint if orders can be created without a quotation.

## Deployment Notes

1. Build TypeScript: `npm run build`
2. Start the built app: `npm start`
3. Ensure environment variables are set (Infisical or `.env`)
4. Configure nginx to proxy traffic and handle websocket upgrades
5. Verify MongoDB indexes and connectivity

## Contributing

Contributions are welcome. Please open issues or PRs. Follow existing code style and add tests for significant changes.
