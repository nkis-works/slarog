# NKIS Works / Slarog Website

スラログ公式サイトの静的ファイル一式です。検索除外するブランチプレビューは `pnpm run build:preview`、本番用成果物は `pnpm run build:production` で `dist/` に生成します。

## 構成

```text
index.html
support.html
privacy.html
terms.html
legal.html
404.html
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
scripts/
  build.mjs
  check-links.mjs
tests/
  site-content.test.mjs
package.json
```

## ローカル確認・リリース前テスト

Node.js 20以降とpnpmを使用します。外部パッケージはありません。

```sh
pnpm run preflight
python3 -m http.server 4173 --directory dist
```

`preflight` は検索除外プレビューの静的ビルド、商用仕様のunit test、内部リンク・画像参照・ページ内アンカーの検査を実行します。モバイル幅・デスクトップ幅のVisual QAは、生成後の `dist/` を対象に実施します。

## Cloudflare Pages 公開方針

本物サイトは退避ブランチからCloudflare Pagesのブランチプレビューだけへ配信し、公開ドメインのルートへは切り替えません。ブランチプレビューにはHTMLとHTTPヘッダーの両方で検索除外を設定します。

正式公開URLは `https://nkisworks.com/` です。

## 公開前チェック

- `slarog.app@gmail.com` が実際に受信できることを確認する
- App Store / Google Play 公開後のURLを追加する
- 価格、無料期間、サブスクリプション条件をサイト、ストア説明、アプリ内表示で一致させる
- ストア登録情報と照合済みの正式住所を販売者情報へ記載する

実際のApp Store URLが確定するまでは、偽リンクや推測URLを置かず「準備中」表示を維持します。公開時の差し替え手順は `RELEASE_CHECKLIST.md` を参照してください。

## 表現方針

「設定がわかる」「勝てる」「高設定を見抜く」などの断定・攻略系表現は使わず、画像からグラフを作成・保存・連結し、あとから振り返るための記録アプリとして表現します。
