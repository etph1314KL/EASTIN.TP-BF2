
const CACHE_NAME = 'breakfast-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://www.eastin-taipei.com.tw/images/logo.png',
  'https://www.eastin-taipei.com.tw/upload/fac_b/253a22bcfaad09d46a1a27b26d41f19a.jpg',
  'https://www.eastin-taipei.com.tw/upload/fac_b/3662c2875fb2a3c7e0c56c204b13dd0c.jpg'
];

// 安裝時快取核心資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 啟動時清理舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 攔截請求：先看快取，沒有再去網路抓
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
