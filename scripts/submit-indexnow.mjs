import { playlistGuideRoutes } from './build-playlist-guides.mjs';

const ORIGIN = 'https://nkisworks.com';
const KEY = '91cf5ab81b6506ff4c8c279ce4405142';
const KEY_LOCATION = `${ORIGIN}/indexnow-${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const urlList = playlistGuideRoutes().map((route) => `${ORIGIN}${route}`);

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: 'nkisworks.com',
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  }),
});

if (![200, 202].includes(response.status)) {
  const body = await response.text();
  throw new Error(`IndexNow submission failed: HTTP ${response.status} ${body}`.trim());
}

console.log(`IndexNow accepted ${urlList.length} guide URLs with HTTP ${response.status}.`);
