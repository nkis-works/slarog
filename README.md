# NKIS Works / Slarog Website

スラログ公式サイトの静的ファイル一式です。ビルド不要で、GitHub Pages の `/ (root)` から公開できます。

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
```

## ローカル確認

ブラウザで `index.html` を開けば確認できます。ローカルサーバーで見る場合は次のコマンドを使います。

```bash
python3 -m http.server 4173
```

## GitHub Pages 公開手順

公開するまでは GitHub Pages を有効化しないでください。公開時は次の設定でそのまま配信できます。

1. GitHub にリポジトリを作成する
2. このディレクトリの中身をリポジトリ直下に置く
3. Settings → Pages → Source: `Deploy from a branch`
4. Branch: `main` / Folder: `/(root)`
5. Save

想定公開URLは `https://nkis-works.github.io/slarog/` です。リポジトリ名や独自ドメインを変える場合は、公開直前に `robots.txt` と `sitemap.xml` のURLを差し替えてください。

## 公開前チェック

- `support@nkisworks.com` が実際に受信できることを確認する
- App Store / Google Play 公開後のURLを追加する
- 価格、無料期間、サブスクリプション条件をサイト、ストア説明、アプリ内表示で一致させる
- 法人化後の正式名称、所在地、連絡先、特商法表記が必要な場合は追加する

## 表現方針

「設定がわかる」「勝てる」「高設定を見抜く」などの断定・攻略系表現は使わず、「過去の記録を整理して、ホール・機種・曜日ごとの動きや偏りを振り返る材料にする」という表現に統一しています。
