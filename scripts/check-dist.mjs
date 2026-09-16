import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { playlistToolkitRoutes } from './build-playlist-toolkit.mjs';

const productRoutes = playlistToolkitRoutes();

const requiredFiles = new Set([
  '.nojekyll',
  'index.html',
  '404.html',
  'support/index.html',
  'privacy/index.html',
  'terms/index.html',
  'legal/index.html',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  '_redirects',
  'indexnow-91cf5ab81b6506ff4c8c279ce4405142.txt',
  'tools/slot-balance/index.html',
  'tools/slot-balance/assets/styles.css',
  'tools/slot-balance/assets/slot-balance-app.js',
  'products/slarog/index.html',
  'en/index.html',
  'ja/index.html',
  ...productRoutes.map((route) => `${route.slice(1)}index.html`),
]);

const files = await listFiles(resolve('dist'));
const fileSet = new Set(files);
for (const required of requiredFiles) {
  assert(fileSet.has(required), `dist に必須ファイルがありません: ${required}`);
}

for (const file of files) {
  const allowed = requiredFiles.has(file) || file.startsWith('assets/');
  assert(allowed, `dist の許可リスト外ファイルです: ${file}`);
  assert(
    !/(^|\/)(?:node_modules|docs?|tests?|e2e|artifacts?|src)(?:\/|$)/i.test(file),
    `dist に開発用ファイルがあります: ${file}`,
  );
  assert(
    !/(?:\.tsx?|\.map|package(?:-lock)?\.json|(?:^|\/)\.[^/]*env)/i.test(file),
    `dist に公開禁止ファイルがあります: ${file}`,
  );
}

const textFiles = files.filter(
  (file) => /\.(?:html|css|js|txt|xml)$/.test(file) || file.startsWith('_'),
);
const textEntries = await Promise.all(
  textFiles.map(async (file) => [file, await readFile(resolve('dist', file), 'utf8')]),
);
const allText = textEntries.map(([, value]) => value).join('\n');

assert(
  !/(?:ca-pub-\d+|adsbygoogle|googlesyndication|data-ad-client|google-analytics|googletagmanager)/i.test(
    allText,
  ),
  '広告または解析コードが含まれています。',
);
assert(!/sourceMappingURL/i.test(allText), 'ソースマップ参照が含まれています。');
assert(
  !/(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16})/.test(allText),
  '秘密情報らしき文字列が含まれています。',
);
assert(
  !/(?:月額500円|¥500|月額300円|月額780円|無料1台|1台まで無料|期限なし無料|高設定判別|設定推測|勝てる|稼げる)/i.test(
    allText,
  ),
  '旧仕様または禁止表現が含まれています。',
);

const headers = await readFile(resolve('dist', '_headers'), 'utf8');
for (const value of [
  'Strict-Transport-Security: max-age=31536000; includeSubDomains',
  'X-Content-Type-Options: nosniff',
  'Referrer-Policy: strict-origin-when-cross-origin',
  'X-Frame-Options: DENY',
  "connect-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
]) {
  assert(headers.includes(value), `_headers に必須設定がありません: ${value}`);
}

const redirects = await readFile(resolve('dist', '_redirects'), 'utf8');
for (const redirect of [
  '/support /support/ 301',
  '/privacy /privacy/ 301',
  '/terms /terms/ 301',
  '/legal /legal/ 301',
  '/tools/slot-balance /tools/slot-balance/ 301',
  '/products/slarog /products/slarog/ 301',
  '/en /en/ 301',
  '/ja /ja/ 301',
  '/products/playlist-toolkit /products/playlist-toolkit/ 301',
  '/products/playlist-toolkit/ja /products/playlist-toolkit/ja/ 301',
]) {
  assert(redirects.includes(redirect), `_redirects に必須設定がありません: ${redirect}`);
}

const index = await readFile(resolve('dist', 'index.html'), 'utf8');
const englishHome = await readFile(resolve('dist', 'en', 'index.html'), 'utf8');
const japaneseHome = await readFile(resolve('dist', 'ja', 'index.html'), 'utf8');
const slarog = await readFile(resolve('dist', 'products', 'slarog', 'index.html'), 'utf8');
for (const [name, html] of [
  ['index', index],
  ['en/index', englishHome],
  ['ja/index', japaneseHome],
  ['products/slarog/index', slarog],
]) {
  assert(
    html.includes('https://x.com/NKIS_Works') || html.includes('https://x.com/slarog_app'),
    `${name} に公式Xリンクがありません。`,
  );
}

for (const route of productRoutes) {
  const html = await readFile(resolve('dist', route.slice(1), 'index.html'), 'utf8');
  assert(html.includes('<!doctype html>'), `${route} がHTMLではありません。`);
  assert(html.includes('canonical'), `${route} にcanonicalがありません。`);
}

console.log(`dist check passed: ${files.length} files.`);

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const nextPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      output.push(...(await listFiles(resolve(directory, entry.name), nextPrefix)));
    } else {
      output.push(nextPrefix);
    }
  }
  return output.sort();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
