"use strict";
(() => {
  // tools/slot-balance/src/ui/dom.ts
  function byId(id) {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) throw new Error(`Missing element: ${id}`);
    return element;
  }
  function replaceChildren(element, ...children) {
    element.replaceChildren(...children);
  }
  function textElement(tagName, text, className) {
    const element = document.createElement(tagName);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function namedControl(form, name) {
    const control = form.elements.namedItem(name);
    return control instanceof HTMLInputElement || control instanceof HTMLSelectElement ? control : void 0;
  }

  // tools/slot-balance/src/ui/accessibility.ts
  function announce(message2) {
    const liveRegion = byId("calculation-announcer");
    liveRegion.textContent = "";
    window.setTimeout(() => {
      liveRegion.textContent = message2;
    }, 0);
  }
  function focusErrorSummary() {
    const summary = byId("error-summary");
    summary.focus({ preventScroll: true });
    summary.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function revealResults() {
    const region = byId("calculation-results");
    const top = region.getBoundingClientRect().top;
    if (top > window.innerHeight * 0.72) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      region.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }

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
  function explainSegments(values) {
    return [
      {
        resultCode: "aggregateRate",
        title: "\u96C6\u8A08\u5DEE\u679A\u30D9\u30FC\u30B9\u51FA\u7389\u7387",
        inputs: [
          { label: "\u5408\u8A08\u30B2\u30FC\u30E0\u6570", value: values.totalGames, unit: "G" },
          { label: "\u5408\u8A08\u5DEE\u679A", value: values.totalNetMedals, unit: "\u679A" }
        ],
        steps: [
          {
            expression: "(\u5408\u8A08G \xD7 3 + \u5408\u8A08\u5DEE\u679A) \xF7 (\u5408\u8A08G \xD7 3) \xD7 100",
            value: values.aggregate.payoutRateEstimate?.display
          }
        ],
        assumptions: ["\u5404\u533A\u9593\u7387\u306E\u5358\u7D14\u5E73\u5747\u306F\u4F7F\u7528\u3057\u307E\u305B\u3093\u3002", "1G\u3042\u305F\u308A3\u679A\u639B\u3051\u306E\u6982\u7B97\u3067\u3059\u3002"]
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
  function message(severity, code, field2, text, correction) {
    return { severity, code, field: field2, message: text, correction };
  }
  function isPositiveDecimal(value) {
    try {
      return compare(decimal(value), integer(0)) > 0;
    } catch {
      return false;
    }
  }
  function validateSafeInteger(value, field2, label) {
    if (Number.isSafeInteger(value)) return [];
    return [
      message(
        "error",
        "integer_required",
        field2,
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
      ([value, field2, label]) => validateSafeInteger(value, field2, label)
    );
    if (messages.some(({ severity }) => severity === "error")) return messages;
    const nonNegativeFields = [
      [input.cashInvestmentYen, "cashInvestmentYen", "negative_cash_investment", "\u73FE\u91D1\u6295\u8CC7\u984D"],
      [storedMedalsUsed, "storedMedalsUsed", "negative_stored_medals", "\u4F7F\u7528\u3057\u305F\u8CAF\u30E1\u30C0\u30EB"],
      [input.currentMedals, "currentMedals", "negative_current_medals", "\u73FE\u5728\u679A\u6570"],
      [alreadyExchangedYen, "alreadyExchangedYen", "negative_exchanged_yen", "\u4EA4\u63DB\u6E08\u307F\u91D1\u984D"]
    ];
    for (const [value, field2, code, label] of nonNegativeFields) {
      if (value < 0) {
        messages.push(
          message(
            "error",
            code,
            field2,
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
  function validateSegments(input) {
    const messages = [];
    if (input.segments.length === 0) {
      return [
        message(
          "error",
          "segments_required",
          "segments",
          "\u533A\u9593\u30921\u4EF6\u4EE5\u4E0A\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          "\u533A\u9593\u540D\u3001\u30B2\u30FC\u30E0\u6570\u3001\u5DEE\u679A\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      ];
    }
    if (input.segments.length > 100) {
      return [
        message(
          "error",
          "segments_limit_exceeded",
          "segments",
          "\u533A\u9593\u306F100\u4EF6\u307E\u3067\u5165\u529B\u3067\u304D\u307E\u3059\u3002",
          "\u5BFE\u8C61\u3092\u5206\u3051\u308B\u304B\u3001\u4E0D\u8981\u306A\u533A\u9593\u3092\u524A\u9664\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        )
      ];
    }
    input.segments.forEach((segment, index) => {
      for (const item of validateNetMedals({ games: segment.games, netMedals: segment.netMedals })) {
        messages.push({ ...item, field: `segments.${index}.${item.field ?? "range"}` });
      }
      if (segment.startGame !== void 0 && segment.endGame !== void 0 && segment.endGame < segment.startGame) {
        messages.push(
          message(
            "error",
            "segment_range_reversed",
            `segments.${index}.endGame`,
            "\u7D42\u4E86G\u304C\u958B\u59CBG\u3088\u308A\u5C0F\u3055\u304F\u306A\u3063\u3066\u3044\u307E\u3059\u3002",
            "\u958B\u59CBG\u3068\u7D42\u4E86G\u3092\u5165\u308C\u66FF\u3048\u308B\u304B\u3001\u5BFE\u8C61\u533A\u9593\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
          )
        );
      }
    });
    const ranges = input.segments.map((segment, index) => ({ index, start: segment.startGame, end: segment.endGame })).filter(
      (range) => range.start !== void 0 && range.end !== void 0 && range.end >= range.start
    ).sort((left, right) => left.start - right.start);
    for (let index = 1; index < ranges.length; index += 1) {
      const previous = ranges[index - 1];
      const current = ranges[index];
      if (previous && current && current.start < previous.end) {
        messages.push(
          message(
            "error",
            "segment_range_overlap",
            `segments.${current.index}.startGame`,
            "\u5165\u529B\u3057\u305F\u533A\u9593\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002",
            "\u5404\u533A\u9593\u304C\u91CD\u306A\u3089\u306A\u3044\u3088\u3046\u306B\u958B\u59CBG\u3068\u7D42\u4E86G\u3092\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
          )
        );
      }
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

  // tools/slot-balance/src/domain/normalizers.ts
  var DEFAULT_UNITS = ["\u30B2\u30FC\u30E0", "G", "\u679A", "\u5186"];
  function error(code, field2, message2, correction) {
    return {
      messages: [{ severity: "error", code, field: field2, message: message2, correction }]
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
  function normalizeIntegerInput(raw, field2, label) {
    return normalizeNumericInput(raw, { field: field2, label, allowDecimal: false });
  }
  function normalizeDecimalInput(raw, field2, label) {
    return normalizeNumericInput(raw, { field: field2, label, allowDecimal: true });
  }

  // tools/slot-balance/src/ui/adapters.ts
  function requiredMessage(field2, label) {
    return {
      severity: "error",
      code: "required_input",
      field: field2,
      message: `${label}\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
      correction: "\u5165\u529B\u4F8B\u3068\u5358\u4F4D\u3092\u78BA\u8A8D\u3057\u3066\u3001\u6570\u5B57\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    };
  }
  function rawValue(form, field2) {
    return namedControl(form, field2)?.value ?? "";
  }
  function requiredInteger(form, field2, label) {
    const raw = rawValue(form, field2);
    if (raw.trim() === "") return { messages: [requiredMessage(field2, label)] };
    const normalized = normalizeIntegerInput(raw, field2, label);
    return { value: normalized.value, messages: normalized.messages };
  }
  function optionalInteger(form, field2, label) {
    const raw = rawValue(form, field2);
    if (raw.trim() === "") return { messages: [] };
    const normalized = normalizeIntegerInput(raw, field2, label);
    return { value: normalized.value, messages: normalized.messages };
  }
  function optionalDecimal(form, field2, label) {
    const raw = rawValue(form, field2);
    if (raw.trim() === "") return { messages: [] };
    const normalized = normalizeDecimalInput(raw, field2, label);
    return { value: normalized.value, messages: normalized.messages };
  }
  function requiredIntegerFromRaw(raw, field2, label) {
    if (raw.trim() === "") return { messages: [requiredMessage(field2, label)] };
    const normalized = normalizeIntegerInput(raw, field2, label);
    return { value: normalized.value, messages: normalized.messages };
  }
  function optionalIntegerFromRaw(raw, field2, label) {
    if (raw.trim() === "") return { messages: [] };
    const normalized = normalizeIntegerInput(raw, field2, label);
    return { value: normalized.value, messages: normalized.messages };
  }
  function pairedOptionalMessage(first, second, firstField, secondField, message2) {
    if (first.value === void 0 === (second.value === void 0)) return [];
    return [
      {
        severity: "error",
        code: "paired_inputs_required",
        field: first.value === void 0 ? firstField : secondField,
        message: message2,
        correction: "\u4E21\u65B9\u3092\u5165\u529B\u3059\u308B\u304B\u3001\u4E21\u65B9\u3092\u7A7A\u6B04\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      }
    ];
  }
  function combineMessages(...parsed) {
    return parsed.flatMap(({ messages }) => messages);
  }

  // tools/slot-balance/src/ui/formatters.ts
  var INTEGER_FORMATTER = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
  var DECIMAL_FORMATTER = new Intl.NumberFormat("ja-JP", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  function formatNumber(value, fractionDigits = 0) {
    return fractionDigits === 0 ? INTEGER_FORMATTER.format(value) : DECIMAL_FORMATTER.format(value);
  }
  function formatSignedNumber(value, fractionDigits = 0) {
    if (value === 0) return formatNumber(0, fractionDigits);
    return `${value > 0 ? "+" : "-"}${formatNumber(Math.abs(value), fractionDigits)}`;
  }
  function formatYen(value, signed = false) {
    return `${signed ? formatSignedNumber(value) : formatNumber(value)}\u5186`;
  }
  function formatMedals(value, signed = false) {
    return `${signed ? formatSignedNumber(value) : formatNumber(value)}\u679A`;
  }
  function formatSignedMedals(value) {
    return formatMedals(value, true);
  }
  function formatGames(value) {
    return `${formatNumber(value)}G`;
  }
  function formatPercent(value) {
    return `${formatNumber(value, 1)}%`;
  }
  function provenanceLabel(provenance) {
    const labels = {
      input: "\u5165\u529B",
      calculated: "\u8A08\u7B97",
      estimated: "\u6982\u7B97",
      reference: "\u53C2\u8003",
      actual: "\u5B9F\u6E2C"
    };
    return labels[provenance];
  }

  // tools/slot-balance/src/ui/modes/investment-recovery-ui.ts
  function setupInvestmentRecoveryUi() {
    const form = byId("investment-form");
    return {
      calculate() {
        const cash = requiredInteger(form, "investment.cash", "\u73FE\u91D1\u6295\u8CC7\u984D");
        const current = requiredInteger(form, "investment.currentMedals", "\u73FE\u5728\u624B\u5143\u306B\u3042\u308B\u679A\u6570");
        const stored = optionalInteger(form, "investment.storedMedals", "\u4F7F\u7528\u3057\u305F\u8CAF\u30E1\u30C0\u30EB");
        const exchanged = optionalInteger(form, "investment.exchangedYen", "\u3059\u3067\u306B\u4EA4\u63DB\u3057\u305F\u91D1\u984D");
        const lend = optionalDecimal(form, "investment.lendRate", "\u8CB8\u51FA\u6761\u4EF6");
        const exchange = optionalDecimal(form, "investment.exchangeRate", "\u4EA4\u63DB\u6761\u4EF6");
        const unit = optionalInteger(form, "investment.exchangeUnit", "\u4EA4\u63DB\u5358\u4F4D");
        const games = optionalInteger(form, "investment.games", "G\u6570");
        const netMedals = optionalInteger(form, "investment.netMedals", "\u5DEE\u679A");
        const messages = [
          ...combineMessages(
            cash,
            current,
            stored,
            exchanged,
            lend,
            exchange,
            unit,
            games,
            netMedals
          ),
          ...pairedOptionalMessage(
            games,
            netMedals,
            "investment.games",
            "investment.netMedals",
            "G\u6570\u3068\u5DEE\u679A\u306F\u540C\u3058\u5BFE\u8C61\u7BC4\u56F2\u3067\u4E21\u65B9\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
          )
        ];
        if (messages.length > 0 || cash.value === void 0 || current.value === void 0) {
          return { key: "investment", messages };
        }
        const result = calculateInvestmentRecovery({
          cashInvestmentYen: cash.value,
          currentMedals: current.value,
          storedMedalsUsed: stored.value,
          alreadyExchangedYen: exchanged.value,
          lendMedalsPer1000Yen: lend.value,
          exchangeMedalsPer1000Yen: exchange.value,
          exchangeUnitYen: unit.value,
          requestRecoveryLines: exchange.value !== void 0,
          games: games.value,
          netMedals: netMedals.value
        });
        if (!result.ok || !result.values) {
          const fieldNames = {
            cashInvestmentYen: "investment.cash",
            currentMedals: "investment.currentMedals",
            storedMedalsUsed: "investment.storedMedals",
            alreadyExchangedYen: "investment.exchangedYen",
            lendMedalsPer1000Yen: "investment.lendRate",
            exchangeMedalsPer1000Yen: "investment.exchangeRate",
            exchangeUnitYen: "investment.exchangeUnit",
            games: "investment.games",
            netMedals: "investment.netMedals"
          };
          return {
            key: "investment",
            result,
            messages: result.errors.map((message2) => ({
              ...message2,
              field: message2.field ? fieldNames[message2.field] ?? message2.field : void 0
            }))
          };
        }
        const values = result.values;
        const groups = [
          {
            items: [
              {
                label: "\u4EA4\u63DB\u5358\u4F4D\u53CD\u6620\u5F8C\u306E\u4EA4\u63DB\u898B\u8FBC\u984D",
                value: formatYen(values.currentExchangeEstimateYen),
                provenance: result.provenance["currentExchangeEstimateYen"] ?? "estimated",
                primary: true
              },
              {
                label: "\u7DCF\u56DE\u53CE\u898B\u8FBC",
                value: formatYen(values.grossReturnEstimateYen),
                provenance: result.provenance["grossReturnEstimateYen"] ?? "estimated",
                primary: true
              },
              {
                label: "\u73FE\u91D1\u30D9\u30FC\u30B9\u5DEE\u984D",
                value: formatYen(values.cashNetEstimateYen, true),
                provenance: result.provenance["cashNetEstimateYen"] ?? "estimated",
                primary: true
              },
              {
                label: "\u8CAF\u30E1\u30C0\u30EB\u8FBC\u307F\u4FA1\u5024\u5DEE\u984D",
                value: formatYen(values.totalValueNetEstimateYen.display, true),
                provenance: result.provenance["totalValueNetEstimateYen"] ?? "estimated",
                primary: true
              }
            ]
          },
          {
            title: "\u63DB\u7B97\u5185\u8A33",
            items: [
              {
                label: "\u73FE\u5728\u679A\u6570\u306E\u7406\u8AD6\u4EA4\u63DB\u984D",
                value: formatYen(values.currentTheoreticalExchangeYen.display),
                provenance: result.provenance["currentTheoreticalExchangeYen"] ?? "estimated"
              },
              {
                label: "\u4F7F\u7528\u8CAF\u30E1\u30C0\u30EB\u306E\u76F8\u5F53\u984D",
                value: formatYen(values.storedMedalValueYen.display),
                provenance: result.provenance["storedMedalValueYen"] ?? "estimated"
              }
            ]
          }
        ];
        const rateItems = [];
        if (values.cashRecoveryRate) {
          rateItems.push({
            label: "\u73FE\u91D1\u56DE\u53CE\u7387",
            value: formatPercent(values.cashRecoveryRate.display),
            provenance: result.provenance["cashRecoveryRate"] ?? "estimated"
          });
        }
        if (values.totalRecoveryRate) {
          rateItems.push({
            label: "\u8CAF\u30E1\u30C0\u30EB\u8FBC\u307F\u56DE\u53CE\u7387",
            value: formatPercent(values.totalRecoveryRate.display),
            provenance: result.provenance["totalRecoveryRate"] ?? "estimated"
          });
        }
        if (rateItems.length > 0) groups.push({ title: "\u56DE\u53CE\u7387", items: rateItems });
        const lineItems = [];
        if (values.cashRecoveryLine) {
          lineItems.push(
            {
              label: "\u73FE\u91D1\u56DE\u53CE\u30E9\u30A4\u30F3",
              value: formatMedals(values.cashRecoveryLine.requiredMedals),
              provenance: result.provenance["cashRecoveryLine"] ?? "estimated"
            },
            {
              label: "\u73FE\u91D1\u56DE\u53CE\u30E9\u30A4\u30F3\u3068\u306E\u5DEE\u679A\u6570",
              value: formatSignedMedals(-values.cashRecoveryLine.gapMedals),
              provenance: result.provenance["cashRecoveryLine"] ?? "estimated",
              note: "\u30D7\u30E9\u30B9\u306F\u73FE\u5728\u679A\u6570\u304C\u30E9\u30A4\u30F3\u3092\u4E0A\u56DE\u308B\u72B6\u614B\u3001\u30DE\u30A4\u30CA\u30B9\u306F\u4E0D\u8DB3\u679A\u6570\u3067\u3059\u3002"
            }
          );
        }
        if (values.showTotalRecoveryLine && values.totalRecoveryLine) {
          lineItems.push(
            {
              label: "\u8CAF\u30E1\u30C0\u30EB\u8FBC\u307F\u56DE\u53CE\u30E9\u30A4\u30F3",
              value: formatMedals(values.totalRecoveryLine.requiredMedals),
              provenance: result.provenance["totalRecoveryLine"] ?? "estimated"
            },
            {
              label: "\u8CAF\u30E1\u30C0\u30EB\u8FBC\u307F\u56DE\u53CE\u30E9\u30A4\u30F3\u3068\u306E\u5DEE\u679A\u6570",
              value: formatSignedMedals(-values.totalRecoveryLine.gapMedals),
              provenance: result.provenance["totalRecoveryLine"] ?? "estimated"
            }
          );
        }
        if (lineItems.length > 0) groups.push({ title: "\u56DE\u53CE\u30E9\u30A4\u30F3", items: lineItems });
        if (values.cashBorrowedMedalsEquivalent) {
          groups.push({
            title: "\u8CB8\u51FA\u6761\u4EF6\u306E\u53C2\u8003",
            items: [
              {
                label: "\u73FE\u91D1\u6295\u8CC7\u306E\u8CB8\u51FA\u679A\u6570\u76F8\u5F53",
                value: formatMedals(values.cashBorrowedMedalsEquivalent.display),
                provenance: result.provenance["cashBorrowedMedalsEquivalent"] ?? "reference"
              }
            ]
          });
        }
        if (values.netMedalsAnalysis) {
          const netItems = [
            {
              label: "1,000G\u3042\u305F\u308A\u5DEE\u679A",
              value: `${formatSignedMedals(values.netMedalsAnalysis.netMedalsPer1000G.display)}\uFF0F1,000G`,
              provenance: "calculated"
            }
          ];
          if (values.netMedalsAnalysis.payoutRateEstimate) {
            netItems.unshift({
              label: "\u5DEE\u679A\u30D9\u30FC\u30B9\u51FA\u7389\u7387",
              value: formatPercent(values.netMedalsAnalysis.payoutRateEstimate.display),
              provenance: "estimated"
            });
          }
          groups.push({ title: "\u8FFD\u52A0\u3057\u305FG\u6570\u30FB\u5DEE\u679A", items: netItems });
        }
        return { key: "investment", result, groups, messages: [] };
      }
    };
  }

  // tools/slot-balance/src/ui/modes/net-medals-ui.ts
  function setupNetMedalsUi() {
    const form = byId("net-form");
    return {
      calculate() {
        const games = requiredInteger(form, "net.games", "G\u6570");
        const netMedals = requiredInteger(form, "net.netMedals", "\u5DEE\u679A");
        const messages = combineMessages(games, netMedals);
        if (messages.length > 0 || games.value === void 0 || netMedals.value === void 0) {
          return { key: "net", messages };
        }
        const scope = namedControl(form, "net.scope")?.value ?? "personal_session";
        const result = calculateNetMedals({
          games: games.value,
          netMedals: netMedals.value,
          gamesScope: scope,
          netMedalsScope: scope
        });
        if (!result.ok || !result.values) {
          const fieldNames = { games: "net.games", netMedals: "net.netMedals" };
          return {
            key: "net",
            result,
            messages: result.errors.map((message2) => ({
              ...message2,
              field: message2.field ? fieldNames[message2.field] ?? message2.field : void 0
            }))
          };
        }
        const values = result.values;
        const primaryItems = [];
        if (values.payoutRateEstimate) {
          primaryItems.push({
            label: "\u5DEE\u679A\u30D9\u30FC\u30B9\u51FA\u7389\u7387",
            value: formatPercent(values.payoutRateEstimate.display),
            provenance: result.provenance["payoutRateEstimate"] ?? "estimated",
            primary: true,
            note: "1G\u3042\u305F\u308A3\u679A\u639B\u3051\u3068\u3057\u3066\u63DB\u7B97\u3057\u305F\u6982\u7B97\u3067\u3059\u3002"
          });
        }
        primaryItems.push({
          label: "1,000G\u3042\u305F\u308A\u5DEE\u679A",
          value: `${formatSignedMedals(values.netMedalsPer1000G.display)}\uFF0F1,000G`,
          provenance: result.provenance["netMedalsPer1000G"] ?? "calculated",
          primary: true
        });
        const groups = [
          { items: primaryItems },
          {
            title: "3\u679A\u639B\u3051\u63DB\u7B97",
            items: [
              {
                label: "IN",
                value: formatMedals(values.assumedIn),
                provenance: result.provenance["assumedIn"] ?? "estimated"
              },
              {
                label: "OUT",
                value: formatMedals(values.assumedOut, true),
                provenance: result.provenance["assumedOut"] ?? "estimated"
              },
              {
                label: "\u5BFE\u8C61G\u6570",
                value: formatGames(games.value),
                provenance: "input"
              }
            ]
          }
        ];
        return { key: "net", result, groups, messages: [] };
      }
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

  // tools/slot-balance/src/domain/calculators/segments.ts
  function calculateSegments(input) {
    const messages = validateSegments(input);
    if (messages.some(({ severity }) => severity === "error")) {
      return createCalculationResult({
        mode: "segments",
        normalizedInputs: input,
        provenance: { segments: "input" },
        explanations: [],
        knowledgeBoundary: SEGMENTS_KNOWLEDGE,
        messages
      });
    }
    const segments = input.segments.map((segment) => {
      const result = calculateNetMedals({ games: segment.games, netMedals: segment.netMedals });
      if (!result.values) throw new Error("Validated segment did not produce values.");
      return { input: segment, values: result.values };
    });
    const totalGames = input.segments.reduce((sum, segment) => sum + segment.games, 0);
    const totalNetMedals = input.segments.reduce((sum, segment) => sum + segment.netMedals, 0);
    const aggregateResult = calculateNetMedals({ games: totalGames, netMedals: totalNetMedals });
    if (!aggregateResult.values) throw new Error("Validated aggregate did not produce values.");
    const values = {
      segments,
      totalGames,
      totalNetMedals,
      aggregate: aggregateResult.values
    };
    return createCalculationResult({
      mode: "segments",
      normalizedInputs: input,
      values,
      provenance: {
        segments: "input",
        totalGames: "calculated",
        totalNetMedals: "calculated",
        aggregate: "estimated"
      },
      explanations: explainSegments(values),
      knowledgeBoundary: SEGMENTS_KNOWLEDGE,
      messages
    });
  }

  // tools/slot-balance/src/ui/modes/segments-inout-ui.ts
  var MAX_SEGMENTS = 100;
  function field(label, dataName, options = {}) {
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    const labelElement = textElement("label", label);
    const controlRow = document.createElement("div");
    controlRow.className = "field-control";
    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.inputMode = options.inputMode ?? "numeric";
    input.dataset["dynamicField"] = dataName;
    if (options.placeholder) input.placeholder = options.placeholder;
    if (options.maxLength) input.maxLength = options.maxLength;
    controlRow.append(input);
    if (options.unit) controlRow.append(textElement("span", options.unit, "field-unit"));
    const hint = textElement("p", "", "field-error");
    hint.dataset["fieldErrorFor"] = "";
    wrapper.append(labelElement, controlRow, hint);
    return wrapper;
  }
  function createNetSegmentRow() {
    const row = document.createElement("fieldset");
    row.className = "dynamic-row";
    row.dataset["segmentRow"] = "net";
    const legend = textElement("legend", "\u533A\u9593");
    legend.dataset["rowLegend"] = "";
    const header = document.createElement("div");
    header.className = "dynamic-row__header";
    const remove = textElement("button", "\u3053\u306E\u533A\u9593\u3092\u524A\u9664", "text-button danger-button");
    remove.type = "button";
    remove.dataset["removeRow"] = "";
    header.append(remove);
    const grid = document.createElement("div");
    grid.className = "field-grid field-grid--dynamic";
    grid.append(
      field("\u533A\u9593\u540D\uFF08\u4EFB\u610F\uFF09", "label", {
        placeholder: "\u4F8B\uFF1A\u5348\u524D",
        inputMode: "text",
        maxLength: 100
      }),
      field("G\u6570", "games", { unit: "G", placeholder: "\u4F8B\uFF1A1000" }),
      field("\u5DEE\u679A", "netMedals", { unit: "\u679A", placeholder: "\u4F8B\uFF1A+200" }),
      field("\u958B\u59CBG\uFF08\u4EFB\u610F\uFF09", "startGame", { unit: "G" }),
      field("\u7D42\u4E86G\uFF08\u4EFB\u610F\uFF09", "endGame", { unit: "G" }),
      field("\u30E1\u30E2\uFF08\u4EFB\u610F\uFF09", "memo", { inputMode: "text", maxLength: 500 })
    );
    row.append(legend, header, grid);
    return row;
  }
  function createInOutSegmentRow() {
    const row = document.createElement("fieldset");
    row.className = "dynamic-row";
    row.dataset["segmentRow"] = "inout";
    const legend = textElement("legend", "IN/OUT\u533A\u9593");
    legend.dataset["rowLegend"] = "";
    const header = document.createElement("div");
    header.className = "dynamic-row__header";
    const remove = textElement("button", "\u3053\u306E\u533A\u9593\u3092\u524A\u9664", "text-button danger-button");
    remove.type = "button";
    remove.dataset["removeRow"] = "";
    header.append(remove);
    const grid = document.createElement("div");
    grid.className = "field-grid field-grid--dynamic";
    grid.append(
      field("\u533A\u9593\u540D\uFF08\u4EFB\u610F\uFF09", "label", { inputMode: "text", maxLength: 100 }),
      field("\u5B9FIN", "actualIn", { unit: "\u679A" }),
      field("\u5B9FOUT", "actualOut", { unit: "\u679A" }),
      field("G\u6570\uFF08\u4EFB\u610F\uFF09", "games", { unit: "G" })
    );
    row.append(legend, header, grid);
    return row;
  }
  function dynamicValue(row, fieldName) {
    return row.querySelector(`[data-dynamic-field="${fieldName}"]`)?.value ?? "";
  }
  function reindex(list) {
    const rows = Array.from(list.container.querySelectorAll("[data-segment-row]"));
    rows.forEach((row, index) => {
      const legend = row.querySelector("[data-row-legend]");
      if (legend) legend.textContent = `\u533A\u9593 ${index + 1}`;
      row.querySelectorAll("[data-dynamic-field]").forEach((input) => {
        const suffix = input.dataset["dynamicField"] ?? "";
        const name = `${list.prefix}.${index}.${suffix}`;
        input.name = name;
        input.id = name.replaceAll(".", "-");
        const wrapper = input.closest(".field");
        const label = wrapper?.querySelector("label");
        const error2 = wrapper?.querySelector("[data-field-error-for]");
        if (label) label.htmlFor = input.id;
        if (error2) {
          error2.dataset["fieldErrorFor"] = name;
          error2.id = `${input.id}-error`;
          input.setAttribute("aria-describedby", error2.id);
        }
      });
      const remove = row.querySelector("[data-remove-row]");
      if (remove) remove.disabled = rows.length === 1;
    });
    list.addButton.disabled = rows.length >= MAX_SEGMENTS;
  }
  function setupDynamicList(list, key, options) {
    list.container.append(list.makeRow());
    reindex(list);
    list.addButton.addEventListener("click", () => {
      const count = list.container.querySelectorAll("[data-segment-row]").length;
      if (count >= MAX_SEGMENTS) {
        options.announce("\u533A\u9593\u306F100\u4EF6\u307E\u3067\u3067\u3059\u3002");
        return;
      }
      list.container.append(list.makeRow());
      list.removed = void 0;
      list.undoRegion.hidden = true;
      reindex(list);
      options.markDirty(key);
      options.announce(`\u533A\u9593 ${count + 1} \u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002`);
    });
    list.container.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.closest("[data-remove-row]")) return;
      const row = target.closest("[data-segment-row]");
      if (!row) return;
      const rows = Array.from(list.container.querySelectorAll("[data-segment-row]"));
      if (rows.length <= 1) return;
      const index = rows.indexOf(row);
      list.removed = { row, index };
      row.remove();
      list.undoRegion.hidden = false;
      reindex(list);
      options.markDirty(key);
      options.announce(`\u533A\u9593 ${index + 1} \u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002\u5143\u306B\u623B\u305B\u307E\u3059\u3002`);
    });
    list.undoButton.addEventListener("click", () => {
      if (!list.removed) return;
      const before = list.container.children.item(list.removed.index);
      list.container.insertBefore(list.removed.row, before);
      const restoredIndex = list.removed.index;
      list.removed = void 0;
      list.undoRegion.hidden = true;
      reindex(list);
      options.markDirty(key);
      options.announce(`\u533A\u9593 ${restoredIndex + 1} \u3092\u5143\u306B\u623B\u3057\u307E\u3057\u305F\u3002`);
    });
  }
  function errorsFromResult(result) {
    return [...result.errors, ...result.warnings, ...result.info];
  }
  function setupSegmentsCalculator(options) {
    const list = {
      container: byId("net-segment-list"),
      addButton: byId("add-net-segment"),
      undoRegion: byId("net-segment-undo"),
      undoButton: byId("undo-net-segment"),
      prefix: "segments",
      makeRow: createNetSegmentRow
    };
    setupDynamicList(list, "segments", options);
    return {
      calculate() {
        const segments = [];
        const messages = [];
        const rows = Array.from(list.container.querySelectorAll("[data-segment-row]"));
        rows.forEach((row, index) => {
          const games = requiredIntegerFromRaw(
            dynamicValue(row, "games"),
            `segments.${index}.games`,
            `\u533A\u9593${index + 1}\u306EG\u6570`
          );
          const netMedals = requiredIntegerFromRaw(
            dynamicValue(row, "netMedals"),
            `segments.${index}.netMedals`,
            `\u533A\u9593${index + 1}\u306E\u5DEE\u679A`
          );
          const start = optionalIntegerFromRaw(
            dynamicValue(row, "startGame"),
            `segments.${index}.startGame`,
            `\u533A\u9593${index + 1}\u306E\u958B\u59CBG`
          );
          const end = optionalIntegerFromRaw(
            dynamicValue(row, "endGame"),
            `segments.${index}.endGame`,
            `\u533A\u9593${index + 1}\u306E\u7D42\u4E86G`
          );
          messages.push(...combineMessages(games, netMedals, start, end));
          if (games.value !== void 0 && netMedals.value !== void 0) {
            const label = dynamicValue(row, "label").trim();
            const memo = dynamicValue(row, "memo").trim();
            segments.push({
              games: games.value,
              netMedals: netMedals.value,
              ...label ? { label } : {},
              ...memo ? { memo } : {},
              ...start.value !== void 0 ? { startGame: start.value } : {},
              ...end.value !== void 0 ? { endGame: end.value } : {}
            });
          }
        });
        if (messages.length > 0 || segments.length !== rows.length) {
          return { key: "segments", messages };
        }
        const result = calculateSegments({ segments });
        if (!result.ok || !result.values) {
          return { key: "segments", result, messages: result.errors };
        }
        const groups = [
          {
            items: [
              {
                label: "\u5408\u8A08\u304B\u3089\u518D\u8A08\u7B97\u3057\u305F\u51FA\u7389\u7387",
                value: result.values.aggregate.payoutRateEstimate ? formatPercent(result.values.aggregate.payoutRateEstimate.display) : "\u7B97\u51FA\u4E0D\u53EF",
                provenance: "estimated",
                primary: true,
                note: "\u5404\u533A\u9593\u7387\u306E\u5358\u7D14\u5E73\u5747\u3067\u306F\u306A\u304F\u3001\u5408\u8A08G\u6570\u30FB\u5408\u8A08\u5DEE\u679A\u304B\u3089\u518D\u8A08\u7B97\u3057\u307E\u3059\u3002"
              },
              {
                label: "\u7DCFG",
                value: formatGames(result.values.totalGames),
                provenance: result.provenance["totalGames"] ?? "calculated",
                primary: true
              },
              {
                label: "\u7DCF\u5DEE\u679A",
                value: formatSignedMedals(result.values.totalNetMedals),
                provenance: result.provenance["totalNetMedals"] ?? "calculated",
                primary: true
              }
            ]
          }
        ];
        result.values.segments.forEach((segment, index) => {
          const label = segment.input.label || `\u533A\u9593 ${index + 1}`;
          const items = [
            {
              label: "G\u6570",
              value: formatGames(segment.input.games),
              provenance: "input"
            },
            {
              label: "\u5DEE\u679A",
              value: formatSignedMedals(segment.input.netMedals),
              provenance: "input"
            },
            {
              label: "1,000G\u3042\u305F\u308A\u5DEE\u679A",
              value: `${formatSignedMedals(segment.values.netMedalsPer1000G.display)}\uFF0F1,000G`,
              provenance: "calculated"
            }
          ];
          if (segment.values.payoutRateEstimate) {
            items.push({
              label: "\u5DEE\u679A\u30D9\u30FC\u30B9\u51FA\u7389\u7387",
              value: formatPercent(segment.values.payoutRateEstimate.display),
              provenance: "estimated"
            });
          }
          groups.push({ title: label, items });
        });
        return { key: "segments", result, groups, messages: [] };
      }
    };
  }
  function setupInOutCalculator(options) {
    const form = byId("inout-form");
    const list = {
      container: byId("inout-segment-list"),
      addButton: byId("add-inout-segment"),
      undoRegion: byId("inout-segment-undo"),
      undoButton: byId("undo-inout-segment"),
      prefix: "inoutSegments",
      makeRow: createInOutSegmentRow
    };
    setupDynamicList(list, "inout", options);
    const sourceInputs = Array.from(form.querySelectorAll('[name="inout.source"]'));
    const updateSource = () => {
      const source = sourceInputs.find(({ checked }) => checked)?.value ?? "total";
      byId("inout-total-fields").hidden = source !== "total";
      byId("inout-segment-fields").hidden = source !== "segments";
    };
    sourceInputs.forEach((input) => input.addEventListener("change", updateSource));
    updateSource();
    return {
      calculate() {
        const source = sourceInputs.find(({ checked }) => checked)?.value ?? "total";
        const messages = [];
        let result;
        if (source === "total") {
          const actualIn = requiredInteger(form, "inout.actualIn", "\u5B9FIN");
          const actualOut = requiredInteger(form, "inout.actualOut", "\u5B9FOUT");
          const games = optionalInteger(form, "inout.games", "G\u6570");
          messages.push(...combineMessages(actualIn, actualOut, games));
          if (messages.length > 0 || actualIn.value === void 0 || actualOut.value === void 0) {
            return { key: "inout", messages };
          }
          result = calculateInOut({
            actualIn: actualIn.value,
            actualOut: actualOut.value,
            games: games.value
          });
        } else {
          const segments = [];
          const rows = Array.from(list.container.querySelectorAll("[data-segment-row]"));
          rows.forEach((row, index) => {
            const actualIn = requiredIntegerFromRaw(
              dynamicValue(row, "actualIn"),
              `inoutSegments.${index}.actualIn`,
              `\u533A\u9593${index + 1}\u306E\u5B9FIN`
            );
            const actualOut = requiredIntegerFromRaw(
              dynamicValue(row, "actualOut"),
              `inoutSegments.${index}.actualOut`,
              `\u533A\u9593${index + 1}\u306E\u5B9FOUT`
            );
            const games = optionalIntegerFromRaw(
              dynamicValue(row, "games"),
              `inoutSegments.${index}.games`,
              `\u533A\u9593${index + 1}\u306EG\u6570`
            );
            messages.push(...combineMessages(actualIn, actualOut, games));
            if (actualIn.value !== void 0 && actualOut.value !== void 0) {
              const label = dynamicValue(row, "label").trim();
              segments.push({
                actualIn: actualIn.value,
                actualOut: actualOut.value,
                ...games.value !== void 0 ? { games: games.value } : {},
                ...label ? { label } : {}
              });
            }
          });
          if (messages.length > 0 || segments.length !== rows.length) {
            return { key: "inout", messages };
          }
          result = calculateInOut({ segments });
        }
        if (!result.ok || !result.values) {
          return {
            key: "inout",
            result,
            messages: result.errors.map((message2) => ({
              ...message2,
              field: message2.field ? message2.field.replace(/^actualIn$/, "inout.actualIn").replace(/^actualOut$/, "inout.actualOut").replace(/^segments\./, "inoutSegments.") : void 0
            }))
          };
        }
        const groups = [
          {
            items: [
              {
                label: "\u5B9FIN/OUT\u51FA\u7389\u7387",
                value: formatPercent(result.values.payoutRate.display),
                provenance: result.provenance["payoutRate"] ?? "actual",
                primary: true
              },
              {
                label: "\u5B9F\u5DEE\u679A",
                value: formatSignedMedals(result.values.actualNetMedals),
                provenance: result.provenance["actualNetMedals"] ?? "actual",
                primary: true
              }
            ]
          },
          {
            title: "\u5B9F\u6E2C\u5408\u8A08",
            items: [
              {
                label: "\u5408\u8A08IN",
                value: formatMedals(result.values.totalIn),
                provenance: result.provenance["totalIn"] ?? "actual"
              },
              {
                label: "\u5408\u8A08OUT",
                value: formatMedals(result.values.totalOut),
                provenance: result.provenance["totalOut"] ?? "actual"
              },
              ...result.values.totalGames === void 0 ? [] : [
                {
                  label: "\u5408\u8A08G",
                  value: formatGames(result.values.totalGames),
                  provenance: "calculated"
                }
              ]
            ]
          }
        ];
        return { key: "inout", result, groups, messages: [] };
      }
    };
  }
  function confirmationMessage(fieldName, message2) {
    return {
      severity: "error",
      code: "confirmation_required",
      field: fieldName,
      message: message2,
      correction: "\u5185\u5BB9\u3092\u78BA\u8A8D\u3057\u3001\u81EA\u5206\u3067\u30C1\u30A7\u30C3\u30AF\u3092\u5165\u308C\u3066\u304F\u3060\u3055\u3044\u3002"
    };
  }
  function isChecked(form, fieldName) {
    const control = namedControl(form, fieldName);
    return control instanceof HTMLInputElement && control.checked;
  }
  function setupCoinHoldCalculator() {
    const form = byId("coin-form");
    const sourceInputs = Array.from(form.querySelectorAll('[name="coin.method"]'));
    const updateSource = () => {
      const source = sourceInputs.find(({ checked }) => checked)?.value ?? "direct";
      byId("coin-direct-fields").hidden = source !== "direct";
      byId("coin-breakdown-fields").hidden = source !== "breakdown";
    };
    sourceInputs.forEach((input) => input.addEventListener("change", updateSource));
    updateSource();
    return {
      calculate() {
        const method = sourceInputs.find(({ checked }) => checked)?.value ?? "direct";
        const normalGames = requiredInteger(form, "coin.normalGames", "\u901A\u5E38\u6642G\u6570");
        const messages = [...normalGames.messages];
        const atBonusExcluded = isChecked(form, "coin.atBonusExcluded");
        const scopeConfirmed = isChecked(form, "coin.scopeConfirmed");
        if (!atBonusExcluded) {
          messages.push(
            confirmationMessage(
              "coin.atBonusExcluded",
              "AT\u30FB\u30DC\u30FC\u30CA\u30B9\u533A\u9593\u3092\u542B\u307E\u306A\u3044\u3053\u3068\u306E\u78BA\u8A8D\u304C\u5FC5\u8981\u3067\u3059\u3002"
            )
          );
        }
        if (!scopeConfirmed) {
          messages.push(
            confirmationMessage(
              "coin.scopeConfirmed",
              "G\u6570\u3068\u679A\u6570\u304C\u540C\u3058\u5BFE\u8C61\u533A\u9593\u3067\u3042\u308B\u3053\u3068\u306E\u78BA\u8A8D\u304C\u5FC5\u8981\u3067\u3059\u3002"
            )
          );
        }
        let input;
        if (method === "direct") {
          const netUsed = requiredInteger(form, "coin.netUsedMedals", "\u6B63\u5473\u4F7F\u7528\u679A\u6570");
          messages.push(...netUsed.messages);
          if (normalGames.value !== void 0 && netUsed.value !== void 0) {
            input = {
              method: "direct",
              normalGames: normalGames.value,
              netUsedMedals: netUsed.value,
              atBonusExcluded,
              scopeConfirmed
            };
          }
        } else {
          const start = requiredInteger(form, "coin.startMedals", "\u958B\u59CB\u6642\u679A\u6570");
          const added = requiredInteger(form, "coin.addedMedals", "\u8FFD\u52A0\u679A\u6570");
          const end = requiredInteger(form, "coin.endMedals", "\u7D42\u4E86\u6642\u679A\u6570");
          const taken = requiredInteger(form, "coin.takenOutMedals", "\u6301\u3061\u51FA\u3057\u679A\u6570");
          messages.push(...combineMessages(start, added, end, taken));
          if (normalGames.value !== void 0 && start.value !== void 0 && added.value !== void 0 && end.value !== void 0 && taken.value !== void 0) {
            input = {
              method: "breakdown",
              normalGames: normalGames.value,
              startMedals: start.value,
              addedMedals: added.value,
              endMedals: end.value,
              takenOutMedals: taken.value,
              atBonusExcluded,
              scopeConfirmed
            };
          }
        }
        if (messages.length > 0 || !input) return { key: "coin", messages };
        const result = calculateCoinHold(input);
        if (!result.ok || !result.values) {
          const fieldNames = {
            normalGames: "coin.normalGames",
            netUsedMedals: "coin.netUsedMedals",
            atBonusExcluded: "coin.atBonusExcluded",
            scopeConfirmed: "coin.scopeConfirmed",
            breakdown: "coin.startMedals"
          };
          return {
            key: "coin",
            result,
            messages: errorsFromResult(result).map((message2) => ({
              ...message2,
              field: message2.field ? fieldNames[message2.field] ?? message2.field : void 0
            }))
          };
        }
        const groups = [
          {
            items: [
              {
                label: "50\u679A\u3042\u305F\u308A\u901A\u5E38\u6642G\u6570",
                value: `${formatNumber(result.values.coinHoldPer50.display, 1)}G\uFF0F50\u679A`,
                provenance: result.provenance["coinHoldPer50"] ?? "calculated",
                primary: true
              },
              {
                label: "\u6B63\u5473\u4F7F\u7528\u679A\u6570",
                value: formatMedals(result.values.netUsedMedals),
                provenance: result.provenance["netUsedMedals"] ?? "calculated",
                primary: true
              }
            ]
          },
          {
            title: "\u7B97\u51FA\u6761\u4EF6",
            items: [
              {
                label: "\u901A\u5E38\u6642G\u6570",
                value: formatGames(input.normalGames),
                provenance: "input"
              },
              {
                label: "\u5BFE\u8C61\u533A\u9593",
                value: "AT\u30FB\u30DC\u30FC\u30CA\u30B9\u3092\u9664\u5916\u3057\u305F\u540C\u4E00\u533A\u9593",
                provenance: "input"
              }
            ]
          }
        ];
        return { key: "coin", result, groups, messages: [] };
      }
    };
  }
  function setupSegmentsInOutUi(options) {
    return {
      segments: setupSegmentsCalculator(options),
      inout: setupInOutCalculator(options),
      coin: setupCoinHoldCalculator()
    };
  }

  // tools/slot-balance/src/ui/renderers.ts
  function output(kind, key) {
    return byId(`${kind}-${key}`);
  }
  function deduplicate(messages) {
    const seen = /* @__PURE__ */ new Set();
    return messages.filter(({ code }) => {
      if (seen.has(code)) return false;
      seen.add(code);
      return true;
    });
  }
  function allMessages(result) {
    return [...result.errors, ...result.warnings, ...result.info];
  }
  function setActiveCalculationKey(key) {
    document.querySelectorAll("[data-output-key]").forEach((element) => {
      element.hidden = element.dataset["outputKey"] !== key;
    });
  }
  function renderResultGroups(key, groups) {
    const container = output("result", key);
    const fragment = document.createDocumentFragment();
    for (const group of groups) {
      const section = document.createElement("section");
      section.className = "result-group";
      if (group.title) section.append(textElement("h3", group.title, "result-group__title"));
      const grid = document.createElement("div");
      grid.className = "metric-grid";
      for (const item of group.items) {
        const metric = document.createElement("article");
        metric.className = `metric${item.primary ? " metric--primary" : ""}`;
        const meta = document.createElement("div");
        meta.className = "metric__meta";
        meta.append(
          textElement("span", provenanceLabel(item.provenance), "provenance"),
          textElement("span", item.label, "metric__label")
        );
        metric.append(meta, textElement("p", item.value, "metric__value"));
        if (item.note) metric.append(textElement("p", item.note, "metric__note"));
        grid.append(metric);
      }
      section.append(grid);
      fragment.append(section);
    }
    replaceChildren(container, fragment);
  }
  function renderMessages(key, messages) {
    const container = output("messages", key);
    const unique = deduplicate(messages);
    if (unique.length === 0) {
      replaceChildren(container, textElement("p", "\u8FFD\u52A0\u306E\u8B66\u544A\u30FB\u88DC\u8DB3\u306F\u3042\u308A\u307E\u305B\u3093\u3002", "empty-note"));
      return;
    }
    const fragment = document.createDocumentFragment();
    const severityLabels = { error: "\u30A8\u30E9\u30FC", warning: "\u78BA\u8A8D", info: "\u88DC\u8DB3" };
    for (const item of unique) {
      const article = document.createElement("article");
      article.className = `validation-message validation-message--${item.severity}`;
      if (item.severity === "error") article.setAttribute("role", "alert");
      article.append(
        textElement("strong", severityLabels[item.severity], "validation-message__label"),
        textElement("p", item.message)
      );
      if (item.correction) article.append(textElement("p", item.correction, "validation-correction"));
      fragment.append(article);
    }
    replaceChildren(container, fragment);
  }
  function renderKnowledgeBoundary(key, boundary) {
    const container = output("boundary", key);
    const wrapper = document.createElement("div");
    wrapper.className = "boundary-grid";
    for (const [title, items, className] of [
      ["\u5206\u304B\u308B\u3053\u3068", boundary.known, "known"],
      ["\u5206\u304B\u3089\u306A\u3044\u3053\u3068", boundary.unknown, "unknown"]
    ]) {
      const section = document.createElement("section");
      section.className = `boundary-panel boundary-panel--${className}`;
      section.append(textElement("h3", title));
      const list = document.createElement("ul");
      for (const item of items) list.append(textElement("li", item.label));
      section.append(list);
      wrapper.append(section);
    }
    replaceChildren(container, wrapper);
  }
  function explanationDetails(explanation) {
    const details = document.createElement("details");
    details.className = "explanation";
    details.append(textElement("summary", explanation.title));
    const inputTitle = textElement("h4", "\u4F7F\u7528\u3057\u305F\u5165\u529B");
    const inputs = document.createElement("dl");
    inputs.className = "explanation-list";
    for (const input of explanation.inputs) {
      inputs.append(
        textElement("dt", input.label),
        textElement("dd", `${String(input.value)}${input.unit ?? ""}`)
      );
    }
    const stepTitle = textElement("h4", "\u8A08\u7B97\u624B\u9806");
    const steps = document.createElement("ol");
    steps.className = "formula-list";
    for (const step of explanation.steps) {
      steps.append(
        textElement(
          "li",
          step.value === void 0 ? step.expression : `${step.expression} \u2192 ${String(step.value)}`
        )
      );
    }
    const assumptionTitle = textElement("h4", "\u4EEE\u5B9A\u30FB\u7AEF\u6570\u51E6\u7406");
    const assumptions = document.createElement("ul");
    assumptions.className = "assumption-list";
    for (const assumption of explanation.assumptions)
      assumptions.append(textElement("li", assumption));
    details.append(inputTitle, inputs, stepTitle, steps, assumptionTitle, assumptions);
    return details;
  }
  function renderExplanations(key, explanations) {
    const container = output("explanations", key);
    if (explanations.length === 0) {
      replaceChildren(
        container,
        textElement("p", "\u5165\u529B\u3092\u4FEE\u6B63\u3059\u308B\u3068\u8A08\u7B97\u6839\u62E0\u3092\u8868\u793A\u3067\u304D\u307E\u3059\u3002", "empty-note")
      );
      return;
    }
    replaceChildren(container, ...explanations.map(explanationDetails));
  }
  function renderSuccessfulCalculation(key, result, groups) {
    renderResultGroups(key, groups);
    renderMessages(key, allMessages(result));
    renderKnowledgeBoundary(key, result.knowledgeBoundary);
    renderExplanations(key, result.explanations);
  }
  function renderFailureMessages(key, messages) {
    renderMessages(key, messages);
    renderFieldErrors(messages);
    renderErrorSummary(messages);
  }
  function clearValidationDisplay() {
    document.querySelectorAll("[data-field-error-for]").forEach((element) => {
      element.textContent = "";
    });
    document.querySelectorAll('[aria-invalid="true"]').forEach((element) => element.removeAttribute("aria-invalid"));
    const summary = byId("error-summary");
    summary.hidden = true;
    replaceChildren(summary);
  }
  function renderFieldErrors(messages) {
    const errors = messages.filter(({ severity }) => severity === "error");
    const fieldOutputs = Array.from(document.querySelectorAll("[data-field-error-for]"));
    const controls = Array.from(
      document.querySelectorAll("[name]")
    );
    for (const error2 of errors) {
      if (!error2.field) continue;
      const fieldOutput = fieldOutputs.find(
        (element) => element.dataset["fieldErrorFor"] === error2.field
      );
      if (fieldOutput) fieldOutput.textContent = error2.correction ?? error2.message;
      const control = controls.find((element) => element.name === error2.field);
      if (control) control.setAttribute("aria-invalid", "true");
    }
  }
  function renderErrorSummary(messages) {
    const errors = deduplicate(messages.filter(({ severity }) => severity === "error"));
    if (errors.length === 0) return;
    const summary = byId("error-summary");
    summary.hidden = false;
    const heading = textElement("h2", "\u5165\u529B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044");
    const list = document.createElement("ul");
    for (const error2 of errors) {
      list.append(
        textElement("li", error2.correction ? `${error2.message} ${error2.correction}` : error2.message)
      );
    }
    replaceChildren(summary, heading, list);
  }
  function setStale(key, stale) {
    const banner = byId(`stale-${key}`);
    banner.hidden = !stale;
    output("result", key).classList.toggle("is-stale", stale);
  }

  // tools/slot-balance/src/ui/state.ts
  function createCalculationState() {
    return { currentInputRevision: 0, hasResult: false, stale: false };
  }
  function createUiState() {
    return {
      net: createCalculationState(),
      investment: createCalculationState(),
      segments: createCalculationState(),
      inout: createCalculationState(),
      coin: createCalculationState()
    };
  }
  function markInputChanged(state2, key) {
    const target = state2[key];
    target.currentInputRevision += 1;
    target.stale = target.hasResult && target.calculatedInputRevision !== target.currentInputRevision;
    return target.stale;
  }
  function markCalculationSucceeded(state2, key) {
    const target = state2[key];
    target.calculatedInputRevision = target.currentInputRevision;
    target.hasResult = true;
    target.stale = false;
  }

  // tools/slot-balance/src/ui/app.ts
  var state = createUiState();
  var mainMode = "net";
  var segmentsSubmode = "segments";
  function activeKey() {
    if (mainMode === "net") return "net";
    if (mainMode === "investment") return "investment";
    return segmentsSubmode;
  }
  function markDirty(key) {
    const stale = markInputChanged(state, key);
    setStale(key, stale);
  }
  var dynamicControllers = setupSegmentsInOutUi({ markDirty, announce });
  var controllers = {
    net: setupNetMedalsUi(),
    investment: setupInvestmentRecoveryUi(),
    ...dynamicControllers
  };
  function setPressed(buttons, value, dataKey) {
    for (const button of buttons) {
      const selected = button.dataset[dataKey] === value;
      button.setAttribute("aria-pressed", String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
  }
  function bindRovingButtons(buttons, select) {
    buttons.forEach((button) => {
      button.addEventListener("click", () => select(button));
      button.addEventListener("keydown", (event) => {
        const index = buttons.indexOf(button);
        let targetIndex;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          targetIndex = (index + 1) % buttons.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          targetIndex = (index - 1 + buttons.length) % buttons.length;
        } else if (event.key === "Home") {
          targetIndex = 0;
        } else if (event.key === "End") {
          targetIndex = buttons.length - 1;
        }
        if (targetIndex === void 0) return;
        event.preventDefault();
        const target = buttons[targetIndex];
        if (target) {
          select(target);
          target.focus();
        }
      });
    });
  }
  var mainButtons = Array.from(document.querySelectorAll("[data-main-mode]"));
  function selectMainMode(button) {
    const mode = button.dataset["mainMode"];
    if (!mode) return;
    mainMode = mode;
    setPressed(mainButtons, mode, "mainMode");
    document.querySelectorAll("[data-main-panel]").forEach((panel) => {
      panel.hidden = panel.dataset["mainPanel"] !== mode;
    });
    setActiveCalculationKey(activeKey());
    clearValidationDisplay();
    announce(
      `${button.textContent?.trim() ?? "\u30E2\u30FC\u30C9"}\u3078\u5207\u308A\u66FF\u3048\u307E\u3057\u305F\u3002\u5165\u529B\u5185\u5BB9\u306F\u4FDD\u6301\u3055\u308C\u3066\u3044\u307E\u3059\u3002`
    );
  }
  bindRovingButtons(mainButtons, selectMainMode);
  var submodeButtons = Array.from(
    document.querySelectorAll("[data-segments-submode]")
  );
  function selectSegmentsSubmode(button) {
    const key = button.dataset["segmentsSubmode"];
    if (!key || !["segments", "inout", "coin"].includes(key)) return;
    segmentsSubmode = key;
    setPressed(submodeButtons, key, "segmentsSubmode");
    document.querySelectorAll("[data-submode-panel]").forEach((panel) => {
      panel.hidden = panel.dataset["submodePanel"] !== key;
    });
    if (mainMode === "segments-inout") setActiveCalculationKey(key);
    clearValidationDisplay();
    announce(`${button.textContent?.trim() ?? "\u5165\u529B\u65B9\u5F0F"}\u3078\u5207\u308A\u66FF\u3048\u307E\u3057\u305F\u3002`);
  }
  bindRovingButtons(submodeButtons, selectSegmentsSubmode);
  function handleCalculation(outcome) {
    clearValidationDisplay();
    if (!outcome.result || !outcome.result.ok || !outcome.groups) {
      const messages = outcome.messages.length > 0 ? outcome.messages : outcome.result?.errors ?? [];
      renderFailureMessages(outcome.key, messages);
      setActiveCalculationKey(outcome.key);
      announce("\u5165\u529B\u30A8\u30E9\u30FC\u304C\u3042\u308A\u307E\u3059\u3002\u8A08\u7B97\u7D50\u679C\u306F\u66F4\u65B0\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002");
      if (messages.some(({ severity }) => severity === "error")) focusErrorSummary();
      return;
    }
    markCalculationSucceeded(state, outcome.key);
    renderSuccessfulCalculation(outcome.key, outcome.result, outcome.groups);
    setStale(outcome.key, false);
    setActiveCalculationKey(outcome.key);
    announce("\u8A08\u7B97\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002\u7D50\u679C\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002");
    revealResults();
  }
  document.querySelectorAll("[data-calculate]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset["calculate"];
      if (!key) return;
      handleCalculation(controllers[key].calculate());
    });
  });
  document.querySelectorAll("[data-calculation-key]").forEach((form) => {
    const onChange = () => {
      const key = form.dataset["calculationKey"];
      if (key) markDirty(key);
    };
    form.addEventListener("input", onChange);
    form.addEventListener("change", onChange);
    form.addEventListener("submit", (event) => event.preventDefault());
  });
  byId("skip-to-tool").addEventListener("click", () => {
    window.setTimeout(() => byId("mode-heading").focus(), 0);
  });
  setPressed(mainButtons, mainMode, "mainMode");
  setPressed(submodeButtons, segmentsSubmode, "segmentsSubmode");
  setActiveCalculationKey(activeKey());
})();
