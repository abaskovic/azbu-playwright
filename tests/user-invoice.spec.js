import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../data/testUsers.js';
import { loginAs } from './helpers/login.js';
import { ARTICLES, pickBranch, pickCustomer } from '../data/salesOrderData.js';
import { openSalesOrder, selectCustomer, addItems, payOrder } from './helpers/sales-order.js';

const ALLOWED = ['k01190', 'k00030', 'k00040', 'n13703', 'n14585', 'a451225', 'g32504', 'a02024', 'g668549', 'v450815', 'g60297', 'a451231', 'a451222', 'a451180', 'g668545', 'a451234'];
const INVOICE_ARTICLES = ALLOWED.map((code) => ARTICLES.find((item) => item.article === code)).filter(Boolean);
const MODES = ['code', 'name', 'barcode'];

test.use({ storageState: { cookies: [], origins: [] } });

for (const user of TEST_USERS) {
  test(`user invoice - ${user.username}`, async ({ page }) => {
    const branch = pickBranch();
    const customer = pickCustomer(Math.random() < 0.5 ? 'company' : 'person');
    const items = [{ ...INVOICE_ARTICLES[Math.floor(Math.random() * INVOICE_ARTICLES.length)], mode: MODES[Math.floor(Math.random() * MODES.length)] }];
    test.info().annotations.push(
      { type: 'user', description: user.username },
      { type: 'branch', description: branch },
      { type: 'customer account', description: customer.account },
      { type: 'items', description: items.map((item) => `${item.article} (${item.mode})`).join(', ') },
    );

    const startDelay = Math.round(Math.random() * Number(process.env.START_SPREAD_SEC ?? 10) * 1000);
    test.info().annotations.push({ type: 'start delay', description: `${(startDelay / 1000).toFixed(1)}s` });
    await page.waitForTimeout(startDelay);

    expect(await loginAs(page, user), `Login failed for ${user.username}`).toBe(true);
    await openSalesOrder(page, branch);
    await selectCustomer(page, customer);
    await addItems(page, items);
    await payOrder(page);
    await page.waitForTimeout(7000);
  });
}
