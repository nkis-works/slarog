import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import {
  calculateQuick,
  expectNoHorizontalOverflow,
  gotoTool,
  monitorPage,
  openPanel,
  TOOL_PATH,
} from './helpers';

test('公開文言、相対リンク、ランドマーク、広告境界、アクセシビリティが健全', async ({ page }) => {
  const monitor = monitorPage(page);
  await gotoTool(page);

  await expect(page.getByRole('heading', { name: 'スロット出玉分析', level: 1 })).toBeVisible();
  await expect(page.getByText('無料・登録不要・端末内で計算')).toBeVisible();
  await expect(page.getByText('未来の結果や設定を予測するものではありません。')).toBeVisible();
  await expect(page.getByText('保存・送信しません。ページを離れると消えます。')).toBeAttached();
  await expect(page.getByRole('link', { name: 'スラログ公式サイトへ' })).toHaveAttribute(
    'href',
    '../../index.html',
  );
  await expect(
    page.getByRole('navigation', { name: 'フッターリンク' }).getByRole('link', {
      name: 'サポート',
    }),
  ).toHaveAttribute('href', '../../support.html');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '../../assets/favicon.svg',
  );
  await expect(page.locator('header')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.locator('#live-region[aria-live="polite"]')).toHaveCount(1);
  await expect(page.getByText('広告', { exact: true })).toHaveCount(0);

  const structure = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return { ordered: false, markerCount: 0, markerBetween: false };
    const selectors = ['.hero', '#quick-result', '.slarog-cta', '#formulas', '#faq', '.disclaimer'];
    const children = Array.from(main.children);
    const nodes = Array.from(main.childNodes);
    const elements = selectors.map((selector) => main.querySelector(selector));
    const positions = elements.map((element) => (element ? children.indexOf(element) : -1));
    const markers = nodes.filter(
      (node) =>
        node.nodeType === Node.COMMENT_NODE &&
        node.textContent?.includes('SLOT_ANALYSIS_MANUAL_AD_INSERTION_POINT'),
    );
    const markerIndex = markers[0] ? nodes.indexOf(markers[0]) : -1;
    const cta = main.querySelector('.slarog-cta');
    const formulas = main.querySelector('#formulas');
    return {
      ordered: positions.every(
        (position, index) => position >= 0 && (index === 0 || position > positions[index - 1]!),
      ),
      markerCount: markers.length,
      markerBetween:
        Boolean(cta && formulas) &&
        nodes.indexOf(cta!) < markerIndex &&
        markerIndex < nodes.indexOf(formulas!),
    };
  });
  expect(structure).toEqual({ ordered: true, markerCount: 1, markerBetween: true });

  await calculateQuick(page);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
  ).toEqual([]);
  expect(monitor.consoleMessages).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
  expect(monitor.externalRequests).toEqual([]);
  expect(monitor.dynamicRequests).toEqual([]);
});

test('キーボード操作、フォーカス移動、44px操作領域を維持する', async ({ page }) => {
  await gotoTool(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '入力フォームへ移動' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#quick-form')).toBeFocused();

  await calculateQuick(page, '4000', '+500');
  await expect(page.locator('#quick-result-title')).toBeFocused();
  await openPanel(page, 'target');
  await expect(page.locator('#target-title')).toBeFocused();
  await page.locator('#target-panel .close-panel').click();
  await expect(page.locator('[data-launcher="target"]')).toBeFocused();

  const tooSmall = await page.locator('button:visible, a.button:visible').evaluateAll((items) =>
    items
      .map((item) => ({
        text: item.textContent?.trim(),
        width: item.getBoundingClientRect().width,
        height: item.getBoundingClientRect().height,
      }))
      .filter(({ width, height }) => width < 44 || height < 44),
  );
  expect(tooSmall).toEqual([]);
});

test('320pxから1440pxまで横overflowせず、デスクトップ幅を制限する', async ({ page }) => {
  await gotoTool(page);
  await calculateQuick(page);
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await expectNoHorizontalOverflow(page);
  }
  const shellWidths = await page
    .locator('.shell')
    .evaluateAll((items) =>
      items.map((element) => Math.round(element.getBoundingClientRect().width)),
    );
  expect(Math.max(...shellWidths)).toBeLessThanOrEqual(1180);
});

test('全機能の入力・計算が保存、送信、Cookie、URL、consoleへ漏れない', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    Object.defineProperty(window, '__uiTransportCalls', { value: calls });
    const beacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (...arguments_) => {
      calls.push('sendBeacon');
      return beacon(...arguments_);
    };
  });
  const monitor = monitorPage(page);
  await gotoTool(page);
  await calculateQuick(page, '4,321G', '+987枚');

  await openPanel(page, 'target');
  await page.locator('#target-games').fill('5000');
  await page.locator('#target-rate').fill('100');
  await page.locator('#target-form button[type="submit"]').click();
  await openPanel(page, 'investment');
  await page.locator('#investment-cash').fill('20000');
  await page.locator('#investment-current').fill('1200');
  await page.locator('#investment-exchange').fill('50');
  await page.locator('#investment-form button[type="submit"]').click();
  await openPanel(page, 'inout');
  await page.locator('#actual-in').fill('12000');
  await page.locator('#actual-out').fill('12500');
  await page.locator('#inout-form button[type="submit"]').click();

  const footprint = await page.evaluate(async () => ({
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    cookie: document.cookie,
    indexedDb: typeof indexedDB.databases === 'function' ? await indexedDB.databases() : [],
    cacheStorage: typeof caches === 'undefined' ? [] : await caches.keys(),
    transportCalls: (window as Window & { __uiTransportCalls: string[] }).__uiTransportCalls,
    search: location.search,
    hash: location.hash,
  }));
  expect(footprint).toEqual({
    localStorage: 0,
    sessionStorage: 0,
    cookie: '',
    indexedDb: [],
    cacheStorage: [],
    transportCalls: [],
    search: '',
    hash: '',
  });
  expect(await context.cookies()).toEqual([]);
  expect(page.url()).toBe(`http://127.0.0.1:4173${TOOL_PATH}`);
  expect(monitor.consoleMessages).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
  expect(monitor.externalRequests).toEqual([]);
  expect(monitor.dynamicRequests).toEqual([]);
});

test('既存静的ページを壊さず、CSS・JavaScriptが読み込まれる', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => errors.push(`${message.type()}: ${message.text()}`));
  for (const path of [
    '/index.html',
    '/support.html',
    '/privacy.html',
    '/terms.html',
    '/404.html',
    TOOL_PATH,
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    expect(await page.evaluate(() => document.styleSheets.length)).toBeGreaterThan(0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html');
  const menu = page.getByRole('button', { name: 'メニュー' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-nav-links]')).toHaveClass(/is-open/);
  expect(errors).toEqual([]);
});

test('旧URLのsource案内はnoindexで入力を引き継がず新URLだけを案内する', async ({ page }) => {
  const response = await page.goto('/tools/slot-balance/index.html?games=4000&net=500');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('スロット出玉分析へ移動しました｜NKIS Works');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('script')).toHaveCount(0);
  await expect(page.locator('input')).toHaveCount(0);
  await expect(page.getByRole('link', { name: '新しいスロット出玉分析を開く' })).toHaveAttribute(
    'href',
    '../slot-analysis/',
  );
  await expect(page.locator('body')).not.toContainText('4000');
  await expect(page.locator('body')).not.toContainText('500');
});

declare global {
  interface Window {
    __uiTransportCalls: string[];
  }
}
