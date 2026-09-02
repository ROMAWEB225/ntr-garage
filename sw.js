// sw.js - Service Worker pour Assist-Garage
const CACHE_NAME = 'assist-garage-v1';
const urlsToCache = [
    '/ntr-garage/',
    '/ntr-garage/index.html',
    '/ntr-garage/sw.js',
    // Ajoute ici les autres fichiers si tu en as (CSS, images...)
];

// Installation : mise en cache des fichiers
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache ouvert');
                return cache.addAll(urlsToCache);
            })
    );
});

// Récupération : sert les fichiers du cache ou du réseau
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Mise à jour du cache
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
