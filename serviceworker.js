importScripts('cacheUtils.js');
const cacheUtil = new CacheUtil();

self.addEventListener('install', (event) => {
  // precache calls fetch internally with addAll
  event.waitUntil(cacheUtil.precache());
});

self.addEventListener('fetch', (event) => {
  if (!location.origin === event.request.url
    || !cacheUtil.precachedResources.find(r => location.origin + r === event.request.url)) {
    event.respondWith(
      new Response('Network access disabled', {
        status: 403,
        statusText: 'Offline Mode - No External Access'
      })
    );
    return;
  }

  const url = new URL(event.request.url);
  if (cacheUtil.precachedResources.includes(url.pathname)) {
    event.respondWith(cacheUtil.checkCacheFirst(event.request));
  }
});
