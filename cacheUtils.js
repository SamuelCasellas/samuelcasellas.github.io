class CacheUtil {
  constructor() {
    this.staticCacheName = 'pwa';
    this.precachedResources = [
      'images/icon-192x192.png',
      'images/icon-512x512.png',
      'cacheUtils.js',
      'externalThreatProtection.js',
      'index.html',
      'script.js',
      'styles.css',
      'uniquePasswordManager.js'
    ];
  }

  async precache() {
    const cache = await caches.open(this.staticCacheName);
    return cache.addAll(this.precachedResources);
  }

  async getFromCache(request) {
    return await caches.match(request);
  }

  async checkCacheFirst(request) {
    const cachedResponse = await this.getFromCache(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(this.staticCacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return Response.error();
    }
  }
}
