# スロバランス 入力辞書

## 共通ルール

数値文字列はUnicode NFKCで正規化し、カンマ、許容空白、末尾の既知単位（`G`、`ゲーム`、`枚`、`円`）を除去する。空欄は`undefined`、`0`は数値0として区別する。不正文字は黙って除去せず、修正方法を持つvalidation errorを返す。

金額、G数、枚数、IN、OUT、交換単位は安全な整数を原則とする。貸出・交換枚数は正の小数を許可し、有理数へ変換して扱う。

## 対象範囲

| 値 | コード | 定義 |
|---|---|---|
| 自分の実戦 | `personal_session` | ユーザー自身が遊技した範囲 |
| 台の当日 | `machine_day` | 台の当日全体 |
| 任意の区間 | `custom_segment` | 同じ開始・終了条件を持つ区間 |

G数と差枚へ別々のscopeが渡された場合は混在warningとする。

## 差枚モード

| フィールド | 型 | 必須 | 定義 |
|---|---|---:|---|
| `games` | integer | yes | 計算対象のG数。0以下はerror |
| `netMedals` | integer | yes | 同じ対象範囲の差枚。正負・0を許可 |
| `gamesScope` | scope | no | G数の対象範囲 |
| `netMedalsScope` | scope | no | 差枚の対象範囲 |
| `machineName` | string | no | 自由入力。analyticsへ送らない |
| `playDate` | YYYY-MM-DD | no | 実戦日 |
| `memo` | string | no | 自由入力。analyticsへ送らない |

## 投資・回収モード

| フィールド | 型 | 必須 | 定義 |
|---|---|---:|---|
| `cashInvestmentYen` | integer | yes | 今回、現金で投入した合計円。0を許可 |
| `storedMedalsUsed` | integer | no | 事前保有の貯メダルから使用した枚数。既定0 |
| `currentMedals` | integer | yes | 現在保有し未交換の枚数。差枚とは別。0を許可 |
| `alreadyExchangedYen` | integer | no | すでに交換して確定した円。既定0 |
| `lendMedalsPer1000Yen` | positive decimal | no | 1,000円で貸し出される枚数。表示用参考 |
| `exchangeMedalsPer1000Yen` | positive decimal | conditional | 1,000円分への交換に必要な枚数 |
| `exchangeUnitYen` | positive integer | no | 実交換を扱う円単位 |
| `requestRecoveryLines` | boolean | no | 回収ラインを要求するか。既定true |
| `games` | integer | no | 差枚分析用。金額計算へ加算しない |
| `netMedals` | integer | no | 差枚分析用。現在枚数へ加算しない |

交換条件は、現在枚数または使用貯メダルを円換算する場合と、回収ラインを枚数表示する場合に必須。現在枚数と使用貯メダルが0で、交換済み実額だけを見る場合は`requestRecoveryLines=false`なら省略できる。

## 区間差枚

| フィールド | 型 | 必須 | 定義 |
|---|---|---:|---|
| `label` | string | no | 区間名 |
| `games` | integer | yes | 区間G数 |
| `netMedals` | integer | yes | 同じ区間の差枚 |
| `memo` | string | no | 区間メモ |
| `startGame` | integer | no | 明示的な開始G |
| `endGame` | integer | no | 明示的な終了G |

開始・終了を使う場合、終了が開始未満ならerror、区間同士の重複はerrorとする。集計の二重計上を避けるためである。

## 実IN/OUT

| フィールド | 型 | 必須 | 定義 |
|---|---|---:|---|
| `actualIn` | integer | conditional | 実際のIN。0以下はerror |
| `actualOut` | integer | conditional | 実際のOUT。負数はerror |
| `segments` | array | conditional | 複数区間の実IN/OUT |
| `games` | integer | no | 参考G数 |

直接IN/OUTまたは1件以上のsegmentsのどちらかを使用する。率は合計INと合計OUTから計算する。

## 通常時コイン持ち

共通フィールドは`normalGames`、`atBonusExcluded`、`scopeConfirmed`。

直接方式は`netUsedMedals`を入力する。内訳方式は`startMedals`、`addedMedals`、`endMedals`、`takenOutMedals`を入力し、正味使用枚数を算出する。正味使用枚数が0以下、通常時Gが0以下、AT・ボーナス未除外、対象範囲未確認では値を返さない。
