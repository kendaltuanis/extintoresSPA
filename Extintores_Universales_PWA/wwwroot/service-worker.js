

const CACHE_NAME = 'extintores-universales-v2';

const appShellFilesToCache = [
  '/dist/0.js',
  '/dist/0.js.map',
  '/dist/1.js',
  '/dist/1.js.map',
  '/dist/2.js',
  '/dist/2.js.map',
  '/dist/vendor.css',
  '/dist/vendor.js',
  '/dist/vendor-manifest.json',
  '/dist/main-client.js',
  '/dist/main-client.js.map',
  '/dist/89889688147bd7575d6327160d64e760.svg'
];

//self.skipWaiting();

//prueba
self.addEventListener('install', (e) => {
  caches.open(CACHE_NAME).then((cache) => {
    console.log('Archivos Cacheados');
    return cache.addAll(appShellFilesToCache);
  });
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    //Obtiene los nombres de todos los caches disponibles
    caches.keys().then((caches_names) => {
      // Retorna un arreglo de promesas
      return Promise.all(
        //Por cada cache disponible ejecuta una función
        caches_names.map((cache_name) => {
          // Si el cache no es igual a CACHE_NAME (cache actual), lo elimina
          if (CACHE_NAME !== cache_name) {
            return caches.delete(cache_name); // elimina el caché viejo
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  console.log('Service Worker: Fetch URL ', e.request.url);

  // Match requests for data and handle them separately
  e.respondWith(
    caches.match(e.request.clone()).then((response) => {
      console.log(e.request.url);
      if (response) {
        console.log("Estoy respondiendo desde el caché");

        return returnFormCacheThenFetch(e.request);
      } else {
        console.log("No estoy en caché");
      }
      return fetch(e.request);
    }).catch((err) => {

      // sin hacer
      if (e.request.mode == "navigate") {

      }
    })
  );
});

function returnFormCacheThenFetch(request) {
  // Abre el cache
  let cachePromise = caches.open(CACHE_NAME);

  // Retorna nueva promesa si encuentra la request dentro del cache y responde del cache
  let matchPromise = cachePromise.then((cache) => {
    return cache.match(request);
  });

  return Promise.all([cachePromise, matchPromise])
    .then(([cache, cacheResponse]) => {
      // Aunque se buscó en el cache igual se va al servidor
      let fetchPromise = fetch(request).then((fetchResponse) => {
        // Actualizamos el cache con la nueva version del servidor
        cache.put(request, fetchResponse.clone());

        return fetchResponse;
      });
      // respondemos con el cache o la respuesta del servidor
      return cacheResponse || fetchResponse;

    })
}