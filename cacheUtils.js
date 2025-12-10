class CacheUtil {
  get precachedResources() {
    return [
      '/images/icon-192x192.png',
      '/images/icon-512x512.png',
      '/storageUtils.js',
      '/uniquePasswordManager.js',
      '/cacheUtils.js',
      '/externalThreatProtection.js',
      '/index.html',
      '/manifest.json',
      '/script.js',
      '/styles.css',
    ];
  }

  async openCache() {
    return await caches.open('pwa');
  }

  async precache() {
    const cache = await this.openCache();
    return cache.addAll(this.precachedResources);
  }

  async getFromCache(request) {
    return await caches.match(request);
  }

  async getFromNetwork(request) {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await this.openCache();
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }

  async checkCacheFirst(request) {
    const cachedResponse = await this.getFromCache(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    try {
      return await this.getFromNetwork(request);
    } catch (error) {
      return Response.error();
    }
  }

  async checkNetworkFirst(request) {
    try {
      return await this.getFromNetwork(request);
    } catch (error) {
      const cachedResponse = await this.getFromCache(request)
      return cachedResponse || Response.error();
    }
  }
}
