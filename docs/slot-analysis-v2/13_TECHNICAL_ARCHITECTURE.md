# 技術アーキテクチャ

## 目標

既存の静的サイト、純粋関数型の計算エンジン、明示allowlistビルドを維持しながら、名称・URL・UIを段階移行する。フレームワーク、API、DB、機種データ、認証を追加しない。

## 推奨構成（実装フェーズ）

```text
tools/slot-analysis/
├─ index.html
├─ styles.css
├─ app.bundle.js          # 生成物
├─ src/
│  ├─ domain/
│  │  ├─ numeric.ts       # NFKC、整数、有理数、丸め
│  │  ├─ quick-analysis.ts
│  │  ├─ benchmarks.ts
│  │  ├─ target-reverse.ts
│  │  ├─ segments.ts
│  │  ├─ investment.ts
│  │  ├─ result.ts        # provenance/message型
│  │  └─ index.ts
│  ├─ application/
│  │  ├─ controllers.ts
│  │  └─ view-models.ts
│  └─ ui/
│     ├─ app.ts
│     ├─ render.ts
│     ├─ focus.ts
│     └─ privacy-boundary.ts
└─ tests/
   ├─ quick-analysis.test.ts
   ├─ benchmarks.test.ts
   ├─ target-reverse.test.ts
   ├─ segments.test.ts
   └─ privacy-contract.test.ts
```

実際には既存 `tools/slot-balance/src` を履歴を保って移動/拡張する案と、新ディレクトリから既存domainをimportする案をPR前に比較する。コピーによる二重実装は避ける。

## レイヤー責任

### Domain

- DOM、locale、network、storageに依存しない純粋関数。
- 入力は正規化済みprimitive/brand型。
- 出力は内部精度、表示推奨精度、式、単位、前提、warningを含む。
- `number`へ早期変換せず、既存BigInt rationalを再利用。

### Application

- 入力正規化とdomain呼び出し。
- クイック値の詳細フォームへの明示コピー。
- form stateはメモリのみ。
- domain errorを利用者向けメッセージへ対応付け。

### UI

- semantic HTML、focus、aria-live、段階開示。
- `textContent`中心で、入力文字列をHTMLへ挿入しない。
- URL/history/storage/networkへ値を渡さない。
- 表示丸めと符号はview modelで統一。

## 計算契約

```ts
type Provenance = {
  formulaId: string;
  assumptions: readonly string[];
  rounding: string;
};

type CalculationResult<T> =
  | { ok: true; value: T; messages: readonly Message[]; provenance: Provenance }
  | { ok: false; errors: readonly ValidationError[] };
```

ベンチマーク、目標、区間はquickの想定IN関数を共有する。累積地点は差分へ変換してから直接区間関数へ渡し、計算経路を一本化する。

## 区間アルゴリズム

- 行数はUIで2〜20、domainはreadonly配列。
- 累積Gは厳密増加を一括検証。
- 区間率/寄与をmap、合計をreduce。
- 最大下落/回復は1パスO(n)。回復は下落発生後だけ計測。
- グラフはRelease CoreではHTML/CSSバー。LaterでSVGを使う場合もcanvas画像だけに意味を閉じない。

## 公開ビルド

現行 `scripts/build-site.mjs` のallowlistは安全資産である。実装リリースでは:

1. 新ディレクトリの公開ファイルだけを明示追加。
2. `docs/`, `prototypes/`, `artifacts/`, `src/`, testsを除外。
3. previewはpreview canonical/noindex、本番は`https://nkisworks.com`。
4. source mapを本番公開しない現行方針を維持。
5. `check:dist`へ禁止パスと外部script検査を追加。

## URLと互換性

- 新canonical `/tools/slot-analysis/`。
- 旧URLをdeploy redirectsで恒久転送。
- 旧ブックマークは入力なしの新ページへ到達。
- query/hashの値移行はしない。
- 既存Slarog CTA、privacy/support/termsのURLを壊さない。

## セキュリティ

- CSPは広告なしRelease Coreで `connect-src 'none'` を維持。
- inline script/styleを避け、既存nonce不要構成に合わせる。
- 外部font/image/CDNなし。
- DOM injectionを避け、区間名はtextContent。
- 入力上限、safe integer、分母0、非有限値、極端なDOM行数を検証。
- 例外/consoleへ入力値を出さない。
- dependency追加なしを第一選択。

## プライバシー契約テスト

- storage APIが0。
- Cookieが0。
- 外部requestが0。
- URL search/hashに値がない。
- console/pageerrorが0。
- clipboard/share/download不使用。
- prototypeと本番の両方で同じ境界をE2E化。

## アクセシビリティテスト

- axe critical/serious 0。
- キーボードによる計算、タブ、行選択、詳細開閉。
- submit後フォーカスとerror summary。
- 320/390/430/768/1440、200%ズーム、reduced motion。
- 色なしで正負/選択/押上/押下を識別。

## 広告の隔離

将来広告はdomain/applicationから参照しない独立adapterとする。build-time flag、origin、CMP状態が揃った場合だけloaderを生成し、入力/結果を引数にしない。広告OFFのbundleにGoogle文字列・DOM・通信を残さない。

## 設計プロトタイプの隔離

`prototypes/slot-analysis-v2` は意図的に本番engineをimportしない。`playwright.prototype.config.ts`は専用ポート4175でのみ起動し、現行Playwright configとtestDirを変更しない。成果物は設計レビュー用に明示force-addしているが、本番dist allowlist外である。
