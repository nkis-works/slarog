import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(".");
const dist = resolve("dist");
const pages = ["support", "privacy", "terms", "legal"];
const headers = `/*
  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Content-Security-Policy: default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'
`;
const redirects = pages.map((page) => `/${page}.html /${page}/ 301`).join("\n") + "\n";

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "assets"), { recursive: true });
await cp(resolve(root, "index.html"), resolve(dist, "index.html"));
await cp(resolve(root, "404.html"), resolve(dist, "404.html"));

for (const page of pages) {
  await mkdir(resolve(dist, page), { recursive: true });
  await cp(resolve(root, `${page}.html`), resolve(dist, page, "index.html"));
}

for (const asset of ["favicon.svg", "prelaunch.css", "slarog_logo.png"]) {
  await cp(resolve(root, "assets", asset), resolve(dist, "assets", asset));
}

await writeFile(resolve(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
await writeFile(
  resolve(dist, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n',
);
await writeFile(resolve(dist, "_headers"), headers);
await writeFile(resolve(dist, "_redirects"), redirects);

const output = await readdir(dist);
console.log(`Built prelaunch distribution with ${output.length} top-level entries.`);
