const CACHE_NAME = 'life-tracker-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/highcharts@12.1.2/highcharts.js',
  'https://cdn.jsdelivr.net/npm/highcharts@12.1.2/highcharts-more.js',
  'https://cdn.jsdelivr.net/npm/highcharts@12.1.2/modules/solid-gauge.js',
  'https://cdn.jsdelivr.net/npm/highcharts@12.1.2/modules/accessibility.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
