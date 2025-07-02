/**
 * Base Presenter class that defines the common interface for all presenters
 * This class serves as the foundation for the MVP pattern implementation
 */
export default class BasePresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  /**
   * Initialize the presenter
   * This method should be overridden by concrete presenters
   */
  async init() {
    throw new Error("init() method must be implemented by concrete presenter");
  }

  /**
   * Handle errors consistently across all presenters
   * @param {Error} error - The error to handle
   * @param {string} fallbackMessage - Fallback message if error has no message
   */
  handleError(
    error,
    fallbackMessage = "Terjadi kesalahan yang tidak diketahui"
  ) {
    const errorMessage = error.message || fallbackMessage;
    this.view.showError(errorMessage);
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.view.showLoading) {
      this.view.showLoading();
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    if (this.view.hideLoading) {
      this.view.hideLoading();
    }
  }

  /**
   * Clean up resources when presenter is destroyed
   */
  destroy() {
    // Override in concrete presenters if cleanup is needed
  }
}
