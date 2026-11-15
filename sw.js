/* Taman Ilmu: service worker minimal untuk installable (Add to Home Screen).
   Sengaja TANPA fetch handler: tidak ada cache, tidak ada risiko konten basi.
   Kalau nanti perlu offline sungguhan, tambah cache berversi di sini. */
const V = 'ti-sw-1';
self.addEventListener('install', (e) => { e.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
