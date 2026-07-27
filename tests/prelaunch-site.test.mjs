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

test("all pages are excluded from search before launch", () => {
  for (const page of Object.values(pages)) {
    assert.match(page, /noindex, nofollow, noarchive, nosnippet/);
  }
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
