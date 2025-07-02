// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import pushNotificationHelper from "./utils/push-notification.js";
import indexedDBHelper from "./utils/indexeddb.js";

/**
 * Register Service Worker for PWA functionality
 */
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
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
