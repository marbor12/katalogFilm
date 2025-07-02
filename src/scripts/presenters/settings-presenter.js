import BasePresenter from "./base-presenter.js";
import pushNotificationHelper from "../utils/push-notification.js";
import indexedDBHelper from "../utils/indexeddb.js";

/**
 * Settings Presenter - handles the logic for app settings and PWA features
 * Mediates between SettingsPage (View) and various utilities (Push, IndexedDB, PWA)
 */
export default class SettingsPresenter extends BasePresenter {
  constructor(view) {
    super(view, indexedDBHelper);
    this.pushHelper = pushNotificationHelper;
    this.installPrompt = null;
    this.isSubscribed = false;
    this.canInstall = false;
  }

  async init() {
    try {
      this.view.initializePage();
      await this.checkPWAFeatures();
      await this.loadNotificationStatus();
      await this.loadStorageStats();
      await this.checkServiceWorkerStatus();
    } catch (error) {
      this.handleError(error, "Gagal memuat pengaturan");
    }
  }

  /**
   * Check PWA features availability
   */
  async checkPWAFeatures() {
    // Check if app can be installed
    this.setupInstallPrompt();

    // Check if already installed (running in standalone mode)
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    this.view.updateInstallStatus(this.canInstall, isInstalled);
  }

  /**
   * Setup install prompt listener
   */
  setupInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (event) => {
      // Prevent the default install prompt
      event.preventDefault();

      // Store the event for later use
      this.installPrompt = event;
      this.canInstall = true;

      // Update UI to show install button
      this.view.updateInstallStatus(true, false);
    });

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      this.installPrompt = null;
      this.canInstall = false;
      this.view.updateInstallStatus(false, true);
      this.view.showSuccess("Aplikasi berhasil diinstall!");
    });
  }

  /**
   * Load notification status
   */
  async loadNotificationStatus() {
    try {
      // Check if push notifications are supported
      if (!this.pushHelper.isSupported()) {
        this.view.updateNotificationStatus(false, "denied");
        return;
      }

      // Initialize push notification helper
      await this.pushHelper.init();

      // Get current permission status
      const permission = this.pushHelper.getPermissionStatus();

      // Check if currently subscribed
      this.isSubscribed = await this.pushHelper.isSubscribed();

      this.view.updateNotificationStatus(this.isSubscribed, permission);
    } catch (error) {
      console.error("Error loading notification status:", error);
      this.view.updateNotificationStatus(false, "default");
    }
  }

  /**
   * Load storage statistics
   */
  async loadStorageStats() {
    try {
      await this.model.init();
      const stats = await this.model.getStats();
      this.view.updateStorageStats(stats);
    } catch (error) {
      console.error("Error loading storage stats:", error);
      this.view.updateStorageStats({
        favorites: 0,
        cachedMovies: 0,
        settings: 0,
      });
    }
  }

  /**
   * Check service worker status
   */
  async checkServiceWorkerStatus() {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        const isActive = registration && registration.active;
        this.view.updateServiceWorkerStatus(isActive);
      } else {
        this.view.updateServiceWorkerStatus(false);
      }
    } catch (error) {
      console.error("Error checking service worker status:", error);
      this.view.updateServiceWorkerStatus(false);
    }
  }

  /**
   * Handle toggle notifications
   */
  async onToggleNotifications() {
    try {
      const permission = this.pushHelper.getPermissionStatus();

      if (permission === "denied") {
        this.view.showError(
          "Notifikasi telah ditolak. Ubah pengaturan di browser untuk mengaktifkannya."
        );
        return;
      }

      if (this.isSubscribed) {
        // Unsubscribe from notifications
        const success = await this.pushHelper.unsubscribe();
        if (success) {
          this.isSubscribed = false;
          this.view.updateNotificationStatus(false, permission);
          this.view.showSuccess("Notifikasi berhasil dimatikan");
        } else {
          this.view.showError("Gagal mematikan notifikasi");
        }
      } else {
        // Request permission and subscribe
        const permissionGranted = await this.pushHelper.requestPermission();

        if (permissionGranted) {
          const subscription = await this.pushHelper.subscribe();
          this.isSubscribed = !!subscription;
          this.view.updateNotificationStatus(this.isSubscribed, "granted");
          this.view.showSuccess("Notifikasi berhasil diaktifkan");
        } else {
          this.view.updateNotificationStatus(false, "denied");
          this.view.showError("Izin notifikasi ditolak");
        }
      }
    } catch (error) {
      this.handleError(error, "Gagal mengubah pengaturan notifikasi");
    }
  }

  /**
   * Handle test notification
   */
  async onTestNotification() {
    try {
      if (!this.isSubscribed) {
        this.view.showError("Notifikasi belum diaktifkan");
        return;
      }

      await this.pushHelper.showNotification("Test Notifikasi", {
        body: "Ini adalah test notifikasi dari Katalog Film Indonesia",
        icon: "/images/logo.png",
        badge: "/images/logo.png",
        tag: "test-notification",
      });

      this.view.showSuccess("Test notifikasi berhasil dikirim");
    } catch (error) {
      this.handleError(error, "Gagal mengirim test notifikasi");
    }
  }

  /**
   * Handle install app
   */
  async onInstallApp() {
    try {
      if (!this.installPrompt) {
        this.view.showError("Install prompt tidak tersedia");
        return;
      }

      // Show the install prompt
      this.installPrompt.prompt();

      // Wait for user choice
      const { outcome } = await this.installPrompt.userChoice;

      if (outcome === "accepted") {
        this.view.showInfo("Aplikasi sedang diinstall...");
      } else {
        this.view.showInfo("Install dibatalkan");
      }

      // Reset the install prompt
      this.installPrompt = null;
      this.canInstall = false;
    } catch (error) {
      this.handleError(error, "Gagal menginstall aplikasi");
    }
  }

  /**
   * Handle refresh cache
   */
  async onRefreshCache() {
    try {
      this.view.showLoading();

      // Clear and rebuild cache via service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Send message to service worker to update cache
          registration.active?.postMessage({ command: "CACHE_UPDATE" });
        }
      }

      // Also refresh page cache
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      this.view.showSuccess("Cache berhasil direfresh");
    } catch (error) {
      this.handleError(error, "Gagal merefresh cache");
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Handle refresh stats
   */
  async onRefreshStats() {
    await this.loadStorageStats();
    this.view.showSuccess("Statistik berhasil direfresh");
  }

  /**
   * Handle reset app
   */
  async onResetApp() {
    try {
      const confirmed = await this.view.confirmAction(
        "Apakah Anda yakin ingin mereset aplikasi? Semua data akan dihapus dan tidak dapat dikembalikan."
      );

      if (!confirmed) return;

      this.view.showLoading();

      // Clear IndexedDB
      await this.model.init();
      await this.model.clearCache();

      // Clear all favorites
      const favorites = await this.model.getAllFavorites();
      for (const movie of favorites) {
        await this.model.removeFromFavorites(movie.id);
      }

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear service worker cache
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      // Unsubscribe from notifications
      if (this.isSubscribed) {
        await this.pushHelper.unsubscribe();
      }

      this.view.showSuccess(
        "Aplikasi berhasil direset. Halaman akan dimuat ulang..."
      );

      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      this.handleError(error, "Gagal mereset aplikasi");
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Handle errors consistently
   */
  handleError(
    error,
    fallbackMessage = "Terjadi kesalahan yang tidak diketahui"
  ) {
    const errorMessage = error.message || fallbackMessage;
    this.view.showError(errorMessage);
  }

  destroy() {
    this.installPrompt = null;
    this.isSubscribed = false;
    this.canInstall = false;
  }
}
