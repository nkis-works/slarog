# スロバランス Validation仕様

## 1. メッセージ契約

```ts
type ValidationMessage = {
  severity: "error" | "warning" | "info";
  code: string;
  field?: string;
  message: string;
  correction?: string;
};
```

errorは計算を止める。warningは結果を返しつつ確認を促す。infoはゼロ値や追加条件を説明する。文言は原因だけでなく、可能な限り修正方法を含める。

## 2. 正規化エラー

| code | severity | 条件 |
|---|---|---|
| `invalid_numeric_input` | error | 単位除去後に数値以外が残る |
| `integer_required` | error | 整数項目へ小数が入力された |
| `unsafe_integer` | error | JavaScript safe integer範囲外 |
| `non_finite_number` | error | NaN、Infinity |

## 3. 差枚

| code | severity | 条件 |
|---|---|---|
| `games_not_positive` | error | games <= 0 |
| `assumed_out_negative` | warning | games × 3 + netMedals < 0 |
| `scope_mismatch` | warning | G数と差枚のscopeが異なる |
| `net_medals_zero` | info | 差枚0 |
| `net_medals_negative` | info | マイナス差枚 |
| `extreme_games` | warning | しきい値超過 |
| `extreme_net_medals` | warning | 絶対差枚がしきい値超過 |

## 4. 投資・回収

| code | severity | 条件 |
|---|---|---|
| `negative_cash_investment` | error | 現金投資が負数 |
| `negative_stored_medals` | error | 使用貯メダルが負数 |
| `negative_current_medals` | error | 現在枚数が負数 |
| `negative_exchanged_yen` | error | 交換済み金額が負数 |
| `invalid_exchange_rate` | error | 交換条件が0以下 |
| `invalid_lend_rate` | error | 貸出条件が0以下 |
| `invalid_exchange_unit` | error | 交換単位が正の整数でない |
| `exchange_rate_required` | error | 枚数換算に交換条件がない |
| `recovery_exchange_rate_required` | error | 回収ライン要求時に交換条件がない |
| `cash_investment_zero` | info | 現金投資0円 |
| `current_medals_zero` | info | 現在枚数0枚 |
| `gross_return_zero` | info | 回収見込0円 |
| `cash_and_stored_medals` | warning | 現金と貯メダルを併用 |
| `non_equivalent_exchange` | warning | 貸出枚数と交換枚数が異なる |
| `already_exchanged` | info | 途中交換済み |
| `net_current_same_value` | warning | 差枚と現在枚数が同値で混同疑い |
| `extreme_money` | warning | 金額しきい値超過 |
| `extreme_medals` | warning | 枚数しきい値超過 |

現金0円はhard errorではない。現金回収率だけを非表示にし、貯メダル込み計算は継続できる。

## 5. 区間・IN/OUT

| code | severity | 条件 |
|---|---|---|
| `segments_required` | error | 区間配列が空 |
| `segment_range_reversed` | error | endGame < startGame |
| `segment_range_overlap` | error | 明示区間が重複 |
| `actual_in_not_positive` | error | 実IN <= 0 |
| `actual_out_negative` | error | 実OUT < 0 |
| `in_out_values_required` | error | 直接値も区間値もない |

区間重複は集計の二重計上を発生させるためerrorとする。率の大小自体を良い・悪いの判定へ使わない。

## 6. 通常時コイン持ち

| code | severity | 条件 |
|---|---|---|
| `normal_games_not_positive` | error | 通常時G <= 0 |
| `net_used_medals_not_positive` | error | 正味使用枚数 <= 0 |
| `at_bonus_not_excluded` | info | AT・ボーナス除外未確認 |
| `normal_scope_not_confirmed` | info | 対象区間未確認 |

infoが計算前提の不足を示す場合、`ok`はfalseではなくても値は返さない。UIは必要入力案内を表示する。

## 7. しきい値

初期値は設定ファイルへ分離する。

- G数: 100,000G超
- 絶対差枚: 1,000,000枚超
- 金額: 10,000,000円超
- 枚数: 1,000,000枚超

しきい値超過は入力ミスの可能性を示すwarningであり、数学的に成立する限り計算を止めない。
