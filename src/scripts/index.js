// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import pushNotificationHelper from "./utils/push-notification.js";
import indexedDBHelper from "./utils/indexeddb.js";

/**
 * Unregister any old service workers to ensure fresh content
 */
async function unregisterOldServiceWorkers() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log("Service worker unregistered");
    }
    // Clear caches
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log("Caches cleared");
    }
  }
}

/**
 * Register Service Worker for PWA functionality
 */
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      // Gunakan path relatif terhadap base URL
      const swPath = "service-worker.js";
      const registration = await navigator.serviceWorker.register(swPath);
      console.log("Service Worker registered successfully:", registration);

      // Update service worker when new version is available
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // Show update available notification
            console.log("New app version available. Refresh to update.");
          }
        });
      });

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  } else {
    console.log("Service Worker not supported");
  }
}

/**
 * Initialize PWA features
 */
async function initializePWA() {
  try {
    // Unregister old service workers first to ensure fresh content
    await unregisterOldServiceWorkers();

    // Register service worker
    await registerServiceWorker();

    // Initialize IndexedDB
    await indexedDBHelper.init();
    console.log("IndexedDB initialized successfully");

    // Initialize push notifications (but don't request permission yet)
    const isSupported = pushNotificationHelper.isSupported();
    if (isSupported) {
      await pushNotificationHelper.init();
      console.log("Push notification helper initialized");
    } else {
      console.log("Push notifications not supported");
    }
  } catch (error) {
    console.error("PWA initialization error:", error);
  }
}

/**
 * Main application initialization
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Menambahkan fallback error handler untuk keseluruhan aplikasi
  window.addEventListener("error", (event) => {
    console.error("Global error caught:", event.error);
    const mainContent = document.querySelector("#main-content");
    if (mainContent && mainContent.innerHTML.trim() === "") {
      mainContent.innerHTML = `
        <div class="container error-recovery">
          <h1>Oops! Terjadi kesalahan</h1>
          <p>Aplikasi tidak dapat dimuat dengan benar. Silakan coba:</p>
          <ul>
            <li>Refresh halaman</li>
            <li>Bersihkan cache browser Anda</li>
            <li>Cek koneksi internet Anda</li>
          </ul>
          <button class="btn btn-primary" onclick="window.location.reload()">
            <i class="fas fa-sync-alt" aria-hidden="true"></i> Muat Ulang
          </button>
        </div>
      `;
    }
  });

  // Initialize PWA features first
  await initializePWA();

  // Initialize main app
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  // Handle route changes
  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  // Handle online/offline status
  window.addEventListener("online", () => {
    console.log("App is online");
    // You could show a notification here
  });

  window.addEventListener("offline", () => {
    console.log("App is offline");
    // You could show a notification here
  });
});
