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

| Check | Result |
| --- | --- |
| Format, lint, typecheck | pass |
| Unit | 19 files / 136 tests pass |
| Source E2E | 40 pass |
| Dist E2E | 14 pass |
| Dist allowlist | 23 files pass |
| axe | critical/serious 0 |
| Responsive | 320–1440px without horizontal overflow |
| Privacy/runtime | console, pageerror, external request, dynamic transport, storage, Cookie, IndexedDB, query, hash all 0 |
| Tracked artifacts | 0 |

## CI

`.github/workflows/quality.yml` runs on every pull request and pushes to `main`. The quality job uses Node 22, `npm ci`, formatting, lint, typecheck, unit, preview build, and dist validation. A separate Chromium job installs only Chromium and runs source and dist E2E. The workflow contains no secret, Cloudflare token, `SITE_ORIGIN`, or production build.

## Compatibility note

The literal `nkisworks-slot-balance` remains only as the validator identifier for the existing v1 Slarog transfer payload. It is not used by public copy, the new URL, bundle name, build configuration, test paths, or analytics event names.

## Pending at this checkpoint

- Draft Release Candidate pull request creation
- GitHub Actions result
- Isolated `nkisworks-site-rc` Cloudflare Pages deployment and preview QA

No production project, custom domain, DNS, GitHub Pages, ad, Analytics, storage, PACHIMITE, app, or ICHIGEKI setting has been changed.
