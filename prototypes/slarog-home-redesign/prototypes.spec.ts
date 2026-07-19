import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = '/prototypes/slarog-home-redesign';
const proposals = [
  { name: 'A', path: `${root}/a/`, desktopNav: '.desktop-nav' },
  { name: 'B', path: `${root}/b/`, desktopNav: '.wide-nav' },
] as const;
const bannedDecorativeLabels = [
  'Before / After',
  'Record & Review',
  'Features',
  'Plans',
  'Coming Soon',
  'Continuous Import',
  '7 Days / 1000',
  'Zero Line / Export',
];

test('比較ページはA/B/現行だけへリンクし、非配布ファイルへ誘導しない', async ({ page }) => {
  await page.goto(`${root}/`);
  const hrefs = await page
    .locator('a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs).toEqual(['a/', 'b/', '../../index.html']);
  expect(hrefs).not.toContain('README.md');
});

test('A/Bともブランド、料金、作った理由、実画面を公開契約どおり表示する', async ({ page }) => {
  for (const proposal of proposals) {
    await page.goto(proposal.path);
    await expect(page.locator('.brand, .identity').first()).toContainText('スラログ');
    await expect(page.locator('.brand, .identity').first()).toContainText('by NKIS Works');
    await expect(page.locator(`${proposal.desktopNav} > a`)).toHaveCount(4);
    await expect(page.locator('h1')).toContainText('ホールのスランプグラフを');
    await expect(page.locator('body')).toContainText('14日間');
    await expect(page.locator('body')).toContainText('月額380円');
    await expect(page.locator('body')).toContainText('自動更新');
    await expect(page.locator('body')).toContainText('App Store／Google Playのアカウント管理');
    await expect(page.locator('#story')).toContainText(
      'グラフ画像を、あとで見返せる記録にしたかった。',
    );
    await expect(page.locator('img')).toHaveCount(11);
    await expect(page.locator('[class*="card"], [class*="panel"]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

    const text = (await page.locator('body').innerText()).replaceAll('\n', ' ');
    for (const label of bannedDecorativeLabels) {
      expect(text).not.toContain(label);
    }
  }
});

test('A/Bともユーザーの操作順を7段階で伝える', async ({ page }) => {
  const expectedOrder = [
    'グラフ画像を読み込む',
    '表示範囲と線を合わせる',
    '保存する',
    'カレンダーや検索から探す',
    '同じ台の複数日をつなぐ',
    '7日ごとに同じ幅で比べる',
    'PNGとして外部保存する',
  ];

  for (const proposal of proposals) {
    await page.goto(proposal.path);
    const headings = await page.locator('#how h3, #workflow h3').allTextContents();
    expect(headings).toHaveLength(7);
    for (const [index, phrase] of expectedOrder.entries()) {
      expect(headings[index]).toContain(phrase);
    }
  }
});

test('desktopでcritical/seriousのaxe違反がない', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const proposal of proposals) {
    await page.goto(proposal.path);
    const result = await new AxeBuilder({ page }).analyze();
    const blocking = result.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact ?? ''),
    );
    expect(blocking, `${proposal.name}案のaxe違反`).toEqual([]);
  }
});

test('mobileで横overflowがなく、メニューと料金が読み取れる', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const proposal of proposals) {
    await page.goto(proposal.path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `${proposal.name}案の横overflow`).toBeLessThanOrEqual(1);
    const menu = page.locator('.mobile-nav, .small-nav');
    await expect(menu).toBeVisible();
    await menu.locator('summary').click();
    await expect(menu.locator('nav a')).toHaveCount(4);
    await expect(page.locator('#price, #pricing')).toContainText('月額 ¥380');
  }
});

test('A/Bは外部通信とブラウザ保存領域を使用しない', async ({ page }) => {
  for (const proposal of proposals) {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin !== 'http://127.0.0.1:4175') externalRequests.push(request.url());
    });
    await page.goto(proposal.path);
    await page.waitForLoadState('networkidle');
    expect(externalRequests).toEqual([]);
    expect(await page.context().cookies()).toEqual([]);
    const storage = await page.evaluate(async () => ({
      local: localStorage.length,
      session: sessionStorage.length,
      indexedDb: (await indexedDB.databases()).length,
    }));
    expect(storage).toEqual({ local: 0, session: 0, indexedDb: 0 });
    page.removeAllListeners('request');
  }
});

test('現行/A/Bのdesktop・mobile比較画像をGit管理外へ出力する', async ({ page }) => {
  test.setTimeout(120_000);
  const output = resolve('artifacts/slarog-home-redesign');
  await mkdir(output, { recursive: true });
  const pages = [
    { name: 'current', path: '/index.html', price: '#plans', story: '#story' },
    { name: 'a', path: `${root}/a/`, price: '#price', story: '#story' },
    { name: 'b', path: `${root}/b/`, price: '#pricing', story: '#story' },
  ];

  for (const item of pages) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(item.path);
    await waitForImages(page);
    await page.screenshot({
      path: resolve(output, `${item.name}-desktop-full.png`),
      fullPage: true,
    });
    await page
      .locator('.hero')
      .screenshot({ path: resolve(output, `hero-${item.name}-desktop.png`) });
    await page.locator(item.price).screenshot({
      path: resolve(output, `pricing-${item.name}-desktop.png`),
    });
    await page.locator(item.story).screenshot({
      path: resolve(output, `maker-${item.name}-desktop.png`),
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(item.path);
    await waitForImages(page);
    await page.screenshot({
      path: resolve(output, `${item.name}-mobile-full.png`),
      fullPage: true,
    });
  }
});

async function waitForImages(page: Page) {
  await page.evaluate(() => {
    for (const image of Array.from(document.images)) image.loading = 'eager';
    for (const element of Array.from(document.querySelectorAll('.reveal'))) {
      element.classList.add('is-visible');
    }
  });
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete));
}
