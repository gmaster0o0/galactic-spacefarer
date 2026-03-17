# Galactic Spacefarer

## Overview

A full-stack SAP BTP application built with CAP (Cloud Application Programming Model) implementing the Galactic Spacefarer Adventure System. The system manages intergalactic spacefarers and their cosmic journeys across the SAP galaxy.

**Key features:**

- Spacefarer CRUD with draft-enabled editing via SAP Fiori Elements
- Row-level authorization — users only see spacefarers from their own planet
- Cosmic validation — stardust collection and wormhole navigation skill are validated and enhanced on creation
- Cosmic welcome email sent via Nodemailer after a spacefarer is created
- Fiori List Report + Object Page UI with department and position value helps

## Getting Started

**Prerequisites:**

- Node.js (v20+ recommended) and npm installed.

**1. Install dependencies:**

```bash
npm install
```

**2. Deploy the database:**

```bash
npm run deploy
```

**3. Start the development server:**

```bash
npm run watch
```

**4. Open the app:**

```
http://alice:@localhost:4004/spacefarer/webapp/index.html
```

## Database Setup

Deploys the schema and seeds the database from the CSV files in `db/data/` into `data/galactic.db`:

```bash
npm run deploy
```

> **Note:** Run this before `npm run watch` on a fresh clone, and after any schema changes.

## Accessing the UI

| URL                                                         | Description            |
| ----------------------------------------------------------- | ---------------------- |
| `http://localhost:4004`                                     | CAP development index  |
| `http://localhost:4004/spacefarer/webapp/index.html`        | Fiori application      |
| `http://alice:@localhost:4004/spacefarer/webapp/index.html` | Login as alice (admin) |

**Test users** (defined in `.cdsrc.json`):

| Username        | Role               | Planet           |
| --------------- | ------------------ | ---------------- |
| `alice`         | admin              | sees all planets |
| `planet-x-user` | authenticated-user | Mars Prime only  |
| `planet-y-user` | authenticated-user | Titan only       |

Password is empty for all users.

## Email Configuration

The cosmic welcome email is disabled by default. To enable it, copy the example env file and fill in your SMTP credentials:

```bash
cp default-env.json.example default-env.json
```

```json
{
  "SMTP_HOST": "sandbox.smtp.mailtrap.io",
  "SMTP_PORT": "2525",
  "SMTP_USER": "your-user",
  "SMTP_PASS": "your-pass",
  "MAIL_ENABLED": "true"
}
```

Without these, emails are skipped and logged to the console instead.

## Testing

Run all tests:

```bash
npm test
```

Run unit tests only:

```bash
npm run test:unit
```

Run integration tests only:

```bash
npm run test:int
```

Run tests with coverage:

```bash
npm run test:coverage
```

CI-friendly test run:

```bash
npm run test:ci
```

Lint and format:

```bash
npm run lint
npm run format
```

## Architecture

- **CDS Models** — domain is defined in `.cds` files under `db/`.
- **Services** — `srv/` exposes service interfaces (CDS) and TypeScript implementations. `srv/spacefarer/spacefarer.service.ts` handles validation and email on CREATE. `srv/mail/mail.service.ts` handles the cosmic welcome email.
- **Runtime** — built on `@sap/cds` (CAP) with Node.js + TypeScript.
- **Testing** — unit tests sit beside services (`*.unit.spec.ts`), integration tests are under `test/`.

## Directory Structure

```
galactic-spacefarer
├── app
│   └── spacefarer
│       ├── webapp/                   ← generated Fiori app
│       └── annotations.cds           ← UI annotations
├── db
│   ├── data
│   │   ├── my.galactic.adventure-Departments.csv
│   │   ├── my.galactic.adventure-Positions.csv
│   │   └── my.galactic.adventure-Spacefarers.csv
│   ├── index.cds
│   └── spacefarer
│       ├── departments.schema.cds
│       ├── positions.schema.cds
│       └── spacefarer.schema.cds
├── srv
│   ├── index.cds
│   ├── mail
│   │   ├── mail.service.ts
│   │   └── mail.service.unit.spec.ts
│   └── spacefarer
│       ├── spacefarer.service.cds
│       ├── spacefarer.service.ts
│       └── spacefarer.unit.spec.ts
├── test
│   ├── spacefarer.service.int.spec.ts
│   └── tsx-setup.cjs
├── .cdsrc.json                       ← CAP config (auth, db profiles)
├── vitest.config.ts
└── package.json
```

**Quick map:**

- `db/` — CDS domain models, schemas, and seed data.
- `srv/` — CAP services (CDS + TypeScript) and unit tests.
- `app/` — Fiori UI application and annotations.
- `test/` — integration tests.
