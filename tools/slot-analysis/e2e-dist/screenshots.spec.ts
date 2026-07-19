import { test, type Page } from '@playwright/test';

import { gotoDistTool } from './release-helpers';

const artifactRoot = 'artifacts/phase2b0';

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    images.forEach((image) => {
      image.loading = 'eager';
    });
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise<void>((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
    await Promise.race([
      Promise.all(images.map((image) => image.decode().catch(() => undefined))),
      new Promise<void>((resolve) => setTimeout(resolve, 5_000)),
    ]);
    (document.activeElement as HTMLElement | null)?.blur();
    document.querySelectorAll<HTMLElement>('.reveal').forEach((element) => {
      element.classList.add('is-visible');
    });
  });
}

async function prepareNet(page: Page): Promise<void> {
  await gotoDistTool(page);
  await page.locator('#quick-games').fill('４,０００Ｇ');
  await page.locator('#quick-net').fill('＋５００枚');
  await page.locator('#quick-form button[type="submit"]').click();
}

async function prepareInvestment(page: Page): Promise<void> {
  await prepareNet(page);
  await page.locator('[data-launcher="investment"]').click();
  await page.locator('#investment-cash').fill('20,000');
  await page.locator('#investment-current').fill('1,200');
  await page.locator('#investment-exchange').fill('50');
  await page.locator('#investment-form button[type="submit"]').click();
}

async function prepareSegments(page: Page): Promise<void> {
  await prepareNet(page);
  await page.locator('[data-launcher="segments"]').click();
  await page.locator('[name="segment.method"][value="direct"]').check();
  await page.locator('[name="segments.direct.0.games"]').fill('1000');
  await page.locator('[name="segments.direct.0.netMedals"]').fill('+200');
  await page.locator('[name="segments.direct.1.games"]').fill('2000');
  await page.locator('[name="segments.direct.1.netMedals"]').fill('-400');
  await page.locator('#segments-form button[type="submit"]').click();
}

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 1000 },
]) {
  test(`captures site home ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/index.html');
    await settle(page);
    await page.screenshot({
      path: `${artifactRoot}/site-home-${viewport.name}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  });

  for (const scenario of [
    { name: 'net', prepare: prepareNet },
    { name: 'investment', prepare: prepareInvestment },
    { name: 'segments', prepare: prepareSegments },
  ]) {
    test(`captures slot analysis ${viewport.name} ${scenario.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await scenario.prepare(page);
      await settle(page);
      await page.screenshot({
        path: `${artifactRoot}/slot-analysis-${viewport.name}-${scenario.name}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    });
  }

  test(`captures formulas and FAQ ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await gotoDistTool(page);
    await page
      .locator('#faq details')
      .first()
      .evaluate((details: HTMLDetailsElement) => {
        details.open = true;
      });
    await settle(page);
    await page.locator('#formulas').scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `${artifactRoot}/slot-analysis-formulas-faq-${viewport.name}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  });
}
