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
  await page.locator('[name="net.games"]').fill('４,０００Ｇ');
  await page.locator('[name="net.netMedals"]').fill('＋５００枚');
  await page.locator('[data-calculate="net"]').click();
}

async function prepareInvestment(page: Page): Promise<void> {
  await gotoDistTool(page);
  await page.locator('[data-main-mode="investment"]').click();
  await page.locator('[name="investment.cash"]').fill('20,000');
  await page.locator('[name="investment.currentMedals"]').fill('1,200');
  await page.locator('[name="investment.exchangeRate"]').fill('50');
  await page.locator('[name="investment.exchangeUnit"]').fill('500');
  await page.locator('[data-calculate="investment"]').click();
}

async function prepareSegments(page: Page): Promise<void> {
  await gotoDistTool(page);
  await page.locator('[data-main-mode="segments-inout"]').click();
  await page.locator('[name="segments.0.games"]').fill('1000');
  await page.locator('[name="segments.0.netMedals"]').fill('+200');
  await page.locator('#add-net-segment').click();
  await page.locator('[name="segments.1.games"]').fill('2000');
  await page.locator('[name="segments.1.netMedals"]').fill('-400');
  await page.locator('[data-calculate="segments"]').click();
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

  test(`captures site free tool ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/products/slarog/');
    await settle(page);
    const section = page.locator('#free-tool');
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({
      path: `${artifactRoot}/site-free-tool-${viewport.name}.png`,
      animations: 'disabled',
    });
  });

  test(`captures Playlist Toolkit ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/products/playlist-toolkit/ja/');
    await settle(page);
    await page.screenshot({
      path: `${artifactRoot}/playlist-toolkit-${viewport.name}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  });

  for (const scenario of [
    { name: 'net', prepare: prepareNet },
    { name: 'investment', prepare: prepareInvestment },
    { name: 'segments', prepare: prepareSegments },
  ]) {
    test(`captures slot balance ${viewport.name} ${scenario.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await scenario.prepare(page);
      await settle(page);
      await page.screenshot({
        path: `${artifactRoot}/slot-balance-${viewport.name}-${scenario.name}.png`,
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
      path: `${artifactRoot}/slot-balance-formulas-faq-${viewport.name}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  });
}
