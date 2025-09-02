self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("cotel-cache").then(cache => cache.addAll([
      "index.html",
      "app.js",
      "style.css",
      "manifest.json",
      "icon.png"
    ]))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(resp=>resp||fetch(e.request)));
});