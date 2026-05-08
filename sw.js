const CACHE = 'shoseki-v7';
const ASSETS = [
  '/02_BookSummary/',
  '/02_BookSummary/index.html',
  '/02_BookSummary/styles.css',
  '/02_BookSummary/app.js',
  '/02_BookSummary/books.js',
  '/02_BookSummary/manifest.json',
  '/02_BookSummary/icons/icon-192.png',
  '/02_BookSummary/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// stale-while-revalidate: キャッシュを即返しつつ裏でネットワーク取得してキャッシュ更新
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isAppAsset = ASSETS.some(a => url.pathname === a || url.pathname.startsWith(a));
  if (!isAppAsset) return;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => null);
        return cached || fresh;
      })
    )
  );
});
