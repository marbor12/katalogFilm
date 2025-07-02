import MoviesPresenter from "../../presenters/movies-presenter";
import MapUtils from "../../utils/map-utils";
import ViewTransition from "../../utils/view-transition";
import { showFormattedDate } from "../../utils/index";

export default class MoviesPage {
  constructor() {
    this.presenter = new MoviesPresenter(this);
    this.mapUtils = null;
  }

  async render() {
    return `
      <section class="movies-section">
        <div class="container">
          <div class="page-header">
            <h1 class="page-title">
              <i class="fas fa-film" aria-hidden="true"></i>
              Katalog Film Indonesia
            </h1>
            <p class="page-description">Jelajahi koleksi film-film terbaik dari berbagai daerah di Indonesia</p>
          </div>

          <div class="movies-content">
            <div class="movies-list-container">
              <div id="movies-list" class="movies-list" role="list">
                <!-- Movies will be loaded here -->
              </div>
            </div>
            
            <div class="map-container">
              <h2 class="map-title">Peta Lokasi Film</h2>
              <div id="movies-map" class="movies-map" role="img" aria-label="Peta lokasi film-film Indonesia"></div>
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
   * Display movies list (called by presenter)
   * @param {Array} movies - Array of movie data
   */
  displayMovies(movies) {
    this.renderMoviesList(movies);
  }

  /**
   * Initialize map with movies data (called by presenter)
   * @param {Array} movies - Array of movie data
   */
  initializeMap(movies) {
    this.mapUtils = new MapUtils();
    this.mapUtils.initializeMap("movies-map");

    // Add markers for each movie
    movies.forEach((movie) => {
      if (movie.lat && movie.lon) {
        const formattedMovie = this.presenter.getFormattedMovieData(movie);
        const popupContent = `
          <div class="map-popup">
            <img src="${movie.photoUrl}" alt="${
          formattedMovie.title
        }" class="popup-image">
            <h4>${formattedMovie.title}</h4>
            <p>${this.presenter.truncateText(movie.description, 100)}</p>
            <small>${showFormattedDate(movie.createdAt, "id-ID")}</small>
          </div>
        `;

        this.mapUtils.addMarker(movie.lat, movie.lon, popupContent);
      }
    });

    // Fit map to show all markers
    const locations = movies
      .filter((movie) => movie.lat && movie.lon)
      .map((movie) => ({ lat: movie.lat, lng: movie.lon }));

    if (locations.length > 0) {
      this.mapUtils.fitBounds(locations);
    }
  }

  /**
   * Navigate to movie detail page
   * @param {string} movieId - ID of the movie
   */
  navigateToMovieDetail(movieId) {
    ViewTransition.transitionTo(() => {
      window.location.hash = `#/movie/${movieId}`;
    });
  }

  /**
   * Navigate to login page (called by presenter)
   */
  navigateToLogin() {
    ViewTransition.transitionTo(() => {
      window.location.hash = "#/login";
    });
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    const moviesListContainer = document.getElementById("movies-list");
    moviesListContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle error-icon" aria-hidden="true"></i>
        <h3>Terjadi Kesalahan</h3>
        <p>${message}</p>
        <button class="btn btn-primary retry-btn">
          <i class="fas fa-redo" aria-hidden="true"></i>
          Coba Lagi
        </button>
      </div>
    `;

    const retryButton = document.querySelector(".retry-btn");
    retryButton.addEventListener("click", () => {
      this.presenter.onRetryClick();
    });
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

  renderMoviesList(movies) {
    console.log("renderMoviesList called with movies:", movies);
    const moviesListContainer = document.getElementById("movies-list");

    if (movies.length === 0) {
      console.log("No movies found - showing empty state");
      moviesListContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-film empty-icon" aria-hidden="true"></i>
          <h3>Belum ada film</h3>
          <p>Jadilah yang pertama menambahkan film ke katalog!</p>
          <a href="#/add-movie" class="btn btn-primary">
            <i class="fas fa-plus" aria-hidden="true"></i>
            Tambah Film
          </a>
        </div>
      `;
      return;
    }

    console.log("Rendering", movies.length, "movies");
    const moviesHTML = movies
      .map((movie) => {
        console.log("Processing movie:", movie);
        const formattedMovie = this.presenter.getFormattedMovieData(movie);
        console.log("Formatted movie:", formattedMovie);
        return `
          <article class="movie-card" role="listitem">
            <div class="movie-image">
              <img src="${movie.photoUrl}" alt="Poster film ${
          formattedMovie.title
        }" class="movie-img" loading="lazy">
            </div>
            <div class="movie-content">
              <h3 class="movie-title">${formattedMovie.title}</h3>
              <p class="movie-description">${formattedMovie.description}</p>
              <div class="movie-meta">
                <span class="movie-date">
                  <i class="fas fa-calendar" aria-hidden="true"></i>
                  ${showFormattedDate(movie.createdAt, "id-ID")}
                </span>
                <span class="movie-location">
                  <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                  ${formattedMovie.location}
                </span>
              </div>
              <button class="btn btn-outline movie-detail-btn" data-movie-id="${
                movie.id
              }" aria-label="Lihat detail film ${formattedMovie.title}">
                <i class="fas fa-eye" aria-hidden="true"></i>
                Lihat Detail
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    moviesListContainer.innerHTML = moviesHTML;

    // Add event listeners for detail buttons
    const detailButtons = document.querySelectorAll(".movie-detail-btn");
    detailButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const movieId = e.target.closest(".movie-detail-btn").dataset.movieId;
        this.presenter.onMovieDetailClick(movieId);
      });
    });
  }
}
