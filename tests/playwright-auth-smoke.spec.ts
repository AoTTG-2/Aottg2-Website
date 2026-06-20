import { test, expect } from '@playwright/test';

const email = process.env['AOTTG2_TEST_EMAIL'] ?? '';
const password = process.env['AOTTG2_TEST_PASSWORD'] ?? '';
const displayName = process.env['AOTTG2_TEST_DISPLAY_NAME'] ?? 'Pi Tester';

test('website login reaches account page and logout returns to login', async ({ page }, testInfo) => {
  test.skip(!email || !password, 'AOTTG2_TEST_EMAIL and AOTTG2_TEST_PASSWORD are required');

  await page.goto('http://localhost:5173/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/accounts$/);
  await expect(page.getByRole('heading', { name: new RegExp(`Welcome, ${displayName}`) })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('account-page.png'), fullPage: true });

  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('button', { name: 'ACCOUNT' })).toBeVisible();

  await page.goto('http://localhost:5173/accounts');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('after-logout-login-page.png'), fullPage: true });
});
