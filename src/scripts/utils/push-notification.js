/**
 * Push Notification utility for handling web push notifications
 */
class PushNotificationHelper {
  constructor() {
    // VAPID Public Key dari dokumentasi API
    this.vapidPublicKey =
      "BN7-r0Svv7CsTi18-OPYtJLVW0bfuZ1x1UtrygczKjNB2VbF_SrJOuKuD6FM0-q1GHDK6YPNjP8lFPU1YxFUJ-g";
    this.registration = null;
    this.subscription = null;
  }

  /**
   * Initialize push notification service
   */
  async init() {
    try {
      // Check if service worker is supported
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker not supported");
      }

      // Check if push messaging is supported
      if (!("PushManager" in window)) {
        throw new Error("Push messaging not supported");
      }

      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;
      console.log("Push Notification: Service Worker ready");

      return true;
    } catch (error) {
      console.error("Push Notification: Initialization failed", error);
      return false;
    }
  }

  /**
   * Request permission for notifications
   */
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      console.log("Push Notification: Permission status", permission);

      if (permission === "granted") {
        return true;
      } else {
        throw new Error("Notification permission denied");
      }
    } catch (error) {
      console.error("Push Notification: Permission request failed", error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe() {
    try {
      if (!this.registration) {
        await this.init();
      }

      // Check if already subscribed
      let subscription = await this.registration.pushManager.getSubscription();

      if (subscription) {
        console.log("Push Notification: Already subscribed");
        this.subscription = subscription;
        return subscription;
      }

      // Convert VAPID key
      const vapidPublicKeyBytes = this.urlBase64ToUint8Array(
        this.vapidPublicKey
      );

      // Subscribe to push notifications
      subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKeyBytes,
      });

      console.log("Push Notification: Subscribed successfully");
      this.subscription = subscription;

      // Send subscription to server (optional)
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error("Push Notification: Subscription failed", error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe() {
    try {
      if (!this.subscription) {
        const subscription =
          await this.registration.pushManager.getSubscription();
        if (!subscription) {
          console.log("Push Notification: No active subscription");
          return true;
        }
        this.subscription = subscription;
      }

      const successful = await this.subscription.unsubscribe();

      if (successful) {
        console.log("Push Notification: Unsubscribed successfully");
        this.subscription = null;

        // Remove subscription from server (optional)
        await this.removeSubscriptionFromServer();
      }

      return successful;
    } catch (error) {
      console.error("Push Notification: Unsubscribe failed", error);
      return false;
    }
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed() {
    try {
      if (!this.registration) {
        await this.init();
      }

      const subscription =
        await this.registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error(
        "Push Notification: Error checking subscription status",
        error
      );
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription() {
    try {
      if (!this.registration) {
        await this.init();
      }

      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Push Notification: Error getting subscription", error);
      return null;
    }
  }

  /**
   * Show local notification (for testing)
   */
  async showNotification(title, options = {}) {
    try {
      if (!this.registration) {
        await this.init();
      }

      const defaultOptions = {
        body: "Ini adalah notifikasi dari Katalog Film Indonesia",
        icon: "/images/logo.png",
        badge: "/images/logo.png",
        tag: "katalog-film-local",
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
        data: {
          url: "/",
        },
      };

      const notificationOptions = { ...defaultOptions, ...options };

      await this.registration.showNotification(title, notificationOptions);
      console.log("Push Notification: Local notification shown");
    } catch (error) {
      console.error("Push Notification: Error showing notification", error);
    }
  }

  /**
   * Send subscription to server (optional implementation)
   */
  async sendSubscriptionToServer(subscription) {
    try {
      // This is where you would send the subscription to your server
      // For now, we'll just store it locally
      localStorage.setItem("pushSubscription", JSON.stringify(subscription));
      console.log("Push Notification: Subscription saved locally");
    } catch (error) {
      console.error(
        "Push Notification: Error sending subscription to server",
        error
      );
    }
  }

  /**
   * Remove subscription from server (optional implementation)
   */
  async removeSubscriptionFromServer() {
    try {
      // This is where you would remove the subscription from your server
      localStorage.removeItem("pushSubscription");
      console.log("Push Notification: Subscription removed from local storage");
    } catch (error) {
      console.error(
        "Push Notification: Error removing subscription from server",
        error
      );
    }
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus() {
    return Notification.permission;
  }

  /**
   * Check if notifications are supported
   */
  isSupported() {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }
}

// Export singleton instance
const pushNotificationHelper = new PushNotificationHelper();
export default pushNotificationHelper;
