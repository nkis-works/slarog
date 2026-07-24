# NKIS Works / Slarog Website

スラログ公式サイトの静的ファイル一式です。公開物は `pnpm run build` で `dist/` に生成します。

## 構成

```text
index.html
support.html
privacy.html
terms.html
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

`preflight` は静的ビルド、商用仕様のunit test、内部リンク・画像参照・ページ内アンカーの検査を実行します。モバイル幅・デスクトップ幅のPlaywright Visual QAは、生成後の `dist/` を対象に実施します。

## GitHub Pages 公開手順

公開するまでは GitHub Pages を有効化しないでください。公開時は次の設定でそのまま配信できます。

1. GitHub にリポジトリを作成する
2. このディレクトリの中身をリポジトリ直下に置く
3. Settings → Pages → Source: `Deploy from a branch`
4. Branch: `main` / Folder: `/(root)`
5. Save

正式公開URLは `https://nkisworks.com/` です。

## 公開前チェック

- `slarog.app@gmail.com` が実際に受信できることを確認する
- App Store / Google Play 公開後のURLを追加する
- 価格、無料期間、サブスクリプション条件をサイト、ストア説明、アプリ内表示で一致させる
- 法人化後の正式名称、所在地、連絡先、特商法表記が必要な場合は追加する

実際のApp Store URLが確定するまでは、偽リンクや推測URLを置かず「準備中」表示を維持します。公開時の差し替え手順は `RELEASE_CHECKLIST.md` を参照してください。

## 表現方針

「設定がわかる」「勝てる」「高設定を見抜く」などの断定・攻略系表現は使わず、「過去の記録を整理して、ホール・機種・曜日ごとの動きや偏りを振り返る材料にする」という表現に統一しています。
