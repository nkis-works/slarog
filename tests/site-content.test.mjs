import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pageNames = ['index', 'support', 'privacy', 'terms', 'legal', '404'];
const pages = Object.fromEntries(
  await Promise.all(
    pageNames.map(async (name) => [
      name,
      await readFile(new URL(`../${name}.html`, import.meta.url), 'utf8'),
    ]),
  ),
);
const tool = await readFile(new URL('../tools/slot-balance/index.html', import.meta.url), 'utf8');
const og = await readFile(new URL('../assets/og-image.svg', import.meta.url), 'utf8');
const publicCopy = `${Object.values(pages).join('\n')}\n${og}`;

test('main message and feature priorities match the approved product', () => {
  assert.match(pages.index, /スランプグラフを、[\s\S]*保存してつなぐ/);
  for (const text of ['作成', '保存', 'アーカイブ', '連結', 'カレンダー', 'PNG']) {
    assert.match(pages.index, new RegExp(text));
  }
});

test('commercial terms distinguish Android app-local and iOS StoreKit trials', () => {
  for (const text of [
    '初回の正常なグラフ保存',
    '14日間',
    '2週間',
    'App Storeが対象と判定',
    'Google Playの無料トライアルではありません',
    '月額380円',
    'App Store',
    'Google Play',
  ]) {
    assert.match(publicCopy, new RegExp(text));
  }
  assert.doesNotMatch(publicCopy, /ストア側の追加無料トライアルはありません/);
  assert.match(pages.terms, /iOS版で無料トライアルを開始した場合/);
  assert.match(pages.terms, /Android版はプランへ登録した場合のみ課金/);
  assert.match(pages.support, /購入を復元/);
});

test('retired terms and prohibited claims are absent', () => {
  for (const text of [
    '無料1台',
    '1台まで無料',
    '期限なし無料',
    '月額500',
    '¥500',
    '500円',
    '月額300',
    '月額780',
    '7日無料',
    '7日間無料',
    'support@nkisworks.com',
    'nkis-works.github.io',
    'pages.dev',
    '勝てる',
    '稼げる',
    '高設定判別',
    '必勝',
    '未来予測',
    '勝率向上',
    '利益保証',
    '出玉保証',
  ]) {
    assert.doesNotMatch(publicCopy, new RegExp(text), `retired or prohibited copy found: ${text}`);
  }
});

test('privacy copy matches both platform implementations', () => {
  for (const text of [
    '写真・ファイル選択',
    '端末内',
    'Google Play Billing',
    'AppleのStoreKit',
    '広告SDK',
    'アクセス解析SDK',
    'クラッシュ解析SDK',
  ]) {
    assert.match(pages.privacy, new RegExp(text));
  }
  for (const text of [
    'スロバランス',
    'ブラウザ内で計算',
    'サーバーへ送信せず',
    '自動保存しません',
  ]) {
    assert.match(pages.privacy, new RegExp(text));
  }
});

test('the free calculation tool is integrated with public navigation and policies', () => {
  for (const text of ['スロバランス', '無料・登録不要', '端末内で計算', '保存・送信されません']) {
    assert.match(tool, new RegExp(text));
  }
  assert.match(pages.index, /href="\/tools\/slot-balance\/"/);
  assert.match(pages.support, /無料計算ツール「スロバランス」/);
  assert.match(pages.privacy, /Cookie、localStorage、sessionStorage、IndexedDB/);
  assert.match(pages.terms, /スロバランスは無料・登録不要/);
  assert.doesNotMatch(tool, /SLOT_BALANCE_MANUAL_AD_INSERTION_POINT/);
});

test('support and operator contacts use their intended roles', () => {
  assert.match(pages.support, /slarog\.app@gmail\.com/);
  assert.doesNotMatch(pages.support, /070-2363-5829/);
  assert.match(pages.legal, /nkis\.base@gmail\.com/);
  assert.match(pages.legal, /070-2363-5829/);
});

test('release page uses the confirmed store destinations', () => {
  assert.match(pages.index, /https:\/\/apps\.apple\.com\/app\/id6792632919/);
  assert.match(
    pages.index,
    /https:\/\/play\.google\.com\/store\/apps\/details\?id=jp\.yuya\.slumparchive/,
  );
  assert.doesNotMatch(
    pages.index,
    /公開準備中|対応予定|App Store 準備中|Google Play 準備中|schema\.org\/PreOrder/,
  );
  assert.match(pages.index, /schema\.org\/InStock/);
});

test('structured application offers are valid for both stores', () => {
  const match = pages.index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'application JSON-LD is missing');
  const data = JSON.parse(match[1]);
  assert.equal(data.name, 'スラログ');
  assert.equal(data.offers.length, 2);
  assert.deepEqual(
    data.offers.map((offer) => offer.price),
    ['380', '380'],
  );
  assert.ok(data.offers.every((offer) => offer.availability === 'https://schema.org/InStock'));
});

test('document pages expose social metadata and current-page navigation', () => {
  for (const name of ['support', 'privacy', 'terms', 'legal']) {
    assert.match(pages[name], /property="og:title"/);
    assert.match(pages[name], /name="twitter:card"/);
    assert.match(pages[name], /aria-current="page"/);
  }
});

test('Open Graph metadata uses the generated wide preview artwork', () => {
  assert.match(pages.index, /og-image-v2\.png/);
  assert.match(pages.index, /summary_large_image/);
  assert.match(pages.index, /https:\/\/nkisworks\.com\//);
});

test('only local application JavaScript is loaded', () => {
  for (const html of Object.values(pages).filter((value) => value.includes('<!doctype html>'))) {
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
    if (html === pages.index) {
      assert.deepEqual(scripts, ['assets/app.js']);
    } else if (html === pages[404]) {
      assert.deepEqual(scripts, ['/assets/app.js']);
    } else {
      assert.deepEqual(scripts, []);
    }
  }
  assert.deepEqual(
    [...tool.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]),
    ['assets/slot-balance-app.js'],
  );
});

test('confirmed address is required for release deployment', () => {
  if (process.env.REQUIRE_CONFIRMED_ADDRESS !== '1') return;
  assert.doesNotMatch(pages.legal, /確認済みの正式住所をストア登録情報との照合後に記載します/);
});
