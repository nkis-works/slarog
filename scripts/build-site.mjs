import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { createSlotAnalysisBundle, SLOT_ANALYSIS_BUNDLE } from './build-slot-analysis.mjs';
import { validateDist } from './check-dist.mjs';

const mode = process.argv[2];
if (!['preview', 'production'].includes(mode)) {
  throw new Error('build-site.mjs には preview または production を指定してください。');
}

const siteOrigin = mode === 'production' ? validateSiteOrigin(process.env['SITE_ORIGIN']) : null;
const root = resolve('.');
const dist = resolve('dist');
const lastModified = '2026-07-19';
const htmlFiles = ['index.html', 'support.html', 'privacy.html', 'terms.html', '404.html'];
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
].join('; ');

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, 'tools/slot-analysis/assets'), { recursive: true });

const bundle = await createSlotAnalysisBundle();
await writeFile(resolve(root, SLOT_ANALYSIS_BUNDLE), bundle);
await writeFile(resolve(dist, 'tools/slot-analysis/assets/slot-analysis-app.js'), bundle);

await cp(resolve(root, 'assets'), resolve(dist, 'assets'), { recursive: true });
await cp(
  resolve(root, 'tools/slot-analysis/assets/styles.css'),
  resolve(dist, 'tools/slot-analysis/assets/styles.css'),
);

for (const file of htmlFiles) {
  const source = await readFile(resolve(root, file), 'utf8');
  await writeFile(resolve(dist, file), prepareHtml(source, file));
}

const toolSource = await readFile(resolve(root, 'tools/slot-analysis/index.html'), 'utf8');
await writeFile(
  resolve(dist, 'tools/slot-analysis/index.html'),
  prepareHtml(toolSource, 'tools/slot-analysis/'),
);

await writeFile(resolve(dist, 'robots.txt'), createRobots());
await writeFile(resolve(dist, 'sitemap.xml'), createSitemap());

const headersTemplate = await readFile(resolve(root, 'deploy/cloudflare/_headers'), 'utf8');
const headers =
  mode === 'preview'
    ? `${headersTemplate.trimEnd()}\n  X-Robots-Tag: noindex, nofollow\n`
    : headersTemplate;
await writeFile(resolve(dist, '_headers'), headers);
await cp(resolve(root, 'deploy/cloudflare/_redirects'), resolve(dist, '_redirects'));

await validateDist({ expectedMode: mode, expectedOrigin: siteOrigin });

function prepareHtml(source, page) {
  let html = source
    .replace(/\s*<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?>/i, '')
    .replace(/\s*<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="og:url"[^>]*>/gi, '');

  const securityMeta = `\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`;
  html = html.replace(/(<meta\s+name="viewport"[^>]*>)/i, `$1${securityMeta}`);

  if (mode === 'preview' || page === '404.html') {
    return html.replace(
      /(<meta\s+name="viewport"[^>]*>)/i,
      '$1\n    <meta name="robots" content="noindex, nofollow">',
    );
  }

  const url = `${siteOrigin}${page === 'index.html' ? '/' : `/${page}`}`;
  const discovery = `\n    <link rel="canonical" href="${url}">\n    <meta property="og:url" content="${url}">`;
  return html.replace(/(<meta\s+name="viewport"[^>]*>)/i, `$1${discovery}`);
}

function createRobots() {
  if (mode === 'preview') {
    return 'User-agent: *\nDisallow: /\n';
  }

  return `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`;
}

function createSitemap() {
  const opening =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  if (mode === 'preview') {
    return `${opening}\n</urlset>\n`;
  }

  const paths = ['/', '/support.html', '/privacy.html', '/terms.html', '/tools/slot-analysis/'];
  const entries = paths
    .map((path) => `  <url><loc>${siteOrigin}${path}</loc><lastmod>${lastModified}</lastmod></url>`)
    .join('\n');
  return `${opening}\n${entries}\n</urlset>\n`;
}

function validateSiteOrigin(value) {
  if (!value) {
    throw new Error('production build には SITE_ORIGIN が必要です。');
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('SITE_ORIGIN は有効なHTTPSオリジンで指定してください。');
  }

  const blockedHost = /(^|\.)(localhost|pages\.dev|github\.io)$/i.test(url.hostname);
  const hasExtraParts = url.pathname !== '/' || Boolean(url.search) || Boolean(url.hash);
  if (url.protocol !== 'https:' || blockedHost || hasExtraParts || url.username || url.password) {
    throw new Error(
      'SITE_ORIGIN はパス・クエリ・フラグメントを含まない公開用HTTPSオリジンで指定してください。',
    );
  }

  return url.origin;
}
