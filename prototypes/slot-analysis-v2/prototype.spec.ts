import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const artifactDir = resolve('artifacts/slot-analysis-v2-design');

const calculateQuick = async (page: Page) => {
  const form = page.locator('#quick-form');
  await form.getByLabel('総ゲーム数').fill('4,000');
  await form.getByLabel('差枚', { exact: true }).fill('+500');
  await form.getByLabel('差枚', { exact: true }).press('Enter');
};

test.beforeAll(() => mkdirSync(artifactDir, { recursive: true }));

test('代表計算、キーボード、プライバシー境界、アクセシビリティ', async ({ page, context }) => {
  const consoleMessages: string[] = [];
  const pageErrors: string[] = [];
  const externalRequests: string[] = [];
  page.on('console', (message) => consoleMessages.push(`${message.type()}: ${message.text()}`));
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== '127.0.0.1') externalRequests.push(request.url());
  });

  await page.goto('/index.html');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeVisible();
  await page.getByLabel('総ゲーム数').focus();
  await page.keyboard.type('4,000');
  await page.keyboard.press('Tab');
  await page.keyboard.type('+500');
  await page.keyboard.press('Enter');

  await expect(page.locator('#result-rate')).toHaveText('104.2%');
  await expect(page.locator('#result-input')).toHaveText('4,000G / +500枚');
  await expect(page.locator('#result-per-thousand')).toHaveText('+125枚');
  await expect(page.locator('#result-flow')).toHaveText('12,000 → 12,500枚');
  await expect(page.locator('[data-rate="100"] [data-difference]')).toHaveText('+500枚');
  await expect(page.locator('[data-rate="103"] [data-difference]')).toHaveText('+140枚');
  await expect(page.locator('[data-rate="105"] [data-difference]')).toHaveText('−100枚');
  await expect(page.locator('#quick-result-title')).toBeFocused();

  await page.locator('[data-rate="103"]').click();
  await expect(page.locator('#benchmark-summary')).toContainText('140枚上回ります');

  const accessibility = await new AxeBuilder({ page }).analyze();
  const severe = accessibility.violations.filter(
    ({ impact }) => impact === 'critical' || impact === 'serious',
  );
  expect(severe).toEqual([]);

  const clientState = await page.evaluate(async () => ({
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    indexedDb: (await indexedDB.databases()).length,
    cookie: document.cookie,
    search: location.search,
    hash: location.hash,
  }));
  expect(clientState).toEqual({
    localStorage: 0,
    sessionStorage: 0,
    indexedDb: 0,
    cookie: '',
    search: '',
    hash: '',
  });
  expect(await context.cookies()).toEqual([]);
  expect(consoleMessages).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test('390×844の初期表示にH1、一文、2入力、主ボタンが収まる', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html');
  await page.locator('.prototype-banner').evaluate((element) => {
    element.hidden = true;
  });
  await expect(page.getByRole('heading', { level: 1, name: 'スロット出玉分析' })).toBeVisible();
  await expect(page.locator('.hero-lead')).toBeVisible();
  await expect(page.getByLabel('総ゲーム数')).toBeVisible();
  await expect(page.locator('#quick-net')).toBeVisible();
  const button = page.getByRole('button', { name: '出玉率を見る' });
  await expect(button).toBeVisible();
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(844);
});

test('厳密差が非0で整数表示0なら1枚未満と方向を示す', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByLabel('総ゲーム数').fill('1');
  await page.locator('#quick-net').fill('0');
  await page.getByRole('button', { name: '出玉率を見る' }).click();
  await expect(page.locator('[data-rate="103"] [data-difference]')).toHaveText('1枚未満');
  await expect(page.locator('[data-rate="103"] [data-relation]')).toHaveText('下回る');
});

test('目標逆算と区間基準の初期中立を固定', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByRole('button', { name: '目標から逆算' }).click();
  await page.getByRole('button', { name: '必要条件を計算' }).click();
  await expect(page.locator('#target-remaining')).toHaveText('1,000G');
  await expect(page.locator('#target-net-result')).toHaveText(
    '−500枚までなら5,000G時点で100%を維持',
  );
  await expect(page.locator('#target-rate-result')).toHaveText('83.3%以上');

  await page.getByRole('button', { name: '区間を比べる' }).click();
  await expect(page.locator('#segment-benchmark')).toHaveValue('');
  await page.getByRole('button', { name: '区間を分析' }).click();
  await expect(page.locator('#segment-benchmark-summary')).toBeHidden();
  await expect(page.locator('#segment-breakdown')).not.toContainText('好調区間');
  await page.locator('#segment-benchmark').selectOption('103');
  await page.getByRole('button', { name: '区間を分析' }).click();
  await expect(page.locator('#segment-total-diff')).toHaveText('−470枚');
  await expect(page.locator('#segment-breakdown')).toContainText('103%基準：好調区間');
  await expect(page.locator('#segment-breakdown')).toContainText('103%基準：低調区間');
});

test('構造HTMLと外部依存を検査', async ({ page }) => {
  await page.goto('/index.html');
  const structure = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    const external = [...document.querySelectorAll('[src], [href]')]
      .map((element) => element.getAttribute('src') ?? element.getAttribute('href') ?? '')
      .filter((value) => /^https?:/i.test(value));
    const unlabeled = [...document.querySelectorAll('input, select')].filter(
      (input) => !input.labels?.length && !input.getAttribute('aria-label'),
    ).length;
    return {
      duplicateIds,
      external,
      unlabeled,
      h1Count: document.querySelectorAll('h1').length,
      mainCount: document.querySelectorAll('main').length,
      prototypeNotice: document.body.textContent?.includes('非公開設計プロトタイプ'),
    };
  });
  expect(structure).toEqual({
    duplicateIds: [],
    external: [],
    unlabeled: 0,
    h1Count: 1,
    mainCount: 1,
    prototypeNotice: true,
  });
});

for (const width of [320, 390, 430, 768, 1440]) {
  test(`${width}pxで横overflowなし`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html');
    await calculateQuick(page);
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}

test('200%ズームで主要タスクと横overflowなし', async ({ page, context }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/index.html');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
  await calculateQuick(page);
  await expect(page.locator('#result-rate')).toHaveText('104.2%');
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('390pxの主要状態を視覚成果物に保存', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html');
  await page.locator('#quick').screenshot({ path: resolve(artifactDir, 'quick-input-mobile.png') });

  await calculateQuick(page);
  await page
    .locator('#quick')
    .screenshot({ path: resolve(artifactDir, 'quick-result-mobile.png') });

  await page.getByRole('button', { name: '目標から逆算' }).click();
  await page.getByRole('button', { name: '必要条件を計算' }).click();
  await page
    .locator('#target-panel')
    .screenshot({ path: resolve(artifactDir, 'target-reverse-mobile.png') });

  await page.getByRole('button', { name: '区間を比べる' }).click();
  await page
    .locator('#segment-panel')
    .screenshot({ path: resolve(artifactDir, 'segment-input-mobile.png') });
  await page.getByRole('button', { name: '区間を分析' }).click();
  await page
    .locator('#segment-panel')
    .screenshot({ path: resolve(artifactDir, 'segment-result-mobile.png') });

  await page.getByRole('button', { name: '投資・回収' }).click();
  await page.locator('summary', { hasText: '詳細投資' }).click();
  await page.getByRole('button', { name: '回収を計算' }).click();
  await page
    .locator('#investment-panel')
    .screenshot({ path: resolve(artifactDir, 'investment-progressive-mobile.png') });

  await page.getByRole('button', { name: '投資・回収' }).click();
  await page.screenshot({ path: resolve(artifactDir, 'full-page-mobile.png'), fullPage: true });
});

test('1440pxの主要状態を視覚成果物に保存', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/index.html');
  await calculateQuick(page);
  await page
    .locator('#quick')
    .screenshot({ path: resolve(artifactDir, 'quick-result-desktop.png') });
  await page.getByRole('button', { name: '区間を比べる' }).click();
  await page.getByRole('button', { name: '区間を分析' }).click();
  await page
    .locator('#segment-panel')
    .screenshot({ path: resolve(artifactDir, 'segment-result-desktop.png') });
  await page.getByRole('button', { name: '区間を比べる' }).click();
  await page.screenshot({ path: resolve(artifactDir, 'full-page-desktop.png'), fullPage: true });
});

test('結果表示2案を視覚成果物に保存', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/result-variants.html');
  await page
    .locator('.variant-card')
    .nth(0)
    .screenshot({ path: resolve(artifactDir, 'result-rail-variant.png') });
  await page
    .locator('.variant-card')
    .nth(1)
    .screenshot({ path: resolve(artifactDir, 'result-list-variant.png') });
});
