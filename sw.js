const CACHE = 'coran-revision-v1.7.0';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'data/quran.json', 'data/hadiths.json', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/logo-mark.svg', 'icons/favicon-32.png', 'icons/apple-touch-icon.png', 'icons/icon-maskable-512.png', 'fonts/amiri-quran-arabic-400-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname === 'everyayah.com') return; // audio : réseau direct
  if (u.origin === location.origin && !u.pathname.endsWith('.json')) {
    // app : réseau d'abord (mises à jour), cache en secours
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
  } else {
    // données + polices : cache d'abord
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })));
  }
});
