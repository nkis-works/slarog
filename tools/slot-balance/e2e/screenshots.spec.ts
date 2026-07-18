import { test, type Locator, type Page } from '@playwright/test';

import {
  calculateQuick,
  gotoTool,
  openPanel,
  selectSegmentMethod,
  settleForScreenshot,
} from './helpers';

const root = 'artifacts/slot-analysis-v2-ui';
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

async function quick(page: Page, viewport = mobile, games = '4000', net = '+500'): Promise<void> {
  await page.setViewportSize(viewport);
  await gotoTool(page);
  await calculateQuick(page, games, net);
}

async function directResult(page: Page): Promise<void> {
  await openPanel(page, 'segments');
  await selectSegmentMethod(page, 'direct');
  await page.locator('[name="segments.direct.0.label"]').fill('前半');
  await page.locator('[name="segments.direct.0.games"]').fill('1000');
  await page.locator('[name="segments.direct.0.netMedals"]').fill('+200');
  await page.locator('[name="segments.direct.1.label"]').fill('後半');
  await page.locator('[name="segments.direct.1.games"]').fill('2000');
  await page.locator('[name="segments.direct.1.netMedals"]').fill('-400');
  await page.locator('#segments-form button[type="submit"]').click();
  await page.locator('[name="segment.benchmark"][value="103"]').check();
}

async function cumulativeResult(page: Page): Promise<void> {
  await openPanel(page, 'segments');
  await selectSegmentMethod(page, 'cumulative');
  await page.locator('[name="segments.points.1.games"]').fill('1000');
  await page.locator('[name="segments.points.1.netMedals"]').fill('200');
  await page.locator('[name="segments.points.2.games"]').fill('3000');
  await page.locator('[name="segments.points.2.netMedals"]').fill('-200');
  await page.locator('#segments-form button[type="submit"]').click();
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

test('benchmark selected mobile', async ({ page }) => {
  await quick(page);
  await page.locator('[data-quick-benchmark="103"]').click();
  await shotLocator(page, page.locator('#quick-result'), 'benchmark-selected-mobile.png');
});

test('target must gain mobile', async ({ page }) => {
  await quick(page, mobile, '4000', '-300');
  await openPanel(page, 'target');
  await page.locator('#target-games').fill('5000');
  await page.locator('#target-rate').fill('100');
  await page.locator('#target-form button[type="submit"]').click();
  await shotLocator(page, page.locator('#target-panel'), 'target-must-gain-mobile.png');
});

test('target can lose mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'target');
  await page.locator('[data-target-games="1000"]').click();
  await page.locator('[data-target-rate="100"]').click();
  await page.locator('#target-form button[type="submit"]').click();
  await shotLocator(page, page.locator('#target-panel'), 'target-can-lose-mobile.png');
});

test('segment method mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'segments');
  await shotLocator(page, page.locator('#segments-panel'), 'segment-method-mobile.png');
});

test('segment direct input mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'segments');
  await selectSegmentMethod(page, 'direct');
  await page.locator('[name="segments.direct.1.games"]').fill('2000');
  await page.locator('[name="segments.direct.1.netMedals"]').fill('-400');
  await shotLocator(page, page.locator('#segments-panel'), 'segment-direct-input-mobile.png');
});

test('segment result mobile', async ({ page }) => {
  await quick(page);
  await directResult(page);
  await shotLocator(page, page.locator('#segments-panel'), 'segment-result-mobile.png');
});

test('segment result desktop', async ({ page }) => {
  await quick(page, desktop);
  await directResult(page);
  await shotLocator(page, page.locator('#segments-panel'), 'segment-result-desktop.png');
});

test('cumulative input mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'segments');
  await selectSegmentMethod(page, 'cumulative');
  await page.locator('[name="segments.points.2.games"]').fill('6000');
  await page.locator('[name="segments.points.2.netMedals"]').fill('200');
  await shotLocator(page, page.locator('#segments-panel'), 'cumulative-input-mobile.png');
});

test('cumulative result mobile', async ({ page }) => {
  await quick(page);
  await cumulativeResult(page);
  await shotLocator(page, page.locator('#segments-panel'), 'cumulative-result-mobile.png');
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

test('investment detail mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'investment');
  await page.locator('#investment-cash').fill('20000');
  await page.locator('#investment-current').fill('1200');
  await page.locator('#investment-exchange').fill('50');
  await page.locator('.advanced-inputs').click();
  await page.locator('#investment-unit').fill('500');
  await page.locator('#investment-stored').fill('500');
  await page.locator('#investment-lend').fill('46');
  await page.locator('#investment-form button[type="submit"]').click();
  await page.locator('#investment-result details').click();
  await shotLocator(page, page.locator('#investment-panel'), 'investment-detail-mobile.png');
});

test('inout mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'inout');
  await page.locator('#actual-in').fill('12000');
  await page.locator('#actual-out').fill('12500');
  await page.locator('#inout-form button[type="submit"]').click();
  await shotLocator(page, page.locator('#inout-panel'), 'inout-mobile.png');
});

test('coin hold mobile', async ({ page }) => {
  await quick(page);
  await openPanel(page, 'coin');
  await page.locator('#coin-games').fill('680');
  await page.locator('#coin-medals').fill('1000');
  await page.locator('[name="coin.atBonus"]').check();
  await page.locator('[name="coin.scope"]').check();
  await page.locator('#coin-form button[type="submit"]').click();
  await shotLocator(page, page.locator('#coin-panel'), 'coin-hold-mobile.png');
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
