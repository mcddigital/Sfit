const CACHE_NAME = 'smartfit-v3';
const SCOPE_URL = self.registration.scope;
const scopedUrl = (path = '') => new URL(path, SCOPE_URL).toString();
const APP_SHELL = [
  scopedUrl(''),
  scopedUrl('index.html'),
  scopedUrl('manifest.json'),
  scopedUrl('icon-192x192.png'),
  scopedUrl('icon-512x512.png'),
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(scopedUrl('index.html'), copy));
          return response;
        })
        .catch(() => caches.match(scopedUrl('index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Hora de manter sua rotina em movimento.',
    icon: scopedUrl('icon-192x192.png'),
    badge: scopedUrl('icon-192x192.png'),
    tag: 'smartfit-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Abrir app' },
      { action: 'close', title: 'Fechar' }
    ]
  };
  event.waitUntil(self.registration.showNotification('SmartFit', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action !== 'close') event.waitUntil(clients.openWindow(SCOPE_URL));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
