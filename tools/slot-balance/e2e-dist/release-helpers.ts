import { expect, type Page } from '@playwright/test';

export const DIST_ORIGIN = 'http://127.0.0.1:4174';
export const DIST_TOOL_PATH = '/tools/slot-balance/index.html';

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
  await expect(page).toHaveTitle('スロット出玉分析｜機械割・実績出玉率・区間差枚を無料計算');
}

export async function calculateDistNet(page: Page): Promise<void> {
  await page.locator('#quick-games').fill('4,321G');
  await page.locator('#quick-net').fill('+987枚');
  await page.locator('#quick-form button[type="submit"]').click();
  await expect(page.locator('#quick-rate')).toBeVisible();
}

declare global {
  interface Window {
    __releaseTransportCalls: string[];
  }
}
