/* Explika · service worker: deja la app disponible sin conexión.
   Sube el número de VERSION cada vez que publiques cambios para que los usuarios reciban la versión nueva. */
const VERSION = 'explika-v6';
const ARCHIVOS = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/util.js', 'js/props.js', 'js/entornos.js', 'js/iconos.js', 'js/motor.js', 'js/ejemplos.js', 'js/guion.js', 'js/ideas.js', 'js/exportar.js', 'js/app.js',
  'vendor/three.min.js', 'vendor/mp4-muxer.js',
  'fonts/inter-latin-500-normal.woff2', 'fonts/inter-latin-600-normal.woff2', 'fonts/inter-latin-700-normal.woff2',
  'fonts/jetbrains-mono-latin-500-normal.woff2', 'fonts/jetbrains-mono-latin-700-normal.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
/* al activarse borra solo las cachés viejas de esta app (también las del nombre anterior), no las de otras apps del mismo dominio */
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && /^(explika|explica3d)-/.test(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/* responde desde la copia guardada y, si hay red, la actualiza por detrás */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(cache => cache.match(req, { ignoreSearch: true }).then(hit => {
    const red = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || red;
  })));
});
