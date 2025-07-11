const CACHE_NAME = 'habit-app-cache-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/placeholder-logo.png',
  '/placeholder-logo.svg',
  '/placeholder-user.jpg',
  '/placeholder.jpg',
  '/placeholder.svg',
  // Add more static assets as needed
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const isApi = request.url.includes('/api/');

  if (isApi) {
    // Network-first for API
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request).catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        })
      );
    })
  );
});

self.addEventListener('push', function(event) {
  let data = {}
  if (event.data) {
    data = event.data.json()
  }
  const title = data.title || 'Atomic Habit App'
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/placeholder-logo.png',
    badge: '/placeholder-logo.png',
  }
  event.waitUntil(self.registration.showNotification(title, options))
}) 