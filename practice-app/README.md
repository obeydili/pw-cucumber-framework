# Trade Desk Lite (practice app)

A small, fake order-ticket app. It is the **system under test** for the framework you build. It's provided as is and isn't part of the lessons, so you don't need to change it.

All data is fake and kept in memory. Restarting the server resets everything.

## Run it

```bash
cd practice-app
npm install
npm run start:dev   # http://localhost:3100  (dev)
npm run start:qa    # http://localhost:3200  (qa)
```

`PORT` decides the port (`npm start` defaults to 3100), so `env/.env.dev` and `env/.env.qa` in your framework can point at different "environments".

## Users

| Username | Password | Role |
|---|---|---|
| `trader1` | `Password123!` | trader: places orders |
| `approver1` | `Password123!` | approver: approves or rejects orders |

## Pages

| Path | Who | What |
|---|---|---|
| `/login` | anyone | Sign-in form (Username, Password, "Sign in") |
| `/orders` | signed in | Order list with a status badge and a "View" link per row |
| `/orders/new` | trader | Order ticket: Symbol, Side (Buy/Sell), Quantity, Limit price. **Submit order** stays disabled until the ticket is valid. |
| `/orders/:id` | signed in | Order details and status |
| `/approvals` | approver | Pending orders with Approve / Reject buttons per row |

Signed-out visitors are redirected to `/login?next=...`. The wrong role gets a "Not allowed" page (403).

Useful hooks for locators: form fields have labels, buttons have names, and status badges have `data-testid="order-status"`. Two things are awkward on purpose: every orders row has a "View" link, and every approvals row has the same "Approve" and "Reject" buttons. Scope your locator to the right row.

## Sessions

- **UI:** signing in sets an HTTP-only `tdl_session` cookie, which Playwright's `storageState` captures.
- **API:** `POST /api/auth/login` returns `{ token }`. Send it as `Authorization: Bearer <token>`.

Both are kept in memory, so restarting the app logs everyone out. Re-run your auth script after a restart.

## API

| Method & path | Auth | Result |
|---|---|---|
| `POST /api/auth/login` | none | `{ username, password }` → `200 { token, user }`, or `401` |
| `POST /api/auth/logout` | cookie | `204` |
| `GET /api/me` | yes | Current user |
| `GET /api/symbols` | yes | `["ACME", "BLUE", ...]` |
| `GET /api/orders` | yes | All orders; `?status=Pending%20Approval` filters |
| `POST /api/orders` | trader | `{ symbol, side, quantity, limitPrice, clientOrderId? }` → `201` order; `400 { error, details }` on validation; `409` on a duplicate `clientOrderId`; `403` for an approver |
| `GET /api/orders/:id` | yes | Order, or `404` |
| `POST /api/orders/:id/approve` | approver | `200` order; `403` for a trader; `409` if no longer pending |
| `POST /api/orders/:id/reject` | approver | Same as approve |
| `POST /api/test/reset` | none | Restores the seed orders (sessions are kept) |

Validation rules:
- `symbol` must come from `/api/symbols`.
- `side` is `Buy` or `Sell`.
- `quantity` is a whole number from 1 to 1,000,000.
- `limitPrice` is greater than 0, with at most 2 decimals.

Order status flow: `Pending Approval` → `Approved` or `Rejected`.
