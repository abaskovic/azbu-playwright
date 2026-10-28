import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../data/testUsers.js';
import { loginAs } from './helpers/login.js';
import { pickBranch, pickCustomer, pickItems } from '../data/salesOrderData.js';
import { openSalesOrder, selectCustomer, addItems, payOrder } from './helpers/sales-order.js';

const ORDER_USERS = TEST_USERS.filter((user) => user.expected === 'success');

test.use({ storageState: { cookies: [], origins: [] } });

for (const customerType of ['company', 'person']) {
  test(`sales order - ${customerType} customer, random branch`, async ({ page }) => {
    test.setTimeout(180000);
    const branch = pickBranch();
    const customer = pickCustomer(customerType);
    const items = pickItems();
    const user = ORDER_USERS[Math.floor(Math.random() * ORDER_USERS.length)];
    test.info().annotations.push(
      { type: 'user', description: user.username },
      { type: 'branch', description: branch },
      { type: 'customer account', description: customer.account },
      { type: 'items', description: items.map((item) => `${item.article} (${item.mode})`).join(', ') },
    );

    const startDelay = Math.round(Math.random() * Number(process.env.START_SPREAD_SEC ?? 20) * 1000);
    test.info().annotations.push({ type: 'start delay', description: `${(startDelay / 1000).toFixed(1)}s` });
    await page.waitForTimeout(startDelay);

    expect(await loginAs(page, user), `Login failed for ${user.username}`).toBe(true);
    await openSalesOrder(page, branch);
    await selectCustomer(page, customer);
    await addItems(page, items);
    await payOrder(page);
  });
}
