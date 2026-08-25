# NKIS Works / Slarog Website

スラログ公式サイトの静的ファイル一式です。検索除外するブランチプレビューは `pnpm run build:preview`、本番用成果物は `pnpm run build:production` で `dist/` に生成します。

## 構成

```text
index.html              スラログ公式サイト
en/index.html           NKIS Works英語版案内
support.html            サポート
privacy.html            プライバシーポリシー
terms.html              利用規約
legal.html              販売者情報
404.html                GitHub Pages用404
robots.txt
sitemap.xml
.nojekyll
.gitignore
assets/
  styles.css
  app.js
  favicon.svg
  og-image.svg
  prelaunch.css
  slarog_logo.png
tools/slot-balance/
  index.html
  assets/
  src/
  tests/
  e2e/
products/playlist-toolkit/  Playlist Toolkit多言語製品ページ（ビルド時生成）
scripts/
  build.mjs
  build-slot-balance.mjs
  check-dist.mjs
  check-links.mjs
tests/
  site-content.test.mjs
package.json
```

## ローカル確認・リリース前テスト

`/` は日本国内向けのスラログ公式サイト、`/en/` は英語圏向けのNKIS Works案内として独立配信します。`/products/playlist-toolkit/` 以下は審査・法務確認用の直接URLだけを維持し、正式リリースまではスラログ公式サイトからリンクせず、sitemapにも掲載せず、検索除外します。ブラウザ言語による強制転送は行いません。

スロバランスは`tools/slot-balance/`にあり、公式サイトのナビゲーション、トップページ、サポートから遷移できます。広告とアクセス解析は有効化していません。

Node.js 20以降とpnpmを使用します。初回は `pnpm install` で開発用パッケージを準備します。

```sh
pnpm run preflight
python3 -m http.server 4173 --directory dist
```

`preflight` は検索除外プレビューの静的ビルド、公式サイトと無料計算ツールのunit test、配布物の許可リスト・CSP・秘密情報・旧表現、内部リンク・画像参照・ページ内アンカーを検査します。ブラウザ操作は `pnpm run test:e2e`、生成後の配布物は `pnpm run test:e2e:dist` で確認します。

無料計算ツールの正式URLは `https://nkisworks.com/tools/slot-balance/` です。入力値はブラウザ内だけで計算し、サーバー送信や自動保存を行いません。

## Cloudflare Pages 公開方針

ブランチプレビューにはHTMLとHTTPヘッダーの両方で検索除外を設定します。本番ビルドだけを公開ドメインへ配信します。

正式公開URLは `https://nkisworks.com/` です。

## 公開前チェック

- `slarog.app@gmail.com` が実際に受信できることを確認する
- App Store（`https://apps.apple.com/jp/app/スラログ/id6792632919`）とGoogle Play（`https://play.google.com/store/apps/details?id=jp.yuya.slumparchive`）を一般ユーザーとして開けることを確認する
- 価格、無料期間、サブスクリプション条件をサイト、ストア説明、アプリ内表示で一致させる
- ストア登録情報と照合済みの正式住所を販売者情報へ記載する

ストアURLはアプリID／packageと対応済みです。公開時の確認手順は `RELEASE_CHECKLIST.md` を参照してください。

## 表現方針

「設定がわかる」「勝てる」「高設定を見抜く」などの断定・攻略系表現は使わず、画像からグラフを作成・保存・連結し、あとから振り返るための記録アプリとして表現します。
