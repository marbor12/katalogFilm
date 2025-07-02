import SettingsPresenter from "../../presenters/settings-presenter.js";

export default class SettingsPage {
  constructor() {
    this.presenter = new SettingsPresenter(this);
  }

  async render() {
    return `
      <section class="settings-section">
        <div class="container">
          <div class="page-header">
            <h1 class="page-title">
              <i class="fas fa-cogs" aria-hidden="true"></i>
              Pengaturan
            </h1>
            <p class="page-description">Kelola preferensi dan pengaturan aplikasi</p>
          </div>

          <div class="settings-content">
            <!-- Notification Settings -->
            <div class="settings-group">
              <h2 class="settings-group-title">
                <i class="fas fa-bell" aria-hidden="true"></i>
                Notifikasi Push
              </h2>
              
              <div class="setting-item">
                <div class="setting-info">
                  <h3>Notifikasi Push</h3>
                  <p>Terima notifikasi tentang film baru dan update aplikasi</p>
                  <div id="notification-status" class="setting-status">
                    <span class="status-indicator"></span>
                    <span class="status-text">Memuat status...</span>
                  </div>
                </div>
                <div class="setting-control">
                  <button id="toggle-notification-btn" class="btn btn-primary" disabled>
                    <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    Memuat...
                  </button>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3>Test Notifikasi</h3>
                  <p>Kirim notifikasi test untuk memastikan fitur berfungsi</p>
                </div>
                <div class="setting-control">
                  <button id="test-notification-btn" class="btn btn-secondary" disabled>
                    <i class="fas fa-paper-plane" aria-hidden="true"></i>
                    Kirim Test
                  </button>
                </div>
              </div>
            </div>

            <!-- PWA Settings -->
            <div class="settings-group">
              <h2 class="settings-group-title">
                <i class="fas fa-mobile-alt" aria-hidden="true"></i>
                Progressive Web App
              </h2>
              
              <div class="setting-item">
                <div class="setting-info">
                  <h3>Install Aplikasi</h3>
                  <p>Install aplikasi ke perangkat untuk akses yang lebih mudah</p>
                  <div id="install-status" class="setting-status">
                    <span class="status-indicator"></span>
                    <span class="status-text">Memuat status...</span>
                  </div>
                </div>
                <div class="setting-control">
                  <button id="install-app-btn" class="btn btn-success" style="display: none;">
                    <i class="fas fa-download" aria-hidden="true"></i>
                    Install Aplikasi
                  </button>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3>Mode Offline</h3>
                  <p>Akses konten yang sudah di-cache saat offline</p>
                  <div id="offline-status" class="setting-status">
                    <span class="status-indicator"></span>
                    <span class="status-text">Online</span>
                  </div>
                </div>
                <div class="setting-control">
                  <button id="refresh-cache-btn" class="btn btn-info">
                    <i class="fas fa-sync" aria-hidden="true"></i>
                    Refresh Cache
                  </button>
                </div>
              </div>
            </div>

            <!-- Data Management -->
            <div class="settings-group">
              <h2 class="settings-group-title">
                <i class="fas fa-database" aria-hidden="true"></i>
                Manajemen Data
              </h2>
              
              <div class="setting-item">
                <div class="setting-info">
                  <h3>Statistik Penyimpanan</h3>
                  <p>Informasi tentang data yang tersimpan di perangkat</p>
                  <div class="storage-stats">
                    <div class="stat-item">
                      <span class="stat-label">Film Favorit:</span>
                      <span id="favorites-stat" class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Data Cache:</span>
                      <span id="cache-stat" class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Pengaturan:</span>
                      <span id="settings-stat" class="stat-value">0</span>
                    </div>
                  </div>
                </div>
                <div class="setting-control">
                  <button id="refresh-stats-btn" class="btn btn-secondary">
                    <i class="fas fa-chart-bar" aria-hidden="true"></i>
                    Refresh
                  </button>
                </div>
              </div>

              <div class="setting-item danger">
                <div class="setting-info">
                  <h3>Reset Aplikasi</h3>
                  <p>Hapus semua data aplikasi dan kembalikan ke pengaturan awal</p>
                  <div class="warning-text">
                    <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    Tindakan ini tidak dapat dibatalkan
                  </div>
                </div>
                <div class="setting-control">
                  <button id="reset-app-btn" class="btn btn-danger">
                    <i class="fas fa-trash-restore" aria-hidden="true"></i>
                    Reset Aplikasi
                  </button>
                </div>
              </div>
            </div>

            <!-- App Information -->
            <div class="settings-group">
              <h2 class="settings-group-title">
                <i class="fas fa-info-circle" aria-hidden="true"></i>
                Informasi Aplikasi
              </h2>
              
              <div class="app-info">
                <div class="info-item">
                  <span class="info-label">Versi:</span>
                  <span class="info-value">1.0.0</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Build:</span>
                  <span class="info-value">${
                    new Date().toISOString().split("T")[0]
                  }</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Service Worker:</span>
                  <span id="sw-status" class="info-value">Memuat...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.presenter.init();
  }

  /**
   * Initialize page (called by presenter)
   */
  initializePage() {
    this.bindEvents();
    this.updateOnlineStatus();
  }

  bindEvents() {
    // Notification toggle
    const toggleNotificationBtn = document.getElementById(
      "toggle-notification-btn"
    );
    toggleNotificationBtn.addEventListener("click", () => {
      this.presenter.onToggleNotifications();
    });

    // Test notification
    const testNotificationBtn = document.getElementById(
      "test-notification-btn"
    );
    testNotificationBtn.addEventListener("click", () => {
      this.presenter.onTestNotification();
    });

    // Install app
    const installAppBtn = document.getElementById("install-app-btn");
    installAppBtn.addEventListener("click", () => {
      this.presenter.onInstallApp();
    });

    // Refresh cache
    const refreshCacheBtn = document.getElementById("refresh-cache-btn");
    refreshCacheBtn.addEventListener("click", () => {
      this.presenter.onRefreshCache();
    });

    // Refresh stats
    const refreshStatsBtn = document.getElementById("refresh-stats-btn");
    refreshStatsBtn.addEventListener("click", () => {
      this.presenter.onRefreshStats();
    });

    // Reset app
    const resetAppBtn = document.getElementById("reset-app-btn");
    resetAppBtn.addEventListener("click", () => {
      this.presenter.onResetApp();
    });

    // Listen for online/offline status
    window.addEventListener("online", this.updateOnlineStatus.bind(this));
    window.addEventListener("offline", this.updateOnlineStatus.bind(this));
  }

  /**
   * Update notification status (called by presenter)
   */
  updateNotificationStatus(isSubscribed, permission) {
    const statusElement = document.getElementById("notification-status");
    const buttonElement = document.getElementById("toggle-notification-btn");
    const testButton = document.getElementById("test-notification-btn");

    let statusText = "";
    let statusClass = "";
    let buttonText = "";
    let buttonIcon = "";

    if (permission === "denied") {
      statusText = "Ditolak oleh browser";
      statusClass = "status-error";
      buttonText = "Tidak Tersedia";
      buttonIcon = "fas fa-ban";
      buttonElement.disabled = true;
      testButton.disabled = true;
    } else if (permission === "granted" && isSubscribed) {
      statusText = "Aktif dan berlangganan";
      statusClass = "status-success";
      buttonText = "Matikan Notifikasi";
      buttonIcon = "fas fa-bell-slash";
      buttonElement.disabled = false;
      testButton.disabled = false;
    } else if (permission === "granted" && !isSubscribed) {
      statusText = "Diizinkan tapi belum berlangganan";
      statusClass = "status-warning";
      buttonText = "Aktifkan Notifikasi";
      buttonIcon = "fas fa-bell";
      buttonElement.disabled = false;
      testButton.disabled = true;
    } else {
      statusText = "Belum diizinkan";
      statusClass = "status-warning";
      buttonText = "Minta Izin";
      buttonIcon = "fas fa-bell";
      buttonElement.disabled = false;
      testButton.disabled = true;
    }

    statusElement.className = `setting-status ${statusClass}`;
    statusElement.querySelector(".status-text").textContent = statusText;

    buttonElement.innerHTML = `<i class="${buttonIcon}" aria-hidden="true"></i> ${buttonText}`;
    buttonElement.disabled = false;
  }

  /**
   * Update install status (called by presenter)
   */
  updateInstallStatus(canInstall, isInstalled) {
    const statusElement = document.getElementById("install-status");
    const buttonElement = document.getElementById("install-app-btn");

    if (isInstalled) {
      statusElement.className = "setting-status status-success";
      statusElement.querySelector(".status-text").textContent =
        "Aplikasi sudah terinstall";
      buttonElement.style.display = "none";
    } else if (canInstall) {
      statusElement.className = "setting-status status-info";
      statusElement.querySelector(".status-text").textContent =
        "Siap untuk diinstall";
      buttonElement.style.display = "inline-flex";
    } else {
      statusElement.className = "setting-status status-warning";
      statusElement.querySelector(".status-text").textContent =
        "Install tidak tersedia";
      buttonElement.style.display = "none";
    }
  }

  /**
   * Update storage statistics (called by presenter)
   */
  updateStorageStats(stats) {
    document.getElementById("favorites-stat").textContent =
      stats.favorites || 0;
    document.getElementById("cache-stat").textContent = stats.cachedMovies || 0;
    document.getElementById("settings-stat").textContent = stats.settings || 0;
  }

  /**
   * Update service worker status (called by presenter)
   */
  updateServiceWorkerStatus(isActive) {
    const swStatus = document.getElementById("sw-status");
    swStatus.textContent = isActive ? "Aktif" : "Tidak Aktif";
    swStatus.className = isActive
      ? "info-value status-success"
      : "info-value status-error";
  }

  /**
   * Update online status
   */
  updateOnlineStatus() {
    const offlineStatus = document.getElementById("offline-status");
    const isOnline = navigator.onLine;

    if (isOnline) {
      offlineStatus.className = "setting-status status-success";
      offlineStatus.querySelector(".status-text").textContent = "Online";
    } else {
      offlineStatus.className = "setting-status status-warning";
      offlineStatus.querySelector(".status-text").textContent = "Offline";
    }
  }

  /**
   * Show success message (called by presenter)
   */
  showSuccess(message) {
    this.showNotification(message, "success");
  }

  /**
   * Show error message (called by presenter)
   */
  showError(message) {
    this.showNotification(message, "error");
  }

  /**
   * Show info message (called by presenter)
   */
  showInfo(message) {
    this.showNotification(message, "info");
  }

  /**
   * Show notification
   */
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    const icon =
      type === "success"
        ? "check-circle"
        : type === "error"
        ? "exclamation-circle"
        : "info-circle";

    notification.innerHTML = `
      <i class="fas fa-${icon}" aria-hidden="true"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Confirm action with user
   */
  async confirmAction(message) {
    return confirm(message);
  }

  /**
   * Show loading state (called by presenter)
   */
  showLoading() {
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.style.display = "flex";
      loadingIndicator.setAttribute("aria-hidden", "false");
    }
  }

  /**
   * Hide loading state (called by presenter)
   */
  hideLoading() {
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
      loadingIndicator.setAttribute("aria-hidden", "true");
    }
  }
}
