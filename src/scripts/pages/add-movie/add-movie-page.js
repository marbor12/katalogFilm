import AddMoviePresenter from "../../presenters/add-movie-presenter";
import CameraUtils from "../../utils/camera-utils";
import MapUtils from "../../utils/map-utils";
import ViewTransition from "../../utils/view-transition";

export default class AddMoviePage {
  constructor() {
    this.presenter = new AddMoviePresenter(this);
    this.cameraUtils = new CameraUtils();
    this.mapUtils = null;
  }

  async render() {
    return `
      <section class="add-movie-section">
        <div class="container">
          <div class="page-header">
            <h1 class="page-title">
              <i class="fas fa-plus" aria-hidden="true"></i>
              Tambah Film Baru
            </h1>
            <p class="page-description">Bagikan film favorit Anda dengan komunitas</p>
          </div>

          <form id="add-movie-form" class="add-movie-form" novalidate>
            <div class="form-section">
              <h2 class="form-section-title">
                <i class="fas fa-info-circle" aria-hidden="true"></i>
                Informasi Film
              </h2>
              
              <div class="form-group">
                <label for="movie-title" class="form-label">Judul Film *</label>
                <input 
                  type="text" 
                  id="movie-title" 
                  name="title" 
                  class="form-input" 
                  required 
                  aria-describedby="title-error"
                  placeholder="Masukkan judul film"
                >
                <div id="title-error" class="error-message" role="alert"></div>
              </div>

              <div class="form-group">
                <label for="movie-description" class="form-label">Deskripsi Film *</label>
                <textarea 
                  id="movie-description" 
                  name="description" 
                  class="form-textarea" 
                  required 
                  rows="4"
                  aria-describedby="description-error"
                  placeholder="Ceritakan tentang film ini..."
                ></textarea>
                <div id="description-error" class="error-message" role="alert"></div>
              </div>
            </div>

            <div class="form-section">
              <h2 class="form-section-title">
                <i class="fas fa-camera" aria-hidden="true"></i>
                Foto Film
              </h2>
              
              <div class="camera-section">
                <div class="camera-container">
                  <video id="camera-video" class="camera-video" autoplay muted playsinline aria-label="Preview kamera"></video>
                  <div id="photo-preview" class="photo-preview" style="display: none;">
                    <img id="preview-image" src="/placeholder.svg" alt="Preview foto yang diambil" class="preview-img">
                  </div>
                </div>
                
                <div class="camera-controls">
                  <button type="button" id="start-camera-btn" class="btn btn-primary">
                    <i class="fas fa-video" aria-hidden="true"></i>
                    Aktifkan Kamera
                  </button>
                  <button type="button" id="capture-photo-btn" class="btn btn-success" style="display: none;">
                    <i class="fas fa-camera" aria-hidden="true"></i>
                    Ambil Foto
                  </button>
                  <button type="button" id="retake-photo-btn" class="btn btn-warning" style="display: none;">
                    <i class="fas fa-redo" aria-hidden="true"></i>
                    Ambil Ulang
                  </button>
                </div>
                
                <div id="photo-error" class="error-message" role="alert"></div>
              </div>
            </div>

            <div class="form-section">
              <h2 class="form-section-title">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                Lokasi Syuting
              </h2>
              
              <p class="form-help-text">Klik pada peta untuk memilih lokasi syuting film</p>
              
              <div class="map-section">
                <div id="location-map" class="location-map" role="img" aria-label="Peta untuk memilih lokasi syuting"></div>
                <div class="location-info">
                  <div id="selected-location" class="selected-location">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                    <span>Belum ada lokasi dipilih</span>
                  </div>
                </div>
              </div>
              
              <div id="location-error" class="error-message" role="alert"></div>
            </div>

            <div id="submit-error" class="error-message" role="alert" style="display: none;"></div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="history.back()">
                <i class="fas fa-arrow-left" aria-hidden="true"></i>
                Batal
              </button>
              <button type="submit" class="btn btn-primary" id="submit-btn">
                <i class="fas fa-save" aria-hidden="true"></i>
                Simpan Film
              </button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.presenter.init();
  }

  /**
   * Initialize form (called by presenter)
   */
  initializeForm() {
    console.log("initializeForm called");
    const form = document.getElementById("add-movie-form");
    if (!form) {
      console.error("Form not found!");
      return;
    }
    console.log("Form found, adding event listener");
    form.addEventListener("submit", this.handleSubmit.bind(this));

    // Add real-time validation
    const titleInput = document.getElementById("movie-title");
    const descriptionInput = document.getElementById("movie-description");

    titleInput.addEventListener("input", (e) => {
      this.presenter.onFieldValidation("title", e.target.value);
    });

    descriptionInput.addEventListener("input", (e) => {
      this.presenter.onFieldValidation("description", e.target.value);
    });

    this.initializeCamera();
    this.initializeMap();
  }

  async initializeCamera() {
    const startCameraBtn = document.getElementById("start-camera-btn");
    const capturePhotoBtn = document.getElementById("capture-photo-btn");
    const retakePhotoBtn = document.getElementById("retake-photo-btn");
    const video = document.getElementById("camera-video");

    startCameraBtn.addEventListener("click", async () => {
      await this.presenter.onCameraInit();
    });

    capturePhotoBtn.addEventListener("click", async () => {
      try {
        const photoBlob = await this.cameraUtils.capturePhoto();
        this.presenter.onPhotoCaptured(photoBlob);
        this.showCaptureControls();
        this.cameraUtils.stopCamera();
      } catch (error) {
        this.showError("photo-error", error.message);
      }
    });

    retakePhotoBtn.addEventListener("click", () => {
      this.presenter.onPhotoRetake();
    });
  }

  /**
   * Start retaking photo (called by presenter)
   */
  restartCamera() {
    this.cameraUtils.stopCamera(); // Pastikan kamera sebelumnya berhenti
    this.showCameraControls();
    this.startCamera();
  }

  /**
   * Initialize camera (called by presenter)
   */
  async startCamera() {
    const video = document.getElementById("camera-video");
    const startCameraBtn = document.getElementById("start-camera-btn");
    const capturePhotoBtn = document.getElementById("capture-photo-btn");

    await this.cameraUtils.initializeCamera(video);
    startCameraBtn.style.display = "none";
    capturePhotoBtn.style.display = "inline-flex";
    this.clearError("photo-error");
  }

  /**
   * Show camera view (called by presenter)
   */
  showCameraView() {
    const video = document.getElementById("camera-video");
    const photoPreview = document.getElementById("photo-preview");
    const startCameraBtn = document.getElementById("start-camera-btn");
    const capturePhotoBtn = document.getElementById("capture-photo-btn");
    const retakePhotoBtn = document.getElementById("retake-photo-btn");

    video.style.display = "block";
    photoPreview.style.display = "none";
    startCameraBtn.style.display = "inline-flex";
    capturePhotoBtn.style.display = "none";
    retakePhotoBtn.style.display = "none";
  }

  /**
   * Show photo preview (called by presenter)
   */
  showPhotoPreview(photoBlob) {
    const video = document.getElementById("camera-video");
    const photoPreview = document.getElementById("photo-preview");
    const previewImage = document.getElementById("preview-image");

    const imageUrl = URL.createObjectURL(photoBlob);
    previewImage.src = imageUrl;

    video.style.display = "none";
    photoPreview.style.display = "block";
  }

  showCaptureControls() {
    const capturePhotoBtn = document.getElementById("capture-photo-btn");
    const retakePhotoBtn = document.getElementById("retake-photo-btn");

    capturePhotoBtn.style.display = "none";
    retakePhotoBtn.style.display = "inline-flex";
  }

  initializeMap() {
    this.mapUtils = new MapUtils();
    this.mapUtils.initializeMap("location-map");

    this.mapUtils.addClickListener((lat, lng) => {
      this.presenter.onLocationSelected({ lat, lon: lng });
    });
  }

  /**
   * Update location display (called by presenter)
   */
  updateLocationDisplay(location) {
    const selectedLocationElement =
      document.getElementById("selected-location");
    selectedLocationElement.innerHTML = `
      <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
      <span>Lokasi: ${location.lat.toFixed(6)}, ${location.lon.toFixed(
      6
    )}</span>
    `;
    this.clearError("location-error");
  }

  async handleSubmit(e) {
    console.log("handleSubmit called");
    e.preventDefault();
    console.log("preventDefault called");
    const formData = new FormData(e.target);
    console.log("FormData created:", formData);
    console.log("Calling presenter.onFormSubmit");
    await this.presenter.onFormSubmit(formData);
    console.log("presenter.onFormSubmit completed");
  }

  /**
   * Show validation errors (called by presenter)
   */
  showValidationErrors(errors) {
    Object.keys(errors).forEach((field) => {
      this.showError(`${field}-error`, errors[field]);
    });
  }

  /**
   * Clear validation error for specific field (called by presenter)
   */
  clearValidationError(fieldName) {
    this.clearError(`${fieldName}-error`);
  }

  /**
   * Update field validation (called by presenter)
   */
  updateFieldValidation(fieldName, errorMessage) {
    if (errorMessage) {
      this.showError(`${fieldName}-error`, errorMessage);
    } else {
      this.clearError(`${fieldName}-error`);
    }
  }

  /**
   * Show success message (called by presenter)
   */
  showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-notification";
    successDiv.innerHTML = `
      <div class="success-content">
        <i class="fas fa-check-circle" aria-hidden="true"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(successDiv);

    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }

  /**
   * Navigate to movies page (called by presenter)
   */
  navigateToMovies() {
    ViewTransition.transitionTo(() => {
      window.location.hash = "#/movies";
    });
  }

  /**
   * Handle delayed navigation (replaces setTimeout in presenter)
   */
  delayNavigation(callback, delay) {
    setTimeout(callback, delay);
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none";
    }
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

  // Cleanup when leaving the page
  destroy() {
    if (this.cameraUtils) {
      this.cameraUtils.stopCamera();
    }
    if (this.mapUtils) {
      this.mapUtils.destroy();
    }
    if (this.presenter) {
      this.presenter.destroy();
    }
  }
}
