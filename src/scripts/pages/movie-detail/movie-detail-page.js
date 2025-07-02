import MovieDetailPresenter from "../../presenters/movie-detail-presenter";
import MapUtils from "../../utils/map-utils";
import { showFormattedDate } from "../../utils/index";
import { parseActivePathname } from "../../routes/url-parser";
import ViewTransition from "../../utils/view-transition";

export default class MovieDetailPage {
  constructor() {
    this.presenter = new MovieDetailPresenter(this);
    this.mapUtils = null;
  }

  async render() {
    return `
      <section class="movie-detail-section">
        <div class="container">
          <div id="movie-detail-content">
            <!-- Content will be loaded here -->
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    await this.presenter.init(id);
  }

  /**
   * Display movie detail (called by presenter)
   */
  displayMovieDetail(movie) {
    const contentContainer = document.getElementById("movie-detail-content");

    contentContainer.innerHTML = `
      <div class="movie-detail-header">
        <button class="btn btn-secondary back-btn" id="back-btn" aria-label="Kembali ke halaman sebelumnya">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
          Kembali
        </button>
        <div class="detail-actions">
          <button class="btn btn-favorite" id="favorite-btn" aria-label="Tambah ke favorit">
            <i class="fas fa-heart" aria-hidden="true"></i>
            <span class="btn-text">Favorit</span>
          </button>
          <button class="btn btn-outline share-btn" id="share-btn" aria-label="Bagikan film ini">
            <i class="fas fa-share" aria-hidden="true"></i>
            Bagikan
          </button>
        </div>
      </div>

      <article class="movie-detail-card">
        <div class="movie-detail-image">
          <img src="${movie.photoUrl}" alt="Poster film ${
      movie.title
    }" class="movie-detail-img">
        </div>
        
        <div class="movie-detail-info">
          <h1 class="movie-detail-title">${movie.title}</h1>
          
          <div class="movie-detail-meta">
            <div class="meta-item">
              <i class="fas fa-calendar" aria-hidden="true"></i>
              <span>Ditambahkan: ${showFormattedDate(
                movie.createdAt,
                "id-ID"
              )}</span>
            </div>
            ${
              movie.hasLocation
                ? `
              <div class="meta-item">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                <span>Lokasi: ${movie.location}</span>
              </div>
            `
                : ""
            }
          </div>
          
          <div class="movie-detail-description">
            <h2>Deskripsi</h2>
            <p>${movie.description}</p>
          </div>
        </div>
      </article>

      ${
        movie.hasLocation
          ? `
        <div class="movie-location-section">
          <h2 class="section-title">
            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
            Lokasi Syuting
          </h2>
          <div id="movie-detail-map" class="movie-detail-map" role="img" aria-label="Peta lokasi syuting film"></div>
        </div>
      `
          : ""
      }
    `;

    // Add event listeners
    const backBtn = document.getElementById("back-btn");
    const shareBtn = document.getElementById("share-btn");
    const favoriteBtn = document.getElementById("favorite-btn");

    backBtn.addEventListener("click", () => {
      this.presenter.onBackToMovies();
    });

    shareBtn.addEventListener("click", () => {
      this.presenter.onShareMovie();
    });

    favoriteBtn.addEventListener("click", () => {
      this.presenter.onToggleFavorite();
    });
  }

  /**
   * Initialize map (called by presenter)
   */
  initializeMap(lat, lon, movie) {
    this.mapUtils = new MapUtils();
    this.mapUtils.initializeMap("movie-detail-map", {
      center: [lat, lon],
      zoom: 15,
    });

    const popupContent = `
      <div class="map-popup">
        <img src="${movie.photoUrl}" alt="${
      movie.name || "Film"
    }" class="popup-image">
        <h4>${movie.name || "Tanpa Judul"}</h4>
        <p>Lokasi syuting film ini</p>
      </div>
    `;

    this.mapUtils.addMarker(lat, lon, popupContent);
  }

  /**
   * Navigate to movies page (called by presenter)
   */
  navigateToMovies() {
    ViewTransition.transitionTo(() => {
      window.location.hash = "#/movies";
    });
  }

  /**
   * Share movie (called by presenter)
   */
  shareMovie(shareData) {
    if (navigator.share) {
      navigator.share(shareData).catch((error) => {
        console.log("Error sharing:", error);
        this.fallbackShare(shareData);
      });
    } else {
      this.fallbackShare(shareData);
    }
  }

  /**
   * Fallback sharing method
   */
  fallbackShare(shareData) {
    // Copy URL to clipboard
    navigator.clipboard
      .writeText(shareData.url)
      .then(() => {
        // Show success message
        const message = document.createElement("div");
        message.className = "share-notification";
        message.innerHTML = `
        <div class="share-content">
          <i class="fas fa-check" aria-hidden="true"></i>
          <span>Link berhasil disalin ke clipboard!</span>
        </div>
      `;
        document.body.appendChild(message);

        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 3000);
      })
      .catch(() => {
        // Fallback: show URL in alert
        alert(`Bagikan film ini: ${shareData.url}`);
      });
  }

  /**
   * Show error (called by presenter)
   */
  showError(message) {
    const contentContainer = document.getElementById("movie-detail-content");
    contentContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle error-icon" aria-hidden="true"></i>
        <h2>Film Tidak Ditemukan</h2>
        <p>${message}</p>
        <div class="error-actions">
          <button class="btn btn-secondary" id="back-error-btn">
            <i class="fas fa-arrow-left" aria-hidden="true"></i>
            Kembali
          </button>
          <button class="btn btn-primary" id="retry-btn">
            <i class="fas fa-redo" aria-hidden="true"></i>
            Coba Lagi
          </button>
          <a href="#/movies" class="btn btn-outline">
            <i class="fas fa-film" aria-hidden="true"></i>
            Lihat Semua Film
          </a>
        </div>
      </div>
    `;

    const backErrorBtn = document.getElementById("back-error-btn");
    const retryBtn = document.getElementById("retry-btn");

    backErrorBtn.addEventListener("click", () => {
      this.presenter.onBackToMovies();
    });

    retryBtn.addEventListener("click", () => {
      this.presenter.onRetryClick();
    });
  }

  /**
   * Get current URL (called by presenter)
   */
  getCurrentUrl() {
    return window.location.href;
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
   * Update favorite button status (called by presenter)
   */
  updateFavoriteButton(isFavorite) {
    const favoriteBtn = document.getElementById("favorite-btn");
    if (!favoriteBtn) return;

    const icon = favoriteBtn.querySelector("i");
    const text = favoriteBtn.querySelector(".btn-text");

    if (isFavorite) {
      favoriteBtn.classList.remove("btn-favorite");
      favoriteBtn.classList.add("btn-favorite-active");
      icon.className = "fas fa-heart";
      text.textContent = "Favorit";
      favoriteBtn.setAttribute("aria-label", "Hapus dari favorit");
    } else {
      favoriteBtn.classList.remove("btn-favorite-active");
      favoriteBtn.classList.add("btn-favorite");
      icon.className = "far fa-heart";
      text.textContent = "Favorit";
      favoriteBtn.setAttribute("aria-label", "Tambah ke favorit");
    }
  }

  /**
   * Show success message (called by presenter)
   */
  showSuccess(message) {
    const notification = document.createElement("div");
    notification.className = "notification success";
    notification.innerHTML = `
      <i class="fas fa-check-circle" aria-hidden="true"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}
