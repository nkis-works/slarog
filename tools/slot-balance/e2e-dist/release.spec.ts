import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import {
  calculateDistNet,
  DIST_ORIGIN,
  expectNoHorizontalOverflow,
  gotoDistTool,
  installTransportProbe,
  monitorReleasePage,
} from './release-helpers';

const pagePaths = [
  '/index.html',
  '/support.html',
  '/privacy.html',
  '/terms.html',
  '/404.html',
  '/tools/slot-balance/index.html',
];

test('curated distribution serves all pages and assets without runtime output or overflow', async ({
  page,
  request,
}) => {
  const monitor = monitorReleasePage(page);
  for (const path of [
    ...pagePaths,
    '/assets/styles.css',
    '/assets/app.js',
    '/tools/slot-balance/assets/styles.css',
    '/tools/slot-balance/assets/slot-balance-app.js',
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    for (const path of pagePaths) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      expect(await page.evaluate(() => document.styleSheets.length), path).toBeGreaterThan(0);
      await expectNoHorizontalOverflow(page);
    }
  }

  expect(monitor.consoleMessages).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
  expect(monitor.externalRequests).toEqual([]);
  expect(monitor.dynamicRequests).toEqual([]);
});

test('public copy, section order, manual ad boundary and navigation are complete', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html');
  const menu = page.getByRole('button', { name: 'メニュー' });
  await menu.click();
  await expect(page.getByRole('link', { name: 'スロバランス' }).first()).toBeVisible();
  await page.getByRole('link', { name: 'スロバランス' }).first().click();
  await expect(page).toHaveURL(`${DIST_ORIGIN}/tools/slot-balance/`);

  await expect(page.getByText('入力した数値は、この端末内で計算されます。')).toBeVisible();
  await expect(
    page.getByText('計算内容をサーバーへ送信したり、自動保存したりしません。'),
  ).toBeVisible();
  await expect(page.locator('#formulas .formula-card')).toHaveCount(9);
  await expect(page.locator('#faq details')).toHaveCount(10);
  await expect(page.getByText('広告', { exact: true })).toHaveCount(0);

  const structure = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return { ordered: false, markerCount: 0, markerBetween: false };
    const selectors = [
      '.tool',
      '#calculation-results',
      '[aria-labelledby="messages-heading"]',
      '[aria-labelledby="boundary-heading"]',
      '[aria-labelledby="explanations-heading"]',
      '.slarog-cta',
      '#formulas',
      '[aria-labelledby="guide-heading"]',
      '#faq',
      '.disclaimer',
    ];
    const elements = selectors.map((selector) => main.querySelector(selector));
    const children = Array.from(main.children);
    const childNodes = Array.from(main.childNodes);
    const positions = elements.map((element) => (element ? children.indexOf(element) : -1));
    const comments = childNodes.filter(
      (node) =>
        node.nodeType === Node.COMMENT_NODE &&
        node.textContent?.includes('SLOT_BALANCE_MANUAL_AD_INSERTION_POINT'),
    );
    const marker = comments[0];
    const cta = main.querySelector('.slarog-cta');
    const formulas = main.querySelector('#formulas');
    const markerIndex = marker ? childNodes.indexOf(marker) : -1;
    return {
      ordered: positions.every(
        (position, index) => position >= 0 && (index === 0 || position > positions[index - 1]!),
      ),
      markerCount: comments.length,
      markerBetween:
        Boolean(cta && formulas) &&
        childNodes.indexOf(cta!) < markerIndex &&
        markerIndex < childNodes.indexOf(formulas!),
    };
  });
  expect(structure).toEqual({ ordered: true, markerCount: 1, markerBetween: true });

  const visibleCopy = await page.locator('body').innerText();
  expect(visibleCopy).not.toMatch(/Phase\s*(?:1|2|2A|2B)|MVP|実装中|開発用|TODO|\bdebug\b/i);

  for (const name of ['サポート', 'プライバシー', '利用規約']) {
    const link = page.getByRole('link', { name, exact: name !== 'プライバシー' }).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    await page.goto(new URL(href!, page.url()).href);
    expect(page.url()).toMatch(
      new RegExp(
        `${name === 'サポート' ? 'support' : name === '利用規約' ? 'terms' : 'privacy'}\\.html$`,
      ),
    );
    await gotoDistTool(page);
  }

  await page.getByRole('link', { name: 'スラログ公式サイトへ戻る' }).click();
  await expect(page).toHaveURL(`${DIST_ORIGIN}/index.html`);
});

test('calculation performs no transport, storage, cookie, URL or console side effects', async ({
  page,
  context,
}) => {
  await installTransportProbe(page);
  const monitor = monitorReleasePage(page);
  await gotoDistTool(page);
  await calculateDistNet(page);

  const footprint = await page.evaluate(async () => ({
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    cookie: document.cookie,
    indexedDb: typeof indexedDB.databases === 'function' ? await indexedDB.databases() : [],
    cacheStorage: typeof caches === 'undefined' ? [] : await caches.keys(),
    transportCalls: window.__releaseTransportCalls,
  }));
  expect(footprint).toEqual({
    localStorage: 0,
    sessionStorage: 0,
    cookie: '',
    indexedDb: [],
    cacheStorage: [],
    transportCalls: [],
  });
  expect(await context.cookies()).toEqual([]);
  expect(page.url()).toBe(`${DIST_ORIGIN}/tools/slot-balance/index.html`);
  expect(monitor.consoleMessages).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
  expect(monitor.externalRequests).toEqual([]);
  expect(monitor.dynamicRequests).toEqual([]);
  expect(monitor.consoleMessages.join('\n')).not.toMatch(/4321|987/);
});

test('headers, meta CSP, redirects and runtime surfaces stay fail-closed', async ({ page }) => {
  const headers = await readFile('dist/_headers', 'utf8');
  const redirects = await readFile('dist/_redirects', 'utf8');
  const headerCsp = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m)?.[1];
  if (!headerCsp) throw new Error('_headersからCSPを取得できません。');
  expect(headerCsp).toBe(
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  );
  expect(headers).toContain('https://nkisworks-site.pages.dev/*\n  X-Robots-Tag: noindex');
  expect(headers).toContain('https://:version.nkisworks-site.pages.dev/*\n  X-Robots-Tag: noindex');
  expect(headers).toContain('X-Robots-Tag: noindex, nofollow');
  expect(headers).not.toMatch(/unsafe-inline|unsafe-eval/i);
  expect(redirects.trim().split('\n')).toEqual([
    '/tools/slot-balance /tools/slot-balance/ 301',
    '/tools/slot-balance/index.html /tools/slot-balance/ 301',
  ]);

  for (const path of pagePaths) {
    await page.goto(path);
    const metaCsp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content');
    expect(metaCsp).toBe(headerCsp.replace("; frame-ancestors 'none'", ''));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
    expect(
      await page.evaluate(() => ({
        externalScripts: Array.from(document.scripts).filter((script) => {
          const source = script.getAttribute('src');
          return source
            ? new URL(source, window.location.href).origin !== window.location.origin
            : false;
        }).length,
        iframes: document.querySelectorAll('iframe').length,
        externalForms: Array.from(document.forms).filter(
          (form) => form.hasAttribute('action') && /^https?:/i.test(form.action),
        ).length,
      })),
    ).toEqual({ externalScripts: 0, iframes: 0, externalForms: 0 });
  }
});
