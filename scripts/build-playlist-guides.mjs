import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ORIGIN = 'https://nkisworks.com';
const BASE = '/products/playlist-toolkit/';
const UPDATED = '2026-09-09';
const AMAZON_ORDER_HELP = 'https://digprjsurvey.amazon.co.uk/csad/help/node/GZX7QVLGPB4MKRDV';
const locales = [
  {
    "code": "en",
    "segment": "",
    "label": "English",
    "og": "en_US"
  },
  {
    "code": "ja",
    "segment": "ja",
    "label": "日本語",
    "og": "ja_JP"
  },
  {
    "code": "de",
    "segment": "de",
    "label": "Deutsch",
    "og": "de_DE"
  },
  {
    "code": "es",
    "segment": "es",
    "label": "Español",
    "og": "es_ES"
  },
  {
    "code": "fr",
    "segment": "fr",
    "label": "Français",
    "og": "fr_FR"
  },
  {
    "code": "it",
    "segment": "it",
    "label": "Italiano",
    "og": "it_IT"
  },
  {
    "code": "pt-BR",
    "segment": "pt-br",
    "label": "Português (Brasil)",
    "og": "pt_BR"
  }
];
const dictionaries = Object.fromEntries(locales.map(locale => [
  locale.code,
  JSON.parse(readFileSync(new URL(`./playlist-guide-locales/${locale.segment || 'en'}.json`, import.meta.url), 'utf8')),
]));
const articleSlugs = ["sort-amazon-music-playlist","amazon-music-sort-order-resets","find-amazon-music-playlist-duplicates","move-multiple-amazon-music-songs"];

// Fail the build instead of silently publishing an English fallback in another language.
for (const locale of locales) {
  const data = dictionaries[locale.code];
  for (const key of Object.keys(dictionaries.en.ui)) {
    if (typeof data.ui?.[key] !== 'string' || !data.ui[key].trim()) {
      throw new Error(`Missing guide UI translation: ${locale.code}.${key}`);
    }
  }
  if (!data.scope || data.articles.length !== articleSlugs.length || data.faqs.length !== 4) {
    throw new Error(`Incomplete guide translation: ${locale.code}`);
  }
  for (const [index, article] of data.articles.entries()) {
    if (article.slug !== articleSlugs[index] || !article.title || !article.description || !article.summary ||
        !article.answer?.title || !article.answer.text || article.answer.steps.length !== 3 ||
        article.sections.length !== dictionaries.en.articles[index].sections.length ||
        article.sections.some(([title, paragraphs]) => !title || !paragraphs.length || paragraphs.some(p => !p.trim())) ||
        article.related.some(slug => !articleSlugs.includes(slug))) {
      throw new Error(`Incomplete guide article: ${locale.code}.${article.slug}`);
    }
  }
  if (data.faqs.some(([question, answer]) => !question?.trim() || !answer?.trim())) {
    throw new Error(`Incomplete guide FAQ: ${locale.code}`);
  }
}

function getLocale(code) {
  return locales.find(locale => locale.code.toLowerCase() === String(code).toLowerCase()) || locales[0];
}
function productBase(locale) { return `${BASE}${locale.segment ? `${locale.segment}/` : ''}`; }
function guideBase(locale) { return `${productBase(locale)}guides/`; }
function guideRoute(locale, article) { return `${guideBase(locale)}${article ? `${article.slug}/` : ''}`; }
function studioHome(locale) { return locale.code === 'ja' ? '/ja/' : '/en/'; }
function studioHomeLang(locale) { return locale.code === 'ja' ? 'ja' : 'en'; }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
export function sortingScope(code) { return dictionaries[getLocale(code).code].scope; }
export function guideLink(code) {
  const locale = getLocale(code);
  return `<a class="pt-button pt-button-secondary" href="${guideBase(locale)}" hreflang="${locale.code}">${escapeHtml(dictionaries[locale.code].ui.guideLink)}</a>`;
}
export function playlistGuideRoutes() {
  return locales.flatMap(locale => [guideBase(locale), ...articleSlugs.map(slug => guideRoute(locale, {slug}))]);
}
function storeLink(locale, article, placement) {
  const url = new URL('https://play.google.com/store/apps/details');
  url.searchParams.set('id', 'app.playlistsort.assistant');
  url.searchParams.set('hl', locale.code);
  url.searchParams.set('utm_source', 'nkisworks_guides');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', article?.slug || 'guide_index');
  url.searchParams.set('utm_content', `${locale.code.toLowerCase()}_${placement}`);
  return escapeHtml(url.href);
}
function languageMenu(locale, article, ui) {
  return `<details class="ng-language"><summary aria-label="${escapeHtml(ui.language)}: ${escapeHtml(locale.label)}">${escapeHtml(locale.label)}</summary><div class="ng-language-list">${locales.map(other => `<a href="${guideRoute(other, article)}" lang="${other.code}" hreflang="${other.code}"${other.code === locale.code ? ' aria-current="page"' : ''}>${escapeHtml(other.label)}</a>`).join('')}</div></details>`;
}
function quickAnswer(locale, article, ui) {
  if (!article) return '';
  const answer = article.answer;
  return `<section class="ng-answer" aria-labelledby="quick-answer-title"><p class="ng-kicker">${escapeHtml(ui.atGlance)}</p><h2 id="quick-answer-title">${escapeHtml(answer.title)}</h2><p>${escapeHtml(answer.text)}</p><ol>${answer.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol><div class="ng-answer-actions"><a class="pt-button pt-button-primary" href="${storeLink(locale, article, 'quick_answer')}">${escapeHtml(ui.play)}</a><a href="${productBase(locale)}">${escapeHtml(ui.features)}</a></div><p class="ng-disclosure">${escapeHtml(ui.disclosure)}</p></section>`;
}
function duplicateQuestions(locale, article, ui) {
  if (article?.slug !== 'find-amazon-music-playlist-duplicates') return '';
  return `<section class="ng-faq" aria-labelledby="duplicate-questions"><h2 id="duplicate-questions">${escapeHtml(ui.faqTitle)}</h2>${dictionaries[locale.code].faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('')}</section>`;
}
function card(locale, article, ui) {
  return `<a class="ng-card" href="${guideRoute(locale, article)}"><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.summary)}</p><span>${escapeHtml(ui.readGuide)} <span aria-hidden="true">&rarr;</span></span></a>`;
}
function render(locale, article) {
  const data = dictionaries[locale.code], ui = data.ui;
  const home = productBase(locale), guides = guideBase(locale), route = guideRoute(locale, article);
  const title = article?.title || ui.indexTitle;
  const description = article?.description || ui.indexDesc;
  const breadcrumbs = [
    {'@type':'ListItem',position:1,name:'NKIS Works',item:`${ORIGIN}${studioHome(locale)}`},
    {'@type':'ListItem',position:2,name:'Playlist Toolkit',item:`${ORIGIN}${home}`},
    {'@type':'ListItem',position:3,name:ui.guides,item:`${ORIGIN}${guides}`},
  ];
  if (article) breadcrumbs.push({'@type':'ListItem',position:4,name:title,item:`${ORIGIN}${route}`});
  const structured = {'@context':'https://schema.org','@graph':[
    {'@type':article?'Article':'CollectionPage','@id':`${ORIGIN}${route}#page`,url:`${ORIGIN}${route}`,headline:title,name:title,description,inLanguage:locale.code,
      datePublished:locale.code==='en'?'2026-09-08':UPDATED,dateModified:UPDATED,
      author:{'@type':'Organization',name:'NKIS Works',url:`${ORIGIN}${studioHome(locale)}`},
      publisher:{'@type':'Organization','@id':`${ORIGIN}/#organization`,name:'NKIS Works',url:`${ORIGIN}/`},
      mainEntityOfPage:`${ORIGIN}${route}`},
    {'@type':'BreadcrumbList',itemListElement:breadcrumbs}
  ]};
  const alternates = locales.map(other => `<link rel="alternate" hreflang="${other.code}" href="${ORIGIN}${guideRoute(other,article)}">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="${ORIGIN}${guideRoute(locales[0],article)}">`;
  const body = article
    ? `<div class="ng-layout"><nav class="ng-toc" aria-label="${escapeHtml(ui.toc)}"><strong>${escapeHtml(ui.toc)}</strong>${article.sections.map(([heading], index) => `<a href="#section-${index+1}">${escapeHtml(heading)}</a>`).join('')}</nav><article class="ng-prose">${article.sections.map(([heading, paragraphs], index) => `<section id="section-${index+1}"><h2>${escapeHtml(heading)}</h2>${paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</section>`).join('')}${article.source ? `<p class="ng-source">${escapeHtml(ui.reference)}: <a href="${AMAZON_ORDER_HELP}" rel="external" hreflang="en">${escapeHtml(ui.sourceLabel)}</a></p>` : ''}${duplicateQuestions(locale,article,ui)}<aside class="ng-note"><h2>${escapeHtml(ui.beforeTitle)}</h2><p>${escapeHtml(ui.billing)}</p><p>${escapeHtml(ui.safety)}</p><a href="${home}privacy/">${escapeHtml(ui.dataLink)}</a></aside></article></div><section class="ng-related"><p class="ng-kicker">${escapeHtml(ui.related)}</p><div class="ng-grid">${article.related.map(slug=>card(locale,data.articles.find(item=>item.slug===slug),ui)).join('')}</div></section>`
    : `<div class="ng-grid">${data.articles.map(item=>card(locale,item,ui)).join('')}</div><section class="ng-note"><h2>${escapeHtml(ui.scopeTitle)}</h2><p>${escapeHtml(data.scope)}</p><p>${escapeHtml(ui.scopeNote)}</p></section>`;
  const dateLabel = new Intl.DateTimeFormat(locale.code,{dateStyle:'long',timeZone:'UTC'}).format(new Date(UPDATED+'T00:00:00Z'));
  return `<!doctype html>
<html lang="${locale.code}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'self'">
<title>${escapeHtml(title)} | Playlist Toolkit</title><meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${ORIGIN}${route}">
${alternates}
<meta name="theme-color" content="#174e40"><meta property="og:type" content="${article?'article':'website'}"><meta property="og:locale" content="${locale.og}"><meta property="og:site_name" content="NKIS Works"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${ORIGIN}${route}"><meta property="og:image" content="${ORIGIN}/assets/playlist-toolkit-og-v2.png"><meta property="og:image:alt" content="Playlist Toolkit / NKIS Works"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@NKIS_Works"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${ORIGIN}/assets/playlist-toolkit-og-v2.png">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/playlist-toolkit.css"><link rel="stylesheet" href="/assets/playlist-guides.css">
<script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script></head>
<body><a class="ng-skip" href="#main">${escapeHtml(ui.skip)}</a><header class="ng-header"><nav class="ng-shell" aria-label="${escapeHtml(ui.mainNav)}"><a class="ng-brand" href="${home}">Playlist Toolkit<span>NKIS WORKS</span></a><div class="ng-header-links"><a href="${guides}"${!article?' aria-current="page"':''}>${escapeHtml(ui.guides)}</a><a href="${home}support/">${escapeHtml(ui.support)}</a><a href="${studioHome(locale)}" hreflang="${studioHomeLang(locale)}">NKIS Works</a>${languageMenu(locale,article,ui)}</div></nav></header>
<main id="main" class="ng-shell"><nav class="ng-breadcrumbs" aria-label="${escapeHtml(ui.breadcrumb)}"><a href="${home}">Playlist Toolkit</a><span aria-hidden="true">/</span>${article?`<a href="${guides}">${escapeHtml(ui.guides)}</a>`:`<span>${escapeHtml(ui.guides)}</span>`}</nav><header class="ng-hero"><p class="ng-kicker">${escapeHtml(ui.kicker)}</p><h1>${escapeHtml(title)}</h1><p class="ng-lead">${escapeHtml(article?.summary||ui.indexLead)}</p><p class="ng-byline">${escapeHtml(ui.author)} <span>${escapeHtml(ui.updated)} <time datetime="${UPDATED}">${escapeHtml(dateLabel)}</time></span></p></header>${quickAnswer(locale,article,ui)}${body}<section class="ng-cta"><h2>${escapeHtml(ui.ctaTitle)}</h2><p>${escapeHtml(ui.ctaText)}</p><a class="pt-button pt-button-primary" href="${storeLink(locale,article,'footer')}">${escapeHtml(ui.play)}</a><a href="${home}">${escapeHtml(ui.features)}</a><a href="${home}support/">${escapeHtml(ui.help)}</a></section></main>
<footer class="ng-footer"><div class="ng-shell"><p>&copy; 2026 NKIS Works. ${escapeHtml(ui.independence)}</p><nav aria-label="${escapeHtml(ui.footerNav)}"><a href="${studioHome(locale)}" hreflang="${studioHomeLang(locale)}">NKIS Works</a><a href="${home}">${escapeHtml(ui.product)}</a><a href="${guides}">${escapeHtml(ui.guides)}</a><a href="${home}privacy/">${escapeHtml(ui.privacy)}</a><a href="${home}terms/">${escapeHtml(ui.terms)}</a><a href="${home}support/">${escapeHtml(ui.support)}</a><a href="https://x.com/NKIS_Works" rel="external">NKIS Works / X</a></nav></div></footer></body></html>`;
}
export async function buildPlaylistGuides(dist) {
  for (const locale of locales) {
    for (const article of [null,...dictionaries[locale.code].articles]) {
      const directory=resolve(dist,guideRoute(locale,article).slice(1));
      await mkdir(directory,{recursive:true});
      await writeFile(resolve(directory,'index.html'),render(locale,article));
    }
  }
}
