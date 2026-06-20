import { test, expect } from '@playwright/test';

const email = process.env['AOTTG2_TEST_EMAIL'] ?? '';
const password = process.env['AOTTG2_TEST_PASSWORD'] ?? '';
const displayName = process.env['AOTTG2_TEST_DISPLAY_NAME'] ?? 'Pi Tester';

const mockAuthResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  photonToken: 'mock-photon-token',
  profile: {
    accountId: 'mock-account-id',
    email: 'oauth@example.test',
    displayName: 'OAuth Tester',
    photonUserId: 'acct_mock',
    emailVerified: true,
    roles: ['player'],
    patreon: {
      linked: false,
      patronStatus: null,
      tierIds: [],
      entitledAmountCents: null,
      lastSyncedAt: null,
    },
  },
};

test('website login reaches account page and logout returns to login', async ({ page }, testInfo) => {
  test.skip(!email || !password, 'AOTTG2_TEST_EMAIL and AOTTG2_TEST_PASSWORD are required');

  await page.goto('http://localhost:5173/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Discord' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/accounts$/);
  await expect(page.getByRole('heading', { name: new RegExp(`Welcome, ${displayName}`) })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Change display name' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Patreon' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Delete account' })).toBeVisible();
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

test('auth portal replacement routes render', async ({ page }) => {
  await page.goto('http://localhost:5173/register');
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Discord' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();

  await page.goto('http://localhost:5173/verify');
  await expect(page.getByRole('heading', { name: 'Invalid link' })).toBeVisible();

  await page.goto('http://localhost:5173/resend-verification');
  await expect(page.getByRole('heading', { name: 'Resend verification' })).toBeVisible();

  await page.goto('http://localhost:5173/forgot-password');
  await expect(page.getByRole('heading', { name: 'Forgot password' })).toBeVisible();

  await page.goto('http://localhost:5173/reset-password');
  await expect(page.getByRole('heading', { name: 'Invalid link' })).toBeVisible();

  await page.goto('http://localhost:5173/oauth-callback');
  await expect(page.getByRole('heading', { name: 'Sign-in failed' })).toBeVisible();
});

test('oauth callback exchanges session code and opens account page', async ({ page }) => {
  await page.route('**/v1/auth/oauth/session?code=mock-code', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockAuthResponse),
    });
  });

  await page.goto('http://localhost:5173/oauth-callback?code=mock-code');
  await expect(page).toHaveURL(/\/accounts$/);
  await expect(page.getByRole('heading', { name: 'Welcome, OAuth Tester' })).toBeVisible();
  await expect(page.getByText('oauth@example.test')).toBeVisible();
});
