import { expect, type Page } from '@playwright/test';

export const TOOL_PATH = '/tools/slot-balance/index.html';
export const TOOL_TITLE = 'スロット出玉分析｜機械割・実績出玉率・区間差枚を無料計算';

export interface PageMonitor {
  consoleMessages: string[];
  pageErrors: string[];
  externalRequests: string[];
  dynamicRequests: string[];
}

export function monitorPage(page: Page): PageMonitor {
  const monitor: PageMonitor = {
    consoleMessages: [],
    pageErrors: [],
    externalRequests: [],
    dynamicRequests: [],
  };
  page.on('console', (message) => {
    monitor.consoleMessages.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => monitor.pageErrors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') monitor.externalRequests.push(request.url());
    if (['fetch', 'xhr', 'eventsource', 'websocket'].includes(request.resourceType())) {
      monitor.dynamicRequests.push(`${request.resourceType()}: ${request.url()}`);
    }
  });
  return monitor;
}

export async function gotoTool(page: Page): Promise<void> {
  const response = await page.goto(TOOL_PATH);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(TOOL_TITLE);
}

export async function calculateQuick(
  page: Page,
  games = '４,０００Ｇ',
  netMedals = '＋５００枚',
): Promise<void> {
  await page.locator('#quick-games').fill(games);
  await page.locator('#quick-net').fill(netMedals);
  await page.locator('#quick-form button[type="submit"]').click();
}

export async function openPanel(
  page: Page,
  panel: 'target' | 'segments' | 'investment' | 'inout' | 'coin',
): Promise<void> {
  await page.locator(`[data-launcher="${panel}"]`).click();
  await expect(page.locator(`#${panel}-panel`)).toBeVisible();
}

export async function selectSegmentMethod(
  page: Page,
  method: 'direct' | 'cumulative',
): Promise<void> {
  await page.locator(`[name="segment.method"][value="${method}"]`).check();
  await expect(page.locator('#segments-form')).toBeVisible();
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

export async function settleForScreenshot(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    (document.activeElement as HTMLElement | null)?.blur();
    const skipLink = document.querySelector<HTMLElement>('.skip-link');
    if (skipLink) skipLink.hidden = true;
    window.scrollTo(0, 0);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}
