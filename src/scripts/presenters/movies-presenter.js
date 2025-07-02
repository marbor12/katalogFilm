import BasePresenter from "./base-presenter.js";
import MovieAPI from "../data/movie-api.js";

/**
 * Movies Presenter - handles the logic for movies listing page
 * Mediates between MoviesPage (View) and MovieAPI (Model)
 */
export default class MoviesPresenter extends BasePresenter {
  constructor(view) {
    super(view, MovieAPI);
    this.movies = [];
  }

  /**
   * Initialize the presenter and load movies
   */
  async init() {
    // Check if we need to force refresh (e.g., after adding a movie)
    const shouldRefresh = this.model.checkAndClearRefreshFlag();

    // Always refresh movies data when the page is loaded
    await this.loadMovies();
  }

  /**
   * Force refresh movies data (can be called from other pages)
   */
  async refreshMovies() {
    await this.loadMovies();
  }

  /**
   * Load all movies from the API
   */
  async loadMovies() {
    try {
      this.view.showLoading();

      // Check if user is logged in
      const isLoggedIn = this.model.isLoggedIn();

      if (!isLoggedIn) {
        this.view.navigateToLogin();
        return;
      }

      // Get all movies for the list
      this.movies = await this.model.getAllMovies();
      this.view.displayMovies(this.movies);

      // Get movies with location for the map
      const moviesWithLocation = await this.model.getMoviesWithLocation();
      this.view.initializeMap(moviesWithLocation);
    } catch (error) {
      const errorMessage = error.message || "Gagal memuat daftar film";
      this.view.showError(errorMessage);
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Handle movie detail navigation
   * @param {string} movieId - The ID of the movie to view
   */
  onMovieDetailClick(movieId) {
    if (!movieId) {
      this.handleError(new Error("ID film tidak valid"));
      return;
    }

    // Navigate to movie detail page
    this.view.navigateToMovieDetail(movieId);
  }

  /**
   * Handle retry click (called by view)
   */
  async onRetryClick() {
    await this.loadMovies();
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
      description: this.truncateText(movie.description, 150),
      photoUrl: movie.photoUrl,
      createdAt: movie.createdAt,
      lat: movie.lat,
      lon: movie.lon,
      location:
        movie.lat && movie.lon
          ? `${movie.lat.toFixed(4)}, ${movie.lon.toFixed(4)}`
          : "Lokasi tidak tersedia",
    };
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  /**
   * Get movies with valid location data for map display
   * @returns {Array} Movies with lat/lon coordinates
   */
  getMoviesWithLocation() {
    return this.movies.filter((movie) => movie.lat && movie.lon);
  }
}
