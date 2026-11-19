# pw-cucumber-framework

[![CI Tests](https://github.com/obeydili/pw-cucumber-framework/actions/workflows/tests.yml/badge.svg)](https://github.com/obeydili/pw-cucumber-framework/actions/workflows/tests.yml)

A BDD test automation framework for **Trade Desk Lite**, a small order-ticket web app with trader and approver roles. Scenarios are written in Gherkin and run with Cucumber; Playwright drives the browser and the HTTP API. The framework covers UI, API and hybrid flows (for example, a trader places an order in the UI and an approver approves it over the API).

The application under test lives in [`practice-app/`](practice-app/README.md). It is a fake app that keeps all data in memory.

## Stack

| Concern | Tool |
|---|---|
| Language | TypeScript (strict), ES modules, run through `tsx` |
| BDD runner | `@cucumber/cucumber` with tag-based profiles |
| Browser and API automation | `@playwright/test` (Chromium, `APIRequestContext`) |
| Configuration | `dotenv`, one file per environment in `env/` |
| CI | GitHub Actions: smoke suite on every push and pull request, HTML report uploaded as an artifact |
| Runtime | Node.js 24 (see `.nvmrc`) |
| Code quality | `oxlint` (ESLint-compatible rules) and Prettier, checked in CI |

## Project structure

```text
.
├── features/            Gherkin scenarios
│   ├── api/             API-only scenarios (@api)
│   └── ui/              UI and hybrid scenarios (@ui, @hybrid)
├── src/
│   ├── steps/           Step definitions: thin glue, no locators
│   ├── actions/         Business flows reused by steps (place an order, log in)
│   ├── pages/           Page objects with role- and label-based locators
│   ├── api/             API client factory and the typed Orders API wrapper
│   ├── data/            DataFactory and JSON templates for orders and users
│   └── support/         Environment config, the Cucumber World and hooks
├── scripts/save-auth.ts Logs in each role once and saves the session to auth/
├── env/.env.example     Template for env/.env.dev and env/.env.qa
├── practice-app/        The application under test
├── cucumber.js          Profiles: default, ci, smoke, regression
└── Makefile             Shortcuts for the common runs
```

How a scenario gets its setup (in `src/support/hooks.ts`):

- `@ui` scenarios get a fresh browser context.
- `@as-trader` / `@as-approver` load the saved session for that role from `auth/`, so the scenario starts signed in.
- `@api` scenarios get an `APIRequestContext` with the role's Bearer token.
- `@hybrid` scenarios get both: the trader's browser session and an approver API context.

## Prerequisites

- Node.js 24 (`nvm use` picks it up from `.nvmrc`)
- npm

## Setup

```bash
npm install                      # also installs Chromium for Playwright
cd practice-app && npm install && cd ..
cp env/.env.example env/.env.dev
cp env/.env.example env/.env.qa
```

Then fill in the env files:

| Variable | Required | Description |
|---|---|---|
| `BASE_URL` | yes | Where the app runs: `http://localhost:3100` for dev, `http://localhost:3200` for qa |
| `VALID_PASSWORD` | yes | The password of the test users (`trader1`, `approver1`). The practice app's README lists it. |
| `HEADLESS` | no | Set to `false` to watch the browser. Default: headless. |

`ENV` picks the file (`dev` by default, so `env/.env.dev`). Variables already set in the shell take precedence, which is how CI passes `VALID_PASSWORD` from a repository secret. The run stops with a clear error if `BASE_URL` or `VALID_PASSWORD` is missing. Usernames come from `src/data/templates/users.json`, not from the env files. The env files are git-ignored; only `env/.env.example` is committed.

## Running the tests

1. Start the app for the environment you want to test:

   ```bash
   cd practice-app
   npm run start:dev    # http://localhost:3100
   # or
   npm run start:qa     # http://localhost:3200
   ```

2. In another terminal, from the project root:

   | Command | What it runs |
   |---|---|
   | `make test` | Every scenario except `@wip` |
   | `make test-smoke` | `@smoke` (the CI suite) |
   | `make test-regression` | `@regression` |
   | `make test-ui` / `make test-api` | `@ui` or `@api` |
   | `make test ENV=qa TAGS=@hybrid` | Any tag expression against any environment |
   | `npm run test:dry` | Checks that every step has a definition, without running anything |
   | `npm run typecheck` | `tsc --noEmit` |
   | `npm run lint` / `npm run format` | oxlint and Prettier check, or Prettier fix |

`npm test` first runs `npm run auth:save` (an npm `pretest` hook), which logs in as each role and writes `auth/trader.json` and `auth/approver.json`. Run `make auth` to refresh the sessions on their own, for example after restarting the app (sessions are kept in memory).

## Reports

Each run writes `reports/cucumber-report.html` and `reports/cucumber-report.json`. Failed UI steps attach a screenshot to the HTML report. In CI the `reports/` folder is uploaded as the `cucumber-report` artifact.

## Continuous integration

[`.github/workflows/tests.yml`](.github/workflows/tests.yml) installs both projects, runs `npm run lint` and `npm run typecheck`, starts the practice app on the qa port, waits for it, and runs `make test ENV=qa TAGS=@smoke`. `VALID_PASSWORD` comes from a repository secret and is passed to that step only; nothing secret is written to disk.

## Linting and formatting

`npm run lint` runs oxlint with warnings treated as errors, then checks the formatting of the TypeScript, JavaScript and JSON files with Prettier. oxlint is used instead of ESLint because `typescript-eslint` doesn't support TypeScript 7 (the native compiler this project uses) yet: it needs the JavaScript compiler API that TypeScript 7 no longer ships. oxlint parses TypeScript itself and implements the core ESLint rules.

## Design notes

See [NOTES.md](NOTES.md) for the reasoning behind the layers, the tag-driven setup and the test data approach.

## License

[MIT](LICENSE)
