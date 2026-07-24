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
const og = await readFile(new URL("../assets/og-image.svg", import.meta.url), "utf8");
const publicCopy = `${Object.values(pages).join("\n")}\n${og}`;

test("main message and feature priorities match the approved product", () => {
  assert.match(pages.index, /スランプグラフを、[\s\S]*保存してつなぐ/);
  for (const text of ["作成", "保存", "アーカイブ", "連結", "カレンダー", "PNG"]) {
    assert.match(pages.index, new RegExp(text));
  }
});

test("commercial terms match the app-local trial contract", () => {
  for (const text of [
    "初回の正常なグラフ保存",
    "14日間",
    "月額380円",
    "未登録のまま自動的に料金が発生することはありません",
    "App Store",
    "Google Play",
  ]) {
    assert.match(publicCopy, new RegExp(text));
  }
  assert.match(pages.terms, /ストア側の追加無料トライアルはありません/);
  assert.match(pages.support, /購入を復元/);
});

test("retired terms and prohibited claims are absent", () => {
  for (const text of [
    "無料1台",
    "1台まで無料",
    "期限なし無料",
    "月額500",
    "¥500",
    "500円",
    "月額300",
    "月額780",
    "7日無料",
    "7日間無料",
    "support@nkisworks.com",
    "nkis-works.github.io",
    "pages.dev",
    "勝てる",
    "稼げる",
    "高設定判別",
    "必勝",
    "未来予測",
    "勝率向上",
    "利益保証",
    "出玉保証",
  ]) {
    assert.doesNotMatch(publicCopy, new RegExp(text), `retired or prohibited copy found: ${text}`);
  }
});

test("privacy copy matches both platform implementations", () => {
  for (const text of ["写真・ファイル選択", "端末内", "Google Play Billing", "Apple StoreKit", "広告SDK", "アクセス解析SDK", "クラッシュ解析SDK"]) {
    assert.match(pages.privacy, new RegExp(text));
  }
});

test("support and operator contacts use their intended roles", () => {
  assert.match(pages.support, /slarog\.app@gmail\.com/);
  assert.doesNotMatch(pages.support, /070-2363-5829/);
  assert.match(pages.legal, /nkis\.base@gmail\.com/);
  assert.match(pages.legal, /070-2363-5829/);
});

test("release page is not presented as already published", () => {
  assert.match(pages.index, /App Store 準備中/);
  assert.match(pages.index, /Google Play 準備中/);
  assert.doesNotMatch(pages.index, /apps\.apple\.com|play\.google\.com/);
});

test("Open Graph metadata uses the generated wide preview artwork", () => {
  assert.match(pages.index, /og-image-v2\.png/);
  assert.match(pages.index, /summary_large_image/);
  assert.match(pages.index, /https:\/\/nkisworks\.com\//);
});

test("only local application JavaScript is loaded", () => {
  for (const html of Object.values(pages).filter((value) => value.includes("<!doctype html>"))) {
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
    if (html === pages.index) {
      assert.deepEqual(scripts, ["assets/app.js"]);
    } else if (html === pages[404]) {
      assert.deepEqual(scripts, ["/assets/app.js"]);
    } else {
      assert.deepEqual(scripts, []);
    }
  }
});

test("confirmed address is required for release deployment", () => {
  if (process.env.REQUIRE_CONFIRMED_ADDRESS !== "1") return;
  assert.doesNotMatch(pages.legal, /確認済みの正式住所をストア登録情報との照合後に記載します/);
});
