# Payment Ledger

A transaction ledger system: create accounts, post credit/debit transactions, transfer money between accounts, and browse balances and history from a dashboard.

- **Backend:** Node.js, Express, Sequelize ORM, MySQL 8
- **Frontend:** React 19, Vite, MUI 7 (same design language as the CRM), React Hook Form, Zustand, ApexCharts

---

## Contents

1. [Getting started](#1-getting-started)
2. [Scripts](#2-scripts)
3. [Configuration](#3-configuration)
4. [Project structure](#4-project-structure)
5. [Data model and integrity guarantees](#5-data-model-and-integrity-guarantees)
6. [API documentation](#6-api-documentation)
7. [Dashboard](#7-dashboard)
8. [Testing](#8-testing)
9. [Assumptions](#9-assumptions)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Getting started

### Prerequisites

| Requirement | Version |
| --- | --- |
| Node.js | 18 or newer |
| MySQL | 8.0.16 or newer, running locally (needed for enforced `CHECK` constraints) |

### Setup

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure the API
cd ../server
cp .env.example .env        # then set DB_USER / DB_PASSWORD (Windows: copy .env.example .env)

# 3. Database
npm run db:create           # CREATE DATABASE IF NOT EXISTS
npm run migrate             # tables, indexes, constraints, immutability triggers

# 4. Run (two terminals)
npm run dev                 # API on :5000
cd ../client && npm run dev # dashboard on :5173 (proxies /api to :5000)
```

Then open:

- Dashboard: <http://localhost:5173>
- API: <http://localhost:5000/api>

The database starts empty; create an account from the dashboard (or `POST /api/accounts`) to begin.

---

## 2. Scripts

Server (`server/package.json`):

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API with nodemon |
| `npm start` | Start the API |
| `npm run db:create` | Create the database if it doesn't exist |
| `npm run migrate` | Run pending migrations |
| `npm run migrate:undo` | Undo the last migration |
| `npm run db:reset` | Undo all migrations and run them again (empties the database) |
| `npm test` | Run the API integration test suite |

Client (`client/package.json`): `dev`, `build`, `preview`.

Root (`package.json`) has shortcuts that run the same commands from the project root: `install:all`, `server`, `client`, `test`, `build`, and `serve` (builds the dashboard and serves everything from the API on one port, :5000).

---

## 3. Configuration

`server/.env` (copied from `server/.env.example`):

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | API port. The Vite dev proxy reads this too. |
| `DB_HOST` | `127.0.0.1` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user (needs `CREATE DATABASE` the first time) |
| `DB_PASSWORD` | _(empty)_ | MySQL password |
| `DB_NAME` | `payment_ledger` | Application database |
| `DB_NAME_TEST` | `payment_ledger_test` | Database used by `npm test` |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed browser origin(s), comma separated |

---

## 4. Project structure

```
paymentLedger/
├── server/                       # Express + Sequelize API
│   ├── app.js                    # express app (middleware, routes, error handler)
│   ├── server.js                 # boot + graceful shutdown
│   ├── scripts/createDatabase.js # CREATE DATABASE IF NOT EXISTS
│   ├── src/
│   │   ├── config/config.js      # sequelize config (dev / test / prod)
│   │   ├── database/migrations/  # schema, constraints, immutability triggers
│   │   ├── models/               # Account, Transaction, Transfer
│   │   ├── services/             # business logic (atomic ledger posting)
│   │   ├── controllers/          # HTTP <-> service mapping
│   │   ├── routes/<module>/      # *.route.js + *.validation.js (express-validator)
│   │   ├── middlewares/          # validation, async handler, error handler
│   │   ├── constants/            # error codes
│   │   └── utils/                # AppError, response envelope, money, pagination
│   └── test/                     # Jest + Supertest integration tests
└── client/                       # React + Vite + MUI dashboard
    └── src/
        ├── components/layouts/   # AppLayout, Header, SideBar (CRM style)
        ├── components/ui/        # Button, Modal, DataTable, SummaryCards, ...
        ├── features/             # dashboard, accounts, transactions, transfers
        ├── services/             # API calls
        ├── store/                # Zustand (refresh signal, sidebar, modals)
        └── theme/                # palette + typography from the CRM
```

The backend follows the CRM's controller → service → route + validation layout and uses migrations only (no `sequelize.sync()`).

---

## 5. Data model and integrity guarantees

### Tables

**accounts**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | BIGINT UNSIGNED, PK, auto-increment | unique account identifier |
| `name` | VARCHAR(100), NOT NULL | account holder name |
| `balance` | DECIMAL(18,2), NOT NULL, default 0 | `CHECK (balance >= 0)` |
| `created_at` / `updated_at` | DATETIME(3) | system generated |

**transactions**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | BIGINT UNSIGNED, PK | unique transaction identifier |
| `account_id` | FK → accounts.id | `ON DELETE RESTRICT` |
| `type` | ENUM('credit','debit') | |
| `amount` | DECIMAL(18,2) | `CHECK (amount > 0)` |
| `description` | VARCHAR(255), nullable | |
| `reference_id` | VARCHAR(100) | **UNIQUE (account_id, reference_id)** |
| `balance_after` | DECIMAL(18,2) | running balance after this entry, `CHECK (>= 0)` |
| `transfer_id` | FK → transfers.id, nullable | set on the two legs of a transfer |
| `created_at` | DATETIME(3) | system generated |

**transfers**: `id`, `from_account_id`, `to_account_id`, `amount` (`CHECK > 0`), `description`, `reference_id` (**UNIQUE (from_account_id, reference_id)**), `created_at`, plus `CHECK (from_account_id <> to_account_id)`.

Indexes cover the history query (`account_id, type, created_at`) and the dashboard aggregates.

### How each requirement is enforced

| Requirement | Application layer | Database layer |
| --- | --- | --- |
| Initial balance is 0 / client can't set it | `balance` in the request body is rejected with 400 | column default `0` |
| Atomicity | Every write runs in one Sequelize (InnoDB) transaction: insert entry + update balance, or nothing | rollback on any error |
| Concurrency | The account row is locked with `SELECT … FOR UPDATE` before the balance is read | row-level lock |
| No overdraft | Balance checked under the lock, rejected with 422 | `CHECK (balance >= 0)` as a backstop |
| Duplicate `reference_id` | Looked up under the lock and rejected with 409 (existing transaction returned) | `UNIQUE (account_id, reference_id)` wins any race |
| Immutability | No update/delete endpoints; `PUT/PATCH/DELETE /transactions/:id` return 405 | `BEFORE UPDATE/DELETE` triggers raise an error on `transactions` and `transfers` |
| Balance consistency | `balance = Σ credits − Σ debits`; rejected requests never write | each entry stores `balance_after` for auditing |
| Transfer atomicity | Transfer row + debit leg + credit leg in one DB transaction; both accounts locked in ascending id order (prevents deadlocks) | FK + CHECK constraints |
| Money precision | Arithmetic in integer paise; at most 2 decimals accepted | DECIMAL(18,2) |

---

## 6. API documentation

Base URL: `http://localhost:5000/api`. All request and response bodies are JSON.

### Response envelope

Success:

```json
{ "success": true, "code": 200, "data": { } }
```

Error:

```json
{
  "success": false,
  "code": 400,
  "errCode": "INVALID_AMOUNT",
  "errorMessage": "amount must be greater than 0",
  "errors": [{ "field": "amount", "location": "body", "message": "amount must be greater than 0" }]
}
```

`errors` is present for validation failures; `data` is present when useful (for example the existing transaction on a duplicate).

### Error codes

| HTTP | `errCode` | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Missing/invalid field (e.g. name, reference_id) or a system field sent by the client |
| 400 | `INVALID_REQUEST_BODY` | Malformed JSON, missing body, or body is not a JSON object |
| 400 | `INVALID_ACCOUNT_ID` | Account id is not a positive integer |
| 400 | `INVALID_TRANSACTION_TYPE` | `type` is not `credit` or `debit` |
| 400 | `INVALID_AMOUNT` | Amount missing, not a number, ≤ 0, more than 2 decimals, or > 1,000,000,000 |
| 400 | `INVALID_PAGINATION` | `page` < 1 or `limit` outside 1–100 |
| 400 | `SAME_ACCOUNT_TRANSFER` | Transfer source and destination are the same |
| 404 | `ACCOUNT_NOT_FOUND` | Account does not exist |
| 404 | `TRANSACTION_NOT_FOUND` | Transaction does not exist |
| 404 | `ROUTE_NOT_FOUND` | Unknown endpoint |
| 405 | `TRANSACTION_IMMUTABLE` | Attempt to edit or delete a transaction |
| 409 | `DUPLICATE_TRANSACTION` | `reference_id` already used on this account |
| 409 | `DUPLICATE_TRANSFER` | Transfer `reference_id` already used by the source account |
| 422 | `INSUFFICIENT_BALANCE` | Debit/transfer larger than the available balance |
| 500 | `INTERNAL_ERROR` | Unexpected server error (details are logged, not returned) |

---

### 7.1 Create account

`POST /accounts`

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | required, 1–100 chars, trimmed |

`balance`, `id`, `created_at` and `updated_at` are rejected if sent.

```bash
curl -X POST http://localhost:5000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"name": "Asha Rao"}'
```

`201 Created`

```json
{
  "success": true,
  "code": 201,
  "message": "Account created successfully",
  "data": {
    "id": 7,
    "name": "Asha Rao",
    "balance": 0,
    "created_at": "2026-10-27T14:30:12.345Z",
    "updated_at": "2026-10-27T14:30:12.345Z"
  }
}
```

Errors: `400 VALIDATION_ERROR` (missing name, or `balance` supplied), `400 INVALID_REQUEST_BODY`.

### 7.2 Add transaction

`POST /transactions`

| Field | Type | Rules |
| --- | --- | --- |
| `account_id` | integer | required, must exist |
| `type` | string | required, `credit` or `debit` (case-insensitive) |
| `amount` | number | required, > 0, max 2 decimals, ≤ 1,000,000,000 |
| `reference_id` | string | required, 1–100 chars, unique per account, must not start with `TRF-` (reserved for transfer legs) |
| `description` | string | optional, ≤ 255 chars |

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"account_id": 7, "type": "credit", "amount": 100, "reference_id": "INV-1001", "description": "Opening deposit"}'
```

`201 Created`

```json
{
  "success": true,
  "code": 201,
  "message": "Transaction created successfully",
  "data": {
    "id": 42,
    "account_id": 7,
    "type": "credit",
    "amount": 100,
    "description": "Opening deposit",
    "reference_id": "INV-1001",
    "balance_after": 100,
    "transfer_id": null,
    "created_at": "2026-10-27T14:31:00.120Z"
  }
}
```

Duplicate (same `account_id` + `reference_id`), `409 Conflict`, balance unchanged:

```json
{
  "success": false,
  "code": 409,
  "errCode": "DUPLICATE_TRANSACTION",
  "errorMessage": "A transaction with reference_id \"INV-1001\" already exists for account 7",
  "data": { "id": 42, "account_id": 7, "type": "credit", "amount": 100, "reference_id": "INV-1001", "...": "..." }
}
```

Insufficient balance, `422 Unprocessable Entity`, nothing persisted:

```json
{
  "success": false,
  "code": 422,
  "errCode": "INSUFFICIENT_BALANCE",
  "errorMessage": "Insufficient balance: account 7 has 100.00, debit requested 150.00",
  "data": { "account_id": 7, "balance": 100, "requested_amount": 150 }
}
```

Other errors: `400 INVALID_TRANSACTION_TYPE`, `400 INVALID_AMOUNT`, `400 INVALID_ACCOUNT_ID`, `400 VALIDATION_ERROR`, `404 ACCOUNT_NOT_FOUND`.

### 7.3 Get account balance

`GET /accounts/:accountId/balance`

```bash
curl http://localhost:5000/api/accounts/7/balance
```

`200 OK`

```json
{ "success": true, "code": 200, "data": { "account_id": 7, "name": "Asha Rao", "balance": 100 } }
```

Errors: `400 INVALID_ACCOUNT_ID`, `404 ACCOUNT_NOT_FOUND`.

### 7.4 Get transaction history

`GET /accounts/:accountId/transactions`

| Query | Default | Rules |
| --- | --- | --- |
| `type` | _(none: both)_ | `credit` or `debit` |
| `page` | `1` | integer ≥ 1 |
| `limit` | `10` | integer 1–100 |

Sorted latest first by `created_at` (ties broken by `id`).

```bash
curl "http://localhost:5000/api/accounts/7/transactions?type=debit&page=1&limit=10"
```

`200 OK`

```json
{
  "success": true,
  "code": 200,
  "data": {
    "account_id": 7,
    "filters": { "type": "debit" },
    "transactions": [
      {
        "id": 44,
        "account_id": 7,
        "type": "debit",
        "amount": 20,
        "description": "Utility bill",
        "reference_id": "INV-1004",
        "balance_after": 100,
        "transfer_id": null,
        "created_at": "2026-10-27T14:35:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "page_size": 10,
      "total_records": 2,
      "total_pages": 1,
      "has_next_page": false,
      "has_previous_page": false
    }
  }
}
```

A page beyond `total_pages` returns an empty `transactions` array with the same pagination metadata.

Errors: `400 INVALID_ACCOUNT_ID`, `400 INVALID_TRANSACTION_TYPE`, `400 INVALID_PAGINATION`, `404 ACCOUNT_NOT_FOUND`.

### 7.5 Transfer money (bonus)

`POST /transfers`

| Field | Type | Rules |
| --- | --- | --- |
| `from_account_id` | integer | required, must exist |
| `to_account_id` | integer | required, must exist, different from source |
| `amount` | number | same rules as transactions |
| `reference_id` | string | required, unique per source account |
| `description` | string | optional |

```bash
curl -X POST http://localhost:5000/api/transfers \
  -H "Content-Type: application/json" \
  -d '{"from_account_id": 1, "to_account_id": 2, "amount": 30, "reference_id": "XFER-001"}'
```

`201 Created`: the transfer with both ledger legs. The debit leg on the source gets reference `TRF-<transferId>-OUT` and the credit leg on the destination gets `TRF-<transferId>-IN`.

```json
{
  "success": true,
  "code": 201,
  "message": "Transfer completed successfully",
  "data": {
    "id": 3,
    "from_account_id": 1,
    "to_account_id": 2,
    "amount": 30,
    "description": null,
    "reference_id": "XFER-001",
    "created_at": "2026-10-27T14:40:00.000Z",
    "fromAccount": { "id": 1, "name": "Account A" },
    "toAccount": { "id": 2, "name": "Account B" },
    "entries": [
      { "id": 50, "account_id": 1, "type": "debit", "amount": 30, "reference_id": "TRF-3-OUT", "balance_after": 70, "transfer_id": 3 },
      { "id": 51, "account_id": 2, "type": "credit", "amount": 30, "reference_id": "TRF-3-IN", "balance_after": 80, "transfer_id": 3 }
    ]
  }
}
```

If any step fails (missing account, insufficient balance, duplicate), the whole transfer is rolled back. A partial transfer is impossible.

Errors: `400 SAME_ACCOUNT_TRANSFER`, `400 INVALID_AMOUNT`, `404 ACCOUNT_NOT_FOUND`, `409 DUPLICATE_TRANSFER`, `422 INSUFFICIENT_BALANCE`.

### 7.6 Supporting endpoints (used by the dashboard)

| Method & path | Description |
| --- | --- |
| `GET /health` | API and database status |
| `GET /accounts?search=&page=&limit=` | Paginated account list; `search` matches name or exact id |
| `GET /accounts/:accountId` | Account plus stats (`total_credit`, `total_debit`, `credit_count`, `debit_count`, `transaction_count`, `last_transaction_at`) |
| `GET /transactions?type=&account_id=&search=&page=&limit=` | Global ledger across all accounts, latest first; `search` matches reference, description or account name |
| `GET /transactions/:id` | Single transaction |
| `PUT / PATCH / DELETE /transactions/:id` | Always `405 TRANSACTION_IMMUTABLE` |
| `GET /transfers?account_id=&page=&limit=` | Paginated transfers, optionally for one account |
| `GET /dashboard/summary?tz_offset=330` | Totals, recent transactions, top accounts and 14-day credit/debit volume (bucketed by `tz_offset` minutes east of UTC) |

---

## 7. Dashboard

The UI reuses the CRM's look: DM Sans, purple `#6E0ACE` accents, white collapsible sidebar, bordered summary cards, underlined tabs with count badges, and the payments data-grid styling.

| Screen | What you can do |
| --- | --- |
| **Dashboard** | Total balance, account count, total credits/debits, 14-day credit vs debit chart, top accounts, recent transactions |
| **Accounts** | Search and paginate accounts, create an account |
| **Account details** | Current balance, credit/debit totals, Credit / Debit / Transfer actions, paginated history with All / Credits / Debits tabs and running balance |
| **Transactions** | Full ledger with type tabs, account filter and search |
| **Transfers** | Transfer history with account filter, new transfer form |

Forms validate on the client and show server errors on the matching field. Each form pre-fills a unique `reference_id` and keeps it for the life of the form, so an accidental double submit is rejected as a duplicate instead of posting twice.

---

## 8. Testing

```bash
npm test
```

Runs Jest + Supertest against a separate `payment_ledger_test` database (created and migrated automatically; your main data is untouched). Set up `server/.env` with working MySQL credentials first (see [Getting started](#1-getting-started)).

Covered:

- account creation, unique ids, zero balance, rejection of client-supplied balance
- credit/debit maths, decimal precision, balance consistency (100 + 50 − 30 − 20 = 100)
- insufficient balance (rejected, balance unchanged)
- duplicate `reference_id` per account (409, no side effects) and reuse across accounts
- every validation and error case listed in the assignment
- history: latest-first order, type filter, pagination metadata, invalid pagination
- immutability at the API (405) and database (trigger) level
- **concurrency**: 10 parallel debits of 30 on a balance of 100 (exactly 3 succeed, final balance 10); 6 parallel requests with the same `reference_id` (exactly 1 succeeds)
- transfers: success, rollback on insufficient balance, same-account, missing account, duplicates

---

## 9. Assumptions

1. **IDs** are auto-increment integers (unique, ordered, easy to read in the UI). They are exposed as numbers.
2. **Currency** is a single implicit currency (shown as INR in the UI). Amounts have at most 2 decimal places; a single transaction is capped at 1,000,000,000.
3. **Setting `balance` on account creation is rejected** (400) rather than silently ignored, so clients find out immediately. Other system fields (`id`, `created_at`, `balance_after`, `transfer_id`) are rejected the same way.
4. **`description` is optional**; `name`, `type`, `amount` and `reference_id` are required. Strings are trimmed; whitespace-only values count as missing. `type` is case-insensitive.
5. **Duplicates return 409 Conflict** with the original transaction in `data`. This applies even if the amount or type differs, because `reference_id` identifies the operation. The check runs before the balance check, so a retried request is always reported as a duplicate.
6. **Rejected transactions are not stored.** The ledger only contains successful entries, so the balance always equals the sum of stored entries.
7. **Insufficient balance returns 422** (the request is valid but can't be processed). Account not found returns 404.
8. **No account update/delete endpoints** were required, so none exist. Foreign keys use `ON DELETE RESTRICT` so an account with history can't be removed.
9. **Transfers** are recorded in a `transfers` table and as two linked ledger entries. Their idempotency key is `(from_account_id, reference_id)`. Leg references use the reserved `TRF-` prefix, which regular transactions can't use, so they never collide with client references.
10. **Timestamps** are stored in UTC with millisecond precision; ordering ties are broken by `id`.
11. **Pagination** defaults to `page=1, limit=10`, max `limit=100`. Requesting a page past the end returns an empty list (not an error).
12. **Authentication** is out of scope for this assignment; the API and dashboard are open on localhost.
13. **Immutability triggers**: if your MySQL user can't create triggers (for example binary logging without `SUPER`), the migration logs a warning and continues. The API still never exposes update/delete.

---

## 10. Troubleshooting

| Problem | Fix |
| --- | --- |
| `Access denied for user` | Fix `DB_USER` / `DB_PASSWORD` in `server/.env` |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL isn't running, or is on another port; set `DB_PORT` in `server/.env` |
| `Check constraint ... is violated` / `CHECK` ignored | Upgrade to MySQL 8.0.16+ (earlier versions parse but don't enforce `CHECK`) |
| Port 5000 or 5173 in use | Change `PORT` in `server/.env`; the dashboard proxy follows it automatically |
| Start over with an empty database | `npm run db:reset` (in `server/`) |
