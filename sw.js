// Life Tracker Service Worker v3 — force cache refresh
var CACHE_NAME = 'life-tracker-v3';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/highcharts@12.1.2/highcharts.js',
  'https://cdn.jsdelivr.net/npm/highcharts@12.1.2/highcharts-more.js',
  'https://cdn.jsdelivr.net/npm/highcharts@12.1.2/modules/solid-gauge.js',
  'https://cdn.jsdelivr.net/npm/highcharts@12.1.2/modules/accessibility.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network-first strategy for HTML files (always get latest)
  if (e.request.mode === 'navigate' || e.request.url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(function(resp) {
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        return resp;
      }).catch(function() {
        return caches.match(e.request).then(function(r) { return r || caches.match('./index.html'); });
      })
    );
    return;
  }
  // Cache-first for other assets
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(resp) {
        if (resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        }
        return resp;
      }).catch(function() {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.includes('Life-Success-Tracker') && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Focus existing window if open
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.includes('Life-Success-Tracker') && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

