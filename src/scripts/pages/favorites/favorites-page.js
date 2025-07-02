import FavoritesPresenter from "../../presenters/favorites-presenter.js";
import ViewTransition from "../../utils/view-transition.js";

export default class FavoritesPage {
  constructor() {
    this.presenter = new FavoritesPresenter(this);
  }

  async render() {
    return `
      <section class="favorites-section">
        <div class="container">
          <div class="page-header">
            <h1 class="page-title">
              <i class="fas fa-heart" aria-hidden="true"></i>
              Film Favorit
            </h1>
            <p class="page-description">Koleksi film favorit Anda yang tersimpan offline</p>
          </div>

          <div class="favorites-controls">
            <div class="favorites-stats">
              <div class="stat-item">
                <i class="fas fa-heart" aria-hidden="true"></i>
                <span id="favorites-count">0</span>
                <span>Favorit</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-database" aria-hidden="true"></i>
                <span id="cached-count">0</span>
                <span>Cache</span>
              </div>
            </div>
            <div class="favorites-actions">
              <button id="clear-favorites-btn" class="btn btn-danger">
                <i class="fas fa-trash" aria-hidden="true"></i>
                Hapus Semua Favorit
              </button>
              <button id="clear-cache-btn" class="btn btn-warning">
                <i class="fas fa-broom" aria-hidden="true"></i>
                Bersihkan Cache
              </button>
            </div>
          </div>

          <div id="favorites-content" class="favorites-content">
            <div id="favorites-list" class="movies-grid" aria-label="Daftar film favorit">
              <!-- Favorites will be loaded here -->
            </div>
            
            <div id="empty-favorites" class="empty-state" style="display: none;">
              <i class="fas fa-heart-broken" aria-hidden="true"></i>
              <h3>Belum Ada Film Favorit</h3>
              <p>Anda belum menambahkan film ke daftar favorit. Kunjungi halaman film dan tambahkan beberapa film ke favorit.</p>
              <a href="#/movies" class="btn btn-primary">
                <i class="fas fa-film" aria-hidden="true"></i>
                Jelajahi Film
              </a>
            </div>

            <div id="error-state" class="error-state" style="display: none;">
              <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
              <h3>Terjadi Kesalahan</h3>
              <p id="error-message">Tidak dapat memuat data favorit.</p>
              <button id="retry-btn" class="btn btn-primary">
                <i class="fas fa-redo" aria-hidden="true"></i>
                Coba Lagi
              </button>
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
    this.loadStats();
  }

  bindEvents() {
    // Clear favorites button
    const clearFavoritesBtn = document.getElementById("clear-favorites-btn");
    clearFavoritesBtn.addEventListener("click", () => {
      this.presenter.onClearFavorites();
    });

    // Clear cache button
    const clearCacheBtn = document.getElementById("clear-cache-btn");
    clearCacheBtn.addEventListener("click", () => {
      this.presenter.onClearCache();
    });

    // Retry button
    const retryBtn = document.getElementById("retry-btn");
    retryBtn.addEventListener("click", () => {
      this.presenter.onRetry();
    });
  }

  /**
   * Display favorites list (called by presenter)
   */
  displayFavorites(favorites) {
    const favoritesList = document.getElementById("favorites-list");
    const emptyState = document.getElementById("empty-favorites");
    const errorState = document.getElementById("error-state");

    // Hide error state
    errorState.style.display = "none";

    if (favorites.length === 0) {
      favoritesList.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    favoritesList.style.display = "grid";

    favoritesList.innerHTML = favorites
      .map(
        (movie) => `
        <article class="movie-card" data-movie-id="${movie.id}">
          <div class="movie-poster">
            <img 
              src="${movie.photoUrl}" 
              alt="Poster ${movie.name || "Film"}"
              class="poster-image"
              loading="lazy"
            >
            <div class="movie-overlay">
              <button 
                class="btn btn-sm btn-primary view-detail-btn"
                data-movie-id="${movie.id}"
                aria-label="Lihat detail ${movie.name || "film"}"
              >
                <i class="fas fa-eye" aria-hidden="true"></i>
                Detail
              </button>
              <button 
                class="btn btn-sm btn-danger remove-favorite-btn"
                data-movie-id="${movie.id}"
                aria-label="Hapus dari favorit"
              >
                <i class="fas fa-heart-broken" aria-hidden="true"></i>
                Hapus
              </button>
            </div>
          </div>
          <div class="movie-info">
            <h3 class="movie-title">${movie.name || "Judul tidak tersedia"}</h3>
            <p class="movie-description">${this.truncateText(
              movie.description || "Tidak ada deskripsi",
              100
            )}</p>
            <div class="movie-meta">
              <span class="favorite-date">
                <i class="fas fa-calendar" aria-hidden="true"></i>
                ${this.formatDate(movie.dateAdded)}
              </span>
              ${
                movie.lat && movie.lon
                  ? `
                <span class="movie-location">
                  <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                  ${movie.lat.toFixed(4)}, ${movie.lon.toFixed(4)}
                </span>
              `
                  : ""
              }
            </div>
          </div>
        </article>
      `
      )
      .join("");

    // Bind movie card events
    this.bindMovieCardEvents();
  }

  bindMovieCardEvents() {
    // View detail buttons
    const viewDetailBtns = document.querySelectorAll(".view-detail-btn");
    viewDetailBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const movieId = btn.dataset.movieId;
        this.presenter.onViewDetail(movieId);
      });
    });

    // Remove favorite buttons
    const removeFavoriteBtns = document.querySelectorAll(
      ".remove-favorite-btn"
    );
    removeFavoriteBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const movieId = btn.dataset.movieId;
        this.presenter.onRemoveFavorite(movieId);
      });
    });
  }

  /**
   * Update statistics (called by presenter)
   */
  updateStats(stats) {
    const favoritesCount = document.getElementById("favorites-count");
    const cachedCount = document.getElementById("cached-count");

    favoritesCount.textContent = stats.favorites || 0;
    cachedCount.textContent = stats.cachedMovies || 0;
  }

  async loadStats() {
    await this.presenter.loadStats();
  }

  /**
   * Show error state (called by presenter)
   */
  showError(message) {
    const favoritesList = document.getElementById("favorites-list");
    const emptyState = document.getElementById("empty-favorites");
    const errorState = document.getElementById("error-state");
    const errorMessage = document.getElementById("error-message");

    favoritesList.style.display = "none";
    emptyState.style.display = "none";
    errorState.style.display = "block";
    errorMessage.textContent = message;
  }

  /**
   * Show success message (called by presenter)
   */
  showSuccess(message) {
    // Create and show success notification
    const notification = document.createElement("div");
    notification.className = "notification success";
    notification.innerHTML = `
      <i class="fas fa-check-circle" aria-hidden="true"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
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

  /**
   * Navigate to movie detail (called by presenter)
   */
  navigateToDetail(movieId) {
    ViewTransition.transitionTo(() => {
      window.location.hash = `#/movie/${movieId}`;
    });
  }

  /**
   * Confirm action with user
   */
  async confirmAction(message) {
    return confirm(message);
  }

  /**
   * Utility methods
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
