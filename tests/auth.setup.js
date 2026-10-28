import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto(process.env.AZBU_URL);
  await page.getByRole('button', { name: 'IAJDGS-TEST Idp IAJDGS-TEST' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(process.env.AZBU_USER);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.AZBU_PASS);
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page).toHaveURL(/\/rt\/ft_azbu_\w+\//, { timeout: 60000 });

  await page.context().storageState({ path: 'auth/azbu.json' });
});
