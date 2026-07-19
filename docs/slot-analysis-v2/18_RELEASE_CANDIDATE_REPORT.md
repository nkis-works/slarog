# Slot Analysis v2 Release Candidate report

## Scope

- Branch: `feature/slot-analysis-v2-release-candidate`
- Base: corrected `feature/slot-analysis-v2-ui` HEAD
- Source path: `tools/slot-analysis/`
- Public path: `/tools/slot-analysis/`
- Production publishing: not performed
- Main merge: not performed

## URL migration

The implementation was moved with `git mv`; the domain and UI were not copied. Cloudflare dist contains only the new tool HTML, CSS, and `slot-analysis-app.js` bundle. Its redirect file contains exactly these permanent redirects:

```text
/tools/slot-balance /tools/slot-analysis/ 301
/tools/slot-balance/ /tools/slot-analysis/ 301
/tools/slot-balance/index.html /tools/slot-analysis/ 301
/tools/slot-analysis /tools/slot-analysis/ 301
/tools/slot-analysis/index.html /tools/slot-analysis/ 301
```

The source-only `tools/slot-balance/index.html` fallback is noindex/nofollow, has no script or input, transfers no values, and provides one explicit link to the new URL. It is excluded from Cloudflare dist.

## Build contracts

Preview:

- `noindex, nofollow` in HTML and `X-Robots-Tag`
- canonical and `og:url` absent
- `robots.txt` disallows all crawling
- sitemap contains no URL

Production:

- requires an HTTPS `SITE_ORIGIN`
- rejects localhost, pages.dev, github.io, paths, query strings, fragments, and credentials
- canonical: `https://nkisworks.com/tools/slot-analysis/`
- sitemap contains the new URL once and the old URL zero times

Deterministic complete-dist digests:

- Preview, two builds: `f533cc765f04fdf6b0dda0703bb1d84425e0b0bd0f6194276a1668547d1bfaa2`
- Production, two builds: `28ccdb5f4624a53bb42c092a3e4ead7e67efb05e84a8ef54b5143da17dd4eed2`

## Automated verification before preview deployment

| Check                   | Result                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| Format, lint, typecheck | pass                                                                                                   |
| Unit                    | 19 files / 136 tests pass                                                                              |
| Source E2E              | 40 pass                                                                                                |
| Dist E2E                | 14 pass                                                                                                |
| Dist allowlist          | 23 files pass                                                                                          |
| axe                     | critical/serious 0                                                                                     |
| Responsive              | 320–1440px without horizontal overflow                                                                 |
| Privacy/runtime         | console, pageerror, external request, dynamic transport, storage, Cookie, IndexedDB, query, hash all 0 |
| Tracked artifacts       | 0                                                                                                      |
| 200% equivalent reflow  | 720 CSS px / DPR 2, no horizontal overflow                                                             |
| Keyboard                | skip link, form focus, and result focus pass on the deployed preview                                   |

The deployed preview HTML, site CSS/JavaScript, and tool CSS/JavaScript were compared byte for byte with the locally validated `dist`. All six files matched, including their SHA-256 digests.

## CI

`.github/workflows/quality.yml` runs on every pull request and pushes to `main`. The quality job uses Node 22, `npm ci`, formatting, lint, typecheck, unit, preview build, and dist validation. A separate Chromium job installs only Chromium and runs source and dist E2E. The workflow contains no secret, Cloudflare token, `SITE_ORIGIN`, or production build.

GitHub Actions run [29687901914](https://github.com/nkis-works/slarog/actions/runs/29687901914) passed both jobs:

- `quality`: pass
- `chromium`: pass

## Pull request and isolated preview

- Draft pull request: [#6 Prepare slot analysis v2 release candidate](https://github.com/nkis-works/slarog/pull/6)
- Base: `feature/slot-analysis-v2-ui`
- Project: `nkisworks-site-rc`
- Validated deployment ID: `e1d0c73b-56c0-4ddb-a776-9b16ee4deb84`
- Validated commit: `e49fbccacc7f84bc01e4e9c0c36cc87eb2277868`
- Stable preview: `https://nkisworks-site-rc.pages.dev`
- Deployment preview: `https://e1d0c73b.nkisworks-site-rc.pages.dev`
- Production branch for the isolated project: `feature/slot-analysis-v2-release-candidate`
- Build command/output: `npm run build:preview` / `dist`
- Environment: `NODE_VERSION=22.16.0` only; `SITE_ORIGIN` is absent
- Custom domain, Web Analytics, Functions, Workers, bindings, and paid features: absent

The existing `nkisworks-site` project was not changed.

## Preview QA

The stable preview was checked at `/`, `/support`, `/privacy`, `/terms`, `/tools/slot-analysis/`, `/tools/slot-balance/`, `/robots.txt`, `/sitemap.xml`, and an unknown URL.

- Published pages and assets return the expected `200`; the legacy URL returns `301`; the unknown URL returns `404`.
- Every preview page is `noindex, nofollow` in HTML and through `X-Robots-Tag`; canonical and `og:url` are absent.
- `robots.txt` disallows all crawling and the sitemap is empty.
- CSS and JavaScript load without console output, page errors, or external requests.
- CSP, Permissions Policy, Referrer Policy, `nosniff`, frame denial, and preview robot headers are present.
- No storage, Cookie, IndexedDB, ad DOM, Analytics, external form/script, query, or hash side effect was found.
- The main calculation returned `104.2%`, `+125枚 / 1,000G`, `想定IN 12,000枚`, and `想定OUT 12,500枚` for `4,000G / +500枚`.
- Widths from 320 through 1440 px had no horizontal overflow. A 200%-equivalent check at 720 CSS px with DPR 2 also had no overflow.
- Keyboard QA passed for the skip link, form focus, calculation, and result focus.
- The preview's six primary HTML/CSS/JavaScript files are byte-identical to the locally tested `dist`, tying the local axe and privacy/runtime results to the deployment.

Ignored visual evidence:

- `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-rc-preview/slot-analysis-mobile-390x844.png` — 390×844
- `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-rc-preview/slot-analysis-mobile-result-390x844.png` — 390×844
- `/Users/nkis/Documents/スラログios版/artifacts/slot-analysis-v2-rc-preview/slot-analysis-desktop-1440x900.png` — 1440×900

No clipping, blank ad area, horizontal overflow, or visual regression was found. The files are local-only ignored artifacts and are not tracked by Git.

## Compatibility note

The literal `nkisworks-slot-balance` remains only as the validator identifier for the existing v1 Slarog transfer payload. It is not used by public copy, the new URL, bundle name, build configuration, test paths, or analytics event names.

## Safety checkpoint

PRs #3 through #6 remain Draft and unmerged. `main`, `nkisworks.com`, the production Pages project, custom domains, DNS, GitHub Pages, ads, Analytics, storage, PACHIMITE, the apps, and ICHIGEKI have not been changed. Deployment was limited to the isolated `nkisworks-site-rc` preview project.
