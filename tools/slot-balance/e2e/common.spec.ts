import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import {
  calculateNet,
  expectNoHorizontalOverflow,
  gotoTool,
  monitorPage,
  TOOL_PATH,
} from './helpers';

test('page, relative links, privacy copy, network and accessibility are sound', async ({
  page,
}) => {
  const monitor = monitorPage(page);
  await gotoTool(page);

  await expect(page.getByRole('heading', { name: 'スロバランス', level: 1 })).toBeVisible();
  await expect(
    page.getByText('設定判別、勝敗予測、続行・ヤメ判断を行うツールではありません。'),
  ).toBeVisible();
  await expect(page.getByText('入力した数値は、この端末内で計算されます。')).toBeVisible();
  await expect(
    page.getByText('計算内容をサーバーへ送信したり、自動保存したりしません。'),
  ).toBeVisible();

  await expect(page.getByRole('link', { name: 'スラログ公式サイトへ戻る' })).toHaveAttribute(
    'href',
    '../../index.html',
  );
  await expect(page.getByRole('link', { name: 'サポート' }).first()).toHaveAttribute(
    'href',
    '../../support.html',
  );
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '../../assets/favicon.svg',
  );

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
  ).toEqual([]);
  expect(monitor.consoleErrors).toEqual([]);
  expect(monitor.externalRequests).toEqual([]);
});

test('mode navigation works with keyboard and preserves raw input', async ({ page }) => {
  await gotoTool(page);
  const netButton = page.locator('[data-main-mode="net"]');
  const investmentButton = page.locator('[data-main-mode="investment"]');
  const segmentsButton = page.locator('[data-main-mode="segments-inout"]');
  await page.locator('[name="net.games"]').fill('1234G');
  await netButton.focus();
  await netButton.press('ArrowRight');
  await expect(investmentButton).toHaveAttribute('aria-pressed', 'true');
  await investmentButton.press('End');
  await expect(segmentsButton).toHaveAttribute('aria-pressed', 'true');
  await segmentsButton.press('Home');
  await expect(netButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[name="net.games"]')).toHaveValue('1234G');
});

test('responsive widths do not overflow and desktop content stays bounded', async ({ page }) => {
  await gotoTool(page);
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await expectNoHorizontalOverflow(page);
  }
  const shellWidth = await page
    .locator('.shell')
    .first()
    .evaluate((element) => Math.round(element.getBoundingClientRect().width));
  expect(shellWidth).toBeLessThanOrEqual(1040);
});

test('calculation does not persist, transmit, log or expose input in the URL', async ({
  page,
  context,
}) => {
  const monitor = monitorPage(page);
  await gotoTool(page);
  await calculateNet(page, '4,321G', '+987枚');
  const storage = await page.evaluate(() => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookie: document.cookie,
  }));
  expect(storage).toEqual({ local: 0, session: 0, cookie: '' });
  expect(await context.cookies()).toEqual([]);
  expect(page.url()).toBe(`http://127.0.0.1:4173${TOOL_PATH}`);
  expect(monitor.consoleErrors.join('\n')).not.toContain('4321');
  expect(monitor.consoleErrors.join('\n')).not.toContain('987');
  expect(monitor.externalRequests).toEqual([]);
});

test('existing static pages load with styles and no JavaScript errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
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
