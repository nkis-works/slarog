import { test } from '@playwright/test';

import { calculateNet, fillInvestmentBase, gotoTool, selectMainMode } from './helpers';

async function prepareNet(page: Parameters<typeof gotoTool>[0]): Promise<void> {
  await gotoTool(page);
  await calculateNet(page);
}

async function prepareInvestment(page: Parameters<typeof gotoTool>[0]): Promise<void> {
  await gotoTool(page);
  await selectMainMode(page, 'investment');
  await fillInvestmentBase(page, { cash: '20,000', current: '1,200', exchange: '50', unit: '500' });
  await page.locator('[data-calculate="investment"]').click();
}

async function prepareSegments(page: Parameters<typeof gotoTool>[0]): Promise<void> {
  await gotoTool(page);
  await selectMainMode(page, 'segments-inout');
  await page.locator('[name="segments.0.games"]').fill('1000');
  await page.locator('[name="segments.0.netMedals"]').fill('+200');
  await page.locator('#add-net-segment').click();
  await page.locator('[name="segments.1.games"]').fill('2000');
  await page.locator('[name="segments.1.netMedals"]').fill('-400');
  await page.locator('[data-calculate="segments"]').click();
}

for (const scenario of [
  { name: 'net-medals', prepare: prepareNet },
  { name: 'investment', prepare: prepareInvestment },
  { name: 'segments', prepare: prepareSegments },
]) {
  test(`captures mobile ${scenario.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await scenario.prepare(page);
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
      const skipLink = document.querySelector<HTMLElement>('.skip-link');
      if (skipLink) skipLink.hidden = true;
    });
    await page.screenshot({
      path: `artifacts/phase2a/slot-balance-mobile-${scenario.name}.png`,
      fullPage: true,
    });
  });

  test(`captures desktop ${scenario.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await scenario.prepare(page);
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
      const skipLink = document.querySelector<HTMLElement>('.skip-link');
      if (skipLink) skipLink.hidden = true;
    });
    await page.screenshot({
      path: `artifacts/phase2a/slot-balance-desktop-${scenario.name}.png`,
      fullPage: true,
    });
  });
}
