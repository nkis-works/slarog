import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const requiredFiles = new Set([
  'index.html',
  'support.html',
  'privacy.html',
  'terms.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  '_redirects',
  'tools/slot-analysis/index.html',
  'tools/slot-analysis/assets/styles.css',
  'tools/slot-analysis/assets/slot-analysis-app.js',
]);
const prototypeFiles = new Set([
  'prototypes/slarog-home-redesign/index.html',
  'prototypes/slarog-home-redesign/comparison.css',
  'prototypes/slarog-home-redesign/a/index.html',
  'prototypes/slarog-home-redesign/a/styles.css',
  'prototypes/slarog-home-redesign/b/index.html',
  'prototypes/slarog-home-redesign/b/styles.css',
]);
const exactCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'self'",
].join('; ');
const metaCsp = exactCsp.replace("; frame-ancestors 'none'", '');

export async function validateDist({ expectedMode, expectedOrigin, allowPrototypes = false } = {}) {
  const dist = resolve('dist');
  const files = await listFiles(dist);
  const fileSet = new Set(files);

  for (const required of requiredFiles) {
    assert(fileSet.has(required), `dist に必須ファイルがありません: ${required}`);
  }
  if (allowPrototypes) {
    for (const prototype of prototypeFiles) {
      assert(fileSet.has(prototype), `prototype preview に必須ファイルがありません: ${prototype}`);
    }
  }

  for (const file of files) {
    const allowed =
      requiredFiles.has(file) ||
      file.startsWith('assets/') ||
      (allowPrototypes && prototypeFiles.has(file));
    assert(allowed, `dist の許可リスト外ファイルです: ${file}`);
    assert(
      !/(^|\/)(?:node_modules|docs?|tests?|e2e|artifacts?|src)(?:\/|$)/i.test(file),
      `dist に開発用ディレクトリを含められません: ${file}`,
    );
    assert(
      !/(?:\.tsx?|\.map|package(?:-lock)?\.json|(?:^|\/)\.[^/]*env|config\.[^/]+)$/i.test(file),
      `dist に公開禁止ファイルを含められません: ${file}`,
    );
  }

  const textEntries = await Promise.all(
    files
      .filter((file) => /\.(?:html|css|js|txt|xml)$/.test(file) || file.startsWith('_'))
      .map(async (file) => [file, await readFile(resolve(dist, file), 'utf8')]),
  );
  const allText = textEntries.map(([, content]) => content).join('\n');
  assert(
    !/(?:ca-pub-\d+|adsbygoogle|googlesyndication|data-ad-client|data-ad-slot)/i.test(allText),
    'dist に広告IDまたは広告配信コードを含められません。',
  );
  assert(!/sourceMappingURL/i.test(allText), 'dist にソースマップ参照を含められません。');
  assert(
    !/(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16})/.test(allText),
    'dist に秘密情報らしき文字列を含められません。',
  );

  const toolHtml = await readFile(resolve(dist, 'tools/slot-analysis/index.html'), 'utf8');
  assert(
    (toolHtml.match(/SLOT_ANALYSIS_MANUAL_AD_INSERTION_POINT/g) ?? []).length === 1,
    '手動広告の挿入位置は1か所だけ必要です。',
  );
  assert(
    !/<(?:iframe|script)[^>]+(?:googlesyndication|doubleclick|google-analytics|googletagmanager)/i.test(
      allText,
    ),
    'dist に広告・解析用の外部実行要素を含められません。',
  );
  assert(
    !/<form[^>]+action\s*=\s*["'](?:https?:)?\/\//i.test(allText),
    'dist のフォームを外部送信先へ接続できません。',
  );
  assert(
    !/(?:Phase\s*(?:1|2|2A|2B)|MVP|実装中|開発用|TODO|\bdebug\b)/i.test(
      textEntries
        .filter(([file]) => file.endsWith('.html'))
        .map(([, content]) => content)
        .join('\n'),
    ),
    '公開HTMLに制作途中の文言があります。',
  );

  const trackedBundle = await readFile(resolve('tools/slot-analysis/assets/slot-analysis-app.js'));
  const distBundle = await readFile(
    resolve(dist, 'tools/slot-analysis/assets/slot-analysis-app.js'),
  );
  assert(trackedBundle.equals(distBundle), '追跡bundleとdist bundleが一致しません。');

  const headers = await readFile(resolve(dist, '_headers'), 'utf8');
  for (const line of [
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'X-Frame-Options: DENY',
    'Permissions-Policy:',
    `Content-Security-Policy: ${exactCsp}`,
  ]) {
    assert(headers.includes(line), `_headers に必須設定がありません: ${line}`);
  }
  assert(!/unsafe-inline|unsafe-eval/i.test(headers), '_headers のCSPにunsafe指定があります。');
  for (const rule of [
    'https://nkisworks-site.pages.dev/*\n  X-Robots-Tag: noindex',
    'https://:version.nkisworks-site.pages.dev/*\n  X-Robots-Tag: noindex',
  ]) {
    assert(headers.includes(rule), `_headers にpages.devのnoindex設定がありません: ${rule}`);
  }

  const redirects = await readFile(resolve(dist, '_redirects'), 'utf8');
  assert(
    redirects.trim() ===
      '/tools/slot-balance /tools/slot-analysis/ 301\n/tools/slot-balance/ /tools/slot-analysis/ 301\n/tools/slot-balance/index.html /tools/slot-analysis/ 301\n/tools/slot-analysis /tools/slot-analysis/ 301\n/tools/slot-analysis/index.html /tools/slot-analysis/ 301',
    '_redirects が承認済みの旧URL転送と末尾スラッシュ正規化だけになっていません。',
  );

  const htmlEntries = textEntries.filter(([file]) => file.endsWith('.html'));
  for (const [file, html] of htmlEntries) {
    const cspMatch = html.match(
      /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"\s*>/i,
    );
    assert(cspMatch?.[1] === metaCsp, `${file} のmeta CSPが配布用CSPと一致しません。`);
  }

  const preview = headers.includes('X-Robots-Tag: noindex, nofollow');
  if (expectedMode) {
    assert(preview === (expectedMode === 'preview'), 'dist の公開モードが指定と一致しません。');
  }

  const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8');
  const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
  if (preview) {
    assert(robots === 'User-agent: *\nDisallow: /\n', 'previewのrobots.txtは全面拒否が必要です。');
    assert(!/<loc>/i.test(sitemap), 'previewのsitemap.xmlに公開URLを含められません。');
    for (const [file, html] of htmlEntries) {
      assert(
        /<meta\s+name="robots"\s+content="noindex, nofollow">/i.test(html),
        `${file} にnoindexがありません。`,
      );
      assert(
        !/rel="canonical"|property="og:url"/i.test(html),
        `${file} にpreview用でない公開URLがあります。`,
      );
    }
    assert(
      !/(?:pages\.dev|github\.io|localhost)/i.test(`${robots}\n${sitemap}`),
      'previewの探索ファイルに公開用ホストがあります。',
    );
  } else {
    const origin = expectedOrigin ?? extractOrigin(robots);
    assert(Boolean(origin), 'production dist の公開オリジンを判定できません。');
    assert(
      !/(?:localhost|pages\.dev|github\.io)/i.test(origin),
      '公開禁止ホストが使われています。',
    );
    assert(
      robots.includes(`Sitemap: ${origin}/sitemap.xml`),
      'robots.txtのsitemap URLが一致しません。',
    );
    const publicPages = htmlEntries.filter(([file]) => file !== '404.html');
    for (const [file, html] of publicPages) {
      assert(
        /rel="canonical"/i.test(html) && /property="og:url"/i.test(html),
        `${file} に公開URLメタデータがありません。`,
      );
    }
    assert(
      (sitemap.match(new RegExp(`${escapeRegExp(origin)}/tools/slot-analysis/`, 'g')) ?? [])
        .length === 1,
      'sitemap.xmlのスロット出玉分析URLは末尾スラッシュ付きで1件だけ必要です。',
    );
    assert(!sitemap.includes('/tools/slot-balance'), 'sitemap.xmlに旧URLを含められません。');
  }

  return { files };
}

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

function extractOrigin(robots) {
  return robots.match(/^Sitemap:\s+(https:\/\/[^/]+)\/sitemap\.xml$/m)?.[1];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  const result = await validateDist({
    allowPrototypes: process.env['ALLOW_SLAROG_PROTOTYPES'] === '1',
  });
  console.log(`dist check: ${result.files.length} files`);
}
