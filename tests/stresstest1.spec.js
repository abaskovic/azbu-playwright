import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../data/testUsers.js';
import { loginAs } from './helpers/login.js';
import { ARTICLES, pickCustomer } from '../data/salesOrderData.js';
import { openSalesOrder, selectCustomer, addItems, reserveOrder, payOrder } from './helpers/sales-order.js';

const CODES = ['k01190', 'k00030', 'k00040', 'n13703', 'n14585', 'a451225', 'g32504', 'a02024', 'g668549', 'v450815', 'g60297', 'a451231', 'a451222', 'a451180', 'a451180', 'g668545', 'a451234'];
const ITEMS = CODES.map((code) => ({ ...(ARTICLES.find((item) => item.article === code) ?? { article: code, name: code }), mode: 'barcode' }));
test.use({ storageState: { cookies: [], origins: [] } });

for (const user of TEST_USERS) {
  test(`stresstest1 - ${user.username}`, async ({ page }) => {
    test.setTimeout(300000);
    const customer = pickCustomer(Math.random() < 0.5 ? 'company' : 'person');
    test.info().annotations.push(
      { type: 'user', description: user.username },
      { type: 'customer account', description: customer.account },
      { type: 'items', description: ITEMS.map((item) => `${item.article} (${item.mode})`).join(', ') },
    );

    const startDelay = Math.round(Math.random() * Number(process.env.START_SPREAD_SEC ?? 10) * 1000);
    test.info().annotations.push({ type: 'start delay', description: `${(startDelay / 1000).toFixed(1)}s` });
    await page.waitForTimeout(startDelay);

    expect(await loginAs(page, user), `Login failed for ${user.username}`).toBe(true);
    await openSalesOrder(page);
    await selectCustomer(page, customer);
    await addItems(page, ITEMS);
    await reserveOrder(page);
    await payOrder(page);
    await page.waitForTimeout(7000);
  });
}
