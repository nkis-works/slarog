import { expect, type Page } from '@playwright/test';

export const TOOL_PATH = '/tools/slot-balance/index.html';

export interface PageMonitor {
  consoleErrors: string[];
  externalRequests: string[];
}

export function monitorPage(page: Page): PageMonitor {
  const monitor: PageMonitor = { consoleErrors: [], externalRequests: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') monitor.consoleErrors.push(message.text());
  });
  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith('http://127.0.0.1:4173/')) monitor.externalRequests.push(url);
  });
  return monitor;
}

export async function gotoTool(page: Page): Promise<void> {
  await page.goto(TOOL_PATH);
  await expect(page).toHaveTitle('スロバランス｜差枚・出玉率・投資回収の無料計算ツール');
}

export async function selectMainMode(
  page: Page,
  mode: 'net' | 'investment' | 'segments-inout',
): Promise<void> {
  await page.locator(`[data-main-mode="${mode}"]`).click();
}

export async function selectSubmode(
  page: Page,
  mode: 'segments' | 'inout' | 'coin',
): Promise<void> {
  await page.locator(`[data-segments-submode="${mode}"]`).click();
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

export async function calculateNet(
  page: Page,
  games = '４,０００Ｇ',
  netMedals = '＋５００枚',
): Promise<void> {
  await page.locator('[name="net.games"]').fill(games);
  await page.locator('[name="net.netMedals"]').fill(netMedals);
  await page.locator('[data-calculate="net"]').click();
}

export async function fillInvestmentBase(
  page: Page,
  options: { cash: string; current: string; exchange?: string; unit?: string },
): Promise<void> {
  await page.locator('[name="investment.cash"]').fill(options.cash);
  await page.locator('[name="investment.currentMedals"]').fill(options.current);
  if (options.exchange !== undefined) {
    await page.locator('[name="investment.exchangeRate"]').fill(options.exchange);
  }
  if (options.unit !== undefined) {
    await page.locator('[name="investment.exchangeUnit"]').fill(options.unit);
  }
}
