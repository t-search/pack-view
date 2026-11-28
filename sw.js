const CACHE = 'packview-v238';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: 'reload'})))).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// 紹介ページ（画像 intro-*.webp も）・特定商取引法・利用規約は保存せず、毎回 GitHub から読む
const NO_CACHE = ['intro.html', 'tokushoho.html', 'terms.html'];

self.addEventListener('fetch', (e) => {
  const path = new URL(e.request.url).pathname;
  if (NO_CACHE.some(name => path.endsWith('/' + name)) || /\/intro-[^\/]*\.webp$/.test(path)) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if(res.ok){
        const resClone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, resClone));
      }
      return res;
    }).catch(() => cached))
  );
});
