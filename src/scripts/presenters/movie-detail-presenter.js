import BasePresenter from "./base-presenter.js";
import MovieAPI from "../data/movie-api.js";
import FavoritesPresenter from "./favorites-presenter.js";

/**
 * Movie Detail Presenter - handles the logic for movie detail page
 * Mediates between MovieDetailPage (View) and MovieAPI (Model)
 */
export default class MovieDetailPresenter extends BasePresenter {
  constructor(view) {
    super(view, MovieAPI);
    this.movie = null;
    this.movieId = null;
    this.favoritesPresenter = new FavoritesPresenter(null);
    this.isFavorite = false;
  }

  /**
   * Initialize the presenter with movie ID
   * @param {string} movieId - ID of the movie to load
   */
  async init(movieId) {
    this.movieId = movieId;
    await this.loadMovieDetail();
  }

  /**
   * Load movie detail from API
   */
  async loadMovieDetail() {
    try {
      if (!this.movieId) {
        throw new Error("ID film tidak valid");
      }

      this.view.showLoading();
      this.movie = await this.model.getMovieDetail(this.movieId);

      if (!this.movie) {
        throw new Error("Film tidak ditemukan");
      }

      const formattedMovie = this.getFormattedMovieData(this.movie);
      this.view.displayMovieDetail(formattedMovie);

      // Initialize map if location is available
      if (this.movie.lat && this.movie.lon) {
        this.view.initializeMap(this.movie.lat, this.movie.lon, this.movie);
      }

      // Check favorite status
      await this.checkFavoriteStatus();
    } catch (error) {
      this.handleError(error, "Gagal memuat detail film");
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Check if current movie is in favorites
   */
  async checkFavoriteStatus() {
    try {
      this.isFavorite = await this.favoritesPresenter.isFavorite(this.movieId);
      this.view.updateFavoriteButton(this.isFavorite);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  }

  /**
   * Handle retry action when loading fails
   */
  onRetryClick() {
    this.loadMovieDetail();
  }

  /**
   * Handle navigation back to movies list
   */
  onBackToMovies() {
    this.view.navigateToMovies();
  }

  /**
   * Handle share functionality
   */
  onShareMovie() {
    if (!this.movie) {
      this.handleError(new Error("Data film tidak tersedia untuk dibagikan"));
      return;
    }

    const shareData = {
      title: this.movie.name || "Film Indonesia",
      text:
        this.movie.description || "Lihat film Indonesia ini di Katalog Film",
      url: this.view.getCurrentUrl(),
    };

    this.view.shareMovie(shareData);
  }

  /**
   * Handle toggle favorite action
   */
  async onToggleFavorite() {
    try {
      if (!this.movie) {
        this.view.showError("Data film tidak tersedia");
        return;
      }

      if (this.isFavorite) {
        // Remove from favorites
        await this.favoritesPresenter.removeFromFavorites(this.movieId);
        this.isFavorite = false;
        this.view.updateFavoriteButton(false);
        this.view.showSuccess("Film dihapus dari favorit");
      } else {
        // Add to favorites
        await this.favoritesPresenter.addToFavorites(this.movie);
        this.isFavorite = true;
        this.view.updateFavoriteButton(true);
        this.view.showSuccess("Film ditambahkan ke favorit");
      }
    } catch (error) {
      this.handleError(error, "Gagal mengubah status favorit");
    }
  }

  /**
   * Get formatted movie data for view consumption
   * @param {Object} movie - Raw movie data from API
   * @returns {Object} Formatted movie data
   */
  getFormattedMovieData(movie) {
    return {
      id: movie.id,
      title: movie.name || "Tanpa Judul",
      description: movie.description || "Tidak ada deskripsi",
      photoUrl: movie.photoUrl,
      createdAt: movie.createdAt,
      lat: movie.lat,
      lon: movie.lon,
      location: this.formatLocation(movie.lat, movie.lon),
      hasLocation: !!(movie.lat && movie.lon),
    };
  }

  /**
   * Format location coordinates for display
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {string} Formatted location string
   */
  formatLocation(lat, lon) {
    if (!lat || !lon) {
      return "Lokasi tidak tersedia";
    }
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }

  /**
   * Get current movie data
   * @returns {Object|null} Current movie data
   */
  getCurrentMovie() {
    return this.movie;
  }

  /**
   * Check if movie has valid location data
   * @returns {boolean} True if movie has location data
   */
  hasLocationData() {
    return this.movie && this.movie.lat && this.movie.lon;
  }
}
