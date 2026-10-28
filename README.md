# AZBU Playwright tests

End-to-end UI tests for AZBU (Oracle VBCS POS / sales order app).

## Setup

```
npm install
npx playwright install chromium
cp .env.example .env
cp data/testUsers.example.json data/testUsers.json
```

Fill in `.env` (`AZBU_URL` for test, `AZBU_URL_PROD` for prod) and `data/testUsers.json` (usernames and passwords). Both files are gitignored.

## Environment

Every run asks which environment to use: `prod`, `test` (uses `AZBU_URL` from `.env`) or `dev` (same URL with `ft_azbu_dev`). To skip the prompt set `AZBU_ENV=prod|test|dev`.

## Scripts

| Script | What it does |
|---|---|
| `npm run test:login` | Login check for every user in `testUsers.json` |
| `npm run test:users:invoice` | One invoice per user, one random article from the allowed list |
| `npm run test:stress1` | One order per user with 17 articles by barcode, reservation, payment |
| `npm run orders -- <count> <workers>` | Random sales orders (company and person customers) |
| `npm run test:order` | Single headed sales order |

Results are printed by custom reporters (`reporters/`) and the HTML report is written to `playwright-report/`.

## Layout

- `tests/` specs, `tests/helpers/` shared login and sales order flows
- `data/` article, customer and branch pools (`salesOrderData.js`), test users loader
- `global-setup.js` environment prompt
