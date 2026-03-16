# Galactic Spacefarer

A Cloud Application Programming (CAP) project for the Galactic Spacefarer demo.

**Short summary**: CDS models define the domain, services in `srv/` implement business logic, and `app/` holds UI or frontend artifacts. Tests are run with Vitest.

**Directory Structure**

Root overview (important folders and files):

```
@cds-models/
app/
data/
db/
	index.cds
	spacefarer/
		departments.schema.cds
		positions.schema.cds
		spacefarer.schema.cds
scripts/
srv/
	index.cds
	mail/
		mail.service.ts
		mail.service.unit.spec.ts
	spacefarer/
		spacefarer.service.cds
		spacefarer.service.ts
		spacefarer.unit.spec.ts
test/
test-results/
readme.md
package.json
tsconfig.json
vitest.config.ts
```

**Quick map**:

- `db/` – CDS domain models and schemas.
- `srv/` – services (CDS + TypeScript) and unit tests.
- `@cds-models/` – generated/packaged model helpers used by services.
- `app/` – frontend/UI content (if present).
- `test/` – integration tests.
- `test-results/` – test artifacts.
- `coverage/` – test coverage reports.

**Architecture**

- CDS Models: domain is defined in `.cds` files (see `db/` and `spacefarer/` schemas).
- Services: `srv/` exposes service interfaces (CDS) and TypeScript implementations. Example: `srv/spacefarer/spacefarer.service.ts` and `srv/mail/mail.service.ts`.
- Runtime: Built on `@sap/cds` (CAP). The project uses Node.js + TypeScript for service logic and Vitest for tests.
- Testing: Unit tests beside services (`*.unit.spec.ts`) and integration tests under `test/`.

## Getting started

Prerequisites:

- Node.js (v20+ recommended) and npm installed.
- `@sap/cds` tooling is used by scripts (installed as dependency/devDependency).

Install dependencies:

```bash
npm install
```

Start the service (development watch):

```bash
# run the CDS watcher (auto-reload on changes)
npm run watch

# or start the service (if you prefer the serve script):
npm start
```

Environment / configuration:

- Add environment variables or local configuration as needed (DB connection, SMTP creds for `mail.service`).
- For quick local development you can use SQLite adapters provided in devDependencies.

## Testing

Run all tests (default):

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

CI-friendly test run (example):

```bash
npm run test:ci
```

Lint and format:

```bash
npm run lint
npm run format
```

For details see the service implementations under [srv/](srv/) and the model definitions under [db/](db/).
