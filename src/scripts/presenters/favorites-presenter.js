import BasePresenter from "./base-presenter.js";
import indexedDBHelper from "../utils/indexeddb.js";

/**
 * Favorites Presenter - handles the logic for favorites and IndexedDB operations
 * Mediates between FavoritesPage (View) and IndexedDB (Model)
 */
export default class FavoritesPresenter extends BasePresenter {
  constructor(view) {
    super(view, indexedDBHelper);
    this.favorites = [];
    this.stats = {
      favorites: 0,
      cachedMovies: 0,
      settings: 0,
    };
  }

  async init() {
    try {
      this.view.initializePage();
      await this.loadFavorites();
      await this.loadStats();
    } catch (error) {
      this.handleError(error, "Gagal memuat halaman favorit");
    }
  }

  /**
   * Load all favorite movies from IndexedDB
   */
  async loadFavorites() {
    try {
      this.view.showLoading();

      // Initialize IndexedDB if not already done
      await this.model.init();

      // Get all favorites
      this.favorites = await this.model.getAllFavorites();

      // Sort by date added (newest first)
      this.favorites.sort(
        (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
      );

      this.view.displayFavorites(this.favorites);
    } catch (error) {
      this.handleError(error, "Gagal memuat daftar favorit");
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Load statistics from IndexedDB
   */
  async loadStats() {
    try {
      this.stats = await this.model.getStats();
      this.view.updateStats(this.stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  /**
   * Handle remove single favorite
   */
  async onRemoveFavorite(movieId) {
    try {
      const confirmed = await this.view.confirmAction(
        "Apakah Anda yakin ingin menghapus film ini dari favorit?"
      );

      if (!confirmed) return;

      await this.model.removeFromFavorites(movieId);

      // Remove from local array
      this.favorites = this.favorites.filter((movie) => movie.id !== movieId);

      // Update view
      this.view.displayFavorites(this.favorites);
      this.view.showSuccess("Film berhasil dihapus dari favorit");

      // Update stats
      await this.loadStats();
    } catch (error) {
      this.handleError(error, "Gagal menghapus film dari favorit");
    }
  }

  /**
   * Handle clear all favorites
   */
  async onClearFavorites() {
    try {
      if (this.favorites.length === 0) {
        this.view.showSuccess("Tidak ada favorit untuk dihapus");
        return;
      }

      const confirmed = await this.view.confirmAction(
        `Apakah Anda yakin ingin menghapus semua ${this.favorites.length} film favorit?`
      );

      if (!confirmed) return;

      this.view.showLoading();

      // Remove all favorites one by one
      for (const movie of this.favorites) {
        await this.model.removeFromFavorites(movie.id);
      }

      this.favorites = [];
      this.view.displayFavorites(this.favorites);
      this.view.showSuccess("Semua favorit berhasil dihapus");

      // Update stats
      await this.loadStats();
    } catch (error) {
      this.handleError(error, "Gagal menghapus semua favorit");
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Handle clear cache
   */
  async onClearCache() {
    try {
      const confirmed = await this.view.confirmAction(
        "Apakah Anda yakin ingin menghapus semua data cache? Data akan diunduh ulang saat dibutuhkan."
      );

      if (!confirmed) return;

      this.view.showLoading();

      await this.model.clearCache();
      this.view.showSuccess("Cache berhasil dihapus");

      // Update stats
      await this.loadStats();
    } catch (error) {
      this.handleError(error, "Gagal menghapus cache");
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Handle view movie detail
   */
  onViewDetail(movieId) {
    this.view.navigateToDetail(movieId);
  }

  /**
   * Handle retry action
   */
  async onRetry() {
    await this.loadFavorites();
    await this.loadStats();
  }

  /**
   * Add movie to favorites (called from other pages)
   */
  async addToFavorites(movie) {
    try {
      await this.model.init();

      // Check if already in favorites
      const isAlreadyFavorite = await this.model.isFavorite(movie.id);
      if (isAlreadyFavorite) {
        throw new Error("Film sudah ada di daftar favorit");
      }

      await this.model.addToFavorites(movie);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove movie from favorites (called from other pages)
   */
  async removeFromFavorites(movieId) {
    try {
      await this.model.init();
      await this.model.removeFromFavorites(movieId);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if movie is favorite (called from other pages)
   */
  async isFavorite(movieId) {
    try {
      await this.model.init();
      return await this.model.isFavorite(movieId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Cache movie data (called from other pages)
   */
  async cacheMovie(movie) {
    try {
      await this.model.init();
      await this.model.cacheMovie(movie);
      return true;
    } catch (error) {
      console.error("Error caching movie:", error);
      return false;
    }
  }

  /**
   * Get cached movies (for offline mode)
   */
  async getCachedMovies() {
    try {
      await this.model.init();
      return await this.model.getCachedMovies();
    } catch (error) {
      console.error("Error getting cached movies:", error);
      return [];
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
    this.favorites = [];
    this.stats = {
      favorites: 0,
      cachedMovies: 0,
      settings: 0,
    };
  }
}
