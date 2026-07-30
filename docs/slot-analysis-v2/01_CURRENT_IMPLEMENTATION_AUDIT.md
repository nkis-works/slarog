# 現行実装監査

## 監査対象

- Repository: `nkis-works/slarog`
- Local: `/Users/nkis/Documents/スラログios版`
- 基準HEAD: `73ebeef5924f2c2d8e8031cedc0cf25db4d51d65`
- 監査時ブランチ: `feature/generic-slot-analysis-product-design`
- 現行公開ツール: `/tools/slot-balance/`

PACHIMITE、スラログiOS/Android本体、ICHIGEKIではない。フォルダ名に「ios版」を含むが、内容はNKIS Works公式静的Webサイトである。

## 技術・公開構成

| 項目             | 現状                                                     |
| ---------------- | -------------------------------------------------------- |
| ページ           | ルートの静的HTMLと `tools/slot-balance/index.html`       |
| スタイル         | ルートCSS、ツール専用 `styles.css`                       |
| ドメインロジック | `tools/slot-balance/src/domain/` のTypeScript            |
| UI               | `tools/slot-balance/src/ui/`、ビルド済み `app.bundle.js` |
| テスト           | Vitest 83件、source E2E 22件、dist E2E 14件              |
| ビルド           | Node 22、esbuild、`scripts/build-site.mjs`               |
| 公開成果物       | `dist/`。明示allowlist方式                               |
| Pages            | Cloudflare Pages。productionは `main`、outputは `dist`   |
| Preview          | `pages.dev` は `X-Robots-Tag: noindex, nofollow`         |
| セキュリティ     | CSP、Referrer-Policy等を `_headers` へ生成               |

`scripts/build-site.mjs` は公開ファイルを明示列挙する。`docs/`、`prototypes/`、`artifacts/` は現行allowlist外であり、設計物が自動公開されない境界になっている。本フェーズはこのファイルを変更しない。

## 現行機能棚卸し

### 差枚

- 入力: 総ゲーム数、差枚。
- 想定IN = 総ゲーム数 × 3。
- 想定OUT = 想定IN + 差枚。
- 実績出玉率 = 想定OUT ÷ 想定IN × 100。
- 1,000Gあたり差枚を表示。
- BigInt有理数、NFKC正規化、half-away-from-zero丸め、provenanceを実装。

### 投資・回収

- 現金投資、持ちメダル、交換率、交換単位。
- 上級入力として貯メダル、交換済み現金、貸出率、ゲーム数、差枚。
- 理論交換、交換単位丸め、端数、現金回収率、総回収率。
- 貸出・交換レートが異なるケースに対応。

### 区間・IN/OUT・コイン持ち

- 区間ごとのゲーム数・差枚を直接入力し合算。
- 実IN/OUTから実績率を計算。
- コイン持ちを直接入力または内訳から計算。
- 前提確認と知識境界を伴う。

### 非機能

- 入力検証をerror/warning/infoで構造化。
- 計算説明、丸め、前提、知識境界を結果に添付。
- Slarog transfer contract v1は定義済みだが、ランタイム転送UIは未実装。
- privacy-safe analytics event contractは定義済みだが、送信処理は未実装。
- Cookie、Web Storage、IndexedDB、クエリ、hash、外部通信を使用しない。

## 現行UIの構造

ページ上部に「差枚」「投資・回収」「区間・IN/OUT」の3モードが並び、区間モードの内側に区間・実IN/OUT・コイン持ちがある。結果、メッセージ、前提、説明が別々の領域に分かれ、その後にスラログCTA、手動広告用コメント、9本の計算式、使い方、FAQ 10件、免責が続く。

### 良い点

- 計算を曖昧にしない型・丸め・前提の設計。
- 機種DBを使わず、利用者の実績値だけで完結。
- 広告・解析・保存がなく、入力値が端末外へ出ない。
- source/distの両方でアクセシビリティとネットワーク境界を検証。
- 本番成果物がallowlistで限定されている。

### 改善点

- 最初からモードと入力候補が多く、初回価値までの判断が増える。
- 主要結果が複数セクションへ分散し、結果の要約が弱い。
- 100/103/105%など相対比較がなく、数値の読み方を利用者が補う必要がある。
- 区間が合計中心で、押し上げ/押し下げ、最大下落、回復幅が見えない。
- 目標時点への必要差枚・必要区間率の逆算がない。
- 「スロバランス」という名称だけでは検索者に機能が伝わりにくい。

## 入力・出力・検証マップ

| モード     | 主要入力                      | 主要出力                       | 主な検証                 |
| ---------- | ----------------------------- | ------------------------------ | ------------------------ |
| 差枚       | games, netMedals              | rate, /1000G, assumed IN/OUT   | 正数G、整数差枚、OUT非負 |
| 投資・回収 | cash, medals, rate, unit      | exchange, balance, return rate | 非負、正レート、単位整数 |
| 区間       | segment games/net             | total rate/net                 | 2区間以上、各値有効      |
| 実IN/OUT   | actualIn/out, optional games  | actual rate                    | IN正、OUT非負            |
| コイン持ち | normalGames/netUsedまたは内訳 | games/50 medals等              | 前提確認、分母正         |

## 本番を壊しうるリスク

1. 現行URLを先に削除すると既存リンクと検索評価を失う。
2. `build-site.mjs` のallowlist変更を誤ると設計物や不要ファイルが公開される。
3. domain関数をUI都合で書き換えると83件の契約を破る。
4. previewで本番canonicalや広告を出すと誤index・誤配信になる。
5. 基準比較を設定判別に見せると、過去実績ツールの境界を越える。
6. 区間差枚と累積差枚を混同すると二重加算になる。
7. 値をURL、storage、analytics、広告パラメータへ含めるとプライバシー境界を破る。
8. 横長結果レールを主UIにすると320pxと200%ズームで情報を失う。

## 変更境界

本設計フェーズで新規追加してよいのは `docs/slot-analysis-v2/`、`prototypes/slot-analysis-v2/`、`artifacts/slot-analysis-v2-design/` と、プロトタイプ検証専用設定だけ。以下は変更禁止:

- `index.html`, `support.html`, `privacy.html`, `terms.html`
- `tools/slot-balance/**`
- `scripts/build-site.mjs`, `scripts/validate-dist.mjs`
- `package.json`, deploy設定、Cloudflare/GitHub Pages設定

## 継承する資産

実装フェーズでは、NFKC入力正規化、BigInt有理数、丸め、検証モデル、結果provenance、既存テスト期待値を再利用する。UIは置換候補だが、ドメイン契約は拡張を基本とし、既存関数の破壊的変更は避ける。
