// Service Worker for GothAlienBoy 3D
const CACHE_NAME = 'gothalienboy-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/game-mobile.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/GLTFLoader.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch new
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});
