# スロバランス 計算仕様

## 1. 精度方針

入力整数と10進小数を整数比へ変換し、有理数で計算する。浮動小数点は説明用の近似値へ変換する最後の段階だけで使用する。分子・分母は約分し、分母は常に正とする。

## 2. 差枚ベース出玉率

`G = games`、`D = netMedals`とする。

```text
assumedIn = G × 3
assumedOut = assumedIn + D
payoutRateEstimate = assumedOut ÷ assumedIn × 100
netMedalsPer1000G = D ÷ G × 1000
```

`games <= 0`はerror。`assumedOut = 0`は0.0%。`assumedOut < 0`は3枚掛け換算の前提で成立しないため、出玉率だけを返さずwarningとする。差枚と1,000Gあたり差枚は返せる。

これは実IN/OUTではなく、1Gあたり3枚として置いた概算である。

## 3. 投資・回収

`C = cashInvestmentYen`、`S = storedMedalsUsed`、`M = currentMedals`、`A = alreadyExchangedYen`、`E = exchangeMedalsPer1000Yen`、`U = exchangeUnitYen`とする。

### 使用貯メダル価値

```text
storedMedalValueYen = S × 1000 ÷ E
```

機会費用としての理論値であり、交換単位の切り捨てを適用しない。

### 現在枚数の交換見込

```text
currentTheoreticalExchangeYen = M × 1000 ÷ E
```

交換単位なしは1円未満を切り捨てる。

```text
currentExchangeEstimateYen = floor(currentTheoreticalExchangeYen)
```

交換単位ありは次のとおり。

```text
currentExchangeEstimateYen
  = floor(currentTheoreticalExchangeYen ÷ U) × U
```

### 差額と回収率

```text
grossReturnEstimateYen = A + currentExchangeEstimateYen
cashNetEstimateYen = grossReturnEstimateYen - C
totalCostValueYen = C + storedMedalValueYen
totalValueNetEstimateYen = grossReturnEstimateYen - totalCostValueYen
cashRecoveryRate = grossReturnEstimateYen ÷ C × 100
totalRecoveryRate = grossReturnEstimateYen ÷ totalCostValueYen × 100
```

分母0の回収率は返さない。totalValue系は内部で有理数を保持し、表示時に1円単位へ丸める。

### 現金回収ライン

```text
remainingCashToRecoverYen = max(C - A, 0)
requiredCashPayoutYen = Uあり
  ? ceil(remainingCashToRecoverYen ÷ U) × U
  : remainingCashToRecoverYen
cashRecoveryLineMedals
  = ceil(requiredCashPayoutYen × E ÷ 1000)
cashRecoveryMedalGap = cashRecoveryLineMedals - M
```

gapが正なら不足、0以下なら到達・超過。`remainingCashToRecoverYen = 0`なら交換済み実額だけで回収済みとする。

### 貯メダル込み回収ライン

```text
remainingTotalValueToRecoverYen
  = max(totalCostValueYen - A, 0)
```

交換単位への切り上げと必要枚数計算は現金回収ラインと同じ。使用貯メダル0なら両ラインは一致し、UIへ重複非表示フラグを返す。

### 貸出相当枚数

貸出条件がある場合だけ次を参考値として返す。

```text
cashBorrowedMedalsEquivalent = C × lendMedalsPer1000Yen ÷ 1000
```

実消費枚数や差枚へ加算しない。

## 4. 区間差枚

各区間は差枚モードと同じ式で計算する。合計は次のとおり。

```text
totalGames = Σ segmentGames
totalNetMedals = Σ segmentNetMedals
aggregateRate
  = (totalGames × 3 + totalNetMedals)
    ÷ (totalGames × 3) × 100
```

各区間率の単純平均は禁止する。

## 5. 実IN/OUT

```text
inOutPayoutRate = actualOut ÷ actualIn × 100
actualNetMedals = actualOut - actualIn
```

複数区間は合計IN、合計OUTから計算する。`actualIn <= 0`または`actualOut < 0`はerror。

## 6. 通常時コイン持ち

直接入力では正味使用枚数を使う。内訳入力は次のとおり。

```text
netUsedMedals
  = startMedals + addedMedals - endMedals - takenOutMedals
coinHoldPer50 = normalGames ÷ netUsedMedals × 50
```

通常時だけの区間であることを確認できない場合は計算しない。
