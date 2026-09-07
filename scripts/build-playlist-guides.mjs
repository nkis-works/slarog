import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ORIGIN = 'https://nkisworks.com';
const BASE = '/products/playlist-toolkit/';
const GUIDES = `${BASE}guides/`;
const UPDATED = '2026-09-08';
const AMAZON_ORDER_HELP = 'https://digprjsurvey.amazon.co.uk/csad/help/node/GZX7QVLGPB4MKRDV';

const scopes = {
  en: 'Display sorting changes the view, not the saved track order. Range moves that you save and songs you confirm adding remain in Amazon Music after Playlist Toolkit is closed.',
  ja: '表示ソートは、保存された曲順を変えずに表示だけを切り替えます。一方、保存した範囲移動や追加を確定した曲は、Playlist Toolkitを閉じてもAmazon Musicに残ります。',
  de: 'Die Anzeigesortierung ändert nur die Ansicht, nicht die gespeicherte Titelreihenfolge. Gespeicherte Bereichsverschiebungen und bestätigte Ergänzungen bleiben nach dem Schließen von Playlist Toolkit in Amazon Music erhalten.',
  es: 'La clasificación cambia la vista, no el orden guardado. Los movimientos que guardes y las canciones que confirmes añadir permanecen en Amazon Music al cerrar Playlist Toolkit.',
  fr: 'Le tri modifie uniquement l’affichage, pas l’ordre enregistré. Les déplacements enregistrés et les ajouts confirmés restent dans Amazon Music après la fermeture de Playlist Toolkit.',
  it: 'L’ordinamento modifica solo la visualizzazione, non la sequenza salvata. Gli spostamenti salvati e le aggiunte confermate rimangono in Amazon Music dopo la chiusura di Playlist Toolkit.',
  'pt-BR': 'A classificação altera a exibição, não a ordem salva. Os movimentos salvos e as músicas cuja adição você confirmou permanecem no Amazon Music após fechar o Playlist Toolkit.',
};
const guideLabels = {
  en: 'Read the playlist guides', ja: 'プレイリスト整理のガイドを読む（英語）',
  de: 'Playlist-Anleitungen lesen (Englisch)', es: 'Leer las guías de playlists (en inglés)',
  fr: 'Lire les guides des playlists (en anglais)', it: 'Leggi le guide alle playlist (in inglese)',
  'pt-BR': 'Leia os guias de playlists (em inglês)',
};

export function sortingScope(locale) { return scopes[locale] || scopes.en; }
export function guideLink(locale) {
  return `<a class="pt-button pt-button-secondary" href="${GUIDES}" hreflang="en">${escapeHtml(guideLabels[locale] || guideLabels.en)}</a>`;
}

const articles = [
  {
    slug: 'sort-amazon-music-playlist',
    title: 'Sort an Amazon Music playlist by title or artist',
    description: 'Choose between sorting the displayed list and changing the saved track order. A practical Android guide with Playlist Toolkit steps and limitations.',
    summary: 'Start with the order you want to change: the list you browse, or the sequence saved in the playlist.',
    sections: [
      ['First, decide what “sort” means', [
        'Sorting the displayed list helps you find a song by its title or artist. It is different from editing the saved sequence of tracks. Playlist Toolkit supports display sorting by Artist, Title, Recently added and Duration on compatible Amazon Music screens. Those choices do not rewrite the saved sequence.',
        'If you are putting together a deliberate opening, middle and ending for a playlist, use the playlist editor instead. A title-sorted view is not a promise that the saved sequence or playback behaviour has changed. Shuffle and other playback settings are separate.',
      ]],
      ['Try the controls already in Amazon Music', [
        'Open your playlist in the Android app and look for its sorting control. Use the available title or artist option if it meets your needs. You do not need a separate subscription to Playlist Toolkit simply to use a control that Amazon Music already provides.',
        'Available controls depend on the screen, account and Amazon Music version. Do not use instructions for the desktop or web player as proof that the same control exists on your Android screen.',
      ]],
      ['Use Playlist Toolkit to remember a display choice', [
        'Run the free compatibility check and read the screen-access explanation before enabling Android Accessibility assistance. The check itself does not charge you; the management features require a monthly Google Play subscription.',
        'Open the supported playlist in Amazon Music. Start sorting from the floating assistant and choose the display mode. When prompted, tap Amazon Music’s Sort chip once. The assistant handles the remaining supported steps and remembers the choice for that playlist.',
        'Keep the playlist visible and avoid touching the screen during the assisted steps. If a needed control cannot be confirmed, the operation stops. This is guided assistance, not a guarantee of fully unattended sorting.',
      ]],
      ['What this does not do', [
        'It does not rewrite the playlist into alphabetical order, change shuffle settings, or permanently impose the same view on every device. It also does not unlock Amazon Music features that your account cannot use.',
        'If the remembered view is not applied on a later visit, check that screen assistance is enabled and follow the Sort prompt again. A changed Amazon Music interface may require a Playlist Toolkit update.',
      ]],
    ],
    related: ['amazon-music-sort-order-resets', 'move-multiple-amazon-music-songs'],
  },
  {
    slug: 'amazon-music-sort-order-resets',
    title: 'Amazon Music playlist sort order keeps resetting?',
    description: 'Understand display order versus saved song order, restore a remembered sorting choice, and troubleshoot screen assistance without changing playlist contents.',
    summary: 'A different view does not necessarily mean your saved playlist has been changed.',
    sections: [
      ['Check what actually changed', [
        'Was the playlist previously displayed by artist or title, or did you move tracks and save a custom sequence in the editor? Those are different operations. A return to another display sort is not, by itself, evidence that songs were deleted or a saved edit was undone.',
        'Check the sorting choice in Amazon Music first. For a saved edit, inspect the playlist in its normal order rather than judging it from an alphabetical view. Playback settings such as shuffle are a separate check.',
      ]],
      ['Restore a choice with guided assistance', [
        'Playlist Toolkit remembers a display choice for each playlist. Open the playlist, start the sort action from the assistant and tap Amazon Music’s Sort chip once when asked. It can then perform the remaining supported steps.',
        'You do not have to keep the Playlist Toolkit activity in front of Amazon Music, but screen assistance must remain enabled. Closing an app screen is not the same as disabling its Accessibility service. Force-stopping or disabling the tool can prevent its assistance from running.',
        'This is not permanent control over Amazon Music’s settings. The saved preference belongs to Playlist Toolkit; applying it still requires a compatible screen and the guided interaction.',
      ]],
      ['If restoration does not happen', [
        'Check Android’s Accessibility settings to confirm that Playlist Toolkit’s screen assistance is enabled. Then reopen the intended playlist in Amazon Music, return to the top of the list and start the action again.',
        'Keep the screen visible and do not navigate, scroll or tap while an assisted step is running. If the app reports that a control cannot be recognized, stop rather than repeatedly trying different screen locations.',
        'After an Amazon Music update, run the free compatibility check again. An unfamiliar screen may need a future Playlist Toolkit update. No claim of compatibility with every future Amazon Music update is made.',
      ]],
      ['Do saved edits disappear when the tool closes?', [
        'No: range moves that you saved in Amazon Music and songs whose addition you confirmed remain there after Playlist Toolkit closes. Display sorting is different: it changes the view without rewriting the saved song sequence.',
        'An audit also does not change the playlist. It reads the list to build a report and local index. Reopening the tool does not roll back previously saved edits.',
      ]],
    ],
    related: ['sort-amazon-music-playlist', 'move-multiple-amazon-music-songs'],
  },
  {
    slug: 'find-amazon-music-playlist-duplicates',
    title: 'Find possible duplicate songs in an Amazon Music playlist',
    description: 'Review duplicate candidates, distinguish versions and protect a playlist from accidental deletion. Includes the audit-first Smart Add workflow on Android.',
    summary: 'Treat matching entries as something to review, not an instruction to delete.',
    sections: [
      ['The same title is not always the same recording', [
        'A playlist may contain a studio recording, a live version, an edit and a remaster with similar titles. Some are intentional. Before removing anything, compare the artist, version label, album and duration where available, and listen if the distinction matters.',
        'A screen-based review is not an audio-fingerprint comparison. Matching visible labels cannot prove that two audio files are identical. Playlist Toolkit presents findings for review rather than automatically deleting every match.',
      ]],
      ['Run a non-destructive playlist audit', [
        'Complete the compatibility check and enable screen assistance after reading its purpose. Open the playlist you want to review and start the full audit from Playlist Toolkit.',
        'Keep Amazon Music on screen while the assistant scrolls through the playlist. Do not scroll manually or switch apps. Use the stop or cancel control if you need to interrupt the operation.',
        'Wait for a completed report before treating the index as a full-playlist check. A paused or stopped scan is not proof that the remainder contains no duplicates. The audit itself does not add, remove, like, download or reorder tracks.',
      ]],
      ['Review the report before editing', [
        'Inspect duplicate groups and possible alternate-version groups separately. Keep versions you want, and confirm any actual playlist edits in Amazon Music. Do not treat the report as permission to remove everything in a group.',
        'Reports and the visible playlist index are processed on your device. Song labels are not sent to an NKIS Works server. If you choose to copy or share a report, review it first: it can contain your playlist name and track information.',
      ]],
      ['Check new additions against the completed audit', [
        'Smart Add uses a completed audit of the destination playlist before enabling verified additions. Without that full scan, it stays in review-only mode. Start with the playlist you actually intend to add to, not another playlist with a similar name.',
        'Browse Add Songs in Amazon Music and review the captured candidates. Select and confirm the songs you want. Confirmed additions happen one at a time and remain in Amazon Music afterwards; an unverified result pauses the process.',
        'If the candidate list expires or the selection no longer matches the current checks, refresh it rather than trying to force the old selection through. These checks reduce avoidable additions, but they are not an absolute guarantee that every duplicate or version will be identified.',
      ]],
    ],
    related: ['sort-amazon-music-playlist', 'move-multiple-amazon-music-songs'],
  },
  {
    slug: 'move-multiple-amazon-music-songs',
    title: 'Move multiple songs in an Amazon Music playlist on Android',
    description: 'Learn how guided range moves work: visible start and end tracks, destinations, small off-screen moves and the final Save confirmation in Amazon Music.',
    summary: 'Move a continuous group with guided gestures, then review and save the result in Amazon Music.',
    sections: [
      ['Use the editor for a saved sequence', [
        'For a custom track sequence, use Amazon Music’s playlist editor rather than an artist- or title-sorted view. Amazon’s official help describes holding a track’s reorder handle, dragging it to a new position and finishing the edit. It also notes that playlist editing depends on the Amazon Music subscription and that online versus offline changes affect syncing.',
        'Playlist Toolkit does not grant editing rights or replace Amazon Music’s own save operation. It assists repeated gestures in a compatible editor. If you only need to move one song, doing it directly may be simpler.',
      ]],
      ['Select a continuous, visible group', [
        'In the editor, make sure the tracks you want to select are visible. Choose a start track above the end track. The selected group includes the tracks between them, and the destination must be outside that group.',
        'This is not an unrestricted spreadsheet-style selection across an entire playlist. It cannot promise to select an arbitrary group of non-adjacent songs or instantly jump hundreds of rows.',
      ]],
      ['Choose a supported destination', [
        'Move the group before a visible destination track, or choose a supported move of 1, 5 or 10 tracks beyond the screen in either direction. The relative order inside the selected group is preserved.',
        'Start with a small group and a short move so you can easily inspect the outcome. Keep the screen untouched while the assistant performs the repeated gestures. Use the stop control if you need to interrupt.',
        'The operation stops if identical entries cannot be distinguished reliably, the screen changes, or the relevant edge is reached. A stop is not evidence that a partly completed operation was rolled back. Inspect the current editor state before deciding what to do next.',
      ]],
      ['Review, then confirm Save in Amazon Music', [
        'Check the group’s position and the surrounding tracks before confirming Save in Amazon Music. A completed movement and a saved playlist are not the same thing.',
        'Once you save the edit in Amazon Music, it remains after Playlist Toolkit closes. Closing the support tool does not restore the old saved order. To undo a saved edit, you need to edit the playlist again; do not rely on reopening the tool.',
        'If cross-device syncing matters, follow Amazon’s current guidance on online playlist editing. A successful movement on one screen is not proof that another device has already synced.',
      ]],
    ],
    source: true,
    related: ['sort-amazon-music-playlist', 'amazon-music-sort-order-resets'],
  },
];

export function playlistGuideRoutes() {
  return [GUIDES, ...articles.map(article => `${GUIDES}${article.slug}/`)];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function card(article) {
  return `<a class="ng-card" href="${GUIDES}${article.slug}/"><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.summary)}</p><span>Read guide <span aria-hidden="true">&rarr;</span></span></a>`;
}

function render(article) {
  const title = article?.title || 'Amazon Music playlist guides for Android';
  const description = article?.description || 'Practical guides to playlist sorting, saved order, possible duplicate songs and guided range moves. Learn what changes and what stays on your device.';
  const route = article ? `${GUIDES}${article.slug}/` : GUIDES;
  const breadcrumbs = [
    { '@type':'ListItem', position:1, name:'NKIS Works', item:`${ORIGIN}/en/` },
    { '@type':'ListItem', position:2, name:'Playlist Toolkit', item:`${ORIGIN}${BASE}` },
    { '@type':'ListItem', position:3, name:'Playlist guides', item:`${ORIGIN}${GUIDES}` },
  ];
  if (article) breadcrumbs.push({ '@type':'ListItem', position:4, name:title, item:`${ORIGIN}${route}` });
  const structured = {
    '@context':'https://schema.org', '@graph': [
      { '@type':article ? 'Article' : 'CollectionPage', '@id':`${ORIGIN}${route}#page`, url:`${ORIGIN}${route}`, headline:title, name:title, description, inLanguage:'en', datePublished:UPDATED, dateModified:UPDATED,
        author:{ '@type':'Organization', name:'NKIS Works', url:`${ORIGIN}/en/` },
        publisher:{ '@type':'Organization', '@id':`${ORIGIN}/#organization`, name:'NKIS Works', url:`${ORIGIN}/` },
        mainEntityOfPage:`${ORIGIN}${route}` },
      { '@type':'BreadcrumbList', itemListElement:breadcrumbs },
    ],
  };
  const body = article
    ? `<div class="ng-layout"><nav class="ng-toc" aria-label="In this guide"><strong>In this guide</strong>${article.sections.map(([heading], index) => `<a href="#section-${index + 1}">${escapeHtml(heading)}</a>`).join('')}</nav><article class="ng-prose">${article.sections.map(([heading, paragraphs], index) => `<section id="section-${index + 1}"><h2>${escapeHtml(heading)}</h2>${paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}</section>`).join('')}${article.source ? `<p class="ng-source">Reference: <a href="${AMAZON_ORDER_HELP}" rel="external">Amazon’s official playlist-reordering help</a>.</p>` : ''}<aside class="ng-note"><h2>Before using Playlist Toolkit</h2><p>The compatibility check is free and does not start a subscription. Management features require a monthly, auto-renewing Google Play subscription. Check the local price before purchasing; renewal can be cancelled in Google Play.</p><p>Screen assistance uses Android Accessibility. It works only with supported Amazon Music screens and stops if required controls cannot be confirmed. It cannot guarantee compatibility with future Amazon Music updates. Playlist Toolkit is an independent third-party product, not affiliated with or endorsed by Amazon.</p><a href="${BASE}privacy/">How screen data is handled</a></aside></article></div><section class="ng-related"><p class="ng-kicker">CONTINUE READING</p><div class="ng-grid">${article.related.map(slug => card(articles.find(item => item.slug === slug))).join('')}</div></section>`
    : `<div class="ng-grid">${articles.map(card).join('')}</div><section class="ng-note"><h2>A view is not a saved edit.</h2><p>${escapeHtml(scopes.en)}</p><p>These guides explain both the manual options and where assisted operations can help. Playlist Toolkit does not provide music playback or replace an Amazon Music subscription.</p></section>`;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'self'">
<title>${escapeHtml(title)} | Playlist Toolkit</title><meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${ORIGIN}${route}"><link rel="alternate" hreflang="en" href="${ORIGIN}${route}"><link rel="alternate" hreflang="x-default" href="${ORIGIN}${route}">
<meta name="theme-color" content="#174e40"><meta property="og:type" content="${article ? 'article' : 'website'}"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="NKIS Works"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${ORIGIN}${route}"><meta property="og:image" content="${ORIGIN}/assets/playlist-toolkit-og-v2.png"><meta property="og:image:alt" content="Playlist Toolkit by NKIS Works"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@NKIS_Works"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${ORIGIN}/assets/playlist-toolkit-og-v2.png">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/playlist-toolkit.css"><link rel="stylesheet" href="/assets/playlist-guides.css">
<script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script></head>
<body><a class="ng-skip" href="#main">Skip to content</a><header class="ng-header"><nav class="ng-shell" aria-label="Main navigation"><a class="ng-brand" href="${BASE}">Playlist Toolkit<span>NKIS WORKS</span></a><div><a href="${GUIDES}"${!article ? ' aria-current="page"' : ''}>Guides</a><a href="${BASE}support/">Support</a><a href="/en/">NKIS Works</a></div></nav></header>
<main id="main" class="ng-shell"><nav class="ng-breadcrumbs" aria-label="Breadcrumb"><a href="${BASE}">Playlist Toolkit</a><span aria-hidden="true">/</span>${article ? `<a href="${GUIDES}">Guides</a>` : '<span>Guides</span>'}</nav><header class="ng-hero"><p class="ng-kicker">PRACTICAL PLAYLIST GUIDES</p><h1>${escapeHtml(title)}</h1><p class="ng-lead">${escapeHtml(article?.summary || 'Find the right approach before changing your playlist. Clear steps, honest limits and no guesswork about what gets saved.')}</p><p class="ng-byline">By <a href="/en/">NKIS Works</a>, developer of Playlist Toolkit. Updated <time datetime="${UPDATED}">September 8, 2026</time>.</p></header>${body}<section class="ng-cta"><h2>See whether Playlist Toolkit fits your workflow.</h2><p>Explore the features, requirements and free compatibility check before deciding on a subscription.</p><a class="pt-button pt-button-primary" href="${BASE}">Explore Playlist Toolkit</a><a href="${BASE}support/">Get help</a></section></main>
<footer class="ng-footer"><div class="ng-shell"><p>© 2026 NKIS Works. Independent of Amazon.</p><nav aria-label="Footer"><a href="/en/">NKIS Works</a><a href="${BASE}">Product</a><a href="${GUIDES}">Guides</a><a href="${BASE}privacy/">Privacy</a><a href="${BASE}terms/">Terms</a><a href="${BASE}support/">Support</a><a href="https://x.com/NKIS_Works" rel="external">NKIS Works on X</a></nav></div></footer></body></html>`;
}

export async function buildPlaylistGuides(dist) {
  for (const article of [null, ...articles]) {
    const directory = resolve(dist, `${GUIDES}${article ? `${article.slug}/` : ''}`.slice(1));
    await mkdir(directory, { recursive:true });
    await writeFile(resolve(directory, 'index.html'), render(article));
  }
}
