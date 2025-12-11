const VERSION = 'v1';
const CORE = [
  '/',
  '/beep.mp3',
  '/favicon.ico',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('core-' + VERSION).then((cache) => cache.addAll(CORE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => !k.endsWith(VERSION)).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  // Network-first for app routes, cache fallback
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open('core-' + VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((c) => c || caches.match('/')))
    );
  }
});

