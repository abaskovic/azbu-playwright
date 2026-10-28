import { expect } from '@playwright/test';
import { addressLabel } from '../../data/customerGenerator.js';

export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class CustomerForm {
  constructor(page, dialog) {
    this.page = page;
    this.dialog = dialog;
  }

  textbox(name, index = 0) {
    return this.dialog.getByRole('textbox', { name, exact: true }).nth(index);
  }

  async fillField(name, value, index = 0) {
    const field = this.textbox(name, index);
    await field.fill(value);
    await field.blur();
    await this.page.waitForTimeout(1000);
  }

  switchBefore(label) {
    return this.dialog
      .getByText(label, { exact: true })
      .first()
      .locator('xpath=preceding::oj-switch[1]')
      .getByRole('switch');
  }

  switchAfter(label) {
    return this.dialog
      .getByText(label, { exact: true })
      .first()
      .locator('xpath=following::oj-switch[1]')
      .getByRole('switch');
  }

  async selectNaturalPerson() {
    const personSwitch = this.switchBefore('Fizička osoba');
    const firstName = this.textbox('Ime');
    await personSwitch.waitFor({ timeout: 15000 });
    if (await firstName.isVisible()) return;
    await personSwitch.click();
    await expect(firstName).toBeVisible({ timeout: 10000 });
  }

  async fillName({ firstName, lastName }) {
    await this.fillField('Ime', firstName);
    await this.fillField('Prezime', lastName);
  }

  async fillOib(oib) {
    await this.fillField('OIB', oib);
  }

  async fillIban(iban) {
    await this.fillField('IBAN', iban);
  }

  async useVatNumber() {
    await this.switchBefore('PDV broj').click();
    await expect(this.textbox('PDV broj')).toBeVisible();
  }

  async fillVatNumber(vatNumber) {
    await this.fillField('PDV broj', vatNumber);
  }

  async fillAddress(address, index = 0) {
    await this.fillField('Adresa', address.street, index);
    await this.fillField('Poštanski broj', address.postalCode, index);
    await this.fillField('Grad', address.city, index);
    if (address.countryCode !== 'HR') {
      await this.selectCountry(address.country, index);
    }
  }

  async selectCountry(country, index = 0) {
    await this.dialog.getByRole('combobox', { name: 'Država' }).nth(index).click();
    await this.page.getByRole('option', { name: country, exact: true }).click();
  }

  async fillContact({ email, mobile, landline }, index = 0) {
    if (email) await this.fillField('Mail', email, index);
    if (mobile) await this.fillField('Broj mobitela', mobile, index);
    if (landline) await this.fillField('Broj telefona', landline, index);
  }

  async splitAddresses() {
    await this.switchAfter('Adresa fakturiranja i adresa otpreme su iste').uncheck();
  }

  async splitContacts() {
    await this.switchAfter('Kontakt je isti').uncheck();
  }

  async fillShippingContact(contact) {
    await this.fillField('Ime', contact.firstName, 1);
    await this.fillField('Prezime', contact.lastName, 1);
    await this.fillContact(contact, 1);
  }
  async submit() {
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('button', { name: 'Kreiraj novog kupca' }).click();
  }
}

export async function openNewCustomerForm(page) {
  await page.goto(process.env.AZBU_URL);
  await page.getByText('Kreiraj nalog prodaje').click();

  const loader = page.getByText('Učitavanje naloga prodaje');
  await loader.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
  await expect(loader).toBeHidden({ timeout: 60000 });

  const customerField = page.getByRole('combobox', { name: 'Odaberi kupca' });
  await expect(customerField).toBeVisible({ timeout: 30000 });

  await customerField
    .locator('xpath=ancestor::*[.//button][1]')
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .last()
    .click();

  const form = new CustomerForm(page, page.getByRole('dialog'));
  await form.selectNaturalPerson();
  return form;
}

function fieldText(page, label) {
  return page.getByLabel(label).first().evaluate((el) => el.value ?? el.innerText);
}

export async function expectCustomerCreated(page, { fullName, billing, shipping, contactName }) {
  await Promise.all([
    expect(page.getByRole('alert')).toContainText(/kreiran/i, { timeout: 30000 }),
    expect(page.getByRole('dialog')).toBeHidden({ timeout: 30000 }),
  ]);

  const field = (label) => page.getByLabel(label).first();
  await expect(field('Odaberi kupca')).toBeVisible({ timeout: 30000 });
  if (billing) await expect(field('Odaberi adresu fakturiranja')).toBeVisible({ timeout: 30000 });
  if (shipping) await expect(field('Odaberi adresu otpremanja')).toBeVisible({ timeout: 30000 });
  await expect(field('Kontakt')).toBeVisible({ timeout: 30000 });

  const poll = { timeout: 15000 };
  await expect.poll(() => fieldText(page, 'Odaberi kupca'), poll).toContain(fullName);
  if (billing) {
    await expect.poll(() => fieldText(page, 'Odaberi adresu fakturiranja'), poll).toContain(addressLabel(billing));
  }
  if (shipping) {
    await expect.poll(() => fieldText(page, 'Odaberi adresu otpremanja'), poll).toContain(addressLabel(shipping));
  }
  await expect.poll(() => fieldText(page, 'Kontakt'), poll).toContain(contactName ?? fullName);
}

export async function expectContactAvailable(page, fullName) {
  await page.getByRole('combobox', { name: 'Kontakt' }).click();
  await expect(page.getByRole('option', { name: new RegExp(escapeRegExp(fullName)) })).toBeVisible();
}
