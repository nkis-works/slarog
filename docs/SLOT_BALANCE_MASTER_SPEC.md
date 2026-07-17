# スロバランス マスター仕様

## 1. サービス定義

スロバランス（SLOT BALANCE）は、差枚・投資・回収を根拠つきで整理する、無料・登録不要のスロット専用Webツールである。設定、将来の出玉、続行・ヤメの正解を判定しない。

一般向けの主文は「差枚・投資・IN/OUTを、条件を分けて整理する無料計算ツール。」とする。結果には使用入力、式、前提、概算か実IN/OUTか、分かること／分からないことを含める。

## 2. 公開とPhase 2B0の境界

公開候補pathは`/tools/slot-balance/`とする。現在のproductionはGitHub Pagesであるが、Phase 2B0はCloudflare Pagesへ`dist/`だけを配信できるcurated build、公式サイト導線、一般計算式、FAQ、privacy／terms更新、source／dist E2E、運用文書までを実装する。

既存サイトは`main`のルートをGitHub Pagesが直接配信する。移行完了までは`tools/slot-balance/assets/slot-balance-app.js`を追跡対象として維持し、同じ入力から生成した`dist/`側bundleとのbyte一致を必須とする。Cloudflare account／Pages project、DNS、custom domain、正式`SITE_ORIGIN`、main merge、production deploy、GitHub Pages停止、実広告はPhase 2B0で実施しない。

## 3. 計算バージョン

初期バージョンは`1.0.0`とする。全計算結果、将来の履歴、共有データ、スラログ引き継ぎは計算バージョンを保持する。

## 4. 値の出所

- `input`: ユーザーが直接入力した値
- `calculated`: 入力から一意に求まる値
- `estimated`: 3枚掛け換算、交換条件による見込額など仮定を含む値
- `reference`: 公表値等との比較用参考値
- `actual`: 入力された実IN/OUTに基づく実測値

値の出所は構造化データとして返し、画面文言へ埋め込まない。

## 5. 結果契約

計算関数は最低限、次を返す。

- `calculationVersion`
- `mode`
- `normalizedInputs`
- `values`
- `provenance`
- `explanations`
- `knowledgeBoundary`
- `errors`
- `warnings`
- `info`
- `ok`

内部の分数値と表示用丸め値を分ける。金額、交換率、回収ラインは整数または有理数で計算し、二進浮動小数点を計算判断へ使用しない。

## 6. モード

### 6.1 差枚から見る

必須入力はゲーム数と差枚。同じ対象範囲でなければならない。3枚掛け換算IN/OUT、差枚ベース出玉率、1,000Gあたり差枚を返す。実IN/OUTとは呼ばない。

### 6.2 投資・回収を見る

現金投資、使用貯メダル、現在枚数、交換済み金額、貸出条件、交換条件、交換単位を分離する。差枚と現在枚数を同じ計算へ二重使用しない。現金回収ラインと貯メダル込み回収ラインを別に返す。

### 6.3 区間・IN/OUTを見る

区間差枚は各区間と合計を計算する。合計率は各率の平均ではなく、総G数と総差枚から再計算する。実IN/OUTも合計INと合計OUTから計算する。

### 6.4 通常時コイン持ち

通常時だけのG数、正味使用枚数、AT・ボーナス除外確認、対象範囲確認が揃った場合だけ計算する。条件不足時は値を推定しない。

## 7. validation原則

- `error`: 計算を停止する不成立・不足
- `warning`: 計算可能だが入力ミスや前提確認が必要
- `info`: ゼロ値、計算前提、追加入力の案内

数学的に可能な値を根拠なくerrorにしない。極端値や意味の混同疑いは設定ファイルのしきい値とルールからwarningを返す。

## 8. プライバシー

公開候補でもデータ送信を行わない。analytics契約にはモード、成否、エラーコード、概算／実INOUT、画面幅カテゴリだけを許可する。金額、差枚、G数、機種名、店舗名、メモは含めない。

スラログ引き継ぎ契約にも現金投資、貯メダル価値、交換済み金額を含めない。Phase 1ではJSONシリアライズまでとし、URLやdeep linkを生成しない。

## 9. stale防止

UIは計算種別ごとに現在入力revisionと最後に計算したrevisionを保持する。入力が1文字でも変われば旧結果へ「再計算してください」を表示し、別モードの結果を現モードへ表示しない。将来の履歴、共有、スラログ引き継ぎでもrevision一致を必須とする。

## 10. 保存・通信・セキュリティ

Phase 2B0はlocalStorage、sessionStorage、IndexedDB、Cookie、Cache Storage、外部通信、analytics、広告、API、URL query／hashへの入力埋め込みを使用しない。外部CSS・JavaScript・font・iframe・`eval`・`new Function`を使用せず、ユーザー入力は`textContent`で描画する。CSP headerとmetaで`connect-src 'none'`を指定する。

## 11. Phase 2A完了条件

Phase 1のドメイン要件に加え、transfer意味検証、analytics errorCode allowlist、3モードUI、全角入力、stale、構造化validation、provenance、knowledge boundary、explanation、相対URL、モバイル・アクセシビリティ、Playwright E2E、既存サイト回帰、Visual QA、決定的build、`check`、`check:all`が成功すること。

## 12. Phase 2B0公開build

- `dist/`は毎回空にして固定allowlistだけを生成する。
- previewは`noindex, nofollow`、canonicalなし、空のsitemapとする。
- productionは確認済みのHTTPS `SITE_ORIGIN`を必須とし、仮ドメインを許可しない。
- TypeScript、tests、E2E、docs、package情報、source map、秘密情報、広告IDを公開しない。
- 追跡bundleとdist bundleは同一入力から生成し、byte一致させる。
- `_headers`とmeta CSPを整合させ、inline script、外部runtime、外部通信を許可しない。
- `_redirects`は末尾スラッシュ正規化だけとし、SPA fallbackを使わない。

## 13. 公開ページ順と静的説明

結果、警告、分かること／分からないこと、動的根拠の後へSlarog CTAを置き、その後へ広告差込位置、一般計算式、使い方、FAQ、免責を置く。一般計算式はドメイン計算を再実装せず、既存ロジックと端数処理の説明だけを表示する。

## 14. 広告境界

Phase 2B0はSlarog CTAの後・一般計算式の前にHTMLコメント1件だけを置く。広告DOM、空枠、script、request、publisher／slot ID、`ads.txt`、広告domainのCSP許可は存在させない。将来もAuto Ads、anchor、sticky、全画面、interstitialを使用せず、正式IDと同意・privacy・CSPの再監査後にmanual responsive display adを1枠だけ追加する。

## 15. Phase 2B0完了条件

curated dist、preview／production分離、production fail-closed、公開禁止物検査、公式導線、一般計算式9項目、FAQ 10項目、広告差込位置、privacy／terms、厳格CSP、source E2E 22件、dist E2E 14件、unit 83件、全6ページ回帰、Visual QA 10画面、決定的build、`check`、`check:all`が成功すること。main変更と本番公開は完了条件に含めない。
