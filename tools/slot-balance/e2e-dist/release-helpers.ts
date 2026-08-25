import { expect, type Page } from '@playwright/test';

export const DIST_ORIGIN = 'http://127.0.0.1:4174';
export const DIST_TOOL_PATH = '/tools/slot-balance/';

export interface ReleaseMonitor {
  consoleMessages: string[];
  pageErrors: string[];
  externalRequests: string[];
  dynamicRequests: string[];
}

export function monitorReleasePage(page: Page): ReleaseMonitor {
  const monitor: ReleaseMonitor = {
    consoleMessages: [],
    pageErrors: [],
    externalRequests: [],
    dynamicRequests: [],
  };
  page.on('console', (message) =>
    monitor.consoleMessages.push(`${message.type()}: ${message.text()}`),
  );
  page.on('pageerror', (error) => monitor.pageErrors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== DIST_ORIGIN) monitor.externalRequests.push(request.url());
    if (['fetch', 'xhr', 'eventsource', 'websocket'].includes(request.resourceType())) {
      monitor.dynamicRequests.push(`${request.resourceType()}: ${request.url()}`);
    }
  });
  return monitor;
}

export async function installTransportProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const calls: string[] = [];
    Object.defineProperty(window, '__releaseTransportCalls', {
      configurable: false,
      value: calls,
      writable: false,
    });
    const originalBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (...arguments_) => {
      calls.push('sendBeacon');
      return originalBeacon(...arguments_);
    };
  });
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const size = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
}

export async function gotoDistTool(page: Page): Promise<void> {
  const response = await page.goto(DIST_TOOL_PATH);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('スロバランス｜差枚・投資・IN/OUT無料計算ツール');
}

export async function calculateDistNet(page: Page): Promise<void> {
  await page.locator('[name="net.games"]').fill('4,321G');
  await page.locator('[name="net.netMedals"]').fill('+987枚');
  await page.locator('[data-calculate="net"]').click();
  await expect(
    page.locator('#result-net .metric__label', { hasText: '差枚ベース出玉率' }),
  ).toBeVisible();
}

declare global {
  interface Window {
    __releaseTransportCalls: string[];
  }
}
