# NKIS Works / Slarog Website

NKIS Worksが運営するスラログ公式サイトと、無料Webツール「スロバランス」の静的ファイル一式です。現在の公開サイトは [https://nkis-works.github.io/slarog/](https://nkis-works.github.io/slarog/) です。Cloudflare Pagesへの移行候補は実装済みですが、まだ公開・設定変更は行っていません。

## 現在の公開方式と移行候補

現在はGitHub Pagesが`main`ブランチの`/(root)`を直接配信しています。`main`への反映は公開サイトへ直結するため、featureブランチで検証してから取り込んでください。

Cloudflare Pages移行後は、リポジトリ全体ではなく`dist/`だけを公開します。`dist/`はbuildのたびに削除して許可リストから再生成し、TypeScript、テスト、文書、package設定、source map、秘密情報、広告IDを含めません。詳細は`docs/CLOUDFLARE_PAGES_DEPLOYMENT.md`を参照してください。

## 構成

```text
index.html              スラログ公式サイト
support.html            サポート
privacy.html            プライバシーポリシー
terms.html              利用規約
404.html                GitHub Pages用404
robots.txt
sitemap.xml
.nojekyll
assets/                 共通CSS、JavaScript、画像
tools/slot-balance/     スロバランス（公開候補UI・ドメイン・source E2E）
docs/                   仕様・計算・QA資料
deploy/cloudflare/      Cloudflare Pages用headers／redirects
scripts/                bundle、curated dist、配布物検査
dist/                   Cloudflare公開物（生成物・Git管理対象外）
```

スロバランスは`tools/slot-balance/`にあり、公式サイトのナビゲーション、トップページ、サポートから遷移できます。privacyとtermsも現状に合わせて更新済みです。広告とアクセス解析は有効化していません。

## ローカル確認

静的サイトだけを確認する場合は、リポジトリ直下で次を実行します。

```bash
python3 -m http.server 4173
```

その後、既存サイトは`http://localhost:4173/`、スロバランスは`http://localhost:4173/tools/slot-balance/index.html`を開きます。CSPと相対URLを含めた確認のため、スロバランスは`file://`ではなくHTTP server経由で確認してください。

Cloudflare向けpreview配布物は次で確認します。

```bash
npm run build:preview
npm run serve:dist
```

`http://localhost:4174/`で`dist/`を確認できます。previewは全ページ`noindex, nofollow`、canonicalなし、空のsitemapで生成されます。

## スロバランス開発

前提はNode.js 22以上とnpm 10以上です。

```bash
npm install
npx playwright install chromium
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build:preview
npm run check:dist
npm run check
npm run test:e2e
npm run test:e2e:dist
npm run check:all
```

`npm run build`は`build:preview`の別名です。`tools/slot-balance/src/ui/app.ts`から同一内容のbrowser向けIIFEを、GitHub Pages移行期間用の追跡bundleと`dist/`のbundleへ生成します。source mapとruntime dependencyは含めません。2回のbuildで全23配布ファイルのSHA-256が一致する決定的出力を維持します。

production buildは公開オリジンを環境変数で明示した場合だけ成功します。

```bash
SITE_ORIGIN="$CONFIRMED_SITE_ORIGIN" npm run build:production
```

`CONFIRMED_SITE_ORIGIN`には、確認済みのcustom domainからなるHTTPS originだけを設定してください。`SITE_ORIGIN`なし、HTTP、パス・query・fragment付き、localhost、`pages.dev`、`github.io`は拒否します。リポジトリへ公開ドメインを仮置きしません。

`npm run test:e2e`はsource版22件、`npm run test:e2e:dist`はcurated dist版14件を実行します。dist版は全6ページ、asset、導線、section順、CSP、noindex、外部通信、browser storage、Cookie、IndexedDB、Cache Storage、console全level、レスポンシブ、10画面のVisual QAを確認します。成果物は無視対象の`artifacts/phase2b0/`へ出力します。

## スロバランスの実装済み範囲

- TypeScript strictの計算ドメイン
- 入力正規化と構造化validation
- 差枚、投資・回収、区間、実IN/OUT、通常時コイン持ち
- 計算根拠、値の出所、分かること／分からないこと
- versionedなスラログ引き継ぎ契約
- privacy-safeなanalyticsイベント契約
- 正解値付きunit testと不変条件テスト
- 3モードのモバイル優先UI
- 入力revisionによるstale表示
- error summary、field error、ARIA live、provenance、根拠表示
- スラログ公式サイトへの通常の相対リンク
- Playwright E2E、axe、7幅レスポンシブ、既存サイト回帰、6画面Visual QA
- 公式サイトからの公開導線、計算式9項目、FAQ 10項目
- curated `dist/`、preview／production分離、CSP／headers／redirects
- dist E2E、全6ページ回帰、10画面Visual QA

履歴、共有カード、analytics送信、計算結果transfer、アプリdeep link、外部広告の実コード、Cookie同意、本番公開は未実装です。

## 公開前チェック

- `support@nkisworks.com`または掲載中の連絡先が実際に受信できること
- App Store / Google Play公開後のURLを追加すること
- 価格、無料期間、サブスクリプション条件をサイト、ストア説明、アプリ内表示で一致させること
- `npm run check:all`と`docs/SLOT_BALANCE_PHASE2B0_QA.md`の公開前項目を再確認すること
- custom domainのapex／www正規URLを決定してから`SITE_ORIGIN`を設定すること
- previewを確認後、production build、main取り込み、旧GitHub Pages URLの扱いを順番に判断すること
- 広告を有効化する場合、`docs/ADSENSE_INTEGRATION_PLAN.md`に従い、スラログCTAより下の手動1枠だけに限定すること
- 広告・解析を有効にする前にprivacy、CSP、同意要件を再監査すること

## 表現方針

「設定がわかる」「勝てる」「高設定を見抜く」「続行・ヤメを推奨する」などの断定表現は使用しません。スラログは記録・比較、スロバランスは入力値と明示した前提から数字を整理するツールとして扱います。
