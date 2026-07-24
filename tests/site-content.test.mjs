import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = {
  index: await readFile(new URL("../index.html", import.meta.url), "utf8"),
  support: await readFile(new URL("../support.html", import.meta.url), "utf8"),
  privacy: await readFile(new URL("../privacy.html", import.meta.url), "utf8"),
  terms: await readFile(new URL("../terms.html", import.meta.url), "utf8"),
  og: await readFile(new URL("../assets/og-image.svg", import.meta.url), "utf8"),
};
const publicCopy = Object.values(pages).join("\n");

test("formal commercial terms are present", () => {
  for (const text of ["14日間", "380", "自動更新"]) {
    assert.match(publicCopy, new RegExp(text));
  }
  assert.match(pages.terms, /1か月/);
  assert.match(pages.terms, /アプリを削除しただけでは解約されません/);
  assert.match(pages.terms, /Standard EULA/);
});

test("retired commercial terms are absent", () => {
  for (const text of [
    "無料プラン",
    "実台1台",
    "1台まで",
    "月額500",
    "¥500",
    "500円",
    "月額300",
    "月額780",
    "7日間無料",
  ]) {
    assert.doesNotMatch(publicCopy, new RegExp(text), `retired copy found: ${text}`);
  }
});

test("privacy copy matches the iOS implementation", () => {
  assert.match(pages.privacy, /端末内/);
  assert.match(pages.privacy, /広告SDK、アクセス解析SDK、クラッシュ解析SDK、独自サーバーを使用せず/);
  assert.match(pages.privacy, /AppleのApp StoreおよびStoreKit/);
});

test("release page is not presented as already published", () => {
  assert.match(pages.index, /App Store 準備中/);
  assert.doesNotMatch(pages.index, /apps\.apple\.com/);
});

test("only local application JavaScript is loaded", () => {
  for (const html of Object.values(pages).filter((value) => value.includes("<!doctype html>"))) {
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(scripts, ["assets/app.js"]);
  }
});
