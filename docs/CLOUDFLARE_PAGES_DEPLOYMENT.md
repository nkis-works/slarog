# Cloudflare Pages 公開手順

## 1. 対象と前提

- GitHub repository: `https://github.com/nkis-works/slarog.git`
- 将来のproduction branch: `main`
- Node.js: 22以上
- npm: 10以上
- install command: `npm ci`
- output directory: `dist`
- preview build: `npm run build:preview`
- production build: `npm run build:production`
- production必須環境変数: `SITE_ORIGIN`

この文書は設定値と順序を固定するための手順書である。Phase 2B0ではCloudflare account、Pages project、DNS、custom domain、SSL、GitHub Pages、AdSenseを変更しない。

## 2. buildの分離

### Preview

branch preview、`pages.dev`確認、ローカルQAは`npm run build:preview`を使う。生成物は次の性質を持つ。

- 全HTMLに`noindex, nofollow`
- `_headers`に`X-Robots-Tag: noindex, nofollow`
- canonicalと`og:url`なし
- `robots.txt`は全面クロール拒否
- `sitemap.xml`はURLなし
- 広告・analyticsなし

### Production

productionは確認済みの公開オリジンを`SITE_ORIGIN`へ指定する。値はHTTPSのoriginだけとし、パス、query、fragment、認証情報を含めない。localhost、`pages.dev`、`github.io`はbuildが拒否する。

production buildは次を生成する。

- ページごとのcanonicalと`og:url`
- 404だけ`noindex, nofollow`
- 公開用`robots.txt`
- スロバランスを末尾スラッシュ付きで1件だけ含む`sitemap.xml`
- preview用`X-Robots-Tag`なし

`SITE_ORIGIN`が未設定ならproduction buildは失敗する。ドメインを推測した値や一時的な値でproductionを作らない。

## 3. Cloudflare Pages project設定候補

project作成はpreview確認の承認後に行う。設定候補は次のとおり。

| 項目                   | 値                  |
| ---------------------- | ------------------- |
| Git provider           | GitHub              |
| Repository             | `nkis-works/slarog` |
| Production branch      | `main`              |
| Root directory         | repository root     |
| Build output directory | `dist`              |
| Node version           | 22以上              |

branchごとにbuildを分ける場合のCloudflare build command候補は次の考え方とする。

```sh
if [ "$CF_PAGES_BRANCH" = "main" ]; then npm run build:production; else npm run build:preview; fi
```

`SITE_ORIGIN`はproduction環境だけに設定する。previewへ設定しない。Dashboardへ登録する前に、利用中のCloudflare Pages仕様でproduction／preview環境変数のスコープを再確認する。

## 4. custom domainの決定

公開前に、所有済みドメインのapexと`www`のどちらをcanonical originにするか決定する。未確認のドメイン名はリポジトリやbuild設定へ書かない。

推奨方針は、公式サイトとして案内する一方をcanonicalに固定し、もう一方を301 redirectすることである。apexをcanonicalにするか`www`をcanonicalにするかは、DNS管理、既存メール、既存URL、ブランド表記を確認して決定する。

## 5. DNS／SSL checklist

1. domainの所有者とDNS管理先を確認する。
2. 既存A、AAAA、CNAME、MX、TXTを記録する。
3. メール用MX／SPF／DKIM／DMARCを変更しないことを確認する。
4. Pagesのcustom domain追加画面が提示するrecordだけを追加する。
5. apex／wwwのcanonical側とredirect側を取り違えない。
6. DNS伝播後、Cloudflare側のdomain statusを確認する。
7. Universal SSL certificateが有効になるまでproduction切替を行わない。
8. HTTPSで証明書名、期限、redirect chain、mixed contentを確認する。
9. HTTPからHTTPS、非canonical hostからcanonical hostが単一の301で収束するか確認する。

## 6. headersとredirects

`deploy/cloudflare/_headers`は次を全pathへ適用する。

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- 不要なdevice APIを無効にする`Permissions-Policy`
- self-hosted assetだけを許可し、`connect-src 'none'`、`frame-ancestors 'none'`、`object-src 'none'`とするCSP

meta CSPは`frame-ancestors`を除いてheaderと一致する。`frame-ancestors`はmetaでは有効にならないためheaderだけで送る。`unsafe-inline`と`unsafe-eval`は使用しない。

`deploy/cloudflare/_redirects`は次の末尾スラッシュ正規化だけを行う。

```text
/tools/slot-balance /tools/slot-balance/ 301
/tools/slot-balance/index.html /tools/slot-balance/ 301
```

SPA fallbackは使わない。存在しないURLは404へ任せる。

## 7. Preview確認

1. feature branchのpreview buildが成功する。
2. `dist/` manifestが許可リストだけである。
3. `npm run check:all`が成功する。
4. branch preview URLに`X-Robots-Tag: noindex, nofollow`が返る。
5. canonical、`og:url`、production sitemapがない。
6. 外部request、fetch、XHR、beacon、Cookie、storageがない。
7. 公式サイトからスロバランス、スロバランスから公式／support／privacy／termsへ遷移できる。
8. mobile／desktopのVisual QA 10枚を確認する。

## 8. Production切替

1. custom domainとcanonical hostを確定する。
2. production環境へ`SITE_ORIGIN`を登録する。
3. production buildを実行し、canonical、`og:url`、robots、sitemapを確認する。
4. preview URLのnoindexが維持され、productionだけがindex可能であることを確認する。
5. security headersが実レスポンスへ付くことを確認する。
6. `main`へ承認済みPRをmergeする。
7. Pages production deploymentを確認する。
8. 旧GitHub Pages URLの扱いをMigration Planの決定後に実施する。

## 9. Rollback

- Cloudflare Pagesの直前に成功したdeployment IDを記録する。
- 障害時は直前の成功deploymentへrollbackする。
- custom domainやDNSを削除する前に、rollback後のoriginが正常か確認する。
- DNS rollbackが必要な場合は変更前recordへ戻し、TTLと証明書状態を確認する。
- コードrollbackはrevert commitで行い、履歴を書き換えない。

## 10. GitHub Pages停止と旧URL

GitHub Pagesはcustom domainのproduction確認と旧URL方針の承認前に停止しない。停止またはredirect専用branchへの変更は、`docs/GITHUB_PAGES_MIGRATION_PLAN.md`の順序で行う。

旧URLが検索流入を持つ場合は301 redirectを優先する。GitHub Pagesの仕組みだけでpath単位のserver redirectができない場合は、redirect用HTML、repository設定、または旧URLを一定期間残す案を比較して決定する。推測で停止しない。

## 11. AdSense／ads.txt

AdSense申請と広告有効化はサイトproduction安定後に行う。Phase 2B0のbuildにはpublisher ID、slot ID、広告script、広告domain、`ads.txt`を含めない。

publisher IDが正式に発行され、表示位置、privacy、同意要件、CSP変更が承認された後だけ`ads.txt`を追加する。詳細は`docs/ADSENSE_INTEGRATION_PLAN.md`を参照する。

## 12. 公開後checklist

- apex／www／HTTPがcanonical HTTPSへ収束
- 全6ページが200、存在しないURLが404
- CSS、JavaScript、画像が200
- production canonical、`og:url`、robots、sitemapが正しい
- previewはnoindexのまま
- CSP／nosniff／referrer／frame／permissions headersが付く
- console、page error、外部requestがない
- 計算5種とvalidationが正常
- 入力値がURL、console、storage、Cookieへ残らない
- mobile 320pxからdesktop 1,440pxまで横overflowなし
- Search Consoleへcanonical propertyとsitemapを登録
- 旧URLのindex状況とredirectを監視
- 広告は別承認まで無効
