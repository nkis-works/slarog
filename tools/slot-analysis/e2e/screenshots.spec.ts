import { test, type Locator, type Page } from '@playwright/test';

import {
  calculateQuick,
  gotoTool,
  openPanel,
  selectSegmentMethod,
  settleForScreenshot,
} from './helpers';

const root = 'artifacts/slot-analysis-v2-ui-final';
const mobile = { width: 390, height: 844 };
const desktop = { width: 1440, height: 1000 };

async function shotPage(page: Page, name: string, fullPage = false): Promise<void> {
  await settleForScreenshot(page);
  await page.screenshot({ path: `${root}/${name}`, fullPage, animations: 'disabled' });
}

async function shotLocator(page: Page, locator: Locator, name: string): Promise<void> {
  await settleForScreenshot(page);
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: `${root}/${name}`, animations: 'disabled' });
}

async function quick(page: Page, viewport = mobile): Promise<void> {
  await page.setViewportSize(viewport);
  await gotoTool(page);
  await calculateQuick(page, '4000', '+500');
}

test('initial mobile', async ({ page }) => {
  await page.setViewportSize(mobile);
  await gotoTool(page);
  await shotPage(page, 'initial-mobile.png');
});

test('quick result mobile', async ({ page }) => {
  await quick(page);
  await shotLocator(page, page.locator('#quick-result'), 'quick-result-mobile.png');
});

test('quick result desktop', async ({ page }) => {
  await quick(page, desktop);
  await shotLocator(page, page.locator('#quick-result'), 'quick-result-desktop.png');
});

test('details collapsed mobile', async ({ page }) => {
  await quick(page);
  await shotLocator(page, page.locator('.launchers'), 'details-collapsed-mobile.png');
});

test('details other open mobile', async ({ page }) => {
  await quick(page);
  await page.locator('.other-launchers summary').click();
  await shotLocator(page, page.locator('.launchers'), 'details-other-open-mobile.png');
});

test('target mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'target');
  await page.locator('#target-games').fill('5000');
  await page.locator('#target-rate').fill('100');
  await page.locator('#target-form button[type="submit"]').click();
  await shotLocator(page, page.locator('#target-panel'), 'target-mobile.png');
});

test('segment empty mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'segments');
  await selectSegmentMethod(page, 'direct');
  await shotLocator(page, page.locator('#segments-panel'), 'segment-empty-mobile.png');
});

test('segment transfer mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'segments');
  await selectSegmentMethod(page, 'direct');
  await page.locator('#transfer-to-direct').click();
  await shotLocator(page, page.locator('#segments-panel'), 'segment-transfer-mobile.png');
});

test('segment result mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'segments');
  await selectSegmentMethod(page, 'direct');
  await page.locator('[name="segments.direct.0.games"]').fill('1000');
  await page.locator('[name="segments.direct.0.netMedals"]').fill('+200');
  await page.locator('[name="segments.direct.1.games"]').fill('2000');
  await page.locator('[name="segments.direct.1.netMedals"]').fill('-400');
  await page.locator('#segments-form button[type="submit"]').click();
  await shotLocator(page, page.locator('#segments-panel'), 'segment-result-mobile.png');
});

test('investment basic mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'investment');
  await page.locator('#investment-cash').fill('20000');
  await page.locator('#investment-current').fill('1200');
  await page.locator('#investment-exchange').fill('50');
  await page.locator('#investment-form button[type="submit"]').click();
  await shotLocator(page, page.locator('#investment-panel'), 'investment-basic-mobile.png');
});

test('investment error mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'investment');
  await page.locator('#investment-form button[type="submit"]').click();
  await shotLocator(page, page.locator('#investment-panel'), 'investment-error-mobile.png');
});

test('coin error mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'coin');
  await page.locator('#coin-form button[type="submit"]').click();
  await shotLocator(page, page.locator('#coin-panel'), 'coin-error-mobile.png');
});

test('full page mobile', async ({ page }) => {
  await quick(page);
  await page.locator('[data-quick-benchmark="103"]').click();
  await shotPage(page, 'full-page-mobile.png', true);
});

test('full page desktop', async ({ page }) => {
  await quick(page, desktop);
  await page.locator('[data-quick-benchmark="103"]').click();
  await shotPage(page, 'full-page-desktop.png', true);
});
