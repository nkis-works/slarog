import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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
  'tools/slot-balance/index.html',
  'tools/slot-balance/assets/styles.css',
  'tools/slot-balance/assets/slot-balance-app.js',
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
  "frame-ancestors 'none'",
]) {
  assert(headers.includes(value), `_headers に必須設定がありません: ${value}`);
}
assert(!/unsafe-inline|unsafe-eval/i.test(headers), 'CSPにunsafe指定があります。');

const redirects = await readFile(resolve('dist', '_redirects'), 'utf8');
for (const rule of [
  '/support /support/ 301',
  '/privacy /privacy/ 301',
  '/terms /terms/ 301',
  '/legal /legal/ 301',
  '/tools/slot-balance /tools/slot-balance/ 301',
  '/tools/slot-balance/index.html /tools/slot-balance/ 301',
]) {
  assert(redirects.includes(rule), `_redirects に必須ルールがありません: ${rule}`);
}

const toolHtml = await readFile(resolve('dist', 'tools', 'slot-balance', 'index.html'), 'utf8');
for (const copy of ['スロバランス', '無料・登録不要', '端末内で計算', '保存・送信されません']) {
  assert(toolHtml.includes(copy), `ツールに必須文言がありません: ${copy}`);
}

const preview = headers.includes('X-Robots-Tag: noindex');
const robots = await readFile(resolve('dist', 'robots.txt'), 'utf8');
const sitemap = await readFile(resolve('dist', 'sitemap.xml'), 'utf8');
if (preview) {
  assert(robots === 'User-agent: *\nDisallow: /\n', 'preview robots.txtが一致しません。');
  assert(!/<loc>/i.test(sitemap), 'preview sitemapに公開URLがあります。');
} else {
  assert(
    robots.includes('Sitemap: https://nkisworks.com/sitemap.xml'),
    'production sitemap参照がありません。',
  );
  assert(
    (sitemap.match(/https:\/\/nkisworks\.com\/tools\/slot-balance\//g) ?? []).length === 1,
    'ツールURLはsitemapに1件だけ必要です。',
  );
}

const sourceBundle = await readFile(
  resolve('tools', 'slot-balance', 'assets', 'slot-balance-app.js'),
);
const distBundle = await readFile(
  resolve('dist', 'tools', 'slot-balance', 'assets', 'slot-balance-app.js'),
);
assert(sourceBundle.equals(distBundle), '生成bundleと配布bundleが一致しません。');

console.log(`dist check: ${files.length} files`);

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      return entry.isDirectory() ? listFiles(resolve(directory, entry.name), relative) : [relative];
    }),
  );
  return nested.flat().sort();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
