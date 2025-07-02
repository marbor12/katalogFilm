/**
 * IndexedDB utility for storing and managing offline data
 */
class IndexedDBHelper {
  constructor(dbName = "KatalogFilmDB", version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  /**
   * Initialize IndexedDB connection
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("IndexedDB: Error opening database");
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB: Database opened successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log("IndexedDB: Upgrading database");

        // Create object stores
        if (!db.objectStoreNames.contains("favorites")) {
          const favoritesStore = db.createObjectStore("favorites", {
            keyPath: "id",
          });
          favoritesStore.createIndex("title", "title", { unique: false });
          favoritesStore.createIndex("dateAdded", "dateAdded", {
            unique: false,
          });
        }

        if (!db.objectStoreNames.contains("movies")) {
          const moviesStore = db.createObjectStore("movies", {
            keyPath: "id",
          });
          moviesStore.createIndex("title", "title", { unique: false });
          moviesStore.createIndex("cached", "cached", { unique: false });
        }

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", {
            keyPath: "key",
          });
        }
      };
    });
  }

  /**
   * Add movie to favorites
   */
  async addToFavorites(movie) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["favorites"], "readwrite");
      const store = transaction.objectStore("favorites");

      const favoriteMovie = {
        ...movie,
        dateAdded: new Date().toISOString(),
        isFavorite: true,
      };

      const request = store.put(favoriteMovie);

      request.onsuccess = () => {
        console.log("IndexedDB: Movie added to favorites", movie.id);
        resolve(favoriteMovie);
      };

      request.onerror = () => {
        console.error("IndexedDB: Error adding to favorites");
        reject(request.error);
      };
    });
  }

  /**
   * Remove movie from favorites
   */
  async removeFromFavorites(movieId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["favorites"], "readwrite");
      const store = transaction.objectStore("favorites");

      const request = store.delete(movieId);

      request.onsuccess = () => {
        console.log("IndexedDB: Movie removed from favorites", movieId);
        resolve(movieId);
      };

      request.onerror = () => {
        console.error("IndexedDB: Error removing from favorites");
        reject(request.error);
      };
    });
  }

  /**
   * Get all favorite movies
   */
  async getAllFavorites() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["favorites"], "readonly");
      const store = transaction.objectStore("favorites");
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(
          "IndexedDB: Retrieved all favorites",
          request.result.length
        );
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("IndexedDB: Error getting favorites");
        reject(request.error);
      };
    });
  }

  /**
   * Check if movie is in favorites
   */
  async isFavorite(movieId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["favorites"], "readonly");
      const store = transaction.objectStore("favorites");
      const request = store.get(movieId);

      request.onsuccess = () => {
        resolve(!!request.result);
      };

      request.onerror = () => {
        console.error("IndexedDB: Error checking favorite status");
        reject(request.error);
      };
    });
  }

  /**
   * Cache movie data for offline access
   */
  async cacheMovie(movie) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["movies"], "readwrite");
      const store = transaction.objectStore("movies");

      const cachedMovie = {
        ...movie,
        cached: new Date().toISOString(),
      };

      const request = store.put(cachedMovie);

      request.onsuccess = () => {
        console.log("IndexedDB: Movie cached", movie.id);
        resolve(cachedMovie);
      };

      request.onerror = () => {
        console.error("IndexedDB: Error caching movie");
        reject(request.error);
      };
    });
  }

  /**
   * Get cached movies
   */
  async getCachedMovies() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["movies"], "readonly");
      const store = transaction.objectStore("movies");
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(
          "IndexedDB: Retrieved cached movies",
          request.result.length
        );
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("IndexedDB: Error getting cached movies");
        reject(request.error);
      };
    });
  }

  /**
   * Clear all cached movies
   */
  async clearCache() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["movies"], "readwrite");
      const store = transaction.objectStore("movies");
      const request = store.clear();

      request.onsuccess = () => {
        console.log("IndexedDB: Cache cleared");
        resolve();
      };

      request.onerror = () => {
        console.error("IndexedDB: Error clearing cache");
        reject(request.error);
      };
    });
  }

  /**
   * Save settings
   */
  async saveSetting(key, value) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["settings"], "readwrite");
      const store = transaction.objectStore("settings");

      const setting = {
        key,
        value,
        updated: new Date().toISOString(),
      };

      const request = store.put(setting);

      request.onsuccess = () => {
        console.log("IndexedDB: Setting saved", key);
        resolve(setting);
      };

      request.onerror = () => {
        console.error("IndexedDB: Error saving setting");
        reject(request.error);
      };
    });
  }

  /**
   * Get setting
   */
  async getSetting(key) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["settings"], "readonly");
      const store = transaction.objectStore("settings");
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };

      request.onerror = () => {
        console.error("IndexedDB: Error getting setting");
        reject(request.error);
      };
    });
  }

  /**
   * Get database statistics
   */
  async getStats() {
    if (!this.db) await this.init();

    const stats = {
      favorites: 0,
      cachedMovies: 0,
      settings: 0,
    };

    try {
      const favorites = await this.getAllFavorites();
      stats.favorites = favorites.length;

      const cached = await this.getCachedMovies();
      stats.cachedMovies = cached.length;

      // Count settings
      const transaction = this.db.transaction(["settings"], "readonly");
      const store = transaction.objectStore("settings");
      const request = store.count();

      return new Promise((resolve) => {
        request.onsuccess = () => {
          stats.settings = request.result;
          resolve(stats);
        };
      });
    } catch (error) {
      console.error("IndexedDB: Error getting stats", error);
      return stats;
    }
  }
}

// Export singleton instance
const indexedDBHelper = new IndexedDBHelper();
export default indexedDBHelper;
