"use strict";
(() => {
  // tools/slot-balance/src/domain/explanations.ts
  var NET_MEDALS_KNOWLEDGE = {
    known: [
      { code: "estimated_payout_rate", label: "3\u679A\u639B\u3051\u63DB\u7B97\u306E\u5DEE\u679A\u30D9\u30FC\u30B9\u51FA\u7389\u7387" },
      { code: "net_per_1000_games", label: "1,000G\u3042\u305F\u308A\u5DEE\u679A" },
      { code: "calculation_games", label: "\u8A08\u7B97\u5BFE\u8C61G\u6570" }
    ],
    unknown: [
      { code: "exact_in_out", label: "\u6B63\u78BA\u306A\u5B9FIN/OUT" },
      { code: "actual_setting", label: "\u5B9F\u969B\u306E\u8A2D\u5B9A" },
      { code: "future_output", label: "\u4ECA\u5F8C\u306E\u51FA\u7389" },
      { code: "exact_coin_hold", label: "\u6B63\u78BA\u306A\u901A\u5E38\u6642\u30B3\u30A4\u30F3\u6301\u3061" },
      { code: "cash_recovery", label: "\u73FE\u91D1\u6295\u8CC7\u306E\u56DE\u53CE\u72B6\u6CC1" },
      { code: "continue_or_stop", label: "\u7D9A\u884C\uFF0F\u30E4\u30E1\u306E\u6B63\u89E3" }
    ]
  };
  var INVESTMENT_KNOWLEDGE = {
    known: [
      { code: "exchange_estimate", label: "\u5165\u529B\u3057\u305F\u4EA4\u63DB\u6761\u4EF6\u3067\u306E\u4EA4\u63DB\u898B\u8FBC\u984D" },
      { code: "cash_recovery_line", label: "\u73FE\u91D1\u6295\u8CC7\u56DE\u53CE\u30E9\u30A4\u30F3" },
      { code: "total_recovery_line", label: "\u8CAF\u30E1\u30C0\u30EB\u8FBC\u307F\u56DE\u53CE\u30E9\u30A4\u30F3" },
      { code: "recovery_rates", label: "\u5165\u529B\u6761\u4EF6\u306B\u57FA\u3065\u304F\u56DE\u53CE\u7387" }
    ],
    unknown: [
      { code: "prize_composition", label: "\u7279\u6B8A\u666F\u54C1\u69CB\u6210\u306B\u3088\u308B\u6700\u7D42\u91D1\u984D" },
      { code: "venue_rounding", label: "\u5E97\u8217\u56FA\u6709\u306E\u7AEF\u6570\u51E6\u7406" },
      { code: "actual_setting", label: "\u5B9F\u969B\u306E\u8A2D\u5B9A" },
      { code: "future_output", label: "\u4ECA\u5F8C\u306E\u51FA\u7389" },
      { code: "continue_or_stop", label: "\u7D9A\u884C\uFF0F\u30E4\u30E1\u306E\u6B63\u89E3" }
    ]
  };
  var SEGMENTS_KNOWLEDGE = {
    known: [
      { code: "segment_net_medals", label: "\u5404\u533A\u9593\u3068\u5408\u8A08\u306E\u5DEE\u679A" },
      { code: "aggregate_estimated_rate", label: "\u7DCFG\u6570\u30FB\u7DCF\u5DEE\u679A\u304B\u3089\u518D\u8A08\u7B97\u3057\u305F\u6982\u7B97\u51FA\u7389\u7387" }
    ],
    unknown: NET_MEDALS_KNOWLEDGE.unknown
  };
  var IN_OUT_KNOWLEDGE = {
    known: [
      { code: "actual_in_out_rate", label: "\u5165\u529B\u3057\u305F\u5B9FIN/OUT\u306B\u57FA\u3065\u304F\u51FA\u7389\u7387" },
      { code: "actual_net_medals", label: "IN\u3068OUT\u306E\u5DEE" }
    ],
    unknown: [
      { code: "actual_setting", label: "\u5B9F\u969B\u306E\u8A2D\u5B9A" },
      { code: "future_output", label: "\u4ECA\u5F8C\u306E\u51FA\u7389" },
      { code: "continue_or_stop", label: "\u7D9A\u884C\uFF0F\u30E4\u30E1\u306E\u6B63\u89E3" }
    ]
  };
  var COIN_HOLD_KNOWLEDGE = {
    known: [{ code: "coin_hold_from_interval", label: "\u5165\u529B\u3057\u305F\u901A\u5E38\u6642\u533A\u9593\u306E\u30B3\u30A4\u30F3\u6301\u3061" }],
    unknown: [
      { code: "machine_published_coin_hold", label: "\u6A5F\u7A2E\u516C\u8868\u5024\u305D\u306E\u3082\u306E" },
      { code: "future_coin_hold", label: "\u4ECA\u5F8C\u306E\u30B3\u30A4\u30F3\u6301\u3061" },
      { code: "actual_setting", label: "\u5B9F\u969B\u306E\u8A2D\u5B9A" }
    ]
  };
  function explainNetMedals(input, values) {
    const explanations = [
      {
        resultCode: "netMedalsPer1000G",
        title: "1,000G\u3042\u305F\u308A\u5DEE\u679A",
        inputs: [
          { label: "\u30B2\u30FC\u30E0\u6570", value: input.games, unit: "G" },
          { label: "\u5DEE\u679A", value: input.netMedals, unit: "\u679A" }
        ],
        steps: [
          { expression: `${input.netMedals} \xF7 ${input.games} \xD7 1,000` },
          { expression: "\u8868\u793A\u5024", value: values.netMedalsPer1000G.display }
        ],
        assumptions: ["\u30B2\u30FC\u30E0\u6570\u3068\u5DEE\u679A\u306F\u540C\u3058\u5BFE\u8C61\u7BC4\u56F2\u3067\u3059\u3002"]
      }
    ];
    if (values.payoutRateEstimate) {
      explanations.unshift({
        resultCode: "payoutRateEstimate",
        title: "\u5DEE\u679A\u30D9\u30FC\u30B9\u51FA\u7389\u7387",
        inputs: [
          { label: "\u30B2\u30FC\u30E0\u6570", value: input.games, unit: "G" },
          { label: "\u5DEE\u679A", value: input.netMedals, unit: "\u679A" }
        ],
        steps: [
          { expression: `${input.games} \xD7 3`, value: values.assumedIn },
          { expression: `${values.assumedIn} + (${input.netMedals})`, value: values.assumedOut },
          {
            expression: `${values.assumedOut} \xF7 ${values.assumedIn} \xD7 100`,
            value: values.payoutRateEstimate.display
          }
        ],
        assumptions: ["1G\u3042\u305F\u308A3\u679A\u639B\u3051\u3068\u3057\u3066\u63DB\u7B97\u3057\u307E\u3059\u3002", "\u5B9FIN/OUT\u305D\u306E\u3082\u306E\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002"]
      });
    }
    return explanations;
  }
  function explainInvestmentRecovery(input, values) {
    return [
      {
        resultCode: "currentExchangeEstimateYen",
        title: "\u4EA4\u63DB\u898B\u8FBC\u984D",
        inputs: [
          { label: "\u73FE\u5728\u679A\u6570", value: input.currentMedals, unit: "\u679A" },
          { label: "\u4EA4\u63DB\u6761\u4EF6", value: input.exchangeMedalsPer1000Yen ?? "-", unit: "\u679A/1,000\u5186" }
        ],
        steps: [
          {
            expression: "\u73FE\u5728\u679A\u6570 \xD7 1,000 \xF7 \u4EA4\u63DB\u679A\u6570",
            value: values.currentTheoreticalExchangeYen.approximate
          },
          { expression: "\u4EA4\u63DB\u5358\u4F4D\u3092\u53CD\u6620", value: values.currentExchangeEstimateYen }
        ],
        assumptions: [
          input.exchangeUnitYen ? `${input.exchangeUnitYen}\u5186\u5358\u4F4D\u3067\u5207\u308A\u6368\u3066\u307E\u3059\u3002` : "\u4EA4\u63DB\u5358\u4F4D\u672A\u6307\u5B9A\u306E\u305F\u30811\u5186\u672A\u6E80\u3092\u5207\u308A\u6368\u3066\u307E\u3059\u3002"
        ]
      },
      {
        resultCode: "cashNetEstimateYen",
        title: "\u73FE\u91D1\u30D9\u30FC\u30B9\u4EA4\u63DB\u898B\u8FBC\u5DEE\u984D",
        inputs: [
          { label: "\u73FE\u91D1\u6295\u8CC7\u984D", value: input.cashInvestmentYen, unit: "\u5186" },
          { label: "\u4EA4\u63DB\u6E08\u307F\u91D1\u984D", value: input.alreadyExchangedYen, unit: "\u5186" }
        ],
        steps: [
          { expression: "\u4EA4\u63DB\u6E08\u307F\u91D1\u984D + \u73FE\u5728\u4EA4\u63DB\u898B\u8FBC", value: values.grossReturnEstimateYen },
          { expression: "\u7DCF\u56DE\u53CE\u898B\u8FBC - \u73FE\u91D1\u6295\u8CC7", value: values.cashNetEstimateYen }
        ],
        assumptions: ["\u672A\u4EA4\u63DB\u306E\u73FE\u5728\u679A\u6570\u3092\u542B\u3080\u305F\u3081\u3001\u78BA\u5B9A\u3057\u305F\u73FE\u91D1\u53CE\u652F\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002"]
      },
      {
        resultCode: "storedMedalValueYen",
        title: "\u4F7F\u7528\u3057\u305F\u8CAF\u30E1\u30C0\u30EB\u306E\u4FA1\u5024",
        inputs: [{ label: "\u4F7F\u7528\u8CAF\u30E1\u30C0\u30EB", value: input.storedMedalsUsed, unit: "\u679A" }],
        steps: [
          {
            expression: "\u4F7F\u7528\u679A\u6570 \xD7 1,000 \xF7 \u4EA4\u63DB\u679A\u6570",
            value: values.storedMedalValueYen.approximate
          }
        ],
        assumptions: ["\u4EA4\u63DB\u6761\u4EF6\u3067\u6A5F\u4F1A\u8CBB\u7528\u8A55\u4FA1\u3057\u3001\u4EA4\u63DB\u5358\u4F4D\u306B\u3088\u308B\u5207\u308A\u6368\u3066\u306F\u9069\u7528\u3057\u307E\u305B\u3093\u3002"]
      }
    ];
  }
  function explainInOut(values) {
    return [
      {
        resultCode: "payoutRate",
        title: "\u5B9FIN/OUT\u51FA\u7389\u7387",
        inputs: [
          { label: "\u5B9FIN", value: values.totalIn, unit: "\u679A" },
          { label: "\u5B9FOUT", value: values.totalOut, unit: "\u679A" }
        ],
        steps: [
          {
            expression: `${values.totalOut} \xF7 ${values.totalIn} \xD7 100`,
            value: values.payoutRate.display
          },
          { expression: `${values.totalOut} - ${values.totalIn}`, value: values.actualNetMedals }
        ],
        assumptions: ["\u5165\u529B\u3055\u308C\u305F\u5B9FIN/OUT\u304B\u3089\u8A08\u7B97\u3057\u307E\u3059\u3002", "\u8907\u6570\u533A\u9593\u306F\u5408\u8A08IN/OUT\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002"]
      }
    ];
  }
  function explainCoinHold(input, values) {
    return [
      {
        resultCode: "coinHoldPer50",
        title: "\u901A\u5E38\u6642\u30B3\u30A4\u30F3\u6301\u3061",
        inputs: [
          { label: "\u901A\u5E38\u6642\u30B2\u30FC\u30E0\u6570", value: input.normalGames, unit: "G" },
          { label: "\u6B63\u5473\u4F7F\u7528\u679A\u6570", value: values.netUsedMedals, unit: "\u679A" }
        ],
        steps: [
          {
            expression: `${input.normalGames} \xF7 ${values.netUsedMedals} \xD7 50`,
            value: values.coinHoldPer50.display
          }
        ],
        assumptions: ["\u901A\u5E38\u6642\u3060\u3051\u306E\u533A\u9593\u3067\u3059\u3002", "AT\u30FB\u30DC\u30FC\u30CA\u30B9\u3092\u542B\u307F\u307E\u305B\u3093\u3002"]
      }
    ];
  }

  // tools/slot-balance/src/domain/rational.ts
  function absolute(value) {
    return value < 0n ? -value : value;
  }
  function greatestCommonDivisor(left, right) {
    let a = absolute(left);
    let b = absolute(right);
    while (b !== 0n) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    return a === 0n ? 1n : a;
  }
  function rational(numerator, denominator = 1n) {
    if (denominator === 0n) throw new RangeError("Rational denominator must not be zero.");
    const sign = denominator < 0n ? -1n : 1n;
    const divisor = greatestCommonDivisor(numerator, denominator);
    return {
      numerator: numerator / divisor * sign,
      denominator: absolute(denominator / divisor)
    };
  }
  function integer(value) {
    return rational(typeof value === "bigint" ? value : BigInt(value));
  }
  function decimal(value) {
    const text = typeof value === "number" ? value.toString() : value.trim();
    const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(text);
    if (!match) throw new RangeError(`Invalid decimal value: ${text}`);
    const sign = match[1] === "-" ? -1n : 1n;
    const integerDigits = match[2] ?? "0";
    const fractionDigits = match[3] ?? "";
    const exponent = Number(match[4] ?? "0");
    const digits = BigInt(`${integerDigits}${fractionDigits}` || "0") * sign;
    const scale = fractionDigits.length - exponent;
    if (scale <= 0) return rational(digits * 10n ** BigInt(-scale));
    return rational(digits, 10n ** BigInt(scale));
  }
  function add(left, right) {
    return rational(
      left.numerator * right.denominator + right.numerator * left.denominator,
      left.denominator * right.denominator
    );
  }
  function subtract(left, right) {
    return rational(
      left.numerator * right.denominator - right.numerator * left.denominator,
      left.denominator * right.denominator
    );
  }
  function multiply(left, right) {
    return rational(left.numerator * right.numerator, left.denominator * right.denominator);
  }
  function divide(left, right) {
    if (right.numerator === 0n) throw new RangeError("Cannot divide by zero.");
    return rational(left.numerator * right.denominator, left.denominator * right.numerator);
  }
  function compare(left, right) {
    const difference = left.numerator * right.denominator - right.numerator * left.denominator;
    return difference < 0n ? -1 : difference > 0n ? 1 : 0;
  }
  function maxZero(value) {
    return value.numerator < 0n ? integer(0) : value;
  }
  function floor(value) {
    const quotient = value.numerator / value.denominator;
    const remainder = value.numerator % value.denominator;
    return value.numerator < 0n && remainder !== 0n ? quotient - 1n : quotient;
  }
  function ceil(value) {
    const quotient = value.numerator / value.denominator;
    const remainder = value.numerator % value.denominator;
    return value.numerator > 0n && remainder !== 0n ? quotient + 1n : quotient;
  }
  function toNumber(value) {
    return Number(value.numerator) / Number(value.denominator);
  }
  function serializeRational(value) {
    return {
      numerator: value.numerator.toString(),
      denominator: value.denominator.toString()
    };
  }

  // tools/slot-balance/src/domain/rounding.ts
  function powerOfTen(decimalPlaces) {
    if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
      throw new RangeError("decimalPlaces must be a non-negative integer.");
    }
    return 10n ** BigInt(decimalPlaces);
  }
  function roundHalfAwayFromZeroInteger(value) {
    const negative = value.numerator < 0n;
    const absoluteNumerator = negative ? -value.numerator : value.numerator;
    let rounded = absoluteNumerator / value.denominator;
    const remainder = absoluteNumerator % value.denominator;
    if (remainder * 2n >= value.denominator) rounded += 1n;
    return negative ? -rounded : rounded;
  }
  function roundHalfAwayFromZero(value, decimalPlaces = 0) {
    const scale = powerOfTen(decimalPlaces);
    const scaled = multiply(value, integer(scale));
    const rounded = roundHalfAwayFromZeroInteger(scaled);
    return Number(rounded) / Number(scale);
  }
  function floorToInteger(value) {
    return Number(floor(value));
  }
  function ceilToInteger(value) {
    return Number(ceil(value));
  }
  function floorToUnit(value, unit) {
    if (!Number.isSafeInteger(unit) || unit <= 0) throw new RangeError("unit must be positive.");
    return Number(floor(divide(value, integer(unit)))) * unit;
  }
  function ceilToUnit(value, unit) {
    if (!Number.isSafeInteger(unit) || unit <= 0) throw new RangeError("unit must be positive.");
    return Number(ceil(divide(value, integer(unit)))) * unit;
  }
  function calculatedNumber(value, decimalPlaces) {
    return {
      exact: serializeRational(value),
      approximate: toNumber(value),
      display: roundHalfAwayFromZero(value, decimalPlaces)
    };
  }

  // tools/slot-balance/src/domain/thresholds.ts
  var VALIDATION_THRESHOLDS = Object.freeze({
    extremeGames: 1e5,
    extremeNetMedals: 1e6,
    extremeMoneyYen: 1e7,
    extremeMedals: 1e6
  });

  // tools/slot-balance/src/domain/validators.ts
  function message(severity, code, field, text, correction) {
    return { severity, code, field, message: text, correction };
  }
  function isPositiveDecimal(value) {
    try {
      return compare(decimal(value), integer(0)) > 0;
    } catch {
      return false;
    }
  }
  function validateSafeInteger(value, field, label) {
    if (Number.isSafeInteger(value)) return [];
    return [
      message(
        "error",
        "integer_required",
        field,
        `${label}\u306F\u5B89\u5168\u306B\u6271\u3048\u308B\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
        "\u5C0F\u6570\u3084\u6975\u7AEF\u306B\u5927\u304D\u306A\u5024\u3092\u907F\u3051\u3001\u6574\u6570\u3078\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      )
    ];
  }
  function partitionValidationMessages(messages) {
    return {
      errors: messages.filter(({ severity }) => severity === "error"),
      warnings: messages.filter(({ severity }) => severity === "warning"),
      info: messages.filter(({ severity }) => severity === "info")
    };
  }
  function validateNetMedals(input) {
    const messages = [
      ...validateSafeInteger(input.games, "games", "\u30B2\u30FC\u30E0\u6570"),
      ...validateSafeInteger(input.netMedals, "netMedals", "\u5DEE\u679A")
    ];
    if (!Number.isSafeInteger(input.games) || !Number.isSafeInteger(input.netMedals)) {
      return messages;
    }
    if (input.games <= 0) {
      messages.push(
        message(
          "error",
          "games_not_positive",
          "games",
          "\u30B2\u30FC\u30E0\u6570\u306F1G\u4EE5\u4E0A\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          "\u8A08\u7B97\u5BFE\u8C61\u306E\u30B2\u30FC\u30E0\u6570\u3092\u78BA\u8A8D\u3057\u3066\u30011\u4EE5\u4E0A\u3078\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (input.netMedals === 0) {
      messages.push(message("info", "net_medals_zero", "netMedals", "\u5DEE\u679A0\u679A\u3068\u3057\u3066\u8A08\u7B97\u3057\u307E\u3059\u3002"));
    } else if (input.netMedals < 0) {
      messages.push(
        message("info", "net_medals_negative", "netMedals", "\u30DE\u30A4\u30CA\u30B9\u5DEE\u679A\u3068\u3057\u3066\u8A08\u7B97\u3057\u307E\u3059\u3002")
      );
    }
    if (input.gamesScope !== void 0 && input.netMedalsScope !== void 0 && input.gamesScope !== input.netMedalsScope) {
      messages.push(
        message(
          "warning",
          "scope_mismatch",
          void 0,
          "\u30B2\u30FC\u30E0\u6570\u3068\u5DEE\u679A\u306E\u5BFE\u8C61\u7BC4\u56F2\u304C\u7570\u306A\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002",
          "\u3069\u3061\u3089\u3082\u81EA\u5206\u306E\u5B9F\u6226\u3001\u53F0\u306E\u5F53\u65E5\u3001\u540C\u3058\u4EFB\u610F\u533A\u9593\u306E\u3044\u305A\u308C\u304B\u3078\u63C3\u3048\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (input.games > VALIDATION_THRESHOLDS.extremeGames) {
      messages.push(
        message(
          "warning",
          "extreme_games",
          "games",
          "\u30B2\u30FC\u30E0\u6570\u304C\u901A\u5E38\u3088\u308A\u5927\u304D\u3044\u5024\u3067\u3059\u3002",
          "\u6841\u6570\u3068\u5BFE\u8C61\u671F\u9593\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (Math.abs(input.netMedals) > VALIDATION_THRESHOLDS.extremeNetMedals) {
      messages.push(
        message(
          "warning",
          "extreme_net_medals",
          "netMedals",
          "\u5DEE\u679A\u304C\u901A\u5E38\u3088\u308A\u5927\u304D\u3044\u5024\u3067\u3059\u3002",
          "\u6841\u6570\u3068\u5BFE\u8C61\u7BC4\u56F2\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (input.games > 0 && input.games * 3 + input.netMedals < 0) {
      messages.push(
        message(
          "warning",
          "assumed_out_negative",
          void 0,
          "\u3053\u306E\u30B2\u30FC\u30E0\u6570\u3068\u5DEE\u679A\u3067\u306F\u30013\u679A\u639B\u3051\u63DB\u7B97OUT\u304C0\u679A\u672A\u6E80\u306B\u306A\u308A\u307E\u3059\u3002",
          "\u30B2\u30FC\u30E0\u6570\u3068\u5DEE\u679A\u306E\u5BFE\u8C61\u7BC4\u56F2\u304C\u540C\u3058\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    return messages;
  }
  function validateInvestmentRecovery(input) {
    const storedMedalsUsed = input.storedMedalsUsed ?? 0;
    const alreadyExchangedYen = input.alreadyExchangedYen ?? 0;
    const requestRecoveryLines = input.requestRecoveryLines ?? true;
    const integerFields = [
      [input.cashInvestmentYen, "cashInvestmentYen", "\u73FE\u91D1\u6295\u8CC7\u984D"],
      [storedMedalsUsed, "storedMedalsUsed", "\u4F7F\u7528\u3057\u305F\u8CAF\u30E1\u30C0\u30EB"],
      [input.currentMedals, "currentMedals", "\u73FE\u5728\u679A\u6570"],
      [alreadyExchangedYen, "alreadyExchangedYen", "\u4EA4\u63DB\u6E08\u307F\u91D1\u984D"]
    ];
    const messages = integerFields.flatMap(
      ([value, field, label]) => validateSafeInteger(value, field, label)
    );
    if (messages.some(({ severity }) => severity === "error")) return messages;
    const nonNegativeFields = [
      [input.cashInvestmentYen, "cashInvestmentYen", "negative_cash_investment", "\u73FE\u91D1\u6295\u8CC7\u984D"],
      [storedMedalsUsed, "storedMedalsUsed", "negative_stored_medals", "\u4F7F\u7528\u3057\u305F\u8CAF\u30E1\u30C0\u30EB"],
      [input.currentMedals, "currentMedals", "negative_current_medals", "\u73FE\u5728\u679A\u6570"],
      [alreadyExchangedYen, "alreadyExchangedYen", "negative_exchanged_yen", "\u4EA4\u63DB\u6E08\u307F\u91D1\u984D"]
    ];
    for (const [value, field, code, label] of nonNegativeFields) {
      if (value < 0) {
        messages.push(
          message(
            "error",
            code,
            field,
            `${label}\u306F0\u4EE5\u4E0A\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
            "\u7B26\u53F7\u3068\u5165\u529B\u6B04\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
          )
        );
      }
    }
    if (input.exchangeMedalsPer1000Yen !== void 0 && !isPositiveDecimal(input.exchangeMedalsPer1000Yen)) {
      messages.push(
        message(
          "error",
          "invalid_exchange_rate",
          "exchangeMedalsPer1000Yen",
          "\u4EA4\u63DB\u6761\u4EF6\u306F0\u3088\u308A\u5927\u304D\u3044\u679A\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          "1,000\u5186\u5206\u3078\u306E\u4EA4\u63DB\u306B\u5FC5\u8981\u306A\u679A\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (input.lendMedalsPer1000Yen !== void 0 && !isPositiveDecimal(input.lendMedalsPer1000Yen)) {
      messages.push(
        message(
          "error",
          "invalid_lend_rate",
          "lendMedalsPer1000Yen",
          "\u8CB8\u51FA\u6761\u4EF6\u306F0\u3088\u308A\u5927\u304D\u3044\u679A\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          "1,000\u5186\u3067\u8CB8\u3057\u51FA\u3055\u308C\u308B\u679A\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (input.exchangeUnitYen !== void 0 && (!Number.isSafeInteger(input.exchangeUnitYen) || input.exchangeUnitYen <= 0)) {
      messages.push(
        message(
          "error",
          "invalid_exchange_unit",
          "exchangeUnitYen",
          "\u4EA4\u63DB\u5358\u4F4D\u306F1\u5186\u4EE5\u4E0A\u306E\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          "500\u5186\u30011,000\u5186\u306A\u3069\u5B9F\u969B\u306E\u4EA4\u63DB\u5358\u4F4D\u3078\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    const needsExchangeRate = storedMedalsUsed > 0 || input.currentMedals > 0;
    if (needsExchangeRate && input.exchangeMedalsPer1000Yen === void 0) {
      messages.push(
        message(
          "error",
          "exchange_rate_required",
          "exchangeMedalsPer1000Yen",
          "\u679A\u6570\u3092\u5186\u63DB\u7B97\u3059\u308B\u306B\u306F\u4EA4\u63DB\u6761\u4EF6\u304C\u5FC5\u8981\u3067\u3059\u3002",
          "1,000\u5186\u5206\u3078\u306E\u4EA4\u63DB\u306B\u5FC5\u8981\u306A\u679A\u6570\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    } else if (requestRecoveryLines && input.exchangeMedalsPer1000Yen === void 0) {
      messages.push(
        message(
          "error",
          "recovery_exchange_rate_required",
          "exchangeMedalsPer1000Yen",
          "\u56DE\u53CE\u30E9\u30A4\u30F3\u3092\u679A\u6570\u3067\u6C42\u3081\u308B\u306B\u306F\u4EA4\u63DB\u6761\u4EF6\u304C\u5FC5\u8981\u3067\u3059\u3002",
          "\u4EA4\u63DB\u6761\u4EF6\u3092\u5165\u529B\u3059\u308B\u304B\u3001\u56DE\u53CE\u30E9\u30A4\u30F3\u8A08\u7B97\u3092\u7121\u52B9\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (input.cashInvestmentYen === 0) {
      messages.push(
        message(
          "info",
          "cash_investment_zero",
          "cashInvestmentYen",
          "\u73FE\u91D1\u6295\u8CC70\u5186\u306E\u305F\u3081\u3001\u73FE\u91D1\u56DE\u53CE\u7387\u306F\u8868\u793A\u3057\u307E\u305B\u3093\u3002"
        )
      );
    }
    if (input.currentMedals === 0) {
      messages.push(
        message("info", "current_medals_zero", "currentMedals", "\u73FE\u5728\u679A\u65700\u679A\u3068\u3057\u3066\u8A08\u7B97\u3057\u307E\u3059\u3002")
      );
    }
    if (input.cashInvestmentYen > 0 && storedMedalsUsed > 0) {
      messages.push(
        message(
          "warning",
          "cash_and_stored_medals",
          void 0,
          "\u73FE\u91D1\u3068\u8CAF\u30E1\u30C0\u30EB\u3092\u4F75\u7528\u3057\u3066\u3044\u307E\u3059\u30022\u7A2E\u985E\u306E\u56DE\u53CE\u30E9\u30A4\u30F3\u3092\u5206\u3051\u3066\u8868\u793A\u3057\u307E\u3059\u3002"
        )
      );
    }
    if (input.lendMedalsPer1000Yen !== void 0 && input.exchangeMedalsPer1000Yen !== void 0 && isPositiveDecimal(input.lendMedalsPer1000Yen) && isPositiveDecimal(input.exchangeMedalsPer1000Yen) && compare(decimal(input.lendMedalsPer1000Yen), decimal(input.exchangeMedalsPer1000Yen)) !== 0) {
      messages.push(
        message(
          "warning",
          "non_equivalent_exchange",
          void 0,
          "\u8CB8\u51FA\u6761\u4EF6\u3068\u4EA4\u63DB\u6761\u4EF6\u304C\u7570\u306A\u308B\u975E\u7B49\u4FA1\u4EA4\u63DB\u3067\u3059\u3002",
          "\u305D\u308C\u305E\u308C\u306E\u5165\u529B\u6B04\u304C\u6B63\u3057\u3044\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (alreadyExchangedYen > 0) {
      messages.push(
        message(
          "info",
          "already_exchanged",
          "alreadyExchangedYen",
          "\u4EA4\u63DB\u6E08\u307F\u91D1\u984D\u3092\u7DCF\u56DE\u53CE\u898B\u8FBC\u3068\u6B8B\u308A\u56DE\u53CE\u30E9\u30A4\u30F3\u3078\u53CD\u6620\u3057\u307E\u3059\u3002"
        )
      );
    }
    if (input.netMedals !== void 0 && input.currentMedals > 0 && input.netMedals === input.currentMedals) {
      messages.push(
        message(
          "warning",
          "net_current_same_value",
          void 0,
          "\u5DEE\u679A\u3068\u73FE\u5728\u679A\u6570\u304C\u540C\u3058\u5024\u3067\u3059\u3002\u5165\u529B\u6B04\u3092\u6DF7\u540C\u3057\u3066\u3044\u306A\u3044\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          "\u5DEE\u679A\u306F\u51FA\u7389\u7387\u3001\u73FE\u5728\u679A\u6570\u306F\u4EA4\u63DB\u898B\u8FBC\u306E\u8A08\u7B97\u306B\u4F7F\u7528\u3057\u307E\u3059\u3002"
        )
      );
    }
    if (Math.max(input.cashInvestmentYen, alreadyExchangedYen) > VALIDATION_THRESHOLDS.extremeMoneyYen) {
      messages.push(
        message(
          "warning",
          "extreme_money",
          void 0,
          "\u91D1\u984D\u304C\u901A\u5E38\u3088\u308A\u5927\u304D\u3044\u5024\u3067\u3059\u3002",
          "\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (Math.max(storedMedalsUsed, input.currentMedals) > VALIDATION_THRESHOLDS.extremeMedals) {
      messages.push(
        message(
          "warning",
          "extreme_medals",
          void 0,
          "\u679A\u6570\u304C\u901A\u5E38\u3088\u308A\u5927\u304D\u3044\u5024\u3067\u3059\u3002",
          "\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    return messages;
  }
  function validateInOut(input) {
    const messages = [];
    if ((input.segments?.length ?? 0) > 100) {
      return [
        message(
          "error",
          "segments_limit_exceeded",
          "segments",
          "IN/OUT\u533A\u9593\u306F100\u4EF6\u307E\u3067\u5165\u529B\u3067\u304D\u307E\u3059\u3002",
          "\u5BFE\u8C61\u3092\u5206\u3051\u308B\u304B\u3001\u4E0D\u8981\u306A\u533A\u9593\u3092\u524A\u9664\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      ];
    }
    const hasSegments = (input.segments?.length ?? 0) > 0;
    const hasDirect = input.actualIn !== void 0 || input.actualOut !== void 0;
    if (!hasSegments && !hasDirect) {
      return [
        message(
          "error",
          "in_out_values_required",
          void 0,
          "\u5B9FIN\u3068\u5B9FOUT\u3001\u307E\u305F\u306FIN/OUT\u533A\u9593\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          "\u540C\u3058\u5BFE\u8C61\u7BC4\u56F2\u306EIN\u3068OUT\u3092\u63C3\u3048\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      ];
    }
    if (hasSegments && hasDirect) {
      messages.push(
        message(
          "warning",
          "in_out_source_conflict",
          void 0,
          "\u76F4\u63A5\u5165\u529B\u3068\u533A\u9593\u5165\u529B\u306E\u4E21\u65B9\u304C\u3042\u308A\u307E\u3059\u3002\u533A\u9593\u5165\u529B\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002",
          "\u4F7F\u7528\u3057\u306A\u3044\u5165\u529B\u3092\u30AF\u30EA\u30A2\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    const values = hasSegments ? (input.segments ?? []).map((segment, index) => ({
      actualIn: segment.actualIn,
      actualOut: segment.actualOut,
      prefix: `segments.${index}`
    })) : [{ actualIn: input.actualIn, actualOut: input.actualOut, prefix: "" }];
    for (const value of values) {
      if (value.actualIn === void 0 || !Number.isSafeInteger(value.actualIn) || value.actualIn <= 0) {
        messages.push(
          message(
            "error",
            "actual_in_not_positive",
            value.prefix ? `${value.prefix}.actualIn` : "actualIn",
            "\u5B9FIN\u306F1\u679A\u4EE5\u4E0A\u306E\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
            "\u540C\u3058\u5BFE\u8C61\u7BC4\u56F2\u306E\u5B9FIN\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
          )
        );
      }
      if (value.actualOut === void 0 || !Number.isSafeInteger(value.actualOut) || value.actualOut < 0) {
        messages.push(
          message(
            "error",
            "actual_out_negative",
            value.prefix ? `${value.prefix}.actualOut` : "actualOut",
            "\u5B9FOUT\u306F0\u679A\u4EE5\u4E0A\u306E\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
            "\u540C\u3058\u5BFE\u8C61\u7BC4\u56F2\u306E\u5B9FOUT\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
          )
        );
      }
    }
    return messages;
  }
  function validateCoinHold(input, netUsedMedals) {
    const messages = [];
    if (!Number.isSafeInteger(input.normalGames) || input.normalGames <= 0) {
      messages.push(
        message(
          "error",
          "normal_games_not_positive",
          "normalGames",
          "\u901A\u5E38\u6642\u30B2\u30FC\u30E0\u6570\u306F1G\u4EE5\u4E0A\u306E\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          "AT\u30FB\u30DC\u30FC\u30CA\u30B9\u3092\u9664\u3044\u305F\u901A\u5E38\u6642\u533A\u9593\u306EG\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (!Number.isSafeInteger(netUsedMedals) || netUsedMedals <= 0) {
      messages.push(
        message(
          "error",
          "net_used_medals_not_positive",
          input.method === "direct" ? "netUsedMedals" : "breakdown",
          "\u901A\u5E38\u6642\u533A\u9593\u306E\u6B63\u5473\u4F7F\u7528\u679A\u6570\u306F1\u679A\u4EE5\u4E0A\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          "\u958B\u59CB\u3001\u8FFD\u52A0\u3001\u7D42\u4E86\u3001\u6301\u3061\u51FA\u3057\u679A\u6570\u306E\u5165\u529B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (!input.atBonusExcluded) {
      messages.push(
        message(
          "info",
          "at_bonus_not_excluded",
          "atBonusExcluded",
          "AT\u30FB\u30DC\u30FC\u30CA\u30B9\u3092\u542B\u3080\u533A\u9593\u3067\u306F\u901A\u5E38\u6642\u30B3\u30A4\u30F3\u6301\u3061\u3092\u8A08\u7B97\u3057\u307E\u305B\u3093\u3002",
          "\u901A\u5E38\u6642\u3060\u3051\u306E\u533A\u9593\u3067\u3042\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    if (!input.scopeConfirmed) {
      messages.push(
        message(
          "info",
          "normal_scope_not_confirmed",
          "scopeConfirmed",
          "\u901A\u5E38\u6642\u3060\u3051\u306E\u5BFE\u8C61\u7BC4\u56F2\u304C\u78BA\u8A8D\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
          "G\u6570\u3068\u4F7F\u7528\u679A\u6570\u304C\u540C\u3058\u901A\u5E38\u6642\u533A\u9593\u3067\u3042\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      );
    }
    return messages;
  }

  // tools/slot-balance/src/domain/version.ts
  var CALCULATION_VERSION = "1.0.0";

  // tools/slot-balance/src/domain/calculators/shared.ts
  function createCalculationResult(options) {
    const { errors, warnings, info } = partitionValidationMessages(options.messages);
    return {
      calculationVersion: CALCULATION_VERSION,
      mode: options.mode,
      normalizedInputs: options.normalizedInputs,
      values: options.values,
      provenance: options.provenance,
      explanations: options.explanations,
      knowledgeBoundary: options.knowledgeBoundary,
      errors,
      warnings,
      info,
      ok: errors.length === 0
    };
  }

  // tools/slot-balance/src/domain/calculators/coin-hold.ts
  function calculateCoinHold(input) {
    const netUsedMedals = input.method === "direct" ? input.netUsedMedals : input.startMedals + input.addedMedals - input.endMedals - input.takenOutMedals;
    const messages = validateCoinHold(input, netUsedMedals);
    const prerequisitesMissing = messages.some(
      ({ code }) => code === "at_bonus_not_excluded" || code === "normal_scope_not_confirmed"
    );
    if (messages.some(({ severity }) => severity === "error") || prerequisitesMissing) {
      return createCalculationResult({
        mode: "coin_hold",
        normalizedInputs: input,
        provenance: {
          normalGames: "input",
          netUsedMedals: input.method === "direct" ? "input" : "calculated"
        },
        explanations: [],
        knowledgeBoundary: COIN_HOLD_KNOWLEDGE,
        messages
      });
    }
    const coinHold = divide(
      multiply(integer(input.normalGames), integer(50)),
      integer(netUsedMedals)
    );
    const values = {
      netUsedMedals,
      coinHoldPer50: calculatedNumber(coinHold, 1)
    };
    return createCalculationResult({
      mode: "coin_hold",
      normalizedInputs: input,
      values,
      provenance: {
        normalGames: "input",
        netUsedMedals: input.method === "direct" ? "input" : "calculated",
        coinHoldPer50: "calculated"
      },
      explanations: explainCoinHold(input, values),
      knowledgeBoundary: COIN_HOLD_KNOWLEDGE,
      messages
    });
  }

  // tools/slot-balance/src/domain/calculators/in-out.ts
  function calculateInOut(input) {
    const messages = validateInOut(input);
    if (messages.some(({ severity }) => severity === "error")) {
      return createCalculationResult({
        mode: "in_out",
        normalizedInputs: input,
        provenance: { actualIn: "input", actualOut: "input" },
        explanations: [],
        knowledgeBoundary: IN_OUT_KNOWLEDGE,
        messages
      });
    }
    const useSegments = (input.segments?.length ?? 0) > 0;
    const totalIn = useSegments ? (input.segments ?? []).reduce((sum, segment) => sum + segment.actualIn, 0) : input.actualIn ?? 0;
    const totalOut = useSegments ? (input.segments ?? []).reduce((sum, segment) => sum + segment.actualOut, 0) : input.actualOut ?? 0;
    const totalGames = useSegments ? (input.segments ?? []).every((segment) => segment.games !== void 0) ? (input.segments ?? []).reduce((sum, segment) => sum + (segment.games ?? 0), 0) : void 0 : input.games;
    const payoutRate = divide(multiply(integer(totalOut), integer(100)), integer(totalIn));
    const values = {
      totalIn,
      totalOut,
      actualNetMedals: totalOut - totalIn,
      payoutRate: calculatedNumber(payoutRate, 1),
      totalGames
    };
    return createCalculationResult({
      mode: "in_out",
      normalizedInputs: input,
      values,
      provenance: {
        actualIn: "input",
        actualOut: "input",
        totalIn: "actual",
        totalOut: "actual",
        actualNetMedals: "actual",
        payoutRate: "actual"
      },
      explanations: explainInOut(values),
      knowledgeBoundary: IN_OUT_KNOWLEDGE,
      messages
    });
  }

  // tools/slot-balance/src/domain/calculators/net-medals.ts
  function calculateNetMedals(input) {
    const messages = validateNetMedals(input);
    const hasErrors = messages.some(({ severity }) => severity === "error");
    if (hasErrors) {
      return createCalculationResult({
        mode: "net_medals",
        normalizedInputs: input,
        provenance: { games: "input", netMedals: "input" },
        explanations: [],
        knowledgeBoundary: NET_MEDALS_KNOWLEDGE,
        messages
      });
    }
    const assumedIn = input.games * 3;
    const assumedOut = assumedIn + input.netMedals;
    const netPer1000 = divide(
      multiply(integer(input.netMedals), integer(1e3)),
      integer(input.games)
    );
    const values = {
      assumedIn,
      assumedOut,
      netMedalsPer1000G: calculatedNumber(netPer1000, 0)
    };
    if (assumedOut >= 0) {
      const payoutRate = divide(multiply(integer(assumedOut), integer(100)), integer(assumedIn));
      values.payoutRateEstimate = calculatedNumber(payoutRate, 1);
    }
    return createCalculationResult({
      mode: "net_medals",
      normalizedInputs: input,
      values,
      provenance: {
        games: "input",
        netMedals: "input",
        assumedIn: "estimated",
        assumedOut: "estimated",
        payoutRateEstimate: "estimated",
        netMedalsPer1000G: "calculated"
      },
      explanations: explainNetMedals(input, values),
      knowledgeBoundary: NET_MEDALS_KNOWLEDGE,
      messages
    });
  }

  // tools/slot-balance/src/domain/calculators/investment-recovery.ts
  function recoveryLine(costValue, alreadyExchangedYen, currentMedals, exchangeRate, exchangeUnitYen) {
    const remainingValue = maxZero(subtract(costValue, integer(alreadyExchangedYen)));
    const requiredPayout = exchangeUnitYen ? integer(ceilToUnit(remainingValue, exchangeUnitYen)) : remainingValue;
    const requiredMedalsExact = divide(multiply(requiredPayout, exchangeRate), integer(1e3));
    const requiredMedals = ceilToInteger(requiredMedalsExact);
    const gapMedals = requiredMedals - currentMedals;
    return {
      remainingValueYen: calculatedNumber(remainingValue, 0),
      requiredPayoutYen: calculatedNumber(requiredPayout, 0),
      requiredMedals,
      gapMedals,
      status: remainingValue.numerator === 0n ? "recovered_by_exchanged" : gapMedals > 0 ? "short" : "met"
    };
  }
  function calculateInvestmentRecovery(input) {
    const normalizedInputs = {
      ...input,
      storedMedalsUsed: input.storedMedalsUsed ?? 0,
      alreadyExchangedYen: input.alreadyExchangedYen ?? 0,
      requestRecoveryLines: input.requestRecoveryLines ?? true
    };
    const messages = validateInvestmentRecovery(normalizedInputs);
    const hasErrors = messages.some(({ severity }) => severity === "error");
    if (hasErrors) {
      return createCalculationResult({
        mode: "investment_recovery",
        normalizedInputs,
        provenance: {
          cashInvestmentYen: "input",
          storedMedalsUsed: "input",
          currentMedals: "input",
          alreadyExchangedYen: "input"
        },
        explanations: [],
        knowledgeBoundary: INVESTMENT_KNOWLEDGE,
        messages
      });
    }
    const exchangeRate = normalizedInputs.exchangeMedalsPer1000Yen === void 0 ? void 0 : decimal(normalizedInputs.exchangeMedalsPer1000Yen);
    const storedMedalValue = exchangeRate ? divide(multiply(integer(normalizedInputs.storedMedalsUsed), integer(1e3)), exchangeRate) : integer(0);
    const currentTheoreticalExchange = exchangeRate ? divide(multiply(integer(normalizedInputs.currentMedals), integer(1e3)), exchangeRate) : integer(0);
    const currentExchangeEstimateYen = normalizedInputs.exchangeUnitYen ? floorToUnit(currentTheoreticalExchange, normalizedInputs.exchangeUnitYen) : floorToInteger(currentTheoreticalExchange);
    const grossReturnEstimateYen = normalizedInputs.alreadyExchangedYen + currentExchangeEstimateYen;
    const cashNetEstimateYen = grossReturnEstimateYen - normalizedInputs.cashInvestmentYen;
    const totalCostValue = add(integer(normalizedInputs.cashInvestmentYen), storedMedalValue);
    const totalValueNetEstimate = subtract(integer(grossReturnEstimateYen), totalCostValue);
    const exchangeUnitDifference = subtract(
      currentTheoreticalExchange,
      integer(currentExchangeEstimateYen)
    );
    const values = {
      storedMedalValueYen: calculatedNumber(storedMedalValue, 0),
      currentTheoreticalExchangeYen: {
        ...calculatedNumber(currentTheoreticalExchange, 0),
        display: floorToInteger(currentTheoreticalExchange)
      },
      currentExchangeEstimateYen,
      exchangeUnitDifferenceYen: calculatedNumber(exchangeUnitDifference, 0),
      grossReturnEstimateYen,
      cashNetEstimateYen,
      totalCostValueYen: calculatedNumber(totalCostValue, 0),
      totalValueNetEstimateYen: calculatedNumber(totalValueNetEstimate, 0),
      showTotalRecoveryLine: normalizedInputs.storedMedalsUsed > 0
    };
    if (normalizedInputs.cashInvestmentYen > 0) {
      values.cashRecoveryRate = calculatedNumber(
        divide(
          multiply(integer(grossReturnEstimateYen), integer(100)),
          integer(normalizedInputs.cashInvestmentYen)
        ),
        1
      );
    }
    if (compare(totalCostValue, integer(0)) > 0) {
      values.totalRecoveryRate = calculatedNumber(
        divide(multiply(integer(grossReturnEstimateYen), integer(100)), totalCostValue),
        1
      );
    }
    if (normalizedInputs.requestRecoveryLines && exchangeRate) {
      values.cashRecoveryLine = recoveryLine(
        integer(normalizedInputs.cashInvestmentYen),
        normalizedInputs.alreadyExchangedYen,
        normalizedInputs.currentMedals,
        exchangeRate,
        normalizedInputs.exchangeUnitYen
      );
      values.totalRecoveryLine = recoveryLine(
        totalCostValue,
        normalizedInputs.alreadyExchangedYen,
        normalizedInputs.currentMedals,
        exchangeRate,
        normalizedInputs.exchangeUnitYen
      );
    }
    if (normalizedInputs.lendMedalsPer1000Yen !== void 0) {
      const lendRate = decimal(normalizedInputs.lendMedalsPer1000Yen);
      values.cashBorrowedMedalsEquivalent = calculatedNumber(
        divide(multiply(integer(normalizedInputs.cashInvestmentYen), lendRate), integer(1e3)),
        2
      );
    }
    if (normalizedInputs.games !== void 0 && normalizedInputs.netMedals !== void 0) {
      const netResult = calculateNetMedals({
        games: normalizedInputs.games,
        netMedals: normalizedInputs.netMedals
      });
      values.netMedalsAnalysis = netResult.values;
      messages.push(...netResult.errors, ...netResult.warnings, ...netResult.info);
    }
    if (grossReturnEstimateYen === 0) {
      messages.push({
        severity: "info",
        code: "gross_return_zero",
        field: "currentMedals",
        message: "\u7DCF\u56DE\u53CE\u898B\u8FBC0\u5186\u3068\u3057\u3066\u8A08\u7B97\u3057\u307E\u3059\u3002"
      });
    }
    return createCalculationResult({
      mode: "investment_recovery",
      normalizedInputs,
      values,
      provenance: {
        cashInvestmentYen: "input",
        storedMedalsUsed: "input",
        currentMedals: "input",
        alreadyExchangedYen: "input",
        lendMedalsPer1000Yen: "input",
        exchangeMedalsPer1000Yen: "input",
        exchangeUnitYen: "input",
        storedMedalValueYen: "estimated",
        currentTheoreticalExchangeYen: "estimated",
        currentExchangeEstimateYen: "estimated",
        grossReturnEstimateYen: "estimated",
        cashNetEstimateYen: "estimated",
        totalCostValueYen: "estimated",
        totalValueNetEstimateYen: "estimated",
        cashRecoveryRate: "estimated",
        totalRecoveryRate: "estimated",
        cashRecoveryLine: "estimated",
        totalRecoveryLine: "estimated",
        cashBorrowedMedalsEquivalent: "reference",
        netMedalsAnalysis: "estimated"
      },
      explanations: explainInvestmentRecovery(normalizedInputs, values),
      knowledgeBoundary: INVESTMENT_KNOWLEDGE,
      messages
    });
  }

  // tools/slot-balance/src/domain/slot-analysis-v2/version.ts
  var SLOT_ANALYSIS_CALCULATION_VERSION = "2.0.0";

  // tools/slot-balance/src/domain/slot-analysis-v2/shared.ts
  var MAX_THREE_MEDAL_GAMES = Math.floor(Number.MAX_SAFE_INTEGER / 3);
  var MAX_DECIMAL_INPUT_LENGTH = 128;
  var MAX_DECIMAL_MANTISSA_DIGITS = 64;
  var MAX_DECIMAL_FRACTION_DIGITS = 32;
  var MAX_DECIMAL_EXPONENT_ABS = 64;
  var DECIMAL_STRUCTURE = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i;
  function deepFreeze(value) {
    if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
      for (const nestedValue of Object.values(value)) {
        deepFreeze(nestedValue);
      }
      Object.freeze(value);
    }
    return value;
  }
  function unique(values) {
    return [...new Set(values)];
  }
  function createMetadata(input) {
    return deepFreeze({
      calculationVersion: SLOT_ANALYSIS_CALCULATION_VERSION,
      formulaIds: unique(input.formulaIds),
      assumptionCodes: unique(input.assumptionCodes),
      roundingCodes: unique(input.roundingCodes),
      warningCodes: unique(input.warningCodes)
    });
  }
  function mergeMetadata(...items) {
    return {
      formulaIds: items.flatMap(({ formulaIds }) => formulaIds),
      assumptionCodes: items.flatMap(({ assumptionCodes }) => assumptionCodes),
      roundingCodes: items.flatMap(({ roundingCodes }) => roundingCodes),
      warningCodes: items.flatMap(({ warningCodes }) => warningCodes)
    };
  }
  function success(value, metadata) {
    return deepFreeze({
      ok: true,
      value: deepFreeze(value),
      metadata: createMetadata(metadata),
      errors: []
    });
  }
  function failure(errors) {
    return deepFreeze({ ok: false, errors: [...errors] });
  }
  function domainError(code, field, index) {
    return index === void 0 ? { code, field } : { code, field, index };
  }
  function validateGames(value, field, codes) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      return domainError(value <= 0 ? codes.notPositive : codes.notSafe, field);
    }
    if (value > MAX_THREE_MEDAL_GAMES) return domainError(codes.notSafe, field);
    return void 0;
  }
  function validateNetMedals2(value, field, codes) {
    if (!Number.isInteger(value)) return domainError(codes.notInteger, field);
    if (!Number.isSafeInteger(value)) return domainError(codes.notSafe, field);
    return void 0;
  }
  function parsePositiveDecimal(value, field, codes) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      return { error: domainError(codes.notFinite, field) };
    }
    const raw = typeof value === "number" ? value.toString() : value;
    if (raw.length > MAX_DECIMAL_INPUT_LENGTH) {
      return { error: domainError("decimal_input_out_of_bounds", field) };
    }
    const text = raw.trim();
    const structure = DECIMAL_STRUCTURE.exec(text);
    if (!structure) return { error: domainError(codes.notFinite, field) };
    const integerDigits = structure[2] ?? "";
    const fractionDigits = structure[3] ?? "";
    const exponentDigits = structure[4] ?? "0";
    if (integerDigits.length + fractionDigits.length > MAX_DECIMAL_MANTISSA_DIGITS || fractionDigits.length > MAX_DECIMAL_FRACTION_DIGITS || BigInt(exponentDigits) > BigInt(MAX_DECIMAL_EXPONENT_ABS) || BigInt(exponentDigits) < BigInt(-MAX_DECIMAL_EXPONENT_ABS)) {
      return { error: domainError("decimal_input_out_of_bounds", field) };
    }
    try {
      const parsed = decimal(text);
      if (compare(parsed, integer(0)) <= 0) {
        return { error: domainError(codes.notPositive, field) };
      }
      return { value: parsed };
    } catch {
      return { error: domainError(codes.notFinite, field) };
    }
  }
  function exact(value) {
    return deepFreeze(serializeRational(value));
  }
  function metric(value, decimalPlaces) {
    const calculated = calculatedNumber(value, decimalPlaces);
    return deepFreeze({
      exact: deepFreeze(calculated.exact),
      approximate: calculated.approximate,
      display: calculated.display
    });
  }
  function hasFiniteApproximation(...values) {
    return values.every((value) => Number.isFinite(toNumber(value)));
  }
  function classifyBenchmarkDifference(value) {
    const comparison = compare(value, integer(0));
    const relation = comparison > 0 ? "above" : comparison < 0 ? "below" : "equal";
    const roundedDifference = calculatedNumber(value, 0).display;
    const differenceDisplayCode = comparison === 0 ? "exact_zero" : roundedDifference === 0 ? comparison > 0 ? "less_than_one_above" : "less_than_one_below" : "rounded_value";
    return { relation, differenceDisplayCode };
  }

  // tools/slot-balance/src/domain/slot-analysis-v2/benchmarks.ts
  var STANDARD_BENCHMARK_RATES = Object.freeze(["100", "103", "105"]);
  function calculateBenchmark(input) {
    const errors = [];
    const gamesError = validateGames(input.games, "games", {
      notPositive: "games_not_positive",
      notSafe: "games_not_safe"
    });
    const netError = validateNetMedals2(input.netMedals, "netMedals", {
      notInteger: "net_medals_not_integer",
      notSafe: "net_medals_not_safe"
    });
    const benchmarkRate = parsePositiveDecimal(input.benchmarkRate, "benchmarkRate", {
      notPositive: "benchmark_rate_not_positive",
      notFinite: "benchmark_rate_not_finite_decimal"
    });
    if (gamesError) errors.push(gamesError);
    if (netError) errors.push(netError);
    if (benchmarkRate.error) errors.push(benchmarkRate.error);
    if (!gamesError && !netError && BigInt(input.games) * 3n + BigInt(input.netMedals) < 0n) {
      errors.push(domainError("assumed_out_negative", "netMedals"));
    }
    if (errors.length > 0 || !benchmarkRate.value) return failure(errors);
    const assumedIn = multiply(integer(input.games), integer(3));
    const expectedNetMedals = divide(
      multiply(assumedIn, subtract(benchmarkRate.value, integer(100))),
      integer(100)
    );
    const differenceNetMedals = subtract(integer(input.netMedals), expectedNetMedals);
    if (!hasFiniteApproximation(expectedNetMedals, differenceNetMedals)) {
      return failure([domainError("result_not_finite", "benchmarkRate")]);
    }
    const { relation, differenceDisplayCode } = classifyBenchmarkDifference(differenceNetMedals);
    return success(
      {
        games: input.games,
        netMedals: input.netMedals,
        benchmarkRate: exact(benchmarkRate.value),
        expectedNetMedals: metric(expectedNetMedals, 0),
        differenceNetMedals: metric(differenceNetMedals, 0),
        relation,
        differenceDisplayCode
      },
      {
        formulaIds: ["benchmark_expected_net_medals", "benchmark_difference"],
        assumptionCodes: ["three_medals_per_game", "benchmark_is_comparison_not_prediction"],
        roundingCodes: ["half_away_from_zero_to_integer_medal"],
        warningCodes: []
      }
    );
  }
  function calculateStandardBenchmarks(input) {
    const values = [];
    for (const benchmarkRate of STANDARD_BENCHMARK_RATES) {
      const result = calculateBenchmark({ ...input, benchmarkRate });
      if (!result.ok) return result;
      values.push(result.value);
    }
    return success(values, {
      formulaIds: ["benchmark_expected_net_medals", "benchmark_difference"],
      assumptionCodes: ["three_medals_per_game", "benchmark_is_comparison_not_prediction"],
      roundingCodes: ["half_away_from_zero_to_integer_medal"],
      warningCodes: []
    });
  }

  // tools/slot-balance/src/domain/slot-analysis-v2/quick-performance.ts
  function calculateQuickPerformance(input) {
    const errors = [];
    const gamesError = validateGames(input.games, "games", {
      notPositive: "games_not_positive",
      notSafe: "games_not_safe"
    });
    const netError = validateNetMedals2(input.netMedals, "netMedals", {
      notInteger: "net_medals_not_integer",
      notSafe: "net_medals_not_safe"
    });
    if (gamesError) errors.push(gamesError);
    if (netError) errors.push(netError);
    if (!gamesError && !netError && BigInt(input.games) * 3n + BigInt(input.netMedals) < 0n) {
      errors.push(domainError("assumed_out_negative", "netMedals"));
    }
    if (errors.length > 0) return failure(errors);
    const assumedIn = integer(BigInt(input.games) * 3n);
    const assumedOut = add(assumedIn, integer(input.netMedals));
    const payoutRate = divide(multiply(assumedOut, integer(100)), assumedIn);
    const netMedalsPer1000Games = divide(
      multiply(integer(input.netMedals), integer(1e3)),
      integer(input.games)
    );
    return success(
      {
        games: input.games,
        netMedals: input.netMedals,
        assumedInMedals: input.games * 3,
        assumedOutMedals: input.games * 3 + input.netMedals,
        payoutRate: metric(payoutRate, 1),
        netMedalsPer1000Games: metric(netMedalsPer1000Games, 1)
      },
      {
        formulaIds: ["quick_performance_rate", "net_medals_per_1000_games"],
        assumptionCodes: ["three_medals_per_game"],
        roundingCodes: ["half_away_from_zero_to_one_decimal"],
        warningCodes: []
      }
    );
  }

  // tools/slot-balance/src/domain/slot-analysis-v2/sensitivity.ts
  function calculatePayoutRateSensitivity(input) {
    const gamesError = validateGames(input.games, "games", {
      notPositive: "games_not_positive",
      notSafe: "games_not_safe"
    });
    if (gamesError) return failure([gamesError]);
    const sensitivity = divide(integer(1e4), integer(input.games * 3));
    return success(
      {
        games: input.games,
        payoutRatePointsPer100Medals: metric(sensitivity, 1)
      },
      {
        formulaIds: ["payout_rate_sensitivity"],
        assumptionCodes: ["three_medals_per_game"],
        roundingCodes: ["half_away_from_zero_to_one_decimal"],
        warningCodes: []
      }
    );
  }

  // tools/slot-balance/src/domain/slot-analysis-v2/target-reverse.ts
  function calculateTargetReverse(input) {
    const errors = [];
    const currentGamesError = validateGames(input.currentGames, "currentGames", {
      notPositive: "games_not_positive",
      notSafe: "games_not_safe"
    });
    const currentNetError = validateNetMedals2(input.currentNetMedals, "currentNetMedals", {
      notInteger: "net_medals_not_integer",
      notSafe: "net_medals_not_safe"
    });
    const targetGamesError = validateGames(input.targetTotalGames, "targetTotalGames", {
      notPositive: "target_games_not_positive",
      notSafe: "target_games_not_safe"
    });
    const targetRate = parsePositiveDecimal(input.targetPayoutRate, "targetPayoutRate", {
      notPositive: "target_rate_not_positive",
      notFinite: "target_rate_not_finite_decimal"
    });
    if (currentGamesError) errors.push(currentGamesError);
    if (currentNetError) errors.push(currentNetError);
    if (targetGamesError) errors.push(targetGamesError);
    if (targetRate.error) errors.push(targetRate.error);
    if (!currentGamesError && !currentNetError && BigInt(input.currentGames) * 3n + BigInt(input.currentNetMedals) < 0n) {
      errors.push(domainError("assumed_out_negative", "currentNetMedals"));
    }
    if (!currentGamesError && !targetGamesError && input.targetTotalGames <= input.currentGames) {
      errors.push(domainError("target_games_not_after_current", "targetTotalGames"));
    }
    if (errors.length > 0 || !targetRate.value) return failure(errors);
    const remainingGames = input.targetTotalGames - input.currentGames;
    const targetIn = integer(input.targetTotalGames * 3);
    const exactTargetTotalNetMedals = divide(
      multiply(targetIn, subtract(targetRate.value, integer(100))),
      integer(100)
    );
    const exactRequiredFutureNetMedals = subtract(
      exactTargetTotalNetMedals,
      integer(input.currentNetMedals)
    );
    const remainingIn = integer(remainingGames * 3);
    const exactRequiredFutureOut = add(remainingIn, exactRequiredFutureNetMedals);
    const clampedToNonnegativeOut = compare(exactRequiredFutureOut, integer(0)) < 0;
    const exactIntegerMinimum = ceil(exactRequiredFutureNetMedals);
    const lowestExecutableNet = -BigInt(remainingGames * 3);
    const executableIntegerMinimum = exactIntegerMinimum < lowestExecutableNet ? lowestExecutableNet : exactIntegerMinimum;
    const minimumFutureNetMedals = Number(executableIntegerMinimum);
    const minimumFutureOutMedals = remainingGames * 3 + minimumFutureNetMedals;
    const boundaryFuturePayoutRate = divide(
      multiply(integer(minimumFutureOutMedals), integer(100)),
      remainingIn
    );
    if (!hasFiniteApproximation(
      exactTargetTotalNetMedals,
      exactRequiredFutureNetMedals,
      boundaryFuturePayoutRate
    )) {
      return failure([domainError("result_not_finite", "targetPayoutRate")]);
    }
    let status;
    if (clampedToNonnegativeOut) status = "any_nonnegative_out_suffices";
    else if (minimumFutureNetMedals > 0) status = "must_gain";
    else if (minimumFutureNetMedals === 0) status = "no_net_change_required";
    else status = "can_lose_up_to";
    return success(
      {
        currentGames: input.currentGames,
        currentNetMedals: input.currentNetMedals,
        targetTotalGames: input.targetTotalGames,
        targetPayoutRate: exact(targetRate.value),
        remainingGames,
        exactTargetTotalNetMedals: metric(exactTargetTotalNetMedals, 0),
        exactRequiredFutureNetMedals: metric(exactRequiredFutureNetMedals, 0),
        minimumIntegerFutureNetMedals: minimumFutureNetMedals,
        minimumFutureOutMedals,
        requiredFuturePayoutRate: metric(boundaryFuturePayoutRate, 1),
        status,
        ...status === "can_lose_up_to" ? { allowedLossMedals: Math.abs(minimumFutureNetMedals) } : {},
        clampedToNonnegativeOut,
        assumptions: ["three_medals_per_game", "mathematical_boundary_not_prediction"],
        warnings: clampedToNonnegativeOut ? ["future_out_clamped_to_zero"] : []
      },
      {
        formulaIds: [
          "target_total_net_medals",
          "target_required_future_net_medals",
          "target_required_future_payout_rate"
        ],
        assumptionCodes: ["three_medals_per_game", "mathematical_boundary_not_prediction"],
        roundingCodes: [
          "half_away_from_zero_to_integer_medal",
          "ceil_to_integer_medal_boundary",
          "half_away_from_zero_to_one_decimal"
        ],
        warningCodes: clampedToNonnegativeOut ? ["future_out_clamped_to_zero"] : []
      }
    );
  }

  // tools/slot-balance/src/domain/slot-analysis-v2/drawdown.ts
  function calculateDrawdownRecovery(points) {
    if (points.length < 2) {
      return failure([{ code: "cumulative_points_required", field: "points" }]);
    }
    const errors = [];
    points.forEach((point, index) => {
      const error2 = validateNetMedals2(point.netMedals, `points[${index}].netMedals`, {
        notInteger: "cumulative_net_medals_not_integer",
        notSafe: "cumulative_net_medals_not_safe"
      });
      if (error2) errors.push({ ...error2, index });
    });
    if (errors.length > 0) return failure(errors);
    let peakValue = BigInt(points[0]?.netMedals ?? 0);
    let peakIndex = 0;
    let maxDrawdown = 0n;
    let drawdownPeakIndex;
    let drawdownTroughIndex;
    let recoveryEligible = false;
    let recoveryTroughValue = 0n;
    let recoveryTroughIndex = 0;
    let maxRecovery = 0n;
    let maxRecoveryTroughIndex;
    let maxRecoveryEndIndex;
    for (let index = 1; index < points.length; index += 1) {
      const value = BigInt(points[index]?.netMedals ?? 0);
      const drawdown = peakValue - value;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        drawdownPeakIndex = peakIndex;
        drawdownTroughIndex = index;
      }
      if (value < peakValue) {
        if (!recoveryEligible || value < recoveryTroughValue) {
          recoveryTroughValue = value;
          recoveryTroughIndex = index;
        }
        recoveryEligible = true;
      }
      if (recoveryEligible) {
        const recovery = value - recoveryTroughValue;
        if (recovery > maxRecovery) {
          maxRecovery = recovery;
          maxRecoveryTroughIndex = recoveryTroughIndex;
          maxRecoveryEndIndex = index;
        }
      }
      if (value > peakValue) {
        peakValue = value;
        peakIndex = index;
      }
    }
    if (maxDrawdown > BigInt(Number.MAX_SAFE_INTEGER) || maxRecovery > BigInt(Number.MAX_SAFE_INTEGER)) {
      return failure([domainError("cumulative_movement_not_safe", "points")]);
    }
    return success(
      {
        maximumDrawdown: {
          medals: Number(maxDrawdown),
          ...drawdownPeakIndex === void 0 ? {} : { startIndex: drawdownPeakIndex, endIndex: drawdownTroughIndex }
        },
        maximumRecoveryAfterDrawdown: {
          medals: Number(maxRecovery),
          ...maxRecoveryTroughIndex === void 0 ? {} : { startIndex: maxRecoveryTroughIndex, endIndex: maxRecoveryEndIndex }
        }
      },
      {
        formulaIds: ["maximum_endpoint_drawdown", "maximum_recovery_after_drawdown"],
        assumptionCodes: ["endpoint_movements_only"],
        roundingCodes: [],
        warningCodes: []
      }
    );
  }

  // tools/slot-balance/src/domain/slot-analysis-v2/segments.ts
  var SLOT_ANALYSIS_MAX_SEGMENTS = 100;
  function segmentProvenance(segment, index) {
    return segment.provenance ?? { source: "direct", sourceSegmentIndex: index };
  }
  function endpointSourceIndices(segments) {
    const first = segments[0]?.provenance;
    const startIndex = first?.source === "cumulative_points" ? first.sourceStartPointIndex ?? 0 : 0;
    return [
      startIndex,
      ...segments.map(
        (segment, index) => segment.provenance?.source === "cumulative_points" ? segment.provenance.sourceEndPointIndex ?? index + 1 : index + 1
      )
    ];
  }
  function mapMovementIndices(values, sourceIndices) {
    const mapMovement = (movement) => ({
      medals: movement.medals,
      ...movement.startIndex === void 0 ? {} : {
        startIndex: sourceIndices[movement.startIndex],
        endIndex: sourceIndices[movement.endIndex ?? movement.startIndex]
      }
    });
    return {
      maximumDrawdown: mapMovement(values.maximumDrawdown),
      maximumRecoveryAfterDrawdown: mapMovement(values.maximumRecoveryAfterDrawdown)
    };
  }
  function segmentMetrics(games, netMedals) {
    const assumedIn = integer(games * 3);
    return {
      payoutRate: metric(
        divide(multiply(add(assumedIn, integer(netMedals)), integer(100)), assumedIn),
        1
      ),
      netMedalsPer1000Games: metric(
        divide(multiply(integer(netMedals), integer(1e3)), integer(games)),
        1
      )
    };
  }
  function benchmarkValues(games, netMedals, benchmarkRate) {
    const result = calculateBenchmark({ games, netMedals, benchmarkRate });
    if (!result.ok) return result;
    const condition = result.value.relation === "above" ? "above_benchmark_segment" : result.value.relation === "below" ? "below_benchmark_segment" : "on_benchmark";
    return success(
      {
        benchmarkRate: result.value.benchmarkRate,
        expectedNetMedals: result.value.expectedNetMedals,
        differenceNetMedals: result.value.differenceNetMedals,
        contributionNetMedals: result.value.differenceNetMedals,
        relation: result.value.relation,
        differenceDisplayCode: result.value.differenceDisplayCode,
        condition
      },
      {
        formulaIds: [...result.metadata.formulaIds, "segment_benchmark_contribution"],
        assumptionCodes: result.metadata.assumptionCodes,
        roundingCodes: result.metadata.roundingCodes,
        warningCodes: result.metadata.warningCodes
      }
    );
  }
  function analyzeSegments(input) {
    if (input.segments.length === 0) {
      return failure([domainError("segments_required", "segments")]);
    }
    if (input.segments.length > SLOT_ANALYSIS_MAX_SEGMENTS) {
      return failure([domainError("segments_limit_exceeded", "segments")]);
    }
    const errors = [];
    let totalGamesBigInt = 0n;
    let totalNetMedalsBigInt = 0n;
    let cumulativeNetMedalsBigInt = 0n;
    input.segments.forEach((segment, index) => {
      const gamesError = validateGames(segment.games, `segments[${index}].games`, {
        notPositive: "segment_games_not_positive",
        notSafe: "segment_games_not_safe"
      });
      const netError = validateNetMedals2(segment.netMedals, `segments[${index}].netMedals`, {
        notInteger: "segment_net_medals_not_integer",
        notSafe: "segment_net_medals_not_safe"
      });
      if (gamesError) errors.push({ ...gamesError, index });
      if (netError) errors.push({ ...netError, index });
      if (!gamesError && !netError) {
        if (BigInt(segment.games) * 3n + BigInt(segment.netMedals) < 0n) {
          errors.push(
            domainError("segment_assumed_out_negative", `segments[${index}].netMedals`, index)
          );
        }
        totalGamesBigInt += BigInt(segment.games);
        totalNetMedalsBigInt += BigInt(segment.netMedals);
        cumulativeNetMedalsBigInt += BigInt(segment.netMedals);
        if (cumulativeNetMedalsBigInt > BigInt(Number.MAX_SAFE_INTEGER) || cumulativeNetMedalsBigInt < BigInt(Number.MIN_SAFE_INTEGER)) {
          errors.push(
            domainError(
              "segment_cumulative_net_medals_not_safe",
              `segments[${index}].netMedals`,
              index
            )
          );
        }
      }
    });
    if (totalGamesBigInt > BigInt(MAX_THREE_MEDAL_GAMES) || totalNetMedalsBigInt > BigInt(Number.MAX_SAFE_INTEGER) || totalNetMedalsBigInt < BigInt(Number.MIN_SAFE_INTEGER)) {
      errors.push(domainError("segment_totals_not_safe", "segments"));
    }
    if (errors.length > 0) return failure(errors);
    const totalGames = Number(totalGamesBigInt);
    const totalNetMedals = Number(totalNetMedalsBigInt);
    const segments = [];
    for (const [index, inputSegment] of input.segments.entries()) {
      const clonedInput = {
        ...inputSegment.label === void 0 ? {} : { label: inputSegment.label },
        games: inputSegment.games,
        netMedals: inputSegment.netMedals,
        provenance: segmentProvenance(inputSegment, index)
      };
      let segmentBenchmark;
      if (input.benchmarkRate !== void 0) {
        const benchmark = benchmarkValues(
          inputSegment.games,
          inputSegment.netMedals,
          input.benchmarkRate
        );
        if (!benchmark.ok) return benchmark;
        segmentBenchmark = benchmark.value;
      }
      segments.push({
        input: clonedInput,
        provenance: clonedInput.provenance ?? segmentProvenance(inputSegment, index),
        ...segmentMetrics(inputSegment.games, inputSegment.netMedals),
        ...segmentBenchmark === void 0 ? {} : { benchmark: segmentBenchmark }
      });
    }
    const aggregateMetrics = segmentMetrics(totalGames, totalNetMedals);
    let aggregateBenchmark;
    if (input.benchmarkRate !== void 0) {
      const benchmark = benchmarkValues(totalGames, totalNetMedals, input.benchmarkRate);
      if (!benchmark.ok) return benchmark;
      aggregateBenchmark = {
        benchmarkRate: benchmark.value.benchmarkRate,
        expectedNetMedals: benchmark.value.expectedNetMedals,
        differenceNetMedals: benchmark.value.differenceNetMedals,
        contributionNetMedals: benchmark.value.contributionNetMedals,
        relation: benchmark.value.relation,
        differenceDisplayCode: benchmark.value.differenceDisplayCode
      };
    }
    const aggregate = {
      aggregateGames: totalGames,
      aggregateNetMedals: totalNetMedals,
      aggregatePayoutRate: aggregateMetrics.payoutRate,
      aggregateNetMedalsPer1000Games: aggregateMetrics.netMedalsPer1000Games,
      ...aggregateBenchmark === void 0 ? {} : { benchmark: aggregateBenchmark }
    };
    const sourceIndices = endpointSourceIndices(input.segments);
    const cumulativePoints = [{ netMedals: 0 }];
    const cumulativeEndpoints = [
      {
        pointIndex: 0,
        sourceIndex: sourceIndices[0] ?? 0,
        cumulativeGames: 0,
        cumulativeNetMedals: 0
      }
    ];
    let cumulativeGamesBigInt = 0n;
    cumulativeNetMedalsBigInt = 0n;
    for (const [index, segment] of input.segments.entries()) {
      cumulativeGamesBigInt += BigInt(segment.games);
      cumulativeNetMedalsBigInt += BigInt(segment.netMedals);
      const cumulativeGames = Number(cumulativeGamesBigInt);
      const cumulativeNetMedals = Number(cumulativeNetMedalsBigInt);
      cumulativePoints.push({ netMedals: cumulativeNetMedals });
      cumulativeEndpoints.push({
        pointIndex: index + 1,
        sourceIndex: sourceIndices[index + 1] ?? index + 1,
        cumulativeGames,
        cumulativeNetMedals
      });
    }
    const drawdownRecovery = calculateDrawdownRecovery(cumulativePoints);
    if (!drawdownRecovery.ok) return drawdownRecovery;
    return success(
      {
        segments,
        aggregate,
        cumulativeEndpoints,
        drawdownRecovery: mapMovementIndices(drawdownRecovery.value, sourceIndices)
      },
      {
        formulaIds: [
          "segment_performance_rate",
          "net_medals_per_1000_games",
          "aggregate_performance_rate",
          ...input.benchmarkRate === void 0 ? [] : [
            "benchmark_expected_net_medals",
            "benchmark_difference",
            "segment_benchmark_contribution"
          ],
          "maximum_endpoint_drawdown",
          "maximum_recovery_after_drawdown"
        ],
        assumptionCodes: [
          "three_medals_per_game",
          "endpoint_movements_only",
          ...input.benchmarkRate === void 0 ? [] : ["benchmark_is_comparison_not_prediction"]
        ],
        roundingCodes: [
          "half_away_from_zero_to_one_decimal",
          ...input.benchmarkRate === void 0 ? [] : ["half_away_from_zero_to_integer_medal"]
        ],
        warningCodes: []
      }
    );
  }

  // tools/slot-balance/src/domain/slot-analysis-v2/cumulative-points.ts
  function convertCumulativePoints(input) {
    if (input.points.length < 2) {
      return failure([domainError("cumulative_points_required", "points")]);
    }
    if (input.points.length > 101) {
      return failure([domainError("cumulative_points_limit_exceeded", "points")]);
    }
    const errors = [];
    const points = input.points.map((point) => ({
      ...point.label === void 0 ? {} : { label: point.label },
      cumulativeGames: point.cumulativeGames,
      cumulativeNetMedals: point.cumulativeNetMedals
    }));
    points.forEach((point, index) => {
      if (!Number.isInteger(point.cumulativeGames)) {
        errors.push(
          domainError("cumulative_games_not_integer", `points[${index}].cumulativeGames`, index)
        );
      } else if (!Number.isSafeInteger(point.cumulativeGames) || point.cumulativeGames > MAX_THREE_MEDAL_GAMES) {
        errors.push(
          domainError("cumulative_games_not_safe", `points[${index}].cumulativeGames`, index)
        );
      } else if (point.cumulativeGames < 0) {
        errors.push(
          domainError("cumulative_games_negative", `points[${index}].cumulativeGames`, index)
        );
      }
      const netError = validateNetMedals2(
        point.cumulativeNetMedals,
        `points[${index}].cumulativeNetMedals`,
        {
          notInteger: "cumulative_net_medals_not_integer",
          notSafe: "cumulative_net_medals_not_safe"
        }
      );
      if (netError) errors.push({ ...netError, index });
      if (index > 0 && Number.isSafeInteger(point.cumulativeGames)) {
        const previousGames = points[index - 1]?.cumulativeGames;
        if (previousGames !== void 0 && point.cumulativeGames <= previousGames) {
          errors.push(
            domainError("cumulative_games_not_increasing", `points[${index}].cumulativeGames`, index)
          );
        }
      }
    });
    if (errors.length > 0) return failure(errors);
    const segments = [];
    for (let index = 1; index < points.length; index += 1) {
      const start = points[index - 1];
      const end = points[index];
      if (!start || !end) continue;
      const games = end.cumulativeGames - start.cumulativeGames;
      const netMedalsBigInt = BigInt(end.cumulativeNetMedals) - BigInt(start.cumulativeNetMedals);
      if (netMedalsBigInt > BigInt(Number.MAX_SAFE_INTEGER) || netMedalsBigInt < BigInt(Number.MIN_SAFE_INTEGER)) {
        return failure([
          domainError("segment_net_medals_not_safe", `points[${index}].cumulativeNetMedals`, index)
        ]);
      }
      const netMedals = Number(netMedalsBigInt);
      if (BigInt(games) * 3n + netMedalsBigInt < 0n) {
        return failure([
          domainError("segment_assumed_out_negative", `points[${index}].cumulativeNetMedals`, index)
        ]);
      }
      segments.push({
        ...start.label !== void 0 && end.label !== void 0 ? { label: `${start.label} \u2192 ${end.label}` } : {},
        games,
        netMedals,
        provenance: {
          source: "cumulative_points",
          sourceStartPointIndex: index - 1,
          sourceEndPointIndex: index
        }
      });
    }
    return success(
      { points, segments },
      {
        formulaIds: ["cumulative_point_difference"],
        assumptionCodes: ["cumulative_points_are_observations"],
        roundingCodes: [],
        warningCodes: []
      }
    );
  }
  function analyzeCumulativePoints(input) {
    const conversion = convertCumulativePoints(input);
    if (!conversion.ok) return conversion;
    const analysis = analyzeSegments({
      segments: conversion.value.segments,
      ...input.benchmarkRate === void 0 ? {} : { benchmarkRate: input.benchmarkRate }
    });
    if (!analysis.ok) return analysis;
    const cumulativeEndpoints = conversion.value.points.map((point, index) => ({
      pointIndex: index,
      sourceIndex: index,
      cumulativeGames: point.cumulativeGames,
      cumulativeNetMedals: point.cumulativeNetMedals
    }));
    return success(
      { ...analysis.value, points: conversion.value.points, cumulativeEndpoints },
      mergeMetadata(conversion.metadata, analysis.metadata)
    );
  }

  // tools/slot-balance/src/domain/normalizers.ts
  var DEFAULT_UNITS = ["\u30B2\u30FC\u30E0", "G", "\u679A", "\u5186"];
  function error(code, field, message2, correction) {
    return {
      messages: [{ severity: "error", code, field, message: message2, correction }]
    };
  }
  function escapeForRegularExpression(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function normalizeNumericInput(raw, options) {
    const label = options.label ?? options.field;
    const allowDecimal = options.allowDecimal ?? false;
    if (raw === void 0 || raw === null) return { messages: [] };
    if (typeof raw === "number") {
      if (!Number.isFinite(raw)) {
        return error(
          "non_finite_number",
          options.field,
          `${label}\u306B\u6709\u9650\u306E\u6570\u5024\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
          "NaN\u3084Infinity\u3067\u306F\u306A\u304F\u3001\u901A\u5E38\u306E\u6570\u5B57\u3078\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        );
      }
      if (!allowDecimal && !Number.isSafeInteger(raw)) {
        return error(
          Number.isInteger(raw) ? "unsafe_integer" : "integer_required",
          options.field,
          Number.isInteger(raw) ? `${label}\u304C\u5B89\u5168\u306B\u6271\u3048\u308B\u6574\u6570\u7BC4\u56F2\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002` : `${label}\u306F\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
          "\u5C0F\u6570\u3084\u6975\u7AEF\u306B\u5927\u304D\u306A\u5024\u3092\u907F\u3051\u3001\u6574\u6570\u3078\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        );
      }
      return { value: Object.is(raw, -0) ? 0 : raw, canonical: String(raw), messages: [] };
    }
    if (typeof raw !== "string") {
      return error(
        "invalid_numeric_input",
        options.field,
        `${label}\u3092\u6570\u5B57\u3068\u3057\u3066\u8AAD\u307F\u53D6\u308C\u307E\u305B\u3093\u3002`,
        "\u6570\u5B57\u3001\u7B26\u53F7\u3001\u30AB\u30F3\u30DE\u3001\u7A7A\u767D\u3001\u5BFE\u5FDC\u5358\u4F4D\u3060\u3051\u3092\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      );
    }
    let normalized = raw.normalize("NFKC").trim();
    if (normalized === "") return { messages: [] };
    const units = (options.units ?? DEFAULT_UNITS).map(escapeForRegularExpression).sort((left, right) => right.length - left.length);
    if (units.length > 0) {
      normalized = normalized.replace(new RegExp(`(?:${units.join("|")})\\s*$`, "i"), "");
    }
    normalized = normalized.replace(/[,\s]/gu, "");
    if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)) {
      return error(
        "invalid_numeric_input",
        options.field,
        `${label}\u306B\u5BFE\u5FDC\u3057\u3066\u3044\u306A\u3044\u6587\u5B57\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u3002`,
        "\u4F8B\u306E\u3088\u3046\u306B\u300C4,000G\u300D\u300C+500\u679A\u300D\u300C20000\u5186\u300D\u306E\u5F62\u5F0F\u3078\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      );
    }
    const value = Number(normalized);
    if (!Number.isFinite(value)) {
      return error(
        "non_finite_number",
        options.field,
        `${label}\u304C\u5927\u304D\u3059\u304E\u308B\u305F\u3081\u8A08\u7B97\u3067\u304D\u307E\u305B\u3093\u3002`,
        "\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3001\u901A\u5E38\u306E\u7BC4\u56F2\u306E\u6570\u5B57\u3078\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      );
    }
    if (!allowDecimal && !Number.isInteger(value)) {
      return error(
        "integer_required",
        options.field,
        `${label}\u306F\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
        "\u5C0F\u6570\u70B9\u4EE5\u4E0B\u3092\u542B\u3081\u305A\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      );
    }
    if (!allowDecimal && !Number.isSafeInteger(value)) {
      return error(
        "unsafe_integer",
        options.field,
        `${label}\u304C\u5B89\u5168\u306B\u6271\u3048\u308B\u6574\u6570\u7BC4\u56F2\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002`,
        "\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3001\u3088\u308A\u5C0F\u3055\u3044\u6574\u6570\u3078\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      );
    }
    return {
      value: Object.is(value, -0) ? 0 : value,
      canonical: String(Object.is(value, -0) ? 0 : value),
      messages: []
    };
  }
  function normalizeIntegerInput(raw, field, label) {
    return normalizeNumericInput(raw, { field, label, allowDecimal: false });
  }
  function normalizeDecimalInput(raw, field, label) {
    return normalizeNumericInput(raw, { field, label, allowDecimal: true });
  }

  // tools/slot-balance/src/ui-v2/shared.ts
  var integerFormatter = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
  var oneDecimalFormatter = new Intl.NumberFormat("ja-JP", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  function byId(id) {
    const node = document.getElementById(id);
    if (!(node instanceof HTMLElement)) throw new Error(`Missing UI element: ${id}`);
    return node;
  }
  function create(tag, options = {}) {
    const node = document.createElement(tag);
    if (options.className) node.className = options.className;
    if (options.text !== void 0) node.textContent = options.text;
    return node;
  }
  function formatInteger(value) {
    return integerFormatter.format(value);
  }
  function formatOneDecimal(value) {
    return oneDecimalFormatter.format(value);
  }
  function formatSigned(value, fractionDigits = 0) {
    const formatted = fractionDigits === 1 ? formatOneDecimal(Math.abs(value)) : formatInteger(Math.abs(value));
    if (value === 0) return fractionDigits === 1 ? formatOneDecimal(0) : "0";
    return `${value > 0 ? "+" : "\u2212"}${formatted}`;
  }
  function requiredInteger(input, field, label) {
    if (input.value.trim() === "")
      return { errors: [{ field, message: `${label}\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002` }] };
    const normalized = normalizeIntegerInput(input.value, field, label);
    return {
      value: normalized.value,
      errors: validationErrors(normalized.messages)
    };
  }
  function requiredDecimal(input, field, label) {
    if (input.value.trim() === "")
      return { errors: [{ field, message: `${label}\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002` }] };
    const normalized = normalizeDecimalInput(input.value, field, label);
    return {
      value: normalized.value,
      errors: validationErrors(normalized.messages)
    };
  }
  function optionalInteger(input, field, label) {
    if (input.value.trim() === "") return { errors: [] };
    const normalized = normalizeIntegerInput(input.value, field, label);
    return { value: normalized.value, errors: validationErrors(normalized.messages) };
  }
  function optionalDecimal(input, field, label) {
    if (input.value.trim() === "") return { errors: [] };
    const normalized = normalizeDecimalInput(input.value, field, label);
    return { value: normalized.value, errors: validationErrors(normalized.messages) };
  }
  function validationErrors(messages) {
    return messages.filter(({ severity }) => severity === "error").map(({ field, correction, message: message2 }) => ({
      ...field === void 0 ? {} : { field },
      message: correction ?? message2
    }));
  }
  var domainMessages = {
    games_not_positive: "\u7DCF\u30B2\u30FC\u30E0\u6570\u306F1\u4EE5\u4E0A\u306E\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    games_not_safe: "\u7DCF\u30B2\u30FC\u30E0\u6570\u306E\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    net_medals_not_integer: "\u5DEE\u679A\u306F\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    net_medals_not_safe: "\u5DEE\u679A\u306E\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    assumed_out_negative: "\u5DEE\u679A\u304C\u5C0F\u3055\u3059\u304E\u308B\u305F\u3081\u3001\u60F3\u5B9AOUT\u304C0\u679A\u672A\u6E80\u306B\u306A\u308A\u307E\u3059\u3002",
    benchmark_rate_not_positive: "\u6BD4\u8F03\u57FA\u6E96\u7387\u306F0\u3088\u308A\u5927\u304D\u3044\u6570\u5024\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    benchmark_rate_not_finite_decimal: "\u6BD4\u8F03\u57FA\u6E96\u7387\u3092\u901A\u5E38\u306E\u6570\u5B57\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    decimal_input_out_of_bounds: "\u5165\u529B\u3057\u305F\u7387\u306E\u6841\u6570\u304C\u5927\u304D\u3059\u304E\u307E\u3059\u3002",
    target_games_not_positive: "\u76EE\u6A19\u7DCF\u30B2\u30FC\u30E0\u6570\u306F1\u4EE5\u4E0A\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    target_games_not_safe: "\u76EE\u6A19\u7DCF\u30B2\u30FC\u30E0\u6570\u306E\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    target_games_not_after_current: "\u76EE\u6A19\u7DCF\u30B2\u30FC\u30E0\u6570\u306F\u73FE\u5728\u306E\u7DCF\u30B2\u30FC\u30E0\u6570\u3088\u308A\u5927\u304D\u304F\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    target_rate_not_positive: "\u76EE\u6A19\u51FA\u7389\u7387\u306F0\u3088\u308A\u5927\u304D\u3044\u6570\u5024\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    target_rate_not_finite_decimal: "\u76EE\u6A19\u51FA\u7389\u7387\u3092\u901A\u5E38\u306E\u6570\u5B57\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    segment_games_not_positive: "\u533A\u9593\u30B2\u30FC\u30E0\u6570\u306F1\u4EE5\u4E0A\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    segment_games_not_safe: "\u533A\u9593\u30B2\u30FC\u30E0\u6570\u306E\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    segment_net_medals_not_integer: "\u533A\u9593\u5DEE\u679A\u306F\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    segment_net_medals_not_safe: "\u533A\u9593\u5DEE\u679A\u306E\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    segment_assumed_out_negative: "\u3053\u306E\u533A\u9593\u306F\u60F3\u5B9AOUT\u304C0\u679A\u672A\u6E80\u306B\u306A\u308A\u307E\u3059\u3002",
    segment_totals_not_safe: "\u533A\u9593\u306E\u5408\u8A08\u304C\u5B89\u5168\u306B\u8A08\u7B97\u3067\u304D\u308B\u7BC4\u56F2\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002",
    segment_cumulative_net_medals_not_safe: "\u9014\u4E2D\u306E\u7D2F\u7A4D\u5DEE\u679A\u304C\u5B89\u5168\u306B\u8A08\u7B97\u3067\u304D\u308B\u7BC4\u56F2\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002",
    cumulative_games_not_increasing: "\u7D2F\u7A4D\u30B2\u30FC\u30E0\u6570\u306F\u524D\u306E\u5730\u70B9\u3088\u308A\u5927\u304D\u304F\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    cumulative_games_negative: "\u7D2F\u7A4D\u30B2\u30FC\u30E0\u6570\u306F0\u4EE5\u4E0A\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    cumulative_games_not_integer: "\u7D2F\u7A4D\u30B2\u30FC\u30E0\u6570\u306F\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    cumulative_games_not_safe: "\u7D2F\u7A4D\u30B2\u30FC\u30E0\u6570\u306E\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    cumulative_net_medals_not_integer: "\u7D2F\u7A4D\u5DEE\u679A\u306F\u6574\u6570\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    cumulative_net_medals_not_safe: "\u7D2F\u7A4D\u5DEE\u679A\u306E\u6841\u6570\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    cumulative_movement_not_safe: "\u5730\u70B9\u9593\u306E\u5DEE\u679A\u5909\u5316\u304C\u5B89\u5168\u306B\u8A08\u7B97\u3067\u304D\u308B\u7BC4\u56F2\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002"
  };
  function domainErrors(errors, mapField = ({ field }) => field) {
    return errors.map((error2) => ({
      ...mapField(error2) === void 0 ? {} : { field: mapField(error2) },
      message: domainMessages[error2.code] ?? "\u5165\u529B\u6761\u4EF6\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    }));
  }
  function clearErrors() {
    document.querySelectorAll("[data-error-for]").forEach((output) => {
      output.textContent = "";
    });
    document.querySelectorAll('[aria-invalid="true"]').forEach((input) => {
      input.removeAttribute("aria-invalid");
    });
    const summary = byId("error-summary");
    summary.hidden = true;
    byId("error-summary-list").replaceChildren();
  }
  function showErrors(errors) {
    clearErrors();
    if (errors.length === 0) return;
    const unique2 = errors.filter(
      (error2, index) => errors.findIndex((candidate) => candidate.message === error2.message) === index
    );
    const list = byId("error-summary-list");
    for (const error2 of unique2) {
      list.append(create("li", { text: error2.message }));
      if (!error2.field) continue;
      const input = document.querySelector(`[name="${CSS.escape(error2.field)}"]`);
      const output = document.querySelector(
        `[data-error-for="${CSS.escape(error2.field)}"]`
      );
      input?.setAttribute("aria-invalid", "true");
      if (output) output.textContent = error2.message;
    }
    const summary = byId("error-summary");
    summary.hidden = false;
    summary.focus({ preventScroll: true });
    summary.scrollIntoView({ block: "center" });
  }
  var formulaLabels = {
    quick_performance_rate: "\u60F3\u5B9AIN\u30FBOUT\u304B\u3089\u5B9F\u7E3E\u51FA\u7389\u7387\u3092\u8A08\u7B97",
    net_medals_per_1000_games: "\u5DEE\u679A\u30921,000G\u3042\u305F\u308A\u3078\u63DB\u7B97",
    benchmark_expected_net_medals: "\u6BD4\u8F03\u57FA\u6E96\u7387\u306E\u671F\u5F85\u5DEE\u679A\u3092\u8A08\u7B97",
    benchmark_difference: "\u5B9F\u7E3E\u5DEE\u679A\u3068\u57FA\u6E96\u671F\u5F85\u5DEE\u679A\u306E\u5DEE\u3092\u8A08\u7B97",
    payout_rate_sensitivity: "100\u679A\u5909\u5316\u6642\u306E\u51FA\u7389\u7387\u30DD\u30A4\u30F3\u30C8\u3092\u8A08\u7B97",
    target_total_net_medals: "\u76EE\u6A19\u7DCF\u5DEE\u679A\u3092\u8A08\u7B97",
    target_required_future_net_medals: "\u6B8B\u308A\u533A\u9593\u306E\u5FC5\u8981\u5DEE\u679A\u3092\u8A08\u7B97",
    target_required_future_payout_rate: "\u6B8B\u308A\u533A\u9593\u306E\u5883\u754C\u51FA\u7389\u7387\u3092\u8A08\u7B97",
    cumulative_point_difference: "\u96A3\u63A5\u3059\u308B\u7D2F\u7A4D\u5730\u70B9\u3092\u533A\u9593\u3078\u5909\u63DB",
    segment_performance_rate: "\u5404\u533A\u9593\u306E\u5B9F\u7E3E\u51FA\u7389\u7387\u3092\u8A08\u7B97",
    segment_benchmark_contribution: "\u5404\u533A\u9593\u306E\u57FA\u6E96\u306B\u5BFE\u3059\u308B\u5BC4\u4E0E\u3092\u8A08\u7B97",
    aggregate_performance_rate: "\u5168\u533A\u9593\u306E\u5408\u8A08\u304B\u3089\u5B9F\u7E3E\u51FA\u7389\u7387\u3092\u518D\u8A08\u7B97",
    maximum_endpoint_drawdown: "\u5165\u529B\u5730\u70B9\u9593\u306E\u6700\u5927\u4E0B\u843D\u3092\u8A08\u7B97",
    maximum_recovery_after_drawdown: "\u4E0B\u843D\u5F8C\u306E\u6700\u5927\u56DE\u5FA9\u3092\u8A08\u7B97"
  };
  var assumptionLabels = {
    three_medals_per_game: "1G\u3042\u305F\u308A3\u679A\u6295\u5165\u306E\u60F3\u5B9A\u5024\u3067\u3059\u3002",
    benchmark_is_comparison_not_prediction: "\u6BD4\u8F03\u57FA\u6E96\u306F\u8A2D\u5B9A\u30FB\u671F\u5F85\u30FB\u672A\u6765\u4E88\u6E2C\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    mathematical_boundary_not_prediction: "\u6570\u5B66\u4E0A\u306E\u5883\u754C\u3067\u3001\u5230\u9054\u3084\u5C06\u6765\u7D50\u679C\u3092\u4FDD\u8A3C\u3057\u307E\u305B\u3093\u3002",
    cumulative_points_are_observations: "\u5165\u529B\u3057\u305F\u7D2F\u7A4D\u5730\u70B9\u306E\u5DEE\u5206\u3060\u3051\u3092\u533A\u9593\u3068\u3057\u3066\u6271\u3044\u307E\u3059\u3002",
    endpoint_movements_only: "\u6700\u5927\u4E0B\u843D\u30FB\u56DE\u5FA9\u306F\u5165\u529B\u5730\u70B9\u306E\u7D42\u70B9\u9593\u3060\u3051\u3067\u8A08\u7B97\u3057\u307E\u3059\u3002"
  };
  var roundingLabels = {
    half_away_from_zero_to_one_decimal: "\u8868\u793A\u306Fhalf-away-from-zero\u3067\u5C0F\u65701\u6841\u306B\u4E38\u3081\u307E\u3059\u3002",
    half_away_from_zero_to_integer_medal: "\u8868\u793A\u5DEE\u679A\u306Fhalf-away-from-zero\u3067\u6574\u6570\u679A\u306B\u4E38\u3081\u307E\u3059\u3002",
    ceil_to_integer_medal_boundary: "\u5FC5\u8981\u5DEE\u679A\u306F\u4E0D\u8DB3\u3057\u306A\u3044\u6574\u6570\u5883\u754C\u3078\u5207\u308A\u4E0A\u3052\u307E\u3059\u3002"
  };
  var warningLabels = {
    future_out_clamped_to_zero: "\u5FC5\u8981OUT\u304C\u8CA0\u306B\u306A\u308B\u305F\u3081\u3001\u5B9F\u884C\u53EF\u80FD\u306A0\u679A\u3078\u5883\u754C\u3092\u8ABF\u6574\u3057\u307E\u3057\u305F\u3002"
  };
  function uniqueCodes(metadata, key) {
    return [...new Set(metadata.flatMap((item) => item[key]))];
  }
  function renderMetadata(container, metadata, facts2 = []) {
    const fragment = document.createDocumentFragment();
    const version = create("p", {
      text: `\u8A08\u7B97\u30D0\u30FC\u30B8\u30E7\u30F3 ${metadata[0]?.calculationVersion ?? "2.0.0"}`
    });
    fragment.append(version);
    const groups = [
      ["\u4F7F\u7528\u3057\u305F\u5F0F", uniqueCodes(metadata, "formulaIds"), formulaLabels],
      ["\u524D\u63D0", uniqueCodes(metadata, "assumptionCodes"), assumptionLabels],
      ["\u4E38\u3081", uniqueCodes(metadata, "roundingCodes"), roundingLabels],
      ["\u6CE8\u610F", uniqueCodes(metadata, "warningCodes"), warningLabels]
    ];
    if (facts2.length > 0) {
      const heading = create("h4", { text: "\u7B97\u51FA\u3057\u305F\u6761\u4EF6" });
      const list = create("ul");
      for (const fact of facts2) list.append(create("li", { text: fact }));
      fragment.append(heading, list);
    }
    for (const [title, codes, labels] of groups) {
      if (codes.length === 0) continue;
      const heading = create("h4", { text: title });
      const list = create("ul");
      for (const code of codes) list.append(create("li", { text: labels[code] ?? code }));
      fragment.append(heading, list);
    }
    container.replaceChildren(fragment);
  }
  function announce(message2) {
    byId("live-region").textContent = message2;
  }

  // tools/slot-balance/src/ui-v2/segments.ts
  var MAX_DIRECT_ROWS = 10;
  var MAX_CUMULATIVE_POINTS = 11;
  var transfer;
  var directInitialized = false;
  var cumulativeInitialized = false;
  var directRemoved;
  var cumulativeRemoved;
  var lastAnalysis;
  var directList = byId("direct-segment-list");
  var cumulativeList = byId("cumulative-point-list");
  var form = byId("segments-form");
  var facts = byId("segment-facts");
  var benchmarkResult = byId("segment-benchmark-result");
  var resultContainer = byId("segments-result");
  function inputField(labelText, name, value, unit, inputMode = "numeric") {
    const field = create("div", { className: "field" });
    const label = create("label", { text: labelText });
    const input = create("input");
    input.type = "text";
    input.inputMode = inputMode;
    input.autocomplete = "off";
    input.name = name;
    input.value = value;
    input.id = name.replaceAll(".", "-");
    label.htmlFor = input.id;
    const control = create("div", { className: "control-with-unit" });
    control.append(input);
    if (unit) control.append(create("span", { text: unit }));
    const error2 = create("p", { className: "field-error" });
    error2.dataset["errorFor"] = name;
    error2.id = `${input.id}-error`;
    input.setAttribute("aria-describedby", error2.id);
    field.append(label, control, error2);
    return field;
  }
  function directRow(index, values) {
    const row = create("fieldset", { className: "editable-row" });
    row.dataset["directRow"] = "";
    row.append(create("legend", { text: `\u533A\u9593 ${index + 1}` }));
    row.append(
      inputField("\u533A\u9593\u540D", `segments.direct.${index}.label`, `\u533A\u9593${index + 1}`, "", "text"),
      inputField(
        "\u30B2\u30FC\u30E0\u6570",
        `segments.direct.${index}.games`,
        values ? String(values.games) : "",
        "G"
      ),
      inputField(
        "\u5DEE\u679A",
        `segments.direct.${index}.netMedals`,
        values ? String(values.netMedals) : "",
        "\u679A"
      )
    );
    const remove = create("button", { className: "remove-row", text: "\u3053\u306E\u533A\u9593\u3092\u524A\u9664" });
    remove.type = "button";
    remove.dataset["removeDirect"] = "";
    row.append(remove);
    return row;
  }
  function cumulativeRow(index, values) {
    const row = create("fieldset", { className: "editable-row" });
    row.dataset["cumulativeRow"] = "";
    row.append(create("legend", { text: index === 0 ? "\u958B\u59CB\u5730\u70B9" : `\u5730\u70B9 ${index}` }));
    row.append(
      inputField(
        "\u5730\u70B9\u540D",
        `segments.points.${index}.label`,
        index === 0 ? "\u958B\u59CB" : `\u5730\u70B9${index}`,
        "",
        "text"
      ),
      inputField(
        "\u7D2F\u7A4D\u30B2\u30FC\u30E0\u6570",
        `segments.points.${index}.games`,
        values ? String(values.games) : "",
        "G"
      ),
      inputField(
        "\u7D2F\u7A4D\u5DEE\u679A",
        `segments.points.${index}.netMedals`,
        values ? String(values.net) : "",
        "\u679A"
      )
    );
    const remove = create("button", { className: "remove-row", text: "\u3053\u306E\u5730\u70B9\u3092\u524A\u9664" });
    remove.type = "button";
    remove.dataset["removeCumulative"] = "";
    row.append(remove);
    return row;
  }
  function reindexRows(kind) {
    const list = kind === "direct" ? directList : cumulativeList;
    const selector = kind === "direct" ? "[data-direct-row]" : "[data-cumulative-row]";
    const prefix = kind === "direct" ? "segments.direct" : "segments.points";
    const rows = Array.from(list.querySelectorAll(selector));
    rows.forEach((row, index) => {
      const legend = row.querySelector("legend");
      if (legend)
        legend.textContent = kind === "direct" ? `\u533A\u9593 ${index + 1}` : index === 0 ? "\u958B\u59CB\u5730\u70B9" : `\u5730\u70B9 ${index}`;
      row.querySelectorAll("input").forEach((input) => {
        const key = input.name.split(".").at(-1) ?? "";
        input.name = `${prefix}.${index}.${key}`;
        input.id = input.name.replaceAll(".", "-");
        const field = input.closest(".field");
        const label = field?.querySelector("label");
        const error2 = field?.querySelector("[data-error-for]");
        if (label) label.htmlFor = input.id;
        if (error2) {
          error2.dataset["errorFor"] = input.name;
          error2.id = `${input.id}-error`;
          input.setAttribute("aria-describedby", error2.id);
        }
      });
    });
    const minimum = kind === "direct" ? 1 : 2;
    rows.forEach((row) => {
      const remove = row.querySelector(".remove-row");
      if (remove) remove.disabled = rows.length <= minimum;
    });
    byId(
      kind === "direct" ? "add-direct-segment" : "add-cumulative-point"
    ).disabled = rows.length >= (kind === "direct" ? MAX_DIRECT_ROWS : MAX_CUMULATIVE_POINTS);
    byId(kind === "direct" ? "direct-limit-note" : "cumulative-limit-note").textContent = `${rows.length} / ${kind === "direct" ? MAX_DIRECT_ROWS : MAX_CUMULATIVE_POINTS}\u4EF6`;
  }
  function initializeDirect() {
    if (directInitialized) return;
    directList.append(directRow(0, transfer), directRow(1));
    directInitialized = true;
    reindexRows("direct");
  }
  function initializeCumulative() {
    if (cumulativeInitialized) return;
    cumulativeList.append(
      cumulativeRow(0, { games: 0, net: 0 }),
      cumulativeRow(1, transfer ? { games: transfer.games, net: transfer.netMedals } : void 0),
      cumulativeRow(2)
    );
    cumulativeInitialized = true;
    reindexRows("cumulative");
  }
  function setupMethodChoice() {
    document.querySelectorAll('[name="segment.method"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const direct = radio.value === "direct" && radio.checked;
        byId("direct-segment-editor").hidden = !direct;
        byId("cumulative-segment-editor").hidden = direct;
        form.hidden = false;
        if (direct) initializeDirect();
        else initializeCumulative();
        resultContainer.hidden = true;
        announce(direct ? "\u533A\u9593\u3054\u3068\u306E\u5165\u529B\u3092\u958B\u304D\u307E\u3057\u305F\u3002" : "\u30B0\u30E9\u30D5\u306E\u5730\u70B9\u304B\u3089\u306E\u5165\u529B\u3092\u958B\u304D\u307E\u3057\u305F\u3002");
      });
    });
  }
  function setupListActions() {
    byId("add-direct-segment").addEventListener("click", () => {
      const count = directList.querySelectorAll("[data-direct-row]").length;
      if (count >= MAX_DIRECT_ROWS) return;
      const row = directRow(count);
      directList.append(row);
      directRemoved = void 0;
      byId("direct-undo").hidden = true;
      reindexRows("direct");
      row.querySelector("input")?.focus();
      announce(`\u533A\u9593 ${count + 1} \u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002`);
    });
    byId("add-cumulative-point").addEventListener("click", () => {
      const count = cumulativeList.querySelectorAll("[data-cumulative-row]").length;
      if (count >= MAX_CUMULATIVE_POINTS) return;
      const row = cumulativeRow(count);
      cumulativeList.append(row);
      cumulativeRemoved = void 0;
      byId("cumulative-undo").hidden = true;
      reindexRows("cumulative");
      row.querySelector("input")?.focus();
      announce(`\u5730\u70B9 ${count} \u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002`);
    });
    directList.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-remove-direct]") : null;
      const row = button?.closest("[data-direct-row]");
      if (!row) return;
      const rows = Array.from(directList.querySelectorAll("[data-direct-row]"));
      if (rows.length <= 1) return;
      directRemoved = { row, index: rows.indexOf(row) };
      row.remove();
      byId("direct-undo").hidden = false;
      reindexRows("direct");
      (directList.querySelector(".remove-row") ?? byId("add-direct-segment")).focus();
    });
    cumulativeList.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-remove-cumulative]") : null;
      const row = button?.closest("[data-cumulative-row]");
      if (!row) return;
      const rows = Array.from(cumulativeList.querySelectorAll("[data-cumulative-row]"));
      if (rows.length <= 2) return;
      cumulativeRemoved = { row, index: rows.indexOf(row) };
      row.remove();
      byId("cumulative-undo").hidden = false;
      reindexRows("cumulative");
    });
    byId("direct-undo").querySelector("button")?.addEventListener("click", () => {
      if (!directRemoved) return;
      directList.insertBefore(directRemoved.row, directList.children.item(directRemoved.index));
      directRemoved.row.querySelector("input")?.focus();
      directRemoved = void 0;
      byId("direct-undo").hidden = true;
      reindexRows("direct");
    });
    byId("cumulative-undo").querySelector("button")?.addEventListener("click", () => {
      if (!cumulativeRemoved) return;
      cumulativeList.insertBefore(
        cumulativeRemoved.row,
        cumulativeList.children.item(cumulativeRemoved.index)
      );
      cumulativeRemoved.row.querySelector("input")?.focus();
      cumulativeRemoved = void 0;
      byId("cumulative-undo").hidden = true;
      reindexRows("cumulative");
    });
  }
  function rowValue(row, key) {
    const input = Array.from(row.querySelectorAll("input")).find(
      ({ name }) => name.endsWith(`.${key}`)
    );
    if (!input) throw new Error(`Missing row field: ${key}`);
    return input;
  }
  function collectDirect() {
    const errors = [];
    const values = [];
    Array.from(directList.querySelectorAll("[data-direct-row]")).forEach(
      (row, index) => {
        const games = requiredInteger(
          rowValue(row, "games"),
          `segments.direct.${index}.games`,
          `\u533A\u9593${index + 1}\u306E\u30B2\u30FC\u30E0\u6570`
        );
        const net = requiredInteger(
          rowValue(row, "netMedals"),
          `segments.direct.${index}.netMedals`,
          `\u533A\u9593${index + 1}\u306E\u5DEE\u679A`
        );
        errors.push(...games.errors, ...net.errors);
        if (games.value !== void 0 && net.value !== void 0) {
          const label = rowValue(row, "label").value.trim();
          values.push({ games: games.value, netMedals: net.value, ...label ? { label } : {} });
        }
      }
    );
    return errors.length > 0 ? { errors } : { values, errors };
  }
  function collectCumulative() {
    const errors = [];
    const values = [];
    Array.from(cumulativeList.querySelectorAll("[data-cumulative-row]")).forEach(
      (row, index) => {
        const games = requiredInteger(
          rowValue(row, "games"),
          `segments.points.${index}.games`,
          `\u5730\u70B9${index}\u306E\u7D2F\u7A4D\u30B2\u30FC\u30E0\u6570`
        );
        const net = requiredInteger(
          rowValue(row, "netMedals"),
          `segments.points.${index}.netMedals`,
          `\u5730\u70B9${index}\u306E\u7D2F\u7A4D\u5DEE\u679A`
        );
        errors.push(...games.errors, ...net.errors);
        if (games.value !== void 0 && net.value !== void 0) {
          const label = rowValue(row, "label").value.trim();
          values.push({
            cumulativeGames: games.value,
            cumulativeNetMedals: net.value,
            ...label ? { label } : {}
          });
        }
      }
    );
    return errors.length > 0 ? { errors } : { values, errors };
  }
  function differenceText(value) {
    if (value.differenceDisplayCode === "exact_zero") return "\u5DEE0\u679A\u30FB\u57FA\u6E96\u901A\u308A";
    if (value.differenceDisplayCode === "less_than_one_above") return "\u5DEE\u306F1\u679A\u672A\u6E80\u30FB\u4E0A\u56DE\u308B";
    if (value.differenceDisplayCode === "less_than_one_below") return "\u5DEE\u306F1\u679A\u672A\u6E80\u30FB\u4E0B\u56DE\u308B";
    return `${formatSigned(value.differenceNetMedals.display)}\u679A\u30FB${value.relation === "above" ? "\u4E0A\u56DE\u308B" : "\u4E0B\u56DE\u308B"}`;
  }
  function renderFacts(result, sourceLabel) {
    if (!result.ok) return;
    const fragment = document.createDocumentFragment();
    fragment.append(
      create("h3", { text: "\u5408\u8A08\u5B9F\u7E3E" }),
      create("p", {
        className: "result-lead",
        text: `${formatOneDecimal(result.value.aggregate.aggregatePayoutRate.display)}%`
      })
    );
    const metrics = create("div", { className: "result-metrics" });
    for (const [label, value] of [
      ["\u5408\u8A08G", `${formatInteger(result.value.aggregate.aggregateGames)}G`],
      ["\u5408\u8A08\u5DEE\u679A", `${formatSigned(result.value.aggregate.aggregateNetMedals)}\u679A`],
      ["\u5165\u529B\u65B9\u5F0F", sourceLabel]
    ]) {
      const item = create("div");
      item.append(create("span", { text: label }), create("strong", { text: value }));
      metrics.append(item);
    }
    fragment.append(metrics, create("h3", { text: "\u533A\u9593\u3054\u3068\u306E\u5B9F\u7E3E" }));
    result.value.segments.forEach((segment, index) => {
      const row = create("article", { className: "segment-row-result" });
      row.append(
        create("strong", { text: segment.input.label || `\u533A\u9593${index + 1}` }),
        create("p", { text: `${formatInteger(segment.input.games)}G` }),
        create("p", { text: `${formatSigned(segment.input.netMedals)}\u679A` }),
        create("p", { text: `${formatOneDecimal(segment.payoutRate.display)}%` })
      );
      const sensitivity = calculatePayoutRateSensitivity({ games: segment.input.games });
      if (sensitivity.ok) {
        row.append(
          create("small", {
            text: `100\u679A\u3067\u51FA\u7389\u7387\u304C\u7D04${formatOneDecimal(sensitivity.value.payoutRatePointsPer100Medals.display)}\u30DD\u30A4\u30F3\u30C8\u52D5\u304F`
          })
        );
      }
      fragment.append(row);
    });
    const movement = create("div", { className: "result-metrics" });
    for (const [label, value] of [
      [
        "\u5165\u529B\u5730\u70B9\u9593\u306E\u6700\u5927\u4E0B\u843D",
        `${formatInteger(result.value.drawdownRecovery.maximumDrawdown.medals)}\u679A`
      ],
      [
        "\u4E0B\u843D\u5F8C\u306E\u6700\u5927\u56DE\u5FA9",
        `${formatInteger(result.value.drawdownRecovery.maximumRecoveryAfterDrawdown.medals)}\u679A`
      ]
    ]) {
      const item = create("div");
      item.append(create("span", { text: label }), create("strong", { text: value }));
      movement.append(item);
    }
    fragment.append(movement);
    facts.replaceChildren(fragment);
    renderMetadata(byId("segment-condition-content"), [result.metadata]);
    resultContainer.hidden = false;
    benchmarkResult.hidden = true;
    document.querySelectorAll('[name="segment.benchmark"]').forEach((radio) => {
      radio.checked = false;
    });
  }
  function analyze(rate) {
    if (!lastAnalysis) return void 0;
    return lastAnalysis.method === "direct" ? analyzeSegments({
      segments: lastAnalysis.direct ?? [],
      ...rate === void 0 ? {} : { benchmarkRate: rate }
    }) : analyzeCumulativePoints({
      points: lastAnalysis.points ?? [],
      ...rate === void 0 ? {} : { benchmarkRate: rate }
    });
  }
  function renderBenchmark(rate) {
    const result = analyze(rate);
    if (!result) return;
    if (!result.ok) {
      showErrors(domainErrors(result.errors));
      return;
    }
    clearErrors();
    const aggregate = result.value.aggregate.benchmark;
    if (!aggregate) return;
    const fragment = document.createDocumentFragment();
    fragment.append(
      create("h3", { text: `${formatOneDecimal(rate)}%\u57FA\u6E96` }),
      create("p", {
        className: "result-lead",
        text: `\u5408\u8A08 ${differenceText({ ...aggregate, condition: "on_benchmark" })}`
      })
    );
    const metrics = create("div", { className: "result-metrics" });
    const expected = create("div");
    expected.append(
      create("span", { text: "\u57FA\u6E96\u671F\u5F85\u5DEE\u679A" }),
      create("strong", { text: `${formatSigned(aggregate.expectedNetMedals.display)}\u679A` })
    );
    const difference = create("div");
    difference.append(
      create("span", { text: "\u57FA\u6E96\u3068\u306E\u5DEE" }),
      create("strong", { text: differenceText({ ...aggregate, condition: "on_benchmark" }) })
    );
    metrics.append(expected, difference);
    fragment.append(metrics, create("h4", { text: "\u533A\u9593\u306E\u5BC4\u4E0E" }));
    const withBenchmark = result.value.segments.filter(
      (segment) => segment.benchmark !== void 0
    );
    for (const [index, segment] of withBenchmark.entries()) {
      const positive2 = segment.benchmark.relation === "above";
      const neutral = segment.benchmark.relation === "equal";
      const row = create("article", {
        className: `segment-row-result ${neutral ? "" : positive2 ? "contribution-high" : "contribution-low"}`
      });
      row.append(
        create("strong", { text: segment.input.label || `\u533A\u9593${index + 1}` }),
        create("p", {
          text: neutral ? "\u57FA\u6E96\u901A\u308A" : positive2 ? "\u597D\u8ABF\u533A\u9593" : "\u4F4E\u8ABF\u533A\u9593",
          className: neutral ? "relation-neutral" : positive2 ? "relation-positive" : "relation-negative"
        }),
        create("p", { text: differenceText(segment.benchmark) }),
        create("p", { text: positive2 ? "\u62BC\u3057\u4E0A\u3052" : neutral ? "\u5909\u5316\u306A\u3057" : "\u62BC\u3057\u4E0B\u3052" })
      );
      fragment.append(row);
    }
    const positive = withBenchmark.filter(({ benchmark }) => benchmark.differenceNetMedals.approximate > 0).sort(
      (left, right) => right.benchmark.differenceNetMedals.approximate - left.benchmark.differenceNetMedals.approximate
    )[0];
    const negative = withBenchmark.filter(({ benchmark }) => benchmark.differenceNetMedals.approximate < 0).sort(
      (left, right) => left.benchmark.differenceNetMedals.approximate - right.benchmark.differenceNetMedals.approximate
    )[0];
    const extremes = create("div", { className: "result-metrics segment-benchmark-detail" });
    for (const [label, segment] of [
      ["\u6700\u5927\u306E\u62BC\u3057\u4E0A\u3052", positive],
      ["\u6700\u5927\u306E\u62BC\u3057\u4E0B\u3052", negative]
    ]) {
      const item = create("div");
      item.append(
        create("span", { text: label }),
        create("strong", {
          text: segment ? `${segment.input.label ?? "\u540D\u79F0\u306A\u3057"} ${formatSigned(segment.benchmark.differenceNetMedals.display)}\u679A` : "\u8A72\u5F53\u306A\u3057"
        })
      );
      extremes.append(item);
    }
    fragment.append(extremes);
    benchmarkResult.replaceChildren(fragment);
    benchmarkResult.hidden = false;
    renderMetadata(byId("segment-condition-content"), [result.metadata]);
    announce(`${formatOneDecimal(rate)}%\u57FA\u6E96\u306E\u533A\u9593\u5BC4\u4E0E\u3092\u8868\u793A\u3057\u307E\u3057\u305F\u3002`);
  }
  function setupBenchmarkChoice() {
    const custom = byId("custom-benchmark");
    document.querySelectorAll('[name="segment.benchmark"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        custom.hidden = radio.value !== "custom";
        if (radio.value !== "custom") renderBenchmark(Number(radio.value));
        else byId("custom-benchmark-rate").focus();
      });
    });
    byId("apply-custom-benchmark").addEventListener("click", () => {
      const parsed = requiredDecimal(
        byId("custom-benchmark-rate"),
        "segment.customBenchmark",
        "\u4EFB\u610F\u57FA\u6E96\u7387"
      );
      if (parsed.errors.length > 0 || parsed.value === void 0) {
        showErrors(parsed.errors);
        return;
      }
      renderBenchmark(parsed.value);
    });
  }
  function submitAnalysis() {
    clearErrors();
    const method = document.querySelector('[name="segment.method"]:checked')?.value;
    if (method === "direct") {
      const collected = collectDirect();
      if (collected.errors.length > 0 || !collected.values) {
        showErrors(collected.errors);
        return;
      }
      const result = analyzeSegments({ segments: collected.values });
      if (!result.ok) {
        showErrors(
          domainErrors(
            result.errors,
            ({ field }) => field.replace(/^segments\[(\d+)]/, "segments.direct.$1")
          )
        );
        return;
      }
      lastAnalysis = { method: "direct", direct: collected.values };
      renderFacts(result, "\u533A\u9593\u3054\u3068");
    } else if (method === "cumulative") {
      const collected = collectCumulative();
      if (collected.errors.length > 0 || !collected.values) {
        showErrors(collected.errors);
        return;
      }
      const result = analyzeCumulativePoints({ points: collected.values });
      if (!result.ok) {
        showErrors(
          domainErrors(
            result.errors,
            ({ field }) => field.replace(/^points\[(\d+)]\.cumulativeGames$/, "segments.points.$1.games").replace(/^points\[(\d+)]\.cumulativeNetMedals$/, "segments.points.$1.netMedals")
          )
        );
        return;
      }
      lastAnalysis = { method: "cumulative", points: collected.values };
      renderFacts(result, "\u30B0\u30E9\u30D5\u306E\u7D2F\u7A4D\u5730\u70B9");
    } else {
      showErrors([{ message: "\u300C\u30B0\u30E9\u30D5\u306E\u5730\u70B9\u304B\u3089\u5165\u529B\u300D\u307E\u305F\u306F\u300C\u533A\u9593\u3054\u3068\u306B\u5165\u529B\u300D\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002" }]);
      return;
    }
    byId("segments-result").scrollIntoView({ block: "start" });
    announce("\u533A\u9593\u5206\u6790\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002");
  }
  function setupSegmentsUi() {
    setupMethodChoice();
    setupListActions();
    setupBenchmarkChoice();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitAnalysis();
    });
    return {
      open(value) {
        transfer = value;
      }
    };
  }

  // tools/slot-balance/src/ui-v2/app.ts
  var quickSnapshot;
  var quickStale = false;
  var activePanel;
  var quickForm = byId("quick-form");
  var quickGames = byId("quick-games");
  var quickNet = byId("quick-net");
  var quickResult = byId("quick-result");
  var launchers = Array.from(document.querySelectorAll("[data-launcher]"));
  var analysisPanels = Array.from(document.querySelectorAll("[data-analysis-panel]"));
  var segmentsUi = setupSegmentsUi();
  function resultMetric(label, value) {
    const item = create("div");
    item.append(create("span", { text: label }), create("strong", { text: value }));
    return item;
  }
  function focusResult(container) {
    const heading = container.querySelector("h2, h3");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: "center" });
  }
  function benchmarkDifference(value) {
    if (value.differenceDisplayCode === "exact_zero") {
      return { text: "\u5DEE0\u679A", relation: "\u57FA\u6E96\u901A\u308A", className: "relation-neutral" };
    }
    if (value.differenceDisplayCode === "less_than_one_above") {
      return { text: "\u5DEE\u306F1\u679A\u672A\u6E80", relation: "\u4E0A\u56DE\u308B", className: "relation-positive" };
    }
    if (value.differenceDisplayCode === "less_than_one_below") {
      return { text: "\u5DEE\u306F1\u679A\u672A\u6E80", relation: "\u4E0B\u56DE\u308B", className: "relation-negative" };
    }
    const above = value.relation === "above";
    return {
      text: `${formatSigned(value.differenceNetMedals.display)}\u679A`,
      relation: above ? "\u4E0A\u56DE\u308B" : "\u4E0B\u56DE\u308B",
      className: above ? "relation-positive" : "relation-negative"
    };
  }
  function renderQuickBenchmarks(values) {
    const list = byId("quick-benchmark-list");
    const summary = byId("quick-benchmark-summary");
    summary.hidden = true;
    const rows = values.map((value) => {
      const rate = Number(value.benchmarkRate.numerator) / Number(value.benchmarkRate.denominator);
      const difference = benchmarkDifference(value);
      const row = create("button", { className: "benchmark-row" });
      row.type = "button";
      row.dataset["quickBenchmark"] = String(rate);
      row.setAttribute("aria-pressed", "false");
      row.append(
        create("strong", { text: `${formatInteger(rate)}%` }),
        create("span", {
          text: `\u671F\u5F85 ${formatSigned(value.expectedNetMedals.display)}\u679A`
        }),
        create("span", {
          className: difference.className,
          text: `${difference.text}\u30FB${difference.relation}`
        })
      );
      row.addEventListener("click", () => {
        rows.forEach((button) => button.setAttribute("aria-pressed", String(button === row)));
        summary.textContent = value.differenceDisplayCode === "exact_zero" ? `\u3053\u306E\u5165\u529B\u306F${formatInteger(rate)}%\u57FA\u6E96\u306E\u5DEE\u679A\u3068\u4E00\u81F4\u3057\u307E\u3059\u3002` : value.differenceDisplayCode === "less_than_one_above" ? `\u3053\u306E\u5165\u529B\u306F${formatInteger(rate)}%\u57FA\u6E96\u306E\u5DEE\u679A\u30921\u679A\u672A\u6E80\u4E0A\u56DE\u308A\u307E\u3059\u3002` : value.differenceDisplayCode === "less_than_one_below" ? `\u3053\u306E\u5165\u529B\u306F${formatInteger(rate)}%\u57FA\u6E96\u306E\u5DEE\u679A\u30921\u679A\u672A\u6E80\u4E0B\u56DE\u308A\u307E\u3059\u3002` : `\u3053\u306E\u5165\u529B\u306F${formatInteger(rate)}%\u57FA\u6E96\u306E\u5DEE\u679A\u3092${formatInteger(Math.abs(value.differenceNetMedals.display))}\u679A${value.relation === "above" ? "\u4E0A\u56DE\u308A\u307E\u3059" : "\u4E0B\u56DE\u308A\u307E\u3059"}\u3002`;
        summary.hidden = false;
        announce(`${formatInteger(rate)}%\u57FA\u6E96\u3092\u9078\u629E\u3057\u307E\u3057\u305F\u3002`);
      });
      return row;
    });
    list.replaceChildren(...rows);
  }
  function quickField(errorField) {
    if (errorField === "games") return "quick.games";
    if (errorField === "netMedals") return "quick.netMedals";
    return void 0;
  }
  function renderQuick() {
    const games = requiredInteger(quickGames, "quick.games", "\u7DCF\u30B2\u30FC\u30E0\u6570");
    const net = requiredInteger(quickNet, "quick.netMedals", "\u5DEE\u679A");
    const errors = [...games.errors, ...net.errors];
    if (errors.length > 0 || games.value === void 0 || net.value === void 0) {
      showErrors(errors);
      return;
    }
    const quick = calculateQuickPerformance({ games: games.value, netMedals: net.value });
    if (!quick.ok) {
      showErrors(domainErrors(quick.errors, ({ field }) => quickField(field)));
      return;
    }
    const benchmarks = calculateStandardBenchmarks({ games: games.value, netMedals: net.value });
    const sensitivity = calculatePayoutRateSensitivity({ games: games.value });
    if (!benchmarks.ok || !sensitivity.ok) {
      const failures = [
        ...benchmarks.ok ? [] : benchmarks.errors,
        ...sensitivity.ok ? [] : sensitivity.errors
      ];
      showErrors(domainErrors(failures, ({ field }) => quickField(field)));
      return;
    }
    clearErrors();
    closePanels();
    quickSnapshot = {
      games: games.value,
      netMedals: net.value,
      quick: quick.value,
      benchmarks: benchmarks.value
    };
    quickStale = false;
    setStale(false);
    byId("quick-rate").textContent = `${formatOneDecimal(quick.value.payoutRate.display)}%`;
    byId("quick-input-summary").textContent = `${formatInteger(games.value)}G / ${formatSigned(net.value)}\u679A`;
    byId("quick-per-1000").textContent = `${formatSigned(quick.value.netMedalsPer1000Games.display)}\u679A / 1,000G`;
    renderQuickBenchmarks(benchmarks.value);
    renderMetadata(
      byId("quick-condition-content"),
      [quick.metadata, benchmarks.metadata, sensitivity.metadata],
      [
        `\u60F3\u5B9AIN ${formatInteger(quick.value.assumedInMedals)}\u679A`,
        `\u60F3\u5B9AOUT ${formatInteger(quick.value.assumedOutMedals)}\u679A`,
        `100\u679A\u3067\u51FA\u7389\u7387\u304C\u7D04${formatOneDecimal(sensitivity.value.payoutRatePointsPer100Medals.display)}\u30DD\u30A4\u30F3\u30C8\u52D5\u304F`
      ]
    );
    quickResult.hidden = false;
    quickResult.classList.remove("is-stale");
    const resultTitle = byId("quick-result-title");
    resultTitle.focus({ preventScroll: true });
    resultTitle.scrollIntoView({ block: "center" });
    announce("\u8A08\u7B97\u7D50\u679C\u3092\u8868\u793A\u3057\u307E\u3057\u305F\u3002");
  }
  function setStale(stale) {
    quickStale = stale;
    byId("quick-stale").hidden = !stale;
    byId("stale-transfer-note").hidden = !stale;
    quickResult.classList.toggle("is-stale", stale);
    launchers.forEach((button) => {
      if (button.dataset["launcher"] === "target" || button.dataset["launcher"] === "segments") {
        button.disabled = stale;
      }
    });
    if (stale && (activePanel === "target" || activePanel === "segments")) closePanels();
  }
  quickForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderQuick();
  });
  quickForm.addEventListener("input", () => {
    if (quickSnapshot && !quickStale) setStale(true);
  });
  byId("quick-reset").addEventListener("click", () => {
    quickForm.reset();
    quickSnapshot = void 0;
    quickStale = false;
    quickResult.hidden = true;
    closePanels();
    clearErrors();
    quickGames.focus();
    announce("\u5165\u529B\u3068\u30AF\u30A4\u30C3\u30AF\u7D50\u679C\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3057\u305F\u3002");
  });
  byId("edit-quick").addEventListener("click", () => quickGames.focus());
  function closePanels() {
    activePanel = void 0;
    analysisPanels.forEach((panel) => {
      panel.hidden = true;
    });
    launchers.forEach((button) => button.setAttribute("aria-expanded", "false"));
  }
  function openPanel(name) {
    if (!quickSnapshot) return;
    if (quickStale && (name === "target" || name === "segments")) {
      announce("\u30AF\u30A4\u30C3\u30AF\u7D50\u679C\u3092\u518D\u8A08\u7B97\u3057\u3066\u304B\u3089\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002");
      return;
    }
    activePanel = name;
    analysisPanels.forEach((panel2) => {
      panel2.hidden = panel2.dataset["analysisPanel"] !== name;
    });
    launchers.forEach((button) => {
      button.setAttribute("aria-expanded", String(button.dataset["launcher"] === name));
    });
    if (name === "target") {
      byId("target-current-summary").textContent = `\u73FE\u5728 ${formatInteger(quickSnapshot.games)}G / ${formatSigned(quickSnapshot.netMedals)}\u679A`;
    }
    if (name === "segments") {
      segmentsUi.open({ games: quickSnapshot.games, netMedals: quickSnapshot.netMedals });
    }
    const panel = analysisPanels.find(({ dataset }) => dataset["analysisPanel"] === name);
    panel?.querySelector("h2")?.focus({ preventScroll: true });
    panel?.scrollIntoView({ block: "start" });
    announce(
      `${launchers.find(({ dataset }) => dataset["launcher"] === name)?.textContent?.trim() ?? "\u8A73\u7D30"}\u3092\u958B\u304D\u307E\u3057\u305F\u3002`
    );
  }
  launchers.forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset["launcher"];
      if (name) openPanel(name);
    });
  });
  document.querySelectorAll(".close-panel").forEach((button) => {
    button.addEventListener("click", () => {
      const previous = activePanel;
      closePanels();
      launchers.find(({ dataset }) => dataset["launcher"] === previous)?.focus();
      announce("\u8A73\u7D30\u6A5F\u80FD\u3092\u9589\u3058\u307E\u3057\u305F\u3002");
    });
  });
  function setPreset(button, group) {
    document.querySelectorAll(group).forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
  }
  document.querySelectorAll("[data-target-games]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      if (!quickSnapshot) return;
      byId("target-games").value = String(
        quickSnapshot.games + Number(button.dataset["targetGames"])
      );
      setPreset(button, "[data-target-games]");
    });
  });
  document.querySelectorAll("[data-target-rate]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      byId("target-rate").value = button.dataset["targetRate"] ?? "";
      setPreset(button, "[data-target-rate]");
    });
  });
  byId("target-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!quickSnapshot || quickStale) return;
    const targetGames = requiredInteger(
      byId("target-games"),
      "target.games",
      "\u76EE\u6A19\u7DCF\u30B2\u30FC\u30E0\u6570"
    );
    const targetRate = requiredDecimal(
      byId("target-rate"),
      "target.rate",
      "\u76EE\u6A19\u51FA\u7389\u7387"
    );
    const errors = [...targetGames.errors, ...targetRate.errors];
    if (errors.length > 0 || targetGames.value === void 0 || targetRate.value === void 0) {
      showErrors(errors);
      return;
    }
    const result = calculateTargetReverse({
      currentGames: quickSnapshot.games,
      currentNetMedals: quickSnapshot.netMedals,
      targetTotalGames: targetGames.value,
      targetPayoutRate: targetRate.value
    });
    if (!result.ok) {
      showErrors(
        domainErrors(
          result.errors,
          ({ field }) => field === "targetTotalGames" ? "target.games" : field === "targetPayoutRate" ? "target.rate" : void 0
        )
      );
      return;
    }
    clearErrors();
    const values = result.value;
    const lead = values.status === "must_gain" ? `\u3042\u3068+${formatInteger(values.minimumIntegerFutureNetMedals)}\u679A\u5FC5\u8981` : values.status === "no_net_change_required" ? "\u5DEE\u679A0\u679A\u4EE5\u4E0A\u3067\u76EE\u6A19\u306B\u5230\u9054" : values.status === "can_lose_up_to" ? `\u2212${formatInteger(values.allowedLossMedals ?? 0)}\u679A\u307E\u3067\u306A\u3089\u76EE\u6A19\u3092\u7DAD\u6301` : "\u6B8B\u308A\u533A\u9593\u306EOUT\u304C0\u679A\u4EE5\u4E0A\u306A\u3089\u76EE\u6A19\u3092\u7DAD\u6301";
    const container = byId("target-result");
    const heading = create("h3", { text: "\u5FC5\u8981\u6761\u4EF6" });
    const metrics = create("div", { className: "result-metrics" });
    metrics.append(
      resultMetric("\u6B8B\u308A\u30B2\u30FC\u30E0\u6570", `${formatInteger(values.remainingGames)}G`),
      resultMetric(
        "\u5883\u754C\u3068\u306A\u308B\u51FA\u7389\u7387",
        `${formatOneDecimal(values.requiredFuturePayoutRate.display)}%\u4EE5\u4E0A`
      ),
      resultMetric("\u76EE\u6A19\u7DCF\u5DEE\u679A", `${formatSigned(values.exactTargetTotalNetMedals.display)}\u679A`)
    );
    const conditions = create("details", { className: "conditions" });
    conditions.append(create("summary", { text: "\u8A08\u7B97\u6761\u4EF6\u3092\u898B\u308B" }));
    const conditionContent = create("div");
    renderMetadata(conditionContent, [result.metadata]);
    conditions.append(conditionContent);
    container.replaceChildren(
      heading,
      create("p", { className: "result-lead", text: lead }),
      metrics,
      create("p", { text: "\u6570\u5B66\u4E0A\u306E\u5883\u754C\u3067\u3042\u308A\u3001\u4E88\u6E2C\u30FB\u671F\u5F85\u5024\u30FB\u7D9A\u884C\u5224\u65AD\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002" }),
      conditions
    );
    container.hidden = false;
    focusResult(container);
    announce("\u76EE\u6A19\u306E\u5FC5\u8981\u6761\u4EF6\u3092\u8868\u793A\u3057\u307E\u3057\u305F\u3002");
  });
  function mapCalculationErrors(result, fields) {
    return validationErrors(result.errors).map((error2, index) => {
      const original = result.errors[index];
      const field = original?.field ? fields[original.field] : void 0;
      return { ...error2, ...field ? { field } : {} };
    });
  }
  function messagesList(messages) {
    const visible = messages.filter(({ severity }) => severity !== "error");
    if (visible.length === 0) return void 0;
    const wrapper = create("div", { className: "conditions" });
    const heading = create("h4", { text: "\u88DC\u8DB3" });
    const list = create("ul");
    for (const item of visible) list.append(create("li", { text: item.message }));
    wrapper.append(heading, list);
    return wrapper;
  }
  byId("investment-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const cash = requiredInteger(byId("investment-cash"), "investment.cash", "\u73FE\u91D1\u6295\u8CC7");
    const current = requiredInteger(byId("investment-current"), "investment.current", "\u73FE\u5728\u30E1\u30C0\u30EB");
    const exchange = requiredDecimal(
      byId("investment-exchange"),
      "investment.exchange",
      "1,000\u5186\u5206\u3078\u306E\u4EA4\u63DB\u306B\u5FC5\u8981\u306A\u679A\u6570"
    );
    const unit = optionalInteger(byId("investment-unit"), "investment.unit", "\u4EA4\u63DB\u5358\u4F4D");
    const stored = optionalInteger(byId("investment-stored"), "investment.stored", "\u4F7F\u7528\u8CAF\u30E1\u30C0\u30EB");
    const exchanged = optionalInteger(
      byId("investment-exchanged"),
      "investment.exchanged",
      "\u4EA4\u63DB\u6E08\u307F\u91D1\u984D"
    );
    const lend = optionalDecimal(byId("investment-lend"), "investment.lend", "\u8CB8\u51FA\u679A\u6570");
    const games = optionalInteger(byId("investment-games"), "investment.games", "\u4ECA\u56DE\u306E\u30B2\u30FC\u30E0\u6570");
    const net = optionalInteger(byId("investment-net"), "investment.net", "\u4ECA\u56DE\u306E\u5DEE\u679A");
    const errors = [cash, current, exchange, unit, stored, exchanged, lend, games, net].flatMap(
      ({ errors: parsedErrors }) => parsedErrors
    );
    if (games.value === void 0 !== (net.value === void 0)) {
      errors.push({
        field: games.value === void 0 ? "investment.games" : "investment.net",
        message: "\u4ECA\u56DE\u306E\u30B2\u30FC\u30E0\u6570\u3068\u5DEE\u679A\u306F\u4E21\u65B9\u5165\u529B\u3059\u308B\u304B\u3001\u4E21\u65B9\u7A7A\u6B04\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      });
    }
    if (errors.length > 0 || cash.value === void 0 || current.value === void 0 || exchange.value === void 0) {
      showErrors(errors);
      return;
    }
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: cash.value,
      currentMedals: current.value,
      exchangeMedalsPer1000Yen: exchange.value,
      storedMedalsUsed: stored.value,
      alreadyExchangedYen: exchanged.value,
      lendMedalsPer1000Yen: lend.value,
      exchangeUnitYen: unit.value,
      requestRecoveryLines: true,
      games: games.value,
      netMedals: net.value
    });
    if (!result.ok || !result.values) {
      showErrors(
        mapCalculationErrors(result, {
          cashInvestmentYen: "investment.cash",
          currentMedals: "investment.current",
          exchangeMedalsPer1000Yen: "investment.exchange",
          exchangeUnitYen: "investment.unit",
          storedMedalsUsed: "investment.stored",
          alreadyExchangedYen: "investment.exchanged",
          lendMedalsPer1000Yen: "investment.lend",
          games: "investment.games",
          netMedals: "investment.net"
        })
      );
      return;
    }
    clearErrors();
    const values = result.values;
    const container = byId("investment-result");
    const metrics = create("div", { className: "result-metrics" });
    metrics.append(
      resultMetric("\u4EA4\u63DB\u984D\u898B\u8FBC\u307F", `${formatInteger(values.currentExchangeEstimateYen)}\u5186`),
      resultMetric("\u73FE\u91D1\u53CE\u652F", `${formatSigned(values.cashNetEstimateYen)}\u5186`),
      resultMetric(
        "\u73FE\u91D1\u56DE\u53CE\u7387",
        values.cashRecoveryRate ? `${formatOneDecimal(values.cashRecoveryRate.display)}%` : "\u2014"
      )
    );
    const details = create("details", { className: "conditions" });
    details.append(create("summary", { text: "\u5185\u8A33\u3092\u898B\u308B" }));
    const list = create("dl", { className: "summary-facts" });
    const detailRows = [
      ["\u7406\u8AD6\u4EA4\u63DB\u984D", `${formatInteger(values.currentTheoreticalExchangeYen.display)}\u5186`],
      ["\u7DCF\u56DE\u53CE\u898B\u8FBC\u307F", `${formatInteger(values.grossReturnEstimateYen)}\u5186`],
      ["\u8CAF\u30E1\u30C0\u30EB\u8FBC\u307F\u4FA1\u5024\u5DEE\u984D", `${formatSigned(values.totalValueNetEstimateYen.display)}\u5186`],
      ["\u4EA4\u63DB\u5358\u4F4D\u3068\u306E\u5DEE", `${formatInteger(values.exchangeUnitDifferenceYen.display)}\u5186`]
    ];
    if (values.totalRecoveryRate) {
      detailRows.push([
        "\u8CAF\u30E1\u30C0\u30EB\u8FBC\u307F\u56DE\u53CE\u7387",
        `${formatOneDecimal(values.totalRecoveryRate.display)}%`
      ]);
    }
    if (values.cashRecoveryLine) {
      detailRows.push([
        "\u73FE\u91D1\u56DE\u53CE\u30E9\u30A4\u30F3",
        `${formatInteger(values.cashRecoveryLine.requiredMedals)}\u679A`
      ]);
    }
    if (values.totalRecoveryLine && values.showTotalRecoveryLine) {
      detailRows.push([
        "\u8CAF\u30E1\u30C0\u30EB\u8FBC\u307F\u56DE\u53CE\u30E9\u30A4\u30F3",
        `${formatInteger(values.totalRecoveryLine.requiredMedals)}\u679A`
      ]);
    }
    if (values.cashBorrowedMedalsEquivalent) {
      detailRows.push([
        "\u73FE\u91D1\u6295\u8CC7\u306E\u8CB8\u51FA\u679A\u6570\u76F8\u5F53",
        `${formatInteger(values.cashBorrowedMedalsEquivalent.display)}\u679A`
      ]);
    }
    for (const [label, value] of detailRows) {
      const row = create("div");
      row.append(create("dt", { text: label }), create("dd", { text: value }));
      list.append(row);
    }
    details.append(list);
    const supplementary = messagesList([...result.warnings, ...result.info]);
    container.replaceChildren(
      create("h3", { text: "\u6295\u8CC7\u30FB\u56DE\u53CE\u7D50\u679C" }),
      metrics,
      details,
      ...supplementary ? [supplementary] : []
    );
    container.hidden = false;
    focusResult(container);
    announce("\u6295\u8CC7\u30FB\u56DE\u53CE\u7D50\u679C\u3092\u8868\u793A\u3057\u307E\u3057\u305F\u3002");
  });
  byId("inout-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const actualIn = requiredInteger(byId("actual-in"), "inout.in", "\u5B9FIN");
    const actualOut = requiredInteger(byId("actual-out"), "inout.out", "\u5B9FOUT");
    const errors = [...actualIn.errors, ...actualOut.errors];
    if (errors.length > 0 || actualIn.value === void 0 || actualOut.value === void 0) {
      showErrors(errors);
      return;
    }
    const result = calculateInOut({ actualIn: actualIn.value, actualOut: actualOut.value });
    if (!result.ok || !result.values) {
      showErrors(mapCalculationErrors(result, { actualIn: "inout.in", actualOut: "inout.out" }));
      return;
    }
    clearErrors();
    const container = byId("inout-result");
    const metrics = create("div", { className: "result-metrics" });
    metrics.append(
      resultMetric("\u5B9FIN / OUT\u51FA\u7389\u7387", `${formatOneDecimal(result.values.payoutRate.display)}%`),
      resultMetric("\u5B9F\u5DEE\u679A", `${formatSigned(result.values.actualNetMedals)}\u679A`),
      resultMetric(
        "\u5B9FIN \u2192 \u5B9FOUT",
        `${formatInteger(result.values.totalIn)}\u679A \u2192 ${formatInteger(result.values.totalOut)}\u679A`
      )
    );
    container.replaceChildren(
      create("h3", { text: "\u5B9F\u6E2C\u7D50\u679C" }),
      metrics,
      create("p", { text: "\u5DEE\u679A\u30D9\u30FC\u30B9\u5B9F\u7E3E\u51FA\u7389\u7387\u3068\u306F\u5206\u3051\u3066\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })
    );
    container.hidden = false;
    focusResult(container);
    announce("\u5B9FIN\u30FBOUT\u7D50\u679C\u3092\u8868\u793A\u3057\u307E\u3057\u305F\u3002");
  });
  byId("coin-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const games = requiredInteger(byId("coin-games"), "coin.games", "\u901A\u5E38\u6642\u30B2\u30FC\u30E0\u6570");
    const medals = requiredInteger(byId("coin-medals"), "coin.medals", "\u6B63\u5473\u4F7F\u7528\u679A\u6570");
    const atBonus = document.querySelector('[name="coin.atBonus"]')?.checked ?? false;
    const scope = document.querySelector('[name="coin.scope"]')?.checked ?? false;
    const errors = [...games.errors, ...medals.errors];
    if (!atBonus) errors.push({ message: "AT\u30FB\u30DC\u30FC\u30CA\u30B9\u533A\u9593\u3092\u9664\u5916\u3057\u305F\u3053\u3068\u306E\u78BA\u8A8D\u304C\u5FC5\u8981\u3067\u3059\u3002" });
    if (!scope) errors.push({ message: "G\u6570\u3068\u679A\u6570\u304C\u540C\u3058\u5BFE\u8C61\u533A\u9593\u3067\u3042\u308B\u3053\u3068\u306E\u78BA\u8A8D\u304C\u5FC5\u8981\u3067\u3059\u3002" });
    if (errors.length > 0 || games.value === void 0 || medals.value === void 0) {
      showErrors(errors);
      return;
    }
    const result = calculateCoinHold({
      method: "direct",
      normalGames: games.value,
      netUsedMedals: medals.value,
      atBonusExcluded: atBonus,
      scopeConfirmed: scope
    });
    if (!result.ok || !result.values) {
      showErrors(
        mapCalculationErrors(result, { normalGames: "coin.games", netUsedMedals: "coin.medals" })
      );
      return;
    }
    clearErrors();
    const container = byId("coin-result");
    const metrics = create("div", { className: "result-metrics" });
    metrics.append(
      resultMetric(
        "50\u679A\u3042\u305F\u308A\u901A\u5E38\u6642\u30B2\u30FC\u30E0\u6570",
        `${formatOneDecimal(result.values.coinHoldPer50.display)}G / 50\u679A`
      ),
      resultMetric("\u6B63\u5473\u4F7F\u7528\u679A\u6570", `${formatInteger(result.values.netUsedMedals)}\u679A`),
      resultMetric("\u5BFE\u8C61\u533A\u9593", "AT\u30FB\u30DC\u30FC\u30CA\u30B9\u9664\u5916\u6E08\u307F")
    );
    container.replaceChildren(create("h3", { text: "\u901A\u5E38\u30B3\u30A4\u30F3\u6301\u3061\u7D50\u679C" }), metrics);
    container.hidden = false;
    focusResult(container);
    announce("\u901A\u5E38\u30B3\u30A4\u30F3\u6301\u3061\u7D50\u679C\u3092\u8868\u793A\u3057\u307E\u3057\u305F\u3002");
  });
  clearErrors();
})();
