import { test, expect } from '@playwright/test';

test('landing navbar is visible before and after scrolling and content is offset', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  const nav = page.getByRole('button', { name: 'PLAY', exact: true });
  await expect(nav).toBeVisible();

  const navBox = await nav.boundingBox();
  if (!navBox) throw new Error('Navbar PLAY button has no bounding box');
  expect(navBox.y).toBeGreaterThanOrEqual(0);
  expect(navBox.y).toBeLessThan(96);

  const layoutPaddingTop = await page.locator('.pt-16.md\\:pt-24').evaluate((layout) => getComputedStyle(layout).paddingTop);
  expect(['64px', '96px']).toContain(layoutPaddingTop);

  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(250);
  await expect(nav).toBeVisible();
  const scrolledBox = await nav.boundingBox();
  if (!scrolledBox) throw new Error('Navbar PLAY button hidden after scroll');
  expect(scrolledBox.y).toBeGreaterThanOrEqual(0);
  expect(scrolledBox.y).toBeLessThan(96);
});
