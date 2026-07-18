# Decision Log

- Status: proposed/fixed for design review
- Date: 2026-07-18
- Scope: Slot Analysis v2 design phase

## Decisions

### V2-D001 — Product is past-performance analysis

- Decision: 過去に入力された数値の分析だけを扱う。
- Reason: 数式で説明可能な範囲を守り、設定推測・未来予測の誤認を避ける。
- Rejected: 設定判別、勝敗予測、台推奨。

### V2-D002 — No machine database

- Decision: 機種名、公称値、設定別率を入力要件にしない。
- Reason: 汎用性、更新不要、誤情報回避。
- Rejected: 機種選択を最初に置く。

### V2-D003 — Two-field quick start

- Decision: 初期入力は総ゲーム数と差枚のみ。
- Reason: 20秒以内に代表価値へ到達する。
- Rejected: 現行3モードを同格で上部表示。

### V2-D004 — Initial result hierarchy

- Decision: 実績出玉率、入力した総G/差枚、/1,000Gの順で初期表示する。想定IN/OUTは「計算条件を見る」内へ置く。
- Reason: 主結果と入力根拠を先に確認でき、想定値を実測結果と誤認しにくい。
- Rejected: すべての派生指標をカード化。

### V2-D005 — Neutral benchmark default

- Decision: 100/103/105%は全表示するが、初期選択と好調/不調判定を置かない。
- Reason: 任意基準を正解や設定に見せない。
- Rejected: 103%自動選択、100%自動選択、総合スコア。

### V2-D006 — Vertical benchmark list

- Decision: 正式UIは縦リスト。
- Reason: 320px、200%ズーム、読み上げ順、全件発見性。
- Rejected: 横レールを主UIにする。

### V2-D007 — Assumed IN naming

- Decision: `G×3`は必ず「想定IN/OUT」と表す。
- Reason: 実測IN/OUTとの混同を避ける。
- Rejected: 単にIN/OUTと表示。

### V2-D008 — Benchmark contribution

- Decision: 区間寄与は「区間差枚 − 基準期待差枚」。
- Reason: 合計が全体の基準差と一致する。
- Rejected: 区間差枚の正負だけを押上/押下と呼ぶ。

### V2-D009 — Two segment input models

- Decision: 直接区間と累積地点を別タブで提供し、混在させない。
- Reason: データ表示方式の違いへ対応し、二重加算を防ぐ。
- Rejected: 自動推定、1表での混在。

### V2-D010 — Endpoint-only drawdown

- Decision: 最大下落/回復は入力した区間終点だけから計算。
- Reason: 区間内軌跡は観測できない。
- Rejected: 区間内の最悪値を推定。

### V2-D011 — Recovery starts after a decline

- Decision: 最大回復は下落が発生した後の最安地点から計測し、開始から最初の上昇は含めない。
- Reason: 「回復」という日本語と一致させる。
- Rejected: 単純な最大run-up。

### V2-D012 — Target reverse uses sign-aware boundary wording

- Decision: 正は`あと+N枚必要`、0は`差枚0枚以上で目標に到達`、負は`−N枚までなら目標を維持`。必要OUTが負なら実行可能境界0%へclampする。
- Reason: 負の必要差枚を追加獲得の指示に見せず、数学上の境界を自然な日本語で伝える。
- Rejected: 達成確率、期待値、推奨続行。

### V2-D013 — Progressive disclosure

- Decision: 目標、区間、投資・回収は結果後の明示操作で1つずつ開く。
- Reason: 初回タスクの認知負荷を抑える。
- Rejected: すべてのフォームを初期DOMで展開。

### V2-D014 — No persistence or share URL

- Decision: 値はメモリ内のみ。storage/cookie/query/hashへ入れない。
- Reason: プライバシー、同意、ログ漏えいを最小化。
- Rejected: 履歴、共有リンク、自動復元。

### V2-D015 — Slarog before ads

- Decision: 結果と詳細の後にSlarog CTA、その後に将来広告。
- Reason: 自社価値と計算体験を優先。
- Rejected: 入力中/結果中の広告。

### V2-D016 — Advertising remains off

- Decision: 初期実装は広告DOM/通信/空白0。
- Reason: AdSense審査、CMP、CSP、privacyを別ゲートにする。
- Rejected: placeholderを本番に残す、Auto Ads。

### V2-D017 — Recommended name

- Decision: 一次推奨は「スロット出玉分析」。
- Reason: 直接的、過去実績中心、機能拡張にも耐える。
- Rejected: スロバランス（不明瞭）、機械割分析（誤認）、分析ノート（保存を示唆）。

### V2-D018 — Recommended slug

- Decision: `/tools/slot-analysis/`。
- Reason: 英語内部名と一致し、将来機能を狭めない。
- Rejected: `/payout/`, `/machine-rate/`, 現行slug継続。

### V2-D019 — Preserve old URL until release gate

- Decision: 新URL検証後に旧URLを恒久転送し、本設計フェーズでは変更しない。
- Reason: 既存リンクと検索評価を保護。
- Rejected: 先に削除、JavaScript転送。

### V2-D020 — Extend existing domain assets

- Decision: 既存正規化、BigInt rational、rounding、message、provenanceを再利用。
- Reason: 83 unitの信頼性を継承。
- Rejected: prototype.jsを本番移植、全面再実装。

### V2-D021 — Explicit build allowlist

- Decision: 現行allowlistを維持し、新公開ファイルだけを将来明示追加。
- Reason: docs/prototypes/artifacts混入防止。
- Rejected: ディレクトリ全コピー。

### V2-D022 — Prototype is intentionally separate

- Decision: prototypeは本番domainをimportせず、非公開・noindex・外部依存なし。
- Reason: 設計の試行と本番変更を混同しない。
- Rejected: 現行production HTML上でA/B実装。

### V2-D023 — No new framework

- Decision: 静的HTML/CSS/TypeScriptの現行構成を維持。
- Reason: 配信・保守・CSP・bundleを単純にする。
- Rejected: React/Vue/Svelte導入。

### V2-D024 — Accessibility is a release gate

- Decision: keyboard、focus-visible、200%ズーム、axe serious/critical 0を必須。
- Reason: 後付けでなく情報構造から担保する。
- Rejected: axeだけで完了扱い。

### V2-D025 — No production/deployment changes in this phase

- Decision: 本PRはdocs/prototype/artifacts/専用テストだけ。
- Reason: ユーザー指定の安全境界。
- Rejected: main merge、Cloudflare preview、本番URL更新。

### V2-D026 — Release Core is indivisible at publication

- Decision: RC-01〜RC-16をすべて完成するまで新UIを本番へ切り替えない。開発PRは分割可。
- Reason: 目標、区間、既存詳細機能の導線を含む製品価値を欠けた状態で公開しない。
- Rejected: クイック機能だけを先行公開。

### V2-D027 — Segment limits are layered

- Decision: 本番UIは最大10区間、累積地点の初期候補は開始点込み11地点、domainは最大100区間。
- Reason: 手入力の認知負荷を抑えつつ、domainをUI都合から分離する。
- Rejected: UI/domainとも20、domain無制限。

### V2-D028 — Benchmark relations remain exact

- Decision: 初期選択なし。厳密差0だけを`基準通り`とし、整数表示0で厳密非0なら`差は1枚未満`と方向を併記する。
- Reason: 表示丸めで関係を反転・消失させない。
- Rejected: 103%自動選択、丸め後0をequal扱い。

### V2-D029 — SEO and navigation copy are fixed

- Decision: H1は`スロット出玉分析`、navは`出玉分析`、titleとdescriptionは名称仕様の固定文を使う。`機械割`はSEO/FAQ/補足だけ。
- Reason: 検索意図へ応えながら、主結果を公称値や設定判別に見せない。

### V2-D030 — Exchange input uses medals per 1,000 yen

- Decision: 投資・回収の主入力は`1,000円分への交換に必要な枚数`とし、`50枚 / 1,000円`、`56枚 / 1,000円`の形式で扱う。`円/枚`はdomain内部で`1000 / 枚数`として有理数換算する。
- Reason: 一般的なホール表示と入力者の手元情報に合わせ、変換ミスを避ける。
- Rejected: `円/枚`を主入力にする、両単位を同格で入力させる。

### V2-D031 — Every successful v2 result exposes metadata

- Decision: すべての成功結果は`calculationVersion='2.0.0'`、`formulaIds`、`assumptionCodes`、`roundingCodes`、`warningCodes`を共通metadataとして返す。
- Reason: UIの「計算条件を見る」をdomainの公開契約から生成し、rendererでの式や前提の再推定を防ぐ。
- Rejected: 結果型ごとの任意文字列、表示値からのformula判定、domain内の日本語文言。

### V2-D032 — Decimal input is bounded before BigInt conversion

- Decision: v2のdecimal入力はraw 128文字、仮数64桁、小数部32桁、指数絶対値64を上限とし、超過時は`decimal_input_out_of_bounds`を返す。
- Reason: `1e1000000`や数万桁入力による巨大BigInt生成、CPU/メモリ消費、例外揺れを入力構造の段階で防ぐ。通常の出玉率入力には十分な精度を残す。
- Rejected: BigInt生成後の検査、無制限decimal、入力種別ごとに異なる上限。

### V2-D033 — Cumulative arithmetic remains exact until safe conversion

- Decision: 累積差枚、終点差枚、最大下落、最大回復はBigIntで中間計算し、すべての累積終点と移動量がsafe integer範囲内だと確認してからNumberへ変換する。
- Reason: 大きな正負区間で最終合計だけsafeに戻る場合や、個別地点はsafeでも差分がunsafeになる場合を見逃さない。
- Rejected: 最終合計だけの検査、Number加算後の`Number.isSafeInteger`、unsafe値の丸め継続。

### V2-D034 — Release Core implementation keeps the existing public path

- Decision: Release Core UIは既存の`/tools/slot-balance/`へ接続し、このPRではURL、canonical、sitemap、redirectを変更しない。
- Reason: UIと計算契約のレビューを配信・URL移行から分離し、既存公開経路を壊さない。
- Rejected: UI実装と同時の`/tools/slot-analysis/`移行、旧URL転送、本番公開。
