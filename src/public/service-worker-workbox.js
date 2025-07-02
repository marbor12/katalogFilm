/**
 * Advanced Service Worker with Workbox
 * Handles offline capabilities, caching strategies, and push notifications
 */

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import {
  registerRoute,
  setDefaultHandler,
  setCatchHandler,
  NavigationRoute,
  Route,
} from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// Base path for GitHub Pages - akan diganti webpack
const BASE_PATH = "/katalogFilm";

// Version untuk cache busting
const VERSION = "v3";

// Clean up old caches first
cleanupOutdatedCaches();

// Always fetch main HTML from network - prevent stale content issues
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: `html-cache-${VERSION}`,
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60, // 1 hour
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache strategies for different types of resources

// 1. Static Assets (JS, CSS, Images) - Cache First
registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image",
  new CacheFirst({
    cacheName: `static-assets-${VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// 2. API Responses - Network First with fallback
registerRoute(
  ({ url }) => url.pathname.includes("/stories"),
  new NetworkFirst({
    cacheName: "api-cache-v2",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
        purgeOnQuotaError: true,
      }),
    ],
    networkTimeoutSeconds: 3,
  })
);

// 3. External CDN Resources - Stale While Revalidate
registerRoute(
  ({ url }) =>
    url.origin === "https://unpkg.com" ||
    url.origin === "https://cdnjs.cloudflare.com",
  new StaleWhileRevalidate({
    cacheName: "cdn-cache-v2",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// 4. HTML Pages - Network First
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages-cache-v2",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);

// 5. Fonts - Cache First
registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({
    cacheName: "fonts-cache-v2",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Default strategy for other requests
setDefaultHandler(new StaleWhileRevalidate());

// Fallback for offline pages
setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return caches.match("/") || Response.error();
  }
  return Response.error();
});

// Background Sync for failed requests
self.addEventListener("sync", (event) => {
  console.log("SW: Background sync triggered", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log("SW: Performing background sync");

  try {
    // Sync pending data to server
    const pendingRequests = await getStoredRequests();

    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removeStoredRequest(request.id);
        console.log("SW: Successfully synced request", request.url);
      } catch (error) {
        console.log("SW: Failed to sync request", request.url, error);
      }
    }
  } catch (error) {
    console.error("SW: Background sync failed", error);
  }
}

// Push Notification Handling (Enhanced)
self.addEventListener("push", (event) => {
  console.log("SW: Push notification received", event);

  let notificationData = {
    title: "Katalog Film Indonesia",
    body: "Ada update baru di aplikasi!",
    icon: "/images/logo.png",
    badge: "/images/logo.png",
    tag: "katalog-film-notification",
    data: { url: "/" },
    requireInteraction: true,
    actions: [
      {
        action: "open",
        title: "Buka Aplikasi",
        icon: "/images/logo.png",
      },
      {
        action: "close",
        title: "Tutup",
      },
    ],
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error("SW: Error parsing push data:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    })
  );
});

// Enhanced Notification Click Handling
self.addEventListener("notificationclick", (event) => {
  console.log("SW: Notification clicked", event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
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

          // Open new window if not already open
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Notification Close Handling
self.addEventListener("notificationclose", (event) => {
  console.log("SW: Notification closed", event);
  // Analytics or cleanup if needed
});

// Helper functions for Background Sync
async function getStoredRequests() {
  try {
    const cache = await caches.open("background-sync-v1");
    const requests = await cache.keys();
    return requests.map((req) => ({
      id: req.url,
      url: req.url,
      options: req,
    }));
  } catch (error) {
    console.error("SW: Error getting stored requests", error);
    return [];
  }
}

async function removeStoredRequest(requestId) {
  try {
    const cache = await caches.open("background-sync-v1");
    await cache.delete(requestId);
  } catch (error) {
    console.error("SW: Error removing stored request", error);
  }
}

// Install event
self.addEventListener("install", (event) => {
  console.log("SW: Service worker installing...");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("SW: Service worker activating...");
  event.waitUntil(self.clients.claim());
});

// Message handling for dynamic cache updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_UPDATE") {
    event.waitUntil(updateCache(event.data.payload));
  }
});

async function updateCache(payload) {
  try {
    const cache = await caches.open("runtime-cache-v1");
    await cache.put(payload.url, new Response(JSON.stringify(payload.data)));
    console.log("SW: Cache updated for", payload.url);
  } catch (error) {
    console.error("SW: Error updating cache", error);
  }
}

console.log("SW: Workbox Service Worker loaded successfully! 🚀");
