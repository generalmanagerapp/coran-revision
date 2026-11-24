const AUDIO = 'murajaa-audio';
const CACHE = 'coran-revision-v2.5.1';
const SHELL = ['./', 'index.html', 'ads-config.js?v=2.5.1', 'privacy.html', 'style.css?v=2.5.1', 'app.js?v=2.5.1', 'manifest.webmanifest', 'data/quran.json', 'data/hadiths.json', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/og-image.png', 'icons/logo-mark.svg', 'icons/favicon-32.png', 'icons/apple-touch-icon.png', 'icons/icon-maskable-512.png', 'fonts/amiri-quran-arabic-400-normal.woff2', 'fonts/uthmanic-hafs.woff2?v=2.5.1'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('coran-revision-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.pathname.endsWith('version.json')) return; // toujours le réseau
  if (/googlesyndication|doubleclick|googleadservices|adtrafficquality|pagead|fundingchoices/.test(u.href)) return; // pubs : jamais en cache
  if (u.hostname === 'everyayah.com') { e.respondWith(audioResp(e.request)); return; } // audio : cache si téléchargé, sinon réseau
  if (u.origin === location.origin && !u.pathname.endsWith('.json')) {
    // app : réseau d'abord (mises à jour), cache en secours
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
  } else {
    // données + polices : cache d'abord
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })));
  }
});

async function audioResp(req) {
  try {
    const m = await (await caches.open(AUDIO)).match(req.url);
    if (!m) return fetch(req);
    const buf = await m.arrayBuffer(), len = buf.byteLength, H = { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes' };
    const rg = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range') || '');
    if (!rg) return new Response(buf, { status: 200, headers: { ...H, 'Content-Length': len } });
    const a = +rg[1], b = rg[2] ? Math.min(+rg[2], len - 1) : len - 1;
    return new Response(buf.slice(a, b + 1), { status: 206, headers: { ...H, 'Content-Length': b - a + 1, 'Content-Range': `bytes ${a}-${b}/${len}` } });
  } catch (e) { return fetch(req); }
}
