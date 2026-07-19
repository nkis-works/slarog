import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, gotoTool } from './helpers';

const sharedPages = [
  '/index.html',
  '/support.html',
  '/privacy.html',
  '/terms.html',
  '/404.html',
  '/tools/slot-analysis/index.html',
] as const;

test('サポートがアプリとWebツールの両方を案内する', async ({ page }) => {
  const response = await page.goto('/support.html');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('サポート｜NKIS Works');
  await expect(page.getByRole('heading', { name: 'サポート', level: 1 })).toBeVisible();

  const description = page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute('content', /スラログ/);
  await expect(description).toHaveAttribute('content', /スロット出玉分析/);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    /スロット出玉分析/,
  );
  await expect(
    page.getByRole('heading', {
      name: 'お問い合わせの際にお知らせいただきたい情報',
      level: 2,
    }),
  ).toBeVisible();
  for (const item of [
    'サービス名／アプリ名',
    'OS／端末名',
    'ブラウザ名・バージョン',
    'アプリバージョン',
    '発生した操作',
    '表示されたエラー内容',
    'スクリーンショット',
  ]) {
    await expect(page.getByText(item, { exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole('heading', { name: 'スラログの基本的な使い方', level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByText('総ゲーム数と差枚から、実績出玉率や100・103・105%基準との差'),
  ).toBeVisible();
  await expect(page.getByText('利用中の端末内だけで計算され')).toBeVisible();
});

test('トップ・規約・プライバシーの説明が現行ツール仕様と一致する', async ({ page }) => {
  await page.goto('/index.html');
  await expect(
    page.getByText(
      '総ゲーム数と差枚を入力するだけで、実績出玉率や基準との差、区間ごとの変化を端末内で計算できます。登録・保存・外部送信はありません。',
    ),
  ).toBeVisible();

  await page.goto('/terms.html');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /スラログ.*スロット出玉分析/,
  );
  await expect(page.getByText('比較基準との差、区間ごとの実績、目標までの条件')).toBeVisible();
  await expect(page.getByText('3枚掛け換算によるIN／OUT')).toBeVisible();
  await expect(page.getByText('最終更新日：2026年7月20日')).toBeVisible();

  await page.goto('/privacy.html');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /スラログ.*スロット出玉分析/,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    /スラログ.*スロット出玉分析/,
  );
  await expect(page.getByText('ブラウザ名・バージョン')).toBeVisible();
  await expect(page.getByText('利用中の端末内だけで計算されます')).toBeVisible();
  await expect(page.getByText('最終更新日：2026年7月20日')).toBeVisible();
});

test('スラログの新料金が公開ページで一致し、廃止した料金文言が残らない', async ({ page }) => {
  const publicPages = ['/index.html', '/support.html', '/privacy.html', '/terms.html'] as const;
  for (const path of publicPages) {
    await page.goto(path);
    const copy = await page.locator('body').innerText();
    expect(copy, path).not.toMatch(
      /月額500円|¥500|無料プラン|1台まで|期限なし|複数台を記録するには|台数無制限|自動更新/,
    );
  }

  await page.goto('/index.html');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /14日間.*月額380円/,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    /14日間.*月額380円/,
  );
  await expect(
    page.getByRole('heading', { name: '試してから、 続けるか決められます。' }),
  ).toBeVisible();
  await expect(page.locator('.price-note')).toContainText('14日間は無料');
  await expect(page.locator('.price-note')).toContainText('月額380円');
  await expect(page.locator('.billing')).toContainText('App Store／Google Playのアカウント管理');

  await page.goto('/support.html');
  await expect(page.getByText('14日間です。無料体験中は料金が発生しません。')).toBeAttached();
  await expect(page.getByText('引き続き利用する場合は月額380円です。')).toBeAttached();
  await expect(page.getByText(/App Store／Google Playのアカウント管理画面/)).toBeAttached();

  await page.goto('/terms.html');
  await expect(page.locator('#billing')).toContainText('14日間の無料体験');
  await expect(page.locator('#billing')).toContainText('月額380円');
  await expect(page.locator('#billing')).toContainText('各ストアのアカウント管理画面');
});

test('トップは困りごと・作った理由・実画面を中心に理解できる', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html');

  await expect(
    page.getByRole('heading', { name: 'あとで見ると、 何のグラフか分からない。' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'グラフ画像を、あとで見返せる記録にしたかった。' }),
  ).toBeVisible();
  const scenarioCopy = await page.locator('.use-case-notes p').allTextContents();
  for (const scenario of [
    '画像フォルダの中で、店・機種・台番・日付が混ざっていく。',
    '同じ台の数日間を見るために、画像を何枚も開かなければならない。',
    '長いグラフは比較しにくく、作った記録を外へ残すのも手間がかかる。',
  ]) {
    expect(scenarioCopy.join('\n')).toContain(scenario);
  }
  expect(await page.locator('img[src*="slarog-"]').count()).toBeGreaterThanOrEqual(8);

  const order = await page.evaluate(() => {
    const main = document.querySelector('main');
    const selectors = [
      '.product-hero',
      '.problem-section',
      '#story',
      '#features',
      '.trust',
      '#plans',
      '.web-tool',
      '#faq',
      '.final-cta',
    ];
    const children = main ? Array.from(main.children) : [];
    return selectors.map((selector) => {
      const element = main?.querySelector(selector);
      return element ? children.indexOf(element) : -1;
    });
  });
  expect(
    order.every(
      (position, index) => position >= 0 && (index === 0 || position > order[index - 1]!),
    ),
  ).toBe(true);

  const majorLabels = await page.locator('.kicker').allTextContents();
  expect(majorLabels).toEqual(
    expect.arrayContaining([
      '撮った時は分かっていたのに。',
      '作った理由',
      '使う順番',
      '料金について',
      '確認しておきたいこと',
    ]),
  );
  expect(majorLabels.join(' ')).not.toMatch(
    /Before|After|Features|Plans|Coming Soon|Record & Review/,
  );
  await expectNoHorizontalOverflow(page);
});

test('表示文言は統一表記を使い、専門的な内部語を見せない', async ({ page }) => {
  for (const path of sharedPages) {
    await page.goto(path);
    const copy = await page.locator('body').innerText();
    expect(copy, path).not.toMatch(/OS \/ 端末名|IN\/OUT|IN \/ OUT|App Store \/ Google Play/);
    expect(copy, path).not.toMatch(
      /クイック結果|クイック分析|数学上の境界|数学上の必要条件|寄与を表示します|Slarog tools/,
    );
    expect(copy, path).not.toMatch(
      /設定が分かる|高設定を見抜ける|勝てる|今後出る|反発する|冷遇判定|優遇判定|期待値が分かる|続行すべき|ヤメるべき|勝率|上振れ確率|下振れ確率/,
    );
  }

  await gotoTool(page);
  await expect(page.locator('[data-launcher="inout"] strong')).toHaveText('実IN／OUT');
  await expect(page.locator('[data-launcher="coin"] strong')).toHaveText('通常時のコイン持ち');
  await expect(
    page.getByText('比較基準を選ぶと、各区間の押し上げ・押し下げを表示します'),
  ).toBeAttached();
  await expect(
    page.getByText(
      'ホールのグラフ画像を見やすい記録にし、店舗・機種・台番号・日付ごとに保存して振り返れます。',
    ),
  ).toBeVisible();
});

test('ナビゲーション・現在ページ・404導線・モバイルメニューが整合する', async ({ page }) => {
  const currentPages = [
    ['/index.html', 'スラログ'],
    ['/support.html', 'サポート'],
    ['/privacy.html', 'プライバシーポリシー'],
    ['/terms.html', '利用規約'],
    ['/tools/slot-analysis/index.html', '出玉分析'],
  ] as const;
  for (const [path, name] of currentPages) {
    await page.goto(path);
    const current = page.locator('[aria-current="page"]');
    await expect(current.filter({ hasText: name })).not.toHaveCount(0);
  }

  await page.goto('/404.html');
  await expect(page.getByRole('link', { name: '公式サイトへ戻る' })).toHaveAttribute(
    'href',
    'index.html',
  );
  await expect(page.getByRole('link', { name: 'スロット出玉分析を使う' })).toHaveAttribute(
    'href',
    'tools/slot-analysis/',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/support.html');
  const menu = page.getByRole('button', { name: 'メニュー' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-nav-links]')).toContainText('出玉分析');
  const navigationLabels = await page.locator('[data-nav-links] a').allTextContents();
  expect(navigationLabels).toEqual(['できること', '料金', 'よくある質問', '出玉分析']);
});

test('titleとH1が一致し、200%文字拡大相当でも操作できる', async ({ page }) => {
  const pages = [
    ['/support.html', 'サポート｜NKIS Works', 'サポート'],
    ['/privacy.html', 'プライバシーポリシー｜NKIS Works', 'プライバシーポリシー'],
    ['/terms.html', '利用規約｜NKIS Works', '利用規約'],
    ['/404.html', 'ページが見つかりません｜NKIS Works', 'ページが見つかりません'],
  ] as const;
  for (const [path, title, heading] of pages) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
  }

  await page.setViewportSize({ width: 640, height: 900 });
  await gotoTool(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expect(page.getByRole('button', { name: '出玉率を見る' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
