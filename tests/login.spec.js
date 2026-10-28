import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../data/testUsers.js';
import { loginAs } from './helpers/login.js';

test.use({ storageState: { cookies: [], origins: [] } });

TEST_USERS.forEach((user, index) => {
  test(`login - ${user.username} (${user.expected})`, async ({ page }) => {
    test.info().annotations.push(
      { type: 'login user', description: user.username },
      { type: 'login expected', description: user.expected },
    );
    const started = Date.now();

    const loggedIn = await loginAs(page, user);

    let reason = '';
    if (!loggedIn) {
      const messages = page.locator('[role="alert"], .error, .oj-messagebanner, [class*="error" i]');
      reason = loginAs.lastReason
        || (await messages.allInnerTexts().catch(() => [])).join(' | ').replace(/\s+/g, ' ').trim().slice(0, 160)
        || 'still on login page';
    }

    test.info().annotations.push(
      { type: 'login result', description: loggedIn ? 'success' : 'failure' },
      { type: 'login time', description: `${((Date.now() - started) / 1000).toFixed(1)}s` },
    );
    if (reason) test.info().annotations.push({ type: 'login reason', description: reason });

    expect(loggedIn ? 'success' : 'failure').toBe(user.expected);
  });
});
