import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(".");
const dist = resolve("dist");
const mode = process.argv.includes("--production") ? "production" : "preview";
const pages = ["support", "privacy", "terms", "legal"];
const routeFiles = [["index.html", "index.html"], ["404.html", "404.html"]];
const noindex = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">';
const baseHeaders = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'
`;
const previewHeaders = `/*
  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
${baseHeaders.slice(3)}`;
const redirects = pages.map((page) => `/${page}.html /${page}/ 301`).join("\n") + "\n";

function render(html) {
  if (mode !== "preview" || html.includes('name="robots"')) return html;
  return html.replace("<head>", `<head>\n  ${noindex}`);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const [source, target] of routeFiles) {
  const html = await readFile(resolve(root, source), "utf8");
  await writeFile(resolve(dist, target), render(html));
}

for (const page of pages) {
  await mkdir(resolve(dist, page), { recursive: true });
  const html = await readFile(resolve(root, `${page}.html`), "utf8");
  await writeFile(resolve(dist, page, "index.html"), render(html));
}

await cp(resolve(root, "assets"), resolve(dist, "assets"), { recursive: true });
await writeFile(resolve(dist, ".nojekyll"), "");
await writeFile(resolve(dist, "_headers"), mode === "preview" ? previewHeaders : baseHeaders);
await writeFile(resolve(dist, "_redirects"), redirects);

if (mode === "preview") {
  await writeFile(resolve(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
  await writeFile(
    resolve(dist, "sitemap.xml"),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n',
  );
} else {
  await writeFile(resolve(dist, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://nkisworks.com/sitemap.xml\n");
  const urls = ["", ...pages.map((page) => `${page}/`)]
    .map((path) => `  <url><loc>https://nkisworks.com/${path}</loc></url>`)
    .join("\n");
  await writeFile(
    resolve(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
}

const output = await readdir(dist);
console.log(`Built ${mode} distribution with ${output.length} top-level entries.`);
