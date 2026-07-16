# GitHub PagesからCloudflare Pagesへの移行計画

## 原則

- 現在のGitHub Pages productionを先に壊さない。
- Cloudflare account、project、DNS、domainを推測で作成・変更しない。
- custom domainと旧URL方針は実データを確認してから承認する。
- preview、production、旧URL、検索、広告を一度に切り替えない。

## 固定する実施順序

### 1. Branch preview

`feature/slot-balance-cloudflare-release-candidate`からCloudflare branch previewを作る。`build:preview`、`dist/`、noindex、security headers、全ページ、計算、Visual QAを確認する。

### 2. Custom domain決定

所有済みドメイン、DNS、メールrecordを確認し、apex／wwwのcanonicalを決定する。未所有・未確認のドメインを購入または設定しない。

### 3. Cloudflare production準備

productionだけに`SITE_ORIGIN`を設定する。custom domain、SSL、redirectを確認し、production buildのcanonical、robots、sitemapを事前確認する。

### 4. `main` mergeとproduction deploy

承認済みPRを`main`へmergeし、Cloudflare Pages productionを確認する。merge前にGitHub Pagesを停止しない。

### 5. 旧URL方針の実施

現行`https://nkis-works.github.io/slarog/`の検索流入、外部リンク、Search Console登録状況を確認する。次のいずれかを承認してから実施する。

- 可能なら新canonicalへ301 redirectする。
- server redirectが使えない場合、明示案内ページを一定期間残す。
- 流入がなく、リンク更新が完了した場合だけ停止する。

旧URLの最終方式はPhase 2B0では未決定とする。実際のcustom domainとGitHub Pages制約を確認するまで決めない。

### 6. GitHub Pages停止またはredirect専用化

Cloudflare production、SSL、旧URL処理が安定した後に、GitHub repositoryのPages sourceを停止するか、redirect専用branchへ変更する。元サイトファイルを削除する操作とは分ける。

### 7. Search Console／sitemap

canonical domainのpropertyを確認し、production sitemapを送信する。旧propertyのindex、redirect、404を監視する。preview URLは登録しない。

### 8. AdSense申請

production domain、privacy、terms、問い合わせ、content、navigationが安定した後に申請する。申請時点でも自動広告は有効にしない。

### 9. 手動広告1枠の有効化

承認済みpublisher ID／slot ID、CSP、privacy、同意要件、`ads.txt`を揃え、スラログCTAの後・計算式の前にresponsive display adを1枠だけ有効にする。

## Rollback条件

次の場合は移行を停止し、直前の成功状態へ戻す。

- SSL未発行または証明書error
- redirect loop、canonical不一致、previewのindex許可
- 計算・asset・navigationの回帰
- CSP違反による実行停止
- DNS変更によるメールrecord影響
- 旧URL処理が未承認

rollback後もGit historyを破壊せず、revertまたはCloudflareのprevious deploymentを使用する。
