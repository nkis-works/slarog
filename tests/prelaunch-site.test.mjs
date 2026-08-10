import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageNames = ["index", "support", "privacy", "terms", "legal", "404"];
const pages = Object.fromEntries(
  await Promise.all(pageNames.map(async (name) => [
    name,
    await readFile(new URL(`../${name}.html`, import.meta.url), "utf8"),
  ])),
);
const all = Object.values(pages).join("\n");
const redirects = await readFile(new URL("../dist/_redirects", import.meta.url), "utf8");
const robots = await readFile(new URL("../dist/robots.txt", import.meta.url), "utf8");
const prelaunchCss = await readFile(new URL("../assets/prelaunch.css", import.meta.url), "utf8");
const logo = await readFile(new URL("../assets/slarog_logo.png", import.meta.url));
const toolkitLocales = ["", "ja/", "de/", "es/", "fr/", "it/", "pt-br/"];
const toolkitPages = Object.fromEntries(
  await Promise.all(toolkitLocales.flatMap((locale) => ["", "privacy/", "support/", "terms/"].map(async (page) => {
    const key = `${locale}${page}` || "en";
    return [key, await readFile(new URL(`../dist/products/playlist-toolkit/${locale}${page}index.html`, import.meta.url), "utf8")];
  }))),
);
const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
const headers = await readFile(new URL("../dist/_headers", import.meta.url), "utf8");

test("all pages are excluded from search before launch", () => {
  for (const page of Object.values(pages)) {
    assert.match(page, /noindex, nofollow, noarchive, nosnippet/);
  }
  assert.equal(
    robots,
    "User-agent: *\nAllow: /\n",
    "crawlers must be allowed to revisit pages and observe noindex",
  );
});

test("maintenance top contains only the approved prelaunch essentials", () => {
  for (const text of [
    "公式サイト公開準備中",
    "App Store",
    "Google Play",
    "slarog.app@gmail.com",
    "© 2026 NKIS Works. All Rights Reserved.",
  ]) {
    assert.match(pages.index, new RegExp(text));
  }
  for (const forbidden of ["月額", "機能一覧", "pages.dev", "github.io", "nkis.base@gmail.com", "070-2363-5829"]) {
    assert.doesNotMatch(pages.index, new RegExp(forbidden));
  }
});

test("maintenance logo preserves its source aspect ratio inside the square frame", () => {
  assert.equal(logo.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(logo.readUInt32BE(16), 2508);
  assert.equal(logo.readUInt32BE(20), 627);
  assert.match(pages.index, /class="app-logo-frame"/);
  assert.match(
    pages.index,
    /class="app-logo-image"[^>]*width="112" height="28"/,
  );
  assert.match(prelaunchCss, /\.app-logo-frame\s*{[^}]*aspect-ratio:\s*1;/s);
  assert.match(
    prelaunchCss,
    /\.app-logo-image\s*{[^}]*width:\s*100%;[^}]*height:\s*auto;/s,
  );
});

test("commercial terms match the approved local trial contract", () => {
  for (const text of ["初回の正常なグラフ保存", "14日間", "月額380円", "自動的に料金が発生することはありません"]) {
    assert.match(all, new RegExp(text));
  }
  for (const retired of ["500円", "780円", "300円", "7日間無料", "無料1台", "期限なし無料", "nkis-works.github.io", "support@nkisworks.com"]) {
    assert.doesNotMatch(all, new RegExp(retired));
  }
});

test("support and operator contacts use their intended roles", () => {
  assert.match(pages.support, /slarog\.app@gmail\.com/);
  assert.doesNotMatch(pages.support, /070-2363-5829/);
  assert.match(pages.legal, /nkis\.base@gmail\.com/);
  assert.match(pages.legal, /070-2363-5829/);
});

test("all legal and support URL variants normalize with an explicit 301", () => {
  for (const page of ["support", "privacy", "terms", "legal"]) {
    assert.match(redirects, new RegExp(`^/${page} /${page}/ 301$`, "m"));
    assert.match(redirects, new RegExp(`^/${page}\\.html /${page}/ 301$`, "m"));
  }
});

test("playlist toolkit publishes seven localized static page sets", () => {
  assert.equal(Object.keys(toolkitPages).length, 28);
  for (const html of Object.values(toolkitPages)) {
    assert.match(html, /Playlist Toolkit/);
    assert.match(html, /rel="canonical"/);
    assert.match(html, /hreflang="x-default"/);
    assert.match(html, /slarog\.app@gmail\.com|products\/playlist-toolkit/);
    assert.doesNotMatch(html, /Amazon (?:logo|official)|Official Amazon/i);
  }
});

test("playlist toolkit is indexable only on the custom domain", () => {
  assert.match(headers, /https:\/\/nkisworks-site\.pages\.dev\/\*/);
  assert.match(headers, /X-Robots-Tag: noindex/);
  assert.doesNotMatch(headers, /^\/\*\n\s+X-Robots-Tag:/m);
  for (const locale of toolkitLocales) {
    for (const page of ["", "privacy/", "support/", "terms/"]) {
      assert.match(sitemap, new RegExp(`https://nkisworks\\.com/products/playlist-toolkit/${locale}${page}`));
    }
  }
});
