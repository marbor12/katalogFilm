const CACHE_NAME = "katalog-film-v1";
const CACHE_STATIC_NAME = "katalog-film-static-v1";
const CACHE_DYNAMIC_NAME = "katalog-film-dynamic-v1";

// Static resources to cache (Application Shell)
const STATIC_RESOURCES = [
  "/",
  "/index.html",
  "/styles/styles.css",
  "/images/logo.png",
  "/favicon.png",
  "/manifest.json",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
];

// Install event - cache static resources
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches
      .open(CACHE_STATIC_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching static resources");
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log("Service Worker: Installed successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_STATIC_NAME &&
              cacheName !== CACHE_DYNAMIC_NAME
            ) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated successfully");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with fallback strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests that can't be cached
  if (
    url.origin !== location.origin &&
    !url.origin.includes("unpkg.com") &&
    !url.origin.includes("cdnjs.cloudflare.com")
  ) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.includes("/stories")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for caching
          const responseClone = response.clone();

          // Cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static resources with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache it
      return fetch(request)
        .then((response) => {
          // Don't cache if not a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseClone = response.clone();

          // Determine which cache to use
          const cacheToUse = STATIC_RESOURCES.includes(request.url)
            ? CACHE_STATIC_NAME
            : CACHE_DYNAMIC_NAME;

          caches.open(cacheToUse).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Return offline fallback for HTML pages
          if (request.destination === "document") {
            return caches.match("/");
          }
        });
    })
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received", event);

  let notificationData = {
    title: "Katalog Film Indonesia",
    body: "Ada update baru di aplikasi!",
    icon: "/images/logo.png",
    badge: "/images/logo.png",
    tag: "katalog-film-notification",
    data: {
      url: "/",
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
      };
    } catch (error) {
      console.error("Error parsing push data:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: true,
      actions: [
        {
          action: "open",
          title: "Buka Aplikasi",
        },
        {
          action: "close",
          title: "Tutup",
        },
      ],
    })
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event);

  event.notification.close();

  if (event.action === "open" || !event.action) {
    const urlToOpen = event.notification.data?.url || "/";

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (
              client.url.includes(self.location.origin) &&
              "focus" in client
            ) {
              return client.focus();
            }
          }

          // Open new window if app is not open
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Background sync (optional - for offline actions)
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync logic here
      console.log("Service Worker: Performing background sync")
    );
  }
});
