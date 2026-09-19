const CACHE_NAME = 'disfrazate-cache-v10';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './catalogo.js?v=5.0',
    './script.js?v=5.0',
    './style.css',
    './logo_disfrazate_tech.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Network-First for JS and catalog data to ensure live updates
    if (requestUrl.pathname.endsWith('catalogo.js') || requestUrl.pathname.endsWith('.json')) {
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            }).catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-First for catalog images
    if (requestUrl.pathname.includes('/catalogo') || event.request.destination === 'image') {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);
                });
            })
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

