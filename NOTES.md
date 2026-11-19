# Design notes

Why the framework is shaped the way it is.

## Layers

`features → steps → actions → pages / api`

- **Steps** only translate Gherkin into calls and keep per-scenario values in the World (`scenarioData`). They hold no locators, so a UI change never touches a step file.
- **Actions** (`OrderActions`, `AuthActions`) are business flows built from page objects, such as "place an order and return the id the app assigned". Several steps reuse them.
- **Pages** expose locators as getters, which re-resolve on every use. They use roles, labels and visible text first, and a `data-testid` only where the app offers nothing better (the status badge).
- **API** code wraps `APIRequestContext`: `ApiClient.create(token)` builds an authenticated context and `OrdersApi` names the endpoints. Steps assert on the returned `APIResponse`.

## Setup is driven by tags

`src/support/hooks.ts` reads each scenario's tags and builds only what the scenario needs:

- `@ui` → a browser context; `@api` → an API context; `@hybrid` → both.
- `@as-trader` / `@as-approver` pick the role. A UI scenario loads that role's saved `storageState`; an API scenario gets a Bearer token for it.

A feature file states who acts and through which channel, and the step code never logs in by itself.

## Sessions are created once per run

`scripts/save-auth.ts` (run by the `pretest` hook) logs in each role through the real login page and saves the session to `auth/`. Scenarios reuse those sessions instead of logging in through the UI every time; only the login feature exercises the form. The hook fails with a clear message if a session file is missing.

## Hybrid scenarios

The UI is the slow, brittle part of a test, so it is used only for what the scenario is about. In the approval scenario the trader places the order in the UI, the approver approves it over the API, and the trader's page is reloaded to check the status. The scenario is about what the trader sees, so the approver's side doesn't need a browser.

## Test data

`DataFactory.getOrderData(template, overrides)` loads a JSON template from `src/data/templates/`, adds a unique `clientOrderId` (the API answers 409 on a duplicate), and applies per-scenario overrides, for example `{ quantity: -500 }` for a validation case. Scenarios create their own orders and never depend on seed data, so they can run in any order.

## Configuration

`src/support/env.ts` loads `env/.env.<ENV>` and checks the required values once, at start-up, so a missing `BASE_URL` or `VALID_PASSWORD` stops the run with one clear message instead of failing at a random login. Shell variables win over the file, so CI injects the password from a secret without writing it to disk.

## Tags and profiles

`@smoke` is the fast CI gate, `@regression` the broader set, and `@wip` is excluded by every profile in `cucumber.js`, so unfinished work can be committed without breaking a run.

## Risks I would test first

1. A trader can approve their own order.
2. An order with quantity 0 is accepted.
3. An approved order can still be changed.

The API feature covers the first one (a trader gets 403 on approve) and the validation path of the second (a negative quantity gets 400 with a field message). Quantity 0 itself and the third risk are not covered yet.
