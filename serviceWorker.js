const staticWeatherApp = "psm-weather-app-v1"

const assets = [
  "/",
  "/authentication.html",
  "/details.html",
  "/localization.html",
  "/index.html",
  "/css/style.css",
  "/js/index.js",
  "/js/firebaseAuth.js",
  "/js/firebaseConfig.js",
  "/js/gMapsConfig.js",
  "/js/logout.js",
  "/images/back-arrow.png",
  "/images/plus-button.png",
  "/images/x-button.png"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticWeatherApp).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })