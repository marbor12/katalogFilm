import routes from "../routes/routes";
import {
  getActiveRoute,
  isValidRoute,
  getNotFoundRoute,
} from "../routes/url-parser";
import ViewTransition from "../utils/view-transition";
import AuthMiddleware from "../middleware/auth-middleware";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupAccessibility();

    // Initialize navigation based on auth status
    AuthMiddleware.updateNavigation();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      const isOpen = this.#navigationDrawer.classList.contains("open");
      this.#navigationDrawer.classList.toggle("open");

      // Update ARIA attributes
      this.#drawerButton.setAttribute("aria-expanded", !isOpen);
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
        this.#drawerButton.setAttribute("aria-expanded", "false");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
          this.#drawerButton.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Close drawer on Escape key
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        this.#navigationDrawer.classList.contains("open")
      ) {
        this.#navigationDrawer.classList.remove("open");
        this.#drawerButton.setAttribute("aria-expanded", "false");
        this.#drawerButton.focus();
      }
    });
  }

  _setupAccessibility() {
    // Focus management for skip link
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
          mainContent.focus();
        }
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    console.log("Rendering page for URL:", url);
    let page = routes[url];
    console.log("Found page component:", page ? "Yes" : "No");

    // Handle 404 - route not found
    if (!page || !isValidRoute(url, routes)) {
      console.log("Route not found, showing 404 page");
      const notFoundRoute = getNotFoundRoute();
      page = routes[notFoundRoute];
      console.log("404 page available:", page ? "Yes" : "No");

      if (!page) {
        // Fallback if 404 page doesn't exist
        console.log("No 404 page found, showing fallback message");
        this.#content.innerHTML = `
          <div class="error-state">
            <i class="fas fa-exclamation-triangle error-icon" aria-hidden="true"></i>
            <h2>Halaman Tidak Ditemukan</h2>
            <p>Halaman yang Anda cari tidak dapat ditemukan.</p>
            <a href="#/" class="btn btn-primary">
              <i class="fas fa-home" aria-hidden="true"></i>
              Kembali ke Beranda
            </a>
          </div>
        `;
        return;
      }
    }

    // Check route protection
    if (this._isProtectedRoute(url)) {
      if (!AuthMiddleware.requireAuth()) {
        return;
      }
    }

    if (this._isGuestOnlyRoute(url)) {
      if (!AuthMiddleware.requireGuest()) {
        return;
      }
    }

    // Cleanup previous page if it has a destroy method
    if (this.#currentPage && typeof this.#currentPage.destroy === "function") {
      this.#currentPage.destroy();
    }

    // Use View Transition API for smooth transitions
    await ViewTransition.transitionTo(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();

      // Update current page reference
      this.#currentPage = page;

      // Update navigation (in case auth status changed)
      AuthMiddleware.updateNavigation();

      // Update active navigation
      this._updateActiveNavigation(url);

      // Focus main content for screen readers
      this.#content.focus();
    });
  }

  _isProtectedRoute(route) {
    const protectedRoutes = ["/movies", "/add-movie", "/movie/:id"];
    return protectedRoutes.some((protectedRoute) => {
      if (protectedRoute.includes(":")) {
        // Handle dynamic routes
        const routePattern = protectedRoute.replace(/:[\w]+/g, "[^/]+");
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(route);
      }
      return protectedRoute === route;
    });
  }

  _isGuestOnlyRoute(route) {
    const guestOnlyRoutes = ["/login", "/register"];
    return guestOnlyRoutes.includes(route);
  }

  _updateActiveNavigation(currentRoute) {
    const navLinks = this.#navigationDrawer.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href").replace("#", "");
      if (href === currentRoute || (currentRoute === "/" && href === "/")) {
        link.classList.add("active");
      }
    });
  }
}

export default App;
