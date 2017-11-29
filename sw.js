const PRECACHE = 'precache-v2';

const PRECACHE_URLS = [
	'./', 				// Alias for index.html
	'index.html',
	'index.js',
	'index.css',
	'lib/beep.js',
	'lib/bluetooth-pulsemonitor.js'
];


self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(PRECACHE)
			.then(cache => cache.addAll(PRECACHE_URLS))
			.then(self.skipWaiting())
	);
});

self.addEventListener('activate', event => {
	const currentCaches = [ PRECACHE ];

	event.waitUntil(
		caches.keys()
			.then(cacheNames => {
				return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
			})
			.then(cachesToDelete => {
				return Promise.all(cachesToDelete.map(cacheToDelete => {
					return caches.delete(cacheToDelete);
				}));
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request)
			.then(response => {
				if (response) {
					return response;
				}
			
				return fetch(event.request)
					.then(response => {
						return response;
					})
					.catch(error => {
						throw error;
					});
			})
	);
});