export async function loginAs(page, user, timeout = 30000) {
  await page.goto(process.env.AZBU_URL);

  const idpButton = page.getByRole('button', { name: 'IAJDGS-TEST Idp IAJDGS-TEST' });
  const locked = page.getByRole('heading', { name: 'Application Locked' });
  const first = await Promise.race([
    idpButton.waitFor({ timeout }).then(() => 'idp'),
    locked.waitFor({ timeout }).then(() => 'locked'),
  ]).catch(() => 'timeout');

  if (first === 'locked') {
    loginAs.lastReason = 'Application locked (maintenance)';
    return false;
  }
  if (first === 'timeout') {
    loginAs.lastReason = 'Login page did not load';
    return false;
  }

  await idpButton.click();
  await page.getByRole('textbox', { name: 'Username' }).fill(user.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(user.password);
  await page.getByRole('button', { name: 'Next' }).click();
  loginAs.lastReason = '';
  return page.waitForURL(/\/rt\/ft_azbu_\w+\//, { timeout }).then(() => true, () => false);
}
