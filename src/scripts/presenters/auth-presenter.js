import BasePresenter from "./base-presenter.js";
import MovieAPI from "../data/movie-api.js";

/**
 * Auth Presenter - handles authentication logic for login and registration
 * Mediates between Auth pages (View) and MovieAPI (Model)
 */
export default class AuthPresenter extends BasePresenter {
  constructor(view) {
    super(view, MovieAPI);
    this.validationErrors = {};
  }

  /**
   * Initialize the presenter
   */
  async init() {
    // Check if user is already logged in
    if (this.model.isLoggedIn()) {
      this.view.navigateToHome();
    }
  }

  /**
   * Handle login form submission
   * @param {Object} loginData - Login form data {email, password}
   */
  async onLogin(loginData) {
    try {
      // Validate login data
      if (!this.validateLoginData(loginData)) {
        this.view.showValidationErrors(this.validationErrors);
        return;
      }

      this.view.showLoading();

      const result = await this.model.login(
        loginData.email,
        loginData.password
      );

      this.view.showSuccess("Login berhasil! Selamat datang kembali.");

      // Navigate to home page after successful login
      this.view.delayNavigation(() => {
        this.view.navigateToHome();
      }, 1500);
    } catch (error) {
      this.handleError(error, "Login gagal. Periksa email dan password Anda.");
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Handle registration form submission
   * @param {Object} registerData - Registration form data {name, email, password, confirmPassword}
   */
  async onRegister(registerData) {
    try {
      // Validate registration data
      if (!this.validateRegisterData(registerData)) {
        this.view.showValidationErrors(this.validationErrors);
        return;
      }

      this.view.showLoading();

      const result = await this.model.register(
        registerData.name,
        registerData.email,
        registerData.password
      );

      this.view.showSuccess(
        "Registrasi berhasil! Silakan login dengan akun Anda."
      );

      // Navigate to login page after successful registration
      this.view.delayNavigation(() => {
        this.view.navigateToLogin();
      }, 2000);
    } catch (error) {
      this.handleError(error, "Registrasi gagal. Silakan coba lagi.");
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Handle logout
   */
  onLogout() {
    try {
      this.model.logout();
      this.view.showSuccess("Anda telah logout. Sampai jumpa!");

      // Navigate to home page after logout
      this.view.delayNavigation(() => {
        this.view.navigateToHome();
      }, 1500);
    } catch (error) {
      this.handleError(error, "Terjadi kesalahan saat logout");
    }
  }

  /**
   * Validate login form data
   * @param {Object} loginData - Login data to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validateLoginData(loginData) {
    this.validationErrors = {};
    let isValid = true;

    // Validate email
    if (!loginData.email || loginData.email.trim().length === 0) {
      this.validationErrors.email = "Email harus diisi";
      isValid = false;
    } else if (!this.isValidEmail(loginData.email)) {
      this.validationErrors.email = "Format email tidak valid";
      isValid = false;
    }

    // Validate password
    if (!loginData.password || loginData.password.length === 0) {
      this.validationErrors.password = "Password harus diisi";
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validate registration form data
   * @param {Object} registerData - Registration data to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validateRegisterData(registerData) {
    this.validationErrors = {};
    let isValid = true;

    // Validate name
    if (!registerData.name || registerData.name.trim().length === 0) {
      this.validationErrors.name = "Nama harus diisi";
      isValid = false;
    } else if (registerData.name.trim().length < 2) {
      this.validationErrors.name = "Nama minimal 2 karakter";
      isValid = false;
    }

    // Validate email
    if (!registerData.email || registerData.email.trim().length === 0) {
      this.validationErrors.email = "Email harus diisi";
      isValid = false;
    } else if (!this.isValidEmail(registerData.email)) {
      this.validationErrors.email = "Format email tidak valid";
      isValid = false;
    }

    // Validate password
    if (!registerData.password || registerData.password.length === 0) {
      this.validationErrors.password = "Password harus diisi";
      isValid = false;
    } else if (registerData.password.length < 8) {
      this.validationErrors.password = "Password minimal 8 karakter";
      isValid = false;
    }

    // Validate confirm password
    if (
      !registerData.confirmPassword ||
      registerData.confirmPassword.length === 0
    ) {
      this.validationErrors.confirmPassword = "Konfirmasi password harus diisi";
      isValid = false;
    } else if (registerData.password !== registerData.confirmPassword) {
      this.validationErrors.confirmPassword =
        "Konfirmasi password tidak sesuai";
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle form field validation (real-time)
   * @param {string} fieldName - Name of the field
   * @param {string} value - Field value
   * @param {string} formType - Type of form ('login' or 'register')
   */
  onFieldValidation(fieldName, value, formType) {
    // Clear previous error for this field
    delete this.validationErrors[fieldName];

    // Validate based on field and form type
    if (fieldName === "email") {
      if (!value.trim()) {
        this.validationErrors.email = "Email harus diisi";
      } else if (!this.isValidEmail(value)) {
        this.validationErrors.email = "Format email tidak valid";
      }
    } else if (fieldName === "password") {
      if (!value) {
        this.validationErrors.password = "Password harus diisi";
      } else if (formType === "register" && value.length < 8) {
        this.validationErrors.password = "Password minimal 8 karakter";
      }
    } else if (fieldName === "name" && formType === "register") {
      if (!value.trim()) {
        this.validationErrors.name = "Nama harus diisi";
      } else if (value.trim().length < 2) {
        this.validationErrors.name = "Nama minimal 2 karakter";
      }
    } else if (fieldName === "confirmPassword" && formType === "register") {
      if (!value) {
        this.validationErrors.confirmPassword =
          "Konfirmasi password harus diisi";
      } else {
        // Get password field value for comparison from view
        const passwordValue = this.view.getPasswordValue();
        if (passwordValue && passwordValue !== value) {
          this.validationErrors.confirmPassword =
            "Konfirmasi password tidak sesuai";
        }
      }
    }

    // Update field validation in view
    this.view.updateFieldValidation(
      fieldName,
      this.validationErrors[fieldName]
    );
  }

  /**
   * Validate confirm password field specifically
   * @param {string} password - The password value
   * @param {string} confirmPassword - The confirm password value
   */
  validateConfirmPassword(password, confirmPassword) {
    delete this.validationErrors.confirmPassword;

    if (!confirmPassword) {
      this.validationErrors.confirmPassword = "Konfirmasi password harus diisi";
    } else if (password !== confirmPassword) {
      this.validationErrors.confirmPassword = "Password tidak cocok";
    }

    // Update field validation in view
    this.view.updateFieldValidation(
      "confirmPassword",
      this.validationErrors.confirmPassword
    );
  }

  /**
   * Get current user information
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    return this.model.getCurrentUser();
  }

  /**
   * Check if user is logged in
   * @returns {boolean} True if user is logged in
   */
  isLoggedIn() {
    return this.model.isLoggedIn();
  }
}
