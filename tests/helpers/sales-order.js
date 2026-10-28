import { test, expect } from '@playwright/test';

async function closeWarning(page) {
  const ok = page.getByRole('dialog').filter({ hasText: 'Upozorenje' }).getByRole('button', { name: 'OK' });
  if (!(await ok.isVisible().catch(() => false))) return false;
  const text = (await page.getByRole('dialog').filter({ hasText: 'Upozorenje' }).innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  test.info().annotations.push({ type: 'warning dialog', description: text.slice(0, 120) });
  await ok.click();
  return true;
}

async function waitForLoader(page, appearTimeout = 5000) {
  const loader = page.getByText(/^Učitavanje/).first();
  await loader.waitFor({ state: 'visible', timeout: appearTimeout }).catch(() => { });
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    await closeWarning(page);
    if (!(await loader.isVisible().catch(() => false))) return;
    await page.waitForTimeout(300);
  }
  await expect(loader).toBeHidden({ timeout: 1000 });
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fieldText(page, label) {
  return page.getByLabel(label).first().evaluate((el) => el.value ?? el.innerText);
}

async function pickBranchCell(page, branchField, name) {
  try {
    await branchField.click({ timeout: 10000 });
    await branchField.press('Control+a', { timeout: 5000 });
    await branchField.press('Backspace', { timeout: 5000 });
    await branchField.pressSequentially(name, { delay: 100, timeout: 15000 });
    await page.waitForTimeout(1000);
    const cell = page.getByRole('gridcell', { name: new RegExp(`(^|[\\s-])${escapeRegExp(name)}\\s*$`, 'i') }).first();
    if (!(await cell.isVisible())) {
      await branchField.click({ timeout: 10000 });
      await page.waitForTimeout(1000);
    }
    if (!(await cell.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false))) return false;
    await cell.click({ timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

async function selectBranch(page, branch) {
  const label = 'Poslovna jedinica';
  const branchField = page.getByRole('combobox', { name: label }).or(page.getByRole('textbox', { name: label })).first();
  const original = (await branchField.inputValue({ timeout: 10000 }).catch(() => '')).trim();
  if (await pickBranchCell(page, branchField, branch)) return;
  const originalName = original.split(' - ').slice(1).join(' - ') || original;
  test.info().annotations.push({ type: 'branch fallback', description: `${branch} not selectable, staying on ${original || 'current'}` });
  await page.keyboard.press('Escape');
  if (originalName && !(await pickBranchCell(page, branchField, originalName))) await page.keyboard.press('Escape');
}

export async function openSalesOrder(page, branch) {
  await page.addLocatorHandler(page.getByRole('dialog').filter({ hasText: 'Upozorenje' }), async (dialog) => {
    const text = (await dialog.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    test.info().annotations.push({ type: 'warning dialog', description: text.slice(0, 120) });
    await dialog.getByRole('button', { name: 'OK' }).click();
  });
  await page.goto(process.env.AZBU_URL);

  await page
    .locator('.oj-flex.oj-sm-flex-direction-column.oj-flex-item.oj-sm-flex-initial.oj-sm-align-items-center')
    .first()
    .click();
  if (branch) await selectBranch(page, branch);
  await page.getByRole('button', { name: 'Kreiraj nalog prodaje' }).click();

  await waitForLoader(page);
  await expect(page.getByRole('combobox', { name: 'Odaberi kupca' })).toBeVisible({ timeout: 30000 });
}

export async function selectCustomer(page, { account, search }) {
  const term = Math.random() < 0.5 ? account : search;
  test.info().annotations.push({ type: 'customer search', description: term });
  await waitForLoader(page, 1500);
  const customerField = page.getByRole('combobox', { name: 'Odaberi kupca' });
  await customerField.click({ force: true });
  await customerField.pressSequentially(term, { delay: 150 });

  const row = page
    .locator('[id="lovDropdown_select-customer"] tr.oj-table-body-row')
    .filter({ hasText: new RegExp(`(^|\\s)${escapeRegExp(account)}(\\s|$)`) })
    .first();
  await expect(row).toBeVisible({ timeout: 15000 });
  await row.click();

  await expect.poll(() => fieldText(page, 'Odaberi kupca'), { timeout: 15000 }).toContain(account);
  return term;
}


const LINE_ROWS = 'tr.oj-table-body-row:has(> td[id^="items-table:"])';

function lineRows(page) {
  return page.locator(LINE_ROWS);
}

async function lineSnapshot(page) {
  const rows = lineRows(page);
  const count = await rows.count();
  const first = count > 0 ? (await rows.first().innerText()).replace(/\s+/g, ' ').trim() : '';
  return { count, first };
}

async function lineChanged(page, before) {
  const now = await lineSnapshot(page);
  return now.count > before.count || now.first !== before.first;
}

async function waitForSelectedItem(page, before) {
  const description = page.locator('#addRow [id="add-ProductDescription"] .oj-text-field-readonly');
  await expect
    .poll(async () => /\S/.test((await description.innerText()) || '') || (await lineChanged(page, before)), { timeout: 8000 })
    .toBe(true);
}

async function waitForPriceAndStock(page, before) {
  const price = page.locator('#addRow [id="add-UnitSellingPrice"] .oj-text-field-readonly');
  await expect
    .poll(async () => /\d/.test((await price.innerText()) || '') || (await lineChanged(page, before)), { timeout: 20000 })
    .toBe(true);
}

async function clearAddRow(page) {
  const cancel = page.locator('#addRow oj-button:has(.oj-ux-ico-multiply) button');
  if (await cancel.isVisible().catch(() => false)) await cancel.click();
  await waitForLoader(page, 1000);
}

async function commitLine(page, field, before) {
  if (await lineChanged(page, before)) return;
  await field.press('Enter');
  const price = page.locator('#addRow [id="add-UnitSellingPrice"] .oj-text-field-readonly');
  await expect(price)
    .not.toHaveText(/\d/, { timeout: 3000 })
    .catch(async () => {
      if (!(await lineChanged(page, before))) await page.locator('#addButton button').click();
    });
}

function nameQuery(name) {
  let query = '';
  for (const word of name.split(/\s+/)) {
    const next = query ? `${query} ${word}` : word;
    if (next.length > 50 && query) break;
    query = next;
  }
  return query.replace(/[,;:.]+$/, '');
}

async function addByArticleField(page, text, code, before) {
  await waitForLoader(page, 1500);
  const articleField = page.getByRole('combobox', { name: /Odaberi artikl|Skeniraj|Barcode/i }).last();
  await expect(articleField).toBeVisible({ timeout: 15000 });
  await articleField.click({ force: true });
  await articleField.pressSequentially(text, { delay: 100 });
  await page.waitForTimeout(1000);

  const rows = page.locator('tr.oj-table-body-row:has(td[id^="select-item-table"])');
  const codePattern = new RegExp(`(^|\\s)${escapeRegExp(code)}(\\s|$)`, 'i');
  const found = await rows.first().waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false);
  if ((!found || (await rows.filter({ hasText: codePattern }).count()) === 0) && text !== code) {
    await articleField.press('Control+a');
    await articleField.pressSequentially(code, { delay: 100 });
    await page.waitForTimeout(1000);
  }
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
  const matching = rows.filter({ hasText: codePattern });
  const row = (await matching.count()) > 0 ? matching.first() : rows.first();
  await row.locator(':scope > td').nth(2).click();
  await waitForSelectedItem(page, before);
  await waitForPriceAndStock(page, before);
  await commitLine(page, articleField, before);
  await waitForLoader(page, 3000);
}

async function addByBarcode(page, code, before) {
  const barcodeField = page.getByRole('textbox', { name: 'Barcode' });
  if (!(await barcodeField.isVisible())) await page.keyboard.press('F4');
  await barcodeField.fill(code);
  await barcodeField.press('Enter');
  await waitForSelectedItem(page, before);
  await waitForPriceAndStock(page, before);
  await commitLine(page, barcodeField, before);
  await waitForLoader(page, 3000);
}

async function addItem(page, item) {
  const before = await lineSnapshot(page);
  if (item.mode === 'barcode') await addByBarcode(page, item.article, before);
  else if (item.mode === 'name') await addByArticleField(page, nameQuery(item.name), item.article, before);
  else await addByArticleField(page, item.article, item.article, before);
  await expect
    .poll(async () => {
      await closeWarning(page);
      return lineChanged(page, before);
    }, { timeout: 30000 })
    .toBe(true);
  await page.waitForTimeout(1000);
  return before;
}

async function isItemAddedCorrectly(page, item, before) {
  const now = await lineSnapshot(page);
  if (now.count === before.count && now.first === before.first) return false;
  if (now.count > before.count + 1) return false;
  if (item.mode === 'barcode') return true;
  return now.first.toLowerCase().includes(item.article.toLowerCase());
}

export async function addItems(page, items) {
  await waitForLoader(page, 1500);
  for (const item of items) {
    let ok = false;
    for (let attempt = 0; attempt < 2 && !ok; attempt++) {
      try {
        const before = await addItem(page, item);
        ok = await isItemAddedCorrectly(page, item, before);
      } catch (error) {
        if (attempt === 1) throw error;
        await clearAddRow(page);
      }
      if (!ok) {
        await clearAddRow(page);
        test.info().annotations.push({ type: 'retry', description: `${item.article} (${item.mode})` });
      }
    }
    expect(ok, `Line for ${item.article} (${item.mode}) was not added correctly`).toBe(true);
  }

  const quantity = page.locator('[id="add-QuantityToRetrieve|input"]');
  await quantity.click();
  await quantity.press('Enter');
}

async function closeBanners(page) {
  await closeWarning(page);
  const banners = page.locator('.oj-messagebanner');
  for (let i = 0; i < 10 && (await banners.count()) > 0; i++) {
    const summary = (await banners.first().locator('.oj-messagebanner-summary').innerText().catch(() => '')) || 'banner';
    test.info().annotations.push({ type: 'banner', description: summary.trim() });
    const close = banners.first().locator('.oj-messagebanner-close-button, button[aria-label*="lose" i], button[title*="lose" i], oj-button button').first();
    if (!(await close.isVisible().catch(() => false))) break;
    await close.click();
    await page.waitForTimeout(300);
  }
}


export async function saveOrder(page) {
  const saveButton = page.getByRole('button', { name: 'Spremi' });
  await expect(saveButton).toBeEnabled({ timeout: 30000 });
  await closeBanners(page);
  await saveButton.click();
}

export async function expectOrderSaved(page) {
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 30000 });
  await expect.poll(() => fieldText(page, 'Broj naloga'), { timeout: 30000 }).toMatch(/\S/);
  const orderNumber = (await fieldText(page, 'Broj naloga')).trim();
  test.info().annotations.push({ type: 'order number', description: orderNumber });
}

export async function reserveOrder(page) {
  await closeBanners(page);
  await page.getByRole('button', { name: 'Rezerviraj nalog' }).click();
  await page.getByRole('menuitem', { name: 'Rezerviraj nalog' }).click();
  await page.getByRole('dialog', { name: 'Primjena promjena' }).getByRole('button', { name: 'Da', exact: true }).click({ timeout: 15000 });
  const alert = page.getByRole('alert').filter({ hasText: 'Rezervacije su uspješno kreirane' });
  await expect(alert).toBeVisible({ timeout: 60000 });
  const text = (await alert.innerText()).replace(/\s+/g, ' ').trim();
  test.info().annotations.push({ type: 'reservation', description: text });
}

export async function payOrder(page) {
  await closeBanners(page);

  const amount = page.getByText(/Iznos za naplatu:\s*[\d.,]+\s*EUR/).first();
  await expect(amount).toBeVisible({ timeout: 30000 });
  await waitForLoader(page, 1000);
  const amountText = (await amount.innerText()).replace(/\s+/g, ' ');
  const isZero = Number((amountText.match(/([\d.,]+)\s*EUR/)?.[1] ?? '0').replace(/\./g, '').replace(',', '.')) === 0;
  test.info().annotations.push({ type: 'payment', description: isZero ? 'advance, amount 0,00' : 'cash' });

  let alert;
  if (isZero) {
    await page.getByRole('button', { name: 'Naplata predujma' }).click();
    await page.getByRole('button', { name: 'Nije potreban ispis' }).click();
    await page.getByText('Maksimalni predujam').click({ timeout: 15000 });
    await page.locator('button.oj-button-button:has(.oj-ux-ico-currency-money):visible').first().click({ timeout: 15000 });
    await page.getByRole('button', { name: 'Potvrdi' }).click();
    alert = page.getByRole('alert').first();
  } else {
    await page.getByRole('button', { name: 'Gotovina' }).click();
    const cashInput = page.getByRole('textbox', { name: 'Unesi iznos' }).or(page.getByPlaceholder('Unesi iznos')).first();
    await expect(cashInput).toBeVisible({ timeout: 15000 });
    if (!(await cashInput.inputValue()).trim()) {
      const total = Number((amountText.match(/([\d.,]+)\s*EUR/)?.[1] ?? '0').replace(/\./g, '').replace(',', '.'));
      await cashInput.fill((total + 50).toFixed(2).replace('.', ','));
      await cashInput.press('Tab');
    }
    await page.getByRole('button', { name: 'Potvrdi' }).click();
    alert = page.getByRole('alert').filter({ hasText: 'Uspješno kreiran račun' });
  }
  await expect(alert).toBeVisible({ timeout: 60000 });
  const text = (await alert.innerText()).replace(/\s+/g, ' ').trim();
  test.info().annotations.push({ type: 'invoice', description: text });
  const orderNumber = await expect
    .poll(() => fieldText(page, 'Broj naloga').then((value) => String(value).trim()), { timeout: 10000 })
    .toMatch(/\S/)
    .then(() => fieldText(page, 'Broj naloga'))
    .catch(() => '');
  if (String(orderNumber).trim()) test.info().annotations.push({ type: 'order number', description: String(orderNumber).trim() });
}
