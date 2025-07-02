import CONFIG from "../config";

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_WITH_LOCATION: `${CONFIG.BASE_URL}/stories?location=1`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

class MovieAPI {
  static async getAllMovies() {
    try {
      const token = this.getAuthToken();
      console.log("Token available:", !!token);

      // Coba tanpa auth dulu untuk testing
      let headers = {};
      if (token) {
        headers = { Authorization: `Bearer ${token}` };
      }

      // Add cache busting parameter to ensure fresh data
      const url = `${ENDPOINTS.STORIES}?_t=${Date.now()}`;

      console.log("Fetching movies from:", url);
      console.log("Headers:", headers);

      const response = await fetch(url, {
        headers,
        cache: "no-cache", // Disable caching
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseJson = await response.json();
      console.log("Movies API response:", responseJson);

      if (!response.ok) {
        // Jika 401 (Unauthorized), redirect ke login
        if (response.status === 401) {
          console.warn("Unauthorized - redirecting to login");
          window.location.hash = "#/login";
          return [];
        }
        throw new Error(
          responseJson.message ||
            `HTTP ${response.status}: Failed to fetch movies`
        );
      }

      return responseJson.listStory || [];
    } catch (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
  }

  static async getMovieDetail(id) {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
        headers,
      });
      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(responseJson.message || "Failed to fetch movie detail");
      }

      return responseJson.story;
    } catch (error) {
      console.error("Error fetching movie detail:", error);
      throw error;
    }
  }

  static async addMovie(movieData) {
    try {
      console.log("Adding movie with data:", movieData);

      const formData = new FormData();
      // Coba tanpa field name dulu, hanya description
      formData.append("description", movieData.description);
      formData.append("photo", movieData.photo);

      // Pastikan lat dan lon disertakan jika ada location
      if (movieData.lat && movieData.lon) {
        formData.append("lat", movieData.lat.toString());
        formData.append("lon", movieData.lon.toString());
      }

      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const token = this.getAuthToken();
      console.log("Auth token:", token ? "Present" : "Missing");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      console.log("Sending request to:", ENDPOINTS.ADD_STORY);
      const response = await fetch(ENDPOINTS.ADD_STORY, {
        method: "POST",
        body: formData,
        headers,
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );
      const responseJson = await response.json();
      console.log("Response data:", responseJson);

      if (!response.ok) {
        throw new Error(responseJson.message || "Failed to add movie");
      }

      return responseJson;
    } catch (error) {
      console.error("Error adding movie:", error);
      throw error;
    }
  }
  static async register(name, email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const responseJson = await response.json();
      if (!response.ok) {
        throw new Error(responseJson.message || "Registration failed");
      }
      return responseJson;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  }

  static async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const responseJson = await response.json();
      if (!response.ok) {
        throw new Error(responseJson.message || "Login failed");
      }
      // Simpan token ke localStorage
      localStorage.setItem("token", responseJson.loginResult.token);
      localStorage.setItem("user", JSON.stringify(responseJson.loginResult));
      return responseJson;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  static getAuthToken() {
    return localStorage.getItem("token") || "";
  }

  static isLoggedIn() {
    return !!this.getAuthToken();
  }

  static getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  static async getMoviesWithLocation() {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Add cache busting parameter to ensure fresh data
      const url = `${ENDPOINTS.STORIES_WITH_LOCATION}&_t=${Date.now()}`;

      console.log("Fetching movies with location from:", url);
      console.log("Headers:", headers);

      const response = await fetch(url, {
        headers,
        cache: "no-cache", // Disable caching
      });

      console.log("Response status for location movies:", response.status);
      const responseJson = await response.json();
      console.log("Movies with location API response:", responseJson);

      if (!response.ok) {
        throw new Error(
          responseJson.message || "Failed to fetch movies with location"
        );
      }

      return responseJson.listStory || [];
    } catch (error) {
      console.error("Error fetching movies with location:", error);
      throw error;
    }
  }

  static setRefreshFlag() {
    localStorage.setItem("shouldRefreshMovies", "true");
  }

  static checkAndClearRefreshFlag() {
    const shouldRefresh = localStorage.getItem("shouldRefreshMovies");
    if (shouldRefresh) {
      localStorage.removeItem("shouldRefreshMovies");
      return true;
    }
    return false;
  }
}

export default MovieAPI;
