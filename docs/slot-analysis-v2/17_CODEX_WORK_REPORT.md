# Codex Work Report

- Date: 2026-07-18
- Repository: `nkis-works/slarog`
- Local: `/Users/nkis/Documents/スラログios版`
- Branch: `feature/generic-slot-analysis-product-design`
- Base: `origin/main` at `73ebeef5924f2c2d8e8031cedc0cf25db4d51d65`
- Draft PR: <https://github.com/nkis-works/slarog/pull/3>
- Status: design phase complete; review only; no merge/deploy

## A. Git and safety audit

- Remote: `https://github.com/nkis-works/slarog.git`.
- Correct NKIS Works official static site, not PACHIMITE, iOS/Android app source, or ICHIGEKI.
- Started from a clean worktree and latest `origin/main`.
- Branch created exactly as requested.
- Four intentional commit groups: audit/research, product/UX, prototype/artifacts, final governance/report.
- Branch pushed normally; no force push, reset, amend, rebase, stash, or history rewrite.
- Draft PR targets `main`; it is not merged.

## B. Production boundary

No intentional diff in:

- root production pages (`index.html`, support, privacy, terms)
- `tools/slot-balance/**`
- package/build scripts and deploy configuration
- Cloudflare, DNS, GitHub Pages, canonical, sitemap, robots, production URL

The preview build remained the existing 23-file curated `dist`. It contains no path matching `docs`, `prototypes`, `artifacts`, or `slot-analysis-v2`.

## C. Deliverables

### Documents

`docs/slot-analysis-v2/00_EXECUTIVE_SUMMARY.md` through `17_CODEX_WORK_REPORT.md`: 18 files. The requested list is numbered 00–17, so all 18 listed filenames were delivered even though the prose called them 17 documents.

### Prototype

`prototypes/slot-analysis-v2/`:

- `README.md`
- `index.html`
- `result-variants.html`
- `styles.css`
- `prototype.js`
- `prototype.spec.ts` (dedicated verification)

`playwright.prototype.config.ts` runs only this prototype on local port 4175 and does not alter existing Playwright configs.

## D. Research

- Audited current domain/application/UI/test/build/privacy boundaries.
- Compared required Kenslo tool plus six or more Japanese Web tools and three store apps.
- Researched 15 naming candidates via public Web, GitHub, App Store, Google Play, public SNS results, and J-PlatPat.
- J-PlatPat primary partial-match checks for six leading strings returned 0 on the check date; documented as preliminary, not legal clearance.
- Used only Google official help sources for responsive display ads, ads.txt, certified CMP, consent, TCF, partners, and revocation.

## E. Product decisions

- Recommended name: `スロット出玉分析`.
- Recommended future slug: `/tools/slot-analysis/`.
- Initial input: total games and net medals only.
- Initial output: actual payout rate, net/1,000G, assumed IN/OUT.
- Benchmarks: neutral vertical list for 100/103/105%, no initial “good/bad” verdict.
- Advanced actions: target reverse, segment analysis, investment/recovery through progressive disclosure.
- No machine DB, setting inference, prediction, history, share URL, or persistence.
- Slarog CTA precedes any future ad.
- Ad remains fully disabled and is a separate future approval gate.

## F. Calculation checks

Prototype and existing engine representative value:

```text
Input: 4,000G / +500 medals
Actual payout rate: 104.2%
Per 1,000G: +125 medals
Assumed IN: 12,000 medals
Assumed OUT: 12,500 medals
100% difference: +500 medals
103% difference: +140 medals
105% difference: −100 medals
```

Target example:

```text
Current: 4,000G / +500 medals
Target: 5,000G / 100%
Remaining: 1,000G
Required remaining net: −500 medals or more
Required remaining rate: 83.3% or more
```

Segment example at 103%:

```text
1,000G / +200 => contribution +110 medals
2,000G / −400 => contribution −580 medals
Total: 3,000G / −200 / 97.8%, benchmark difference −470
Endpoint maximum decline: 400 medals
Maximum recovery after decline: 0 medals
```

## G. Visual QA and revisions

| ファイル名                        | 絶対パス                                                                                                  | 画面幅 | 確認内容                     | 発見した問題                 | 修正内容                              | Git管理 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ | ---------------------------- | ---------------------------- | ------------------------------------- | ------- |
| quick-input-mobile.png            | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/quick-input-mobile.png`            | 366px  | 初期入力と主要操作           | 問題なし                     | 変更なし                              | 管理外  |
| quick-result-mobile.png           | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/quick-result-mobile.png`           | 366px  | 結果階層と縦型基準一覧       | 問題なし                     | 変更なし                              | 管理外  |
| quick-result-desktop.png          | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/quick-result-desktop.png`          | 1120px | 結果のデスクトップ配置       | 問題なし                     | 変更なし                              | 管理外  |
| result-rail-variant.png           | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/result-rail-variant.png`           | 366px  | 横レール比較案               | 右側項目の発見性が低い       | 正式案を全件見える縦一覧へ変更        | 管理外  |
| result-list-variant.png           | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/result-list-variant.png`           | 366px  | 縦一覧比較案                 | 問題なし                     | 正式案として採用                      | 管理外  |
| segment-input-mobile.png          | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/segment-input-mobile.png`          | 366px  | 区間入力の読み順と操作領域   | 問題なし                     | 変更なし                              | 管理外  |
| segment-result-mobile.png         | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/segment-result-mobile.png`         | 366px  | 区間合計・寄与・下落回復     | 回復の定義が単純run-upだった | 下落発生後の回復だけへ定義修正        | 管理外  |
| segment-result-desktop.png        | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/segment-result-desktop.png`        | 1120px | 区間結果のデスクトップ配置   | 問題なし                     | 変更なし                              | 管理外  |
| target-reverse-mobile.png         | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/target-reverse-mobile.png`         | 366px  | 正負を区別した目標逆算表示   | 問題なし                     | 変更なし                              | 管理外  |
| investment-progressive-mobile.png | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/investment-progressive-mobile.png` | 366px  | 投資入力の段階表示           | 基本入力が4項目で重かった    | 基本3項目へ削減                       | 管理外  |
| full-page-mobile.png              | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/full-page-mobile.png`              | 390px  | 全体順序・モバイルoverflow   | skip-linkが撮影時に重なった  | 撮影時だけblurし通常のfocus表示は維持 | 管理外  |
| full-page-desktop.png             | `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-design/full-page-desktop.png`             | 1440px | 全体順序・デスクトップ最大幅 | sticky要素が全景構成を歪めた | stickyを解除                          | 管理外  |

## H. Verification results

| Command/check           | Result                                          |
| ----------------------- | ----------------------------------------------- |
| `npm install`           | up to date; 142 packages; 0 vulnerabilities     |
| `npm run format:check`  | pass                                            |
| `npm run lint`          | pass                                            |
| `npm run typecheck`     | pass                                            |
| `npm run test`          | 9 files / 83 tests pass                         |
| `npm run build:preview` | pass                                            |
| `npm run check:dist`    | 23 curated files pass                           |
| `npm run test:e2e`      | 22 pass                                         |
| `npm run test:e2e:dist` | 14 pass                                         |
| `npm run check`         | pass                                            |
| `npm run check:all`     | pass                                            |
| Prototype Playwright    | 14 pass                                         |
| axe                     | critical/serious 0                              |
| Responsive              | 320/390/430/768/1440 no overflow                |
| Zoom                    | 200% pass                                       |
| Privacy                 | request/storage/Cookie/query/hash 0             |
| Runtime                 | console/pageerror 0                             |
| Keyboard                | skip link, form submit, result focus, tabs pass |

The prototype was also operated through the app browser: quick calculation and target reverse values matched the automated checks.

## I. Tooling notes

- The host had Node but no global npm. `npm@10.9.2` was executed temporarily through the bundled pnpm runtime; repository package files were not changed by install.
- The GitHub connector returned 403 for PR creation. The authenticated GitHub CLI fallback created Draft PR #3 as prescribed by the publishing workflow.

## J. Current stop condition

- Design work complete.
- Branch pushed and Draft PR created.
- No main merge, production deploy, Cloudflare/DNS/GitHub Pages change, ad, Analytics, CMP, or production code change.
- Follow-up work begins only after design review and the gates in `14_IMPLEMENTATION_ROADMAP.md` / `16_OPEN_QUESTIONS.md`.

## K. Design review revision

- Final product/H1, nav label, SEO title, description, and `/tools/slot-analysis/` slug are locked.
- The former MVP/Next/Future split is replaced by Release Core/Later/Do not build.
- Release Core contains RC-01〜RC-16 and is an all-or-nothing production gate; implementation PRs may remain stacked and split.
- Initial results are ordered as actual payout rate, input summary, and per-1,000G. Assumed IN/OUT moved to calculation conditions.
- Benchmark and segment defaults are neutral, exact-zero/sub-medal wording is locked, and target reverse copy is sign-aware.
- Segment limits are UI 10, cumulative initial candidate 11 points including the start, and domain 100.
- This revision remains docs/prototype-only. Production UI, URL, build, deployment, Cloudflare, advertising, and Analytics are unchanged.

## L. Public-contract hardening revision

- Investment/recovery now uses `1,000円分への交換に必要な枚数` as its primary exchange input; `円/枚` is an internal rational conversion only.
- The basic investment prototype is reduced from four fields to cash invested, current medals, and medals per 1,000 yen.
- Every successful v2 result is specified to expose immutable metadata with calculation version, formula, assumption, rounding, and warning codes.
- UI calculation-condition copy must be derived from domain metadata through an adapter; the renderer must not infer formulas or exact relations from rounded display values.
- Prototype Playwright remains 14 tests and now checks the corrected exchange input and representative result.
