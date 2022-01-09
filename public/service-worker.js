const CACHE_NAME = 'sw-cache-example';
const toCache = [
  '/javascripts/status.js',
];

self.addEventListener('install', function(event) {
   //'used to register the service worker'
   event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(toCache)
      })
      .then(self.skipWaiting()) //Avoid the need for the user to navigate away from the page
  )
  })
  
  self.addEventListener('fetch', function(event) {
    //'used to intercept requests so we can check for the file or data in the cache'
    event.respondWith(
        fetch(event.request)
          .catch(() => {
            return caches.open(CACHE_NAME)
              .then((cache) => {
                return cache.match(event.request)
              })
          })
      )
  })
  
  self.addEventListener('activate', function(event) {
    //'this event triggers when the service worker activates'
    event.waitUntil(
        caches.keys()
          .then((keyList) => {
            return Promise.all(keyList.map((key) => {
              if (key !== CACHE_NAME) {
                console.log('[ServiceWorker] Removing old cache', key)
                return caches.delete(key)
              }
            }))
          })
          .then(() => self.clients.claim())
      )
  })