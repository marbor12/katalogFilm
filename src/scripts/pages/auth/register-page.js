import AuthPresenter from "../../presenters/auth-presenter";
import ViewTransition from "../../utils/view-transition";

class RegisterPage {
  constructor() {
    this.presenter = new AuthPresenter(this);
  }
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <i class="fas fa-user-plus auth-icon" aria-hidden="true"></i>
            <h1>Daftar Akun Baru</h1>
            <p>Bergabunglah dengan komunitas pecinta film Indonesia</p>
          </div>
          
          <form id="register-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="name" class="form-label">
                <i class="fas fa-user" aria-hidden="true"></i>
                Nama Lengkap
              </label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-input" 
                placeholder="Masukkan nama lengkap Anda"
                required
                autocomplete="name"
              >
              <div class="error-message" id="name-error" role="alert"></div>
            </div>

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
                  placeholder="Masukkan password (minimal 8 karakter)"
                  required
                  autocomplete="new-password"
                >
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <i class="fas fa-eye" aria-hidden="true"></i>
                </button>
              </div>
              <div class="error-message" id="password-error" role="alert"></div>
              <div class="form-hint">
                Password harus minimal 8 karakter
              </div>
            </div>

            <div class="form-group">
              <label for="confirm-password" class="form-label">
                <i class="fas fa-lock" aria-hidden="true"></i>
                Konfirmasi Password
              </label>
              <div class="password-input-wrapper">
                <input 
                  type="password" 
                  id="confirm-password" 
                  name="confirm-password" 
                  class="form-input" 
                  placeholder="Masukkan ulang password Anda"
                  required
                  autocomplete="new-password"
                >
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <i class="fas fa-eye" aria-hidden="true"></i>
                </button>
              </div>
              <div class="error-message" id="confirm-password-error" role="alert"></div>
            </div>

            <button type="submit" class="btn btn-primary btn-full" id="register-btn">
              <i class="fas fa-user-plus" aria-hidden="true"></i>
              Daftar
            </button>
          </form>

          <div class="auth-footer">
            <p>Sudah punya akun? <a href="#/login" class="auth-link">Masuk di sini</a></p>
          </div>

          <div id="register-message" class="message-container" role="alert" aria-live="polite"></div>
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
   * Navigate to login page (called by presenter)
   */
  navigateToLogin() {
    ViewTransition.transitionTo(() => {
      window.location.hash = "#/login";
    });
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
    const messageContainer = document.getElementById("register-message");
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
    const messageContainer = document.getElementById("register-message");
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

  /**
   * Get password field value (called by presenter)
   */
  getPasswordValue() {
    const passwordField = document.getElementById("password");
    return passwordField ? passwordField.value : null;
  }

  _setupEventListeners() {
    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this._handleRegister(event);
    });
  }

  _setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll(".toggle-password");

    toggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const passwordInput = button.previousElementSibling;
        const type =
          passwordInput.getAttribute("type") === "password"
            ? "text"
            : "password";
        passwordInput.setAttribute("type", type);

        const icon = button.querySelector("i");
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      });
    });
  }

  _setupFormValidation() {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    nameInput.addEventListener("blur", () => {
      this.presenter.onFieldValidation("name", nameInput.value, "register");
    });
    emailInput.addEventListener("blur", () => {
      this.presenter.onFieldValidation("email", emailInput.value, "register");
    });
    passwordInput.addEventListener("blur", () => {
      this.presenter.onFieldValidation(
        "password",
        passwordInput.value,
        "register"
      );
    });
    confirmPasswordInput.addEventListener("blur", () => {
      // Use the standard field validation method
      this.presenter.onFieldValidation(
        "confirmPassword",
        confirmPasswordInput.value,
        "register"
      );
    });

    // Clear errors on input
    nameInput.addEventListener("input", () => this._clearError("name-error"));
    emailInput.addEventListener("input", () => this._clearError("email-error"));
    passwordInput.addEventListener("input", () =>
      this._clearError("password-error")
    );
    confirmPasswordInput.addEventListener("input", () =>
      this._clearError("confirm-password-error")
    );
  }

  async _handleRegister(event) {
    const formData = new FormData(event.target);
    const registerData = {
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      password: formData.get("password"),
      confirmPassword: formData.get("confirm-password"),
    };

    const registerBtn = document.getElementById("register-btn");

    try {
      // Show loading state
      registerBtn.disabled = true;
      registerBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Mendaftar...';

      await this.presenter.onRegister(registerData);
    } finally {
      // Reset button
      registerBtn.disabled = false;
      registerBtn.innerHTML =
        '<i class="fas fa-user-plus" aria-hidden="true"></i> Daftar';
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

export default RegisterPage;
