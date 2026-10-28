import { test } from '@playwright/test';
import { generateCustomer, generateContact, generateAddress, generateForeignVat } from '../data/customerGenerator.js';
import { openNewCustomerForm, expectCustomerCreated, expectContactAvailable } from './helpers/customer-form.js';

test.describe('natural person customer', () => {
  test('1 - name, surname and email only', async ({ page }) => {
    const customer = generateCustomer();

    const form = await openNewCustomerForm(page);
    await form.fillName(customer);
    await form.fillContact({ email: customer.email });
    await form.submit();

    await expectCustomerCreated(page, { fullName: customer.fullName });
  });

  test('2 - all data filled', async ({ page }) => {
    const customer = generateCustomer();

    const form = await openNewCustomerForm(page);
    await form.fillName(customer);
    await form.fillOib(customer.oib);
    await form.fillIban(customer.iban);
    await form.fillAddress(customer.address);
    await form.fillContact(customer);
    await form.submit();

    await expectCustomerCreated(page, {
      fullName: customer.fullName,
      billing: customer.address,
      shipping: customer.address,
    });
  });

  test('3 - different billing and shipping addresses', async ({ page }) => {
    const customer = generateCustomer();
    const shippingAddress = generateAddress();

    const form = await openNewCustomerForm(page);
    await form.fillName(customer);
    await form.fillOib(customer.oib);
    await form.fillIban(customer.iban);
    await form.splitAddresses();
    await form.fillAddress(customer.address, 0);
    await form.fillContact(customer, 0);
    await form.fillAddress(shippingAddress, 1);
    await form.submit();

    await expectCustomerCreated(page, {
      fullName: customer.fullName,
      billing: customer.address,
      shipping: shippingAddress,
    });
  });

  test('4 - different addresses and different contacts', async ({ page }) => {
    const customer = generateCustomer();
    const shippingAddress = generateAddress();
    const shippingContact = generateContact(shippingAddress.areaCode);

    const form = await openNewCustomerForm(page);
    await form.fillName(customer);
    await form.fillOib(customer.oib);
    await form.fillIban(customer.iban);
    await form.splitAddresses();
    await form.fillAddress(customer.address, 0);
    await form.fillContact(customer, 0);
    await form.fillAddress(shippingAddress, 1);
    await form.splitContacts();
    await form.fillShippingContact(shippingContact);
    await form.submit();

    await expectCustomerCreated(page, {
      fullName: customer.fullName,
      billing: customer.address,
      shipping: shippingAddress,
    });
    await expectContactAvailable(page, shippingContact.fullName);
  });

  test('5 - VAT number (HR)', async ({ page }) => {
    const customer = generateCustomer();

    const form = await openNewCustomerForm(page);
    await form.fillName(customer);
    await form.useVatNumber();
    await form.fillVatNumber(customer.vatNumber);
    await form.fillIban(customer.iban);
    await form.fillAddress(customer.address);
    await form.fillContact(customer);
    await form.submit();

    await expectCustomerCreated(page, {
      fullName: customer.fullName,
      billing: customer.address,
      shipping: customer.address,
    });
  });

  test('6 - VAT number, country other than HR', async ({ page }) => {
    const customer = generateCustomer();
    const foreign = generateForeignVat('SI');

    const form = await openNewCustomerForm(page);
    await form.fillName(customer);
    await form.useVatNumber();
    await form.fillVatNumber(foreign.vatNumber);
    await form.fillAddress(foreign.address);
    await form.fillContact({ email: customer.email });
    await form.submit();

    await expectCustomerCreated(page, {
      fullName: customer.fullName,
      billing: foreign.address,
      shipping: foreign.address,
    });
  });
});
