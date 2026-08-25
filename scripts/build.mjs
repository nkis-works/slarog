import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { createSlotBalanceBundle, SLOT_BALANCE_BUNDLE } from './build-slot-balance.mjs';
import { buildPlaylistToolkit, playlistToolkitRoutes } from './build-playlist-toolkit.mjs';

const root = resolve('.');
const dist = resolve('dist');
const mode = process.argv.includes('--production') ? 'production' : 'preview';
const pages = ['support', 'privacy', 'terms', 'legal'];
const productRoutes = playlistToolkitRoutes();
const routeFiles = [
  ['index.html', 'index.html'],
  ['404.html', '404.html'],
];
const noindex = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">';
const baseHeaders = `/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'
`;
const previewHeaders = `/*
  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
${baseHeaders.slice(3)}`;
const redirects =
  [
    ...pages.flatMap((page) => [`/${page} /${page}/ 301`, `/${page}.html /${page}/ 301`]),
    '/tools/slot-balance /tools/slot-balance/ 301',
    '/tools/slot-balance/index.html /tools/slot-balance/ 301',
    '/en /en/ 301',
    '/en/index.html /en/ 301',
    ...productRoutes.flatMap((route) => [
      `${route.slice(0, -1)} ${route} 301`,
      `${route}index.html ${route} 301`,
    ]),
  ].join('\n') + '\n';

function render(html) {
  if (mode !== 'preview' || html.includes('name="robots"')) return html;
  return html.replace('<head>', `<head>\n  ${noindex}`);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(resolve(dist, 'tools', 'slot-balance', 'assets'), { recursive: true });

const slotBalanceBundle = await createSlotBalanceBundle();
await writeFile(resolve(root, SLOT_BALANCE_BUNDLE), slotBalanceBundle);
await writeFile(
  resolve(dist, 'tools', 'slot-balance', 'assets', 'slot-balance-app.js'),
  slotBalanceBundle,
);

for (const [source, target] of routeFiles) {
  const html = await readFile(resolve(root, source), 'utf8');
  await writeFile(resolve(dist, target), render(html));
}

for (const page of pages) {
  await mkdir(resolve(dist, page), { recursive: true });
  const html = await readFile(resolve(root, `${page}.html`), 'utf8');
  await writeFile(resolve(dist, page, 'index.html'), render(html));
}

await mkdir(resolve(dist, 'en'), { recursive: true });
const englishHome = await readFile(resolve(root, 'en', 'index.html'), 'utf8');
await writeFile(resolve(dist, 'en', 'index.html'), render(englishHome));

await buildPlaylistToolkit(dist);
for (const route of productRoutes) {
  const productPage = resolve(dist, route.slice(1), 'index.html');
  const html = await readFile(productPage, 'utf8');
  await writeFile(productPage, render(html));
}

const toolHtml = await readFile(resolve(root, 'tools', 'slot-balance', 'index.html'), 'utf8');
await writeFile(resolve(dist, 'tools', 'slot-balance', 'index.html'), render(toolHtml));
await cp(
  resolve(root, 'tools', 'slot-balance', 'assets', 'styles.css'),
  resolve(dist, 'tools', 'slot-balance', 'assets', 'styles.css'),
);

await cp(resolve(root, 'assets'), resolve(dist, 'assets'), { recursive: true });
await writeFile(resolve(dist, '.nojekyll'), '');
await writeFile(resolve(dist, '_headers'), mode === 'preview' ? previewHeaders : baseHeaders);
await writeFile(resolve(dist, '_redirects'), redirects);

if (mode === 'preview') {
  await writeFile(resolve(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  await writeFile(
    resolve(dist, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n',
  );
} else {
  await writeFile(
    resolve(dist, 'robots.txt'),
    'User-agent: *\nAllow: /\nSitemap: https://nkisworks.com/sitemap.xml\n',
  );
  const urls = [
    '',
    ...pages.map((page) => `${page}/`),
    'tools/slot-balance/',
    'en/',
    ...productRoutes.map((route) => route.slice(1)),
  ]
    .map((path) => `  <url><loc>https://nkisworks.com/${path}</loc></url>`)
    .join('\n');
  await writeFile(
    resolve(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
}

const output = await readdir(dist);
console.log(`Built ${mode} distribution with ${output.length} top-level entries.`);
