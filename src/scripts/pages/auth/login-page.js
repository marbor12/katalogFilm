import AuthPresenter from "../../presenters/auth-presenter";
import ViewTransition from "../../utils/view-transition";

class LoginPage {
  constructor() {
    this.presenter = new AuthPresenter(this);
  }
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <i class="fas fa-sign-in-alt auth-icon" aria-hidden="true"></i>
            <h1>Masuk ke Akun</h1>
            <p>Silakan masuk untuk mengakses fitur lengkap aplikasi</p>
          </div>
          
          <form id="login-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="email" class="form-label">
                <i class="fas fa-envelope" aria-hidden="true"></i>
                Email
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input" 
                placeholder="Masukkan email Anda"
                required
                autocomplete="email"
              >
              <div class="error-message" id="email-error" role="alert"></div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">
                <i class="fas fa-lock" aria-hidden="true"></i>
                Password
              </label>
              <div class="password-input-wrapper">
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  class="form-input" 
                  placeholder="Masukkan password Anda"
                  required
                  autocomplete="current-password"
                >
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <i class="fas fa-eye" aria-hidden="true"></i>
                </button>
              </div>
              <div class="error-message" id="password-error" role="alert"></div>
            </div>

            <button type="submit" class="btn btn-primary btn-full" id="login-btn">
              <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
              Masuk
            </button>
          </form>

          <div class="auth-footer">
            <p>Belum punya akun? <a href="#/register" class="auth-link">Daftar di sini</a></p>
          </div>

          <div id="login-message" class="message-container" role="alert" aria-live="polite"></div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.presenter.init();
    this._setupEventListeners();
    this._setupPasswordToggle();
    this._setupFormValidation();
  }

  /**
   * Navigate to home page (called by presenter)
   */
  navigateToHome() {
    ViewTransition.transitionTo(() => {
      window.location.hash = "#/";
    });
  }

  /**
   * Navigate to register page (called by presenter)
   */
  navigateToLogin() {
    // Already on login page
  }

  /**
   * Handle delayed navigation (replaces setTimeout in presenter)
   */
  delayNavigation(callback, delay) {
    setTimeout(callback, delay);
  }

  /**
   * Show validation errors (called by presenter)
   */
  showValidationErrors(errors) {
    Object.keys(errors).forEach((field) => {
      const errorElement = document.getElementById(`${field}-error`);
      if (errorElement) {
        this._showError(errorElement, errors[field]);
      }
    });
  }

  /**
   * Update field validation (called by presenter)
   */
  updateFieldValidation(fieldName, errorMessage) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
      if (errorMessage) {
        this._showError(errorElement, errorMessage);
      } else {
        this._clearError(`${fieldName}-error`);
      }
    }
  }

  /**
   * Show success message (called by presenter)
   */
  showSuccess(message) {
    const messageContainer = document.getElementById("login-message");
    messageContainer.innerHTML = `
      <div class="message success">
        <i class="fas fa-check-circle" aria-hidden="true"></i>
        ${message}
      </div>
    `;
  }

  /**
   * Show error message (called by presenter)
   */
  showError(message) {
    const messageContainer = document.getElementById("login-message");
    messageContainer.innerHTML = `
      <div class="message error">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        ${message}
      </div>
    `;
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

  _setupEventListeners() {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this._handleLogin(event);
    });
  }

  _setupPasswordToggle() {
    const toggleButton = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    toggleButton.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      const icon = toggleButton.querySelector("i");
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  }

  _setupFormValidation() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    emailInput.addEventListener("blur", () => {
      this.presenter.onFieldValidation("email", emailInput.value, "login");
    });
    passwordInput.addEventListener("blur", () => {
      this.presenter.onFieldValidation(
        "password",
        passwordInput.value,
        "login"
      );
    });

    // Clear errors on input
    emailInput.addEventListener("input", () => this._clearError("email-error"));
    passwordInput.addEventListener("input", () =>
      this._clearError("password-error")
    );
  }

  async _handleLogin(event) {
    const formData = new FormData(event.target);
    const loginData = {
      email: formData.get("email").trim(),
      password: formData.get("password"),
    };

    const loginBtn = document.getElementById("login-btn");

    try {
      // Show loading state
      loginBtn.disabled = true;
      loginBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Masuk...';

      await this.presenter.onLogin(loginData);
    } finally {
      // Reset button
      loginBtn.disabled = false;
      loginBtn.innerHTML =
        '<i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk';
    }
  }

  _showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }

  _clearError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none";
    }
  }

  destroy() {
    if (this.presenter) {
      this.presenter.destroy();
    }
  }
}

export default LoginPage;
