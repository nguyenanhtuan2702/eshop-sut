# Automated EShop tests: FR-01, FR-09, FR-17

These Playwright tests use the running local EShop applications. They do not start
or reset the database and do not seed over existing data. Coupons/users created
by a run use a unique prefix and are removed after each applicable test or suite.

## Prerequisites

- Node.js and npm.
- Backend API running at `http://localhost:3000`.
- Frontend Web running at `http://localhost:5173`.
- Frontend Admin running at `http://localhost:5174`.
- A valid Admin login supplied through `ESHOP_ADMIN_EMAIL` and
  `ESHOP_ADMIN_PASSWORD` environment variables. Do not put credentials in source.

Install the test dependencies once:

```powershell
Set-Location D:\eshop-sut\tests\automated
npm install
npx playwright install chromium
```

Set the Admin login in the current PowerShell session, then run all three groups:

```powershell
$env:ESHOP_ADMIN_EMAIL = "admin@eshop.com"
$env:ESHOP_ADMIN_PASSWORD = "<your-admin-password>"
.\run-tests.ps1
```

The script runs the registration, coupon-application, and coupon-management
groups independently, saves console logs and per-case JSON evidence under
`test-results\executions\<run-id>\`, and writes an `execution-results.md` beside
each source test-design folder.
Each executed test that opens the configured Web or Admin UI also saves a
full-page screenshot after its assertion, for both PASS and FAIL outcomes.
API-only cases are recorded with their response and JSON log instead of a
blank-browser screenshot.

Organize the preserved baseline evidence and any supplemental execution into
`evidence/`. Set `ESHOP_EVIDENCE_SUPPLEMENT_RUN_IDS` to one or more comma-
separated run IDs when adding rerun evidence:

```powershell
$env:ESHOP_EVIDENCE_SUPPLEMENT_RUN_IDS = "20261016-<supplement-run-id>"
npm run evidence
```

The organizer preserves the baseline run ID, records supplemental runs
separately, and updates report evidence links without replacing historical
expected results or statuses.

Run one group without the wrapper if needed:

```powershell
npm run test:fr01
npm run test:fr09
npm run test:fr17
```

Set `ESHOP_WEB_URL`, `ESHOP_API_URL`, or `ESHOP_TEST_RUN_ID` to override local
defaults. Use `ESHOP_ADMIN_URL` to override the Admin URL. Tests that require
account confirmation or other unsupported UI/API inputs are reported as
`NOT AUTOMATED`, not silently omitted.

## Scope notes

- FR-01 registration uses the Web UI for interactive registration and native
  required-field behavior; API calls are used for invalid inputs masked by the
  client.
- FR-09 coupon application runs through the Checkout UI. A dedicated test
  account is created per case; usage records are only created for that account
  and removed with it. An inactive and date-bound coupon fixture is created
  under the run's unique prefix and cleaned up afterward.
- FR-17 uses the Admin UI for create/list/delete and form constraints. API
  requests are used for `type` values that the current UI cannot express.
