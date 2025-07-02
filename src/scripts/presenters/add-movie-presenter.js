import BasePresenter from "./base-presenter.js";
import MovieAPI from "../data/movie-api.js";

/**
 * Add Movie Presenter - handles the logic for adding new movies
 * Mediates between AddMoviePage (View) and MovieAPI (Model)
 */
export default class AddMoviePresenter extends BasePresenter {
  constructor(view) {
    super(view, MovieAPI);
    this.selectedLocation = null;
    this.capturedPhoto = null;
    this.validationErrors = {};
  }

  async init() {
    this.view.initializeForm();
  }
  async onFormSubmit(formData) {
    try {
      const isLoggedIn = this.model.isLoggedIn();

      if (!isLoggedIn) {
        this.view.showError("submit-error", "Anda harus login terlebih dahulu");
        return;
      }

      if (!this.validateFormData(formData)) {
        this.view.showValidationErrors(this.validationErrors);
        return;
      }

      this.view.showLoading();

      const movieData = this.prepareMovieData(formData);

      const result = await this.model.addMovie(movieData);

      this.view.showSuccess("Film berhasil ditambahkan!");
      this.model.setRefreshFlag();

      this.view.delayNavigation(() => {
        this.view.navigateToMovies();
      }, 2000);
    } catch (error) {
      const errorMessage = error.message || "Gagal menambahkan film";
      this.view.showError("submit-error", errorMessage);
    } finally {
      this.view.hideLoading();
    }
  }

  validateFormData(formData) {
    this.validationErrors = {};
    let isValid = true;

    const title = formData.get("title");
    if (!title || title.trim().length === 0) {
      this.validationErrors.title = "Judul film harus diisi";
      isValid = false;
    } else if (title.trim().length < 3) {
      this.validationErrors.title = "Judul film minimal 3 karakter";
      isValid = false;
    }

    const description = formData.get("description");
    if (!description || description.trim().length === 0) {
      this.validationErrors.description = "Deskripsi film harus diisi";
      isValid = false;
    } else if (description.trim().length < 10) {
      this.validationErrors.description = "Deskripsi film minimal 10 karakter";
      isValid = false;
    }

    if (!this.capturedPhoto) {
      this.validationErrors.photo = "Foto film harus diambil";
      isValid = false;
    }

    return isValid;
  }

  prepareMovieData(formData) {
    const title = formData.get("title");
    const description = formData.get("description");

    const fullDescription = `${title}\n\n${description}`;

    const movieData = {
      description: fullDescription,
      photo: this.capturedPhoto,
    };

    // Pastikan field lokasi yang dikirim adalah lat dan lon
    if (
      this.selectedLocation &&
      this.selectedLocation.lat &&
      this.selectedLocation.lon
    ) {
      movieData.lat = parseFloat(this.selectedLocation.lat);
      movieData.lon = parseFloat(this.selectedLocation.lon);
    }

    return movieData;
  }

  onPhotoCaptured(photoBlob) {
    this.capturedPhoto = photoBlob;
    this.view.showPhotoPreview(photoBlob);

    if (this.validationErrors.photo) {
      delete this.validationErrors.photo;
      this.view.clearValidationError("photo");
    }
  }

  onPhotoRetake() {
    this.capturedPhoto = null;
    this.view.showCameraView();
  }

  onLocationSelected(location) {
    this.selectedLocation = location;
    this.view.updateLocationDisplay(location);
  }

  /**
   * Handle camera initialization
   */
  async onCameraInit() {
    try {
      await this.view.startCamera();
    } catch (error) {
      this.view.showError("photo-error", "Gagal mengaktifkan kamera");
    }
  }

  onFieldValidation(fieldName, value) {
    if (fieldName === "title") {
      if (value.trim().length === 0) {
        this.validationErrors.title = "Judul film harus diisi";
      } else if (value.trim().length < 3) {
        this.validationErrors.title = "Judul film minimal 3 karakter";
      } else {
        delete this.validationErrors.title;
      }

      this.view.updateFieldValidation(fieldName, this.validationErrors.title);
    } else if (fieldName === "description") {
      if (value.trim().length === 0) {
        this.validationErrors.description = "Deskripsi film harus diisi";
      } else if (value.trim().length < 10) {
        this.validationErrors.description =
          "Deskripsi film minimal 10 karakter";
      } else {
        delete this.validationErrors.description;
      }

      this.view.updateFieldValidation(
        fieldName,
        this.validationErrors.description
      );
    }
  }

  destroy() {
    this.selectedLocation = null;
    this.capturedPhoto = null;
    this.validationErrors = {};
  }
}
