/**
 * Not Found Page (404) - Handles unknown routes
 */
export default class NotFoundPage {
  constructor() {
    this.pageTitle = "404 - Halaman Tidak Ditemukan";
  }

  async render() {
    return `
      <div class="not-found-container">
        <div class="not-found-content">
          <div class="not-found-icon">
            <i class="fas fa-film" aria-hidden="true"></i>
            <span class="error-code">404</span>
          </div>
          
          <h1 class="not-found-title">Halaman Tidak Ditemukan</h1>
          
          <p class="not-found-message">
            Maaf, halaman yang Anda cari tidak ditemukan. 
            Mungkin URL salah atau halaman telah dipindahkan.
          </p>
          
          <div class="not-found-suggestions">
            <h3>Yang bisa Anda lakukan:</h3>
            <ul>
              <li>Periksa kembali URL yang Anda masukkan</li>
              <li>Kembali ke halaman sebelumnya</li>
              <li>Kunjungi halaman utama untuk menjelajahi film</li>
            </ul>
          </div>
          
          <div class="not-found-actions">
            <button id="goBack" class="btn btn-secondary">
              <i class="fas fa-arrow-left" aria-hidden="true"></i>
              Kembali
            </button>
            
            <a href="#/" class="btn btn-primary">
              <i class="fas fa-home" aria-hidden="true"></i>
              Halaman Utama
            </a>
            
            <a href="#/movies" class="btn btn-primary">
              <i class="fas fa-film" aria-hidden="true"></i>
              Jelajahi Film
            </a>
          </div>
          
          <div class="not-found-extras">
            <p class="suggestion-text">
              Atau gunakan pencarian untuk menemukan film yang Anda cari:
            </p>
            
            <div class="search-shortcut">
              <input 
                type="text" 
                id="quickSearch" 
                placeholder="Cari film..."
                class="search-input"
                aria-label="Pencarian cepat film"
              >
              <button id="quickSearchBtn" class="search-btn" aria-label="Cari film">
                <i class="fas fa-search" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="not-found-animation">
          <div class="floating-film">
            <i class="fas fa-film"></i>
          </div>
          <div class="floating-film delay-1">
            <i class="fas fa-video"></i>
          </div>
          <div class="floating-film delay-2">
            <i class="fas fa-camera"></i>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.bindEvents();
    this.updatePageTitle();
  }

  bindEvents() {
    // Go back button
    const goBackBtn = document.getElementById("goBack");
    if (goBackBtn) {
      goBackBtn.addEventListener("click", () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.hash = "/";
        }
      });
    }

    // Quick search functionality
    const quickSearch = document.getElementById("quickSearch");
    const quickSearchBtn = document.getElementById("quickSearchBtn");

    if (quickSearch && quickSearchBtn) {
      const performSearch = () => {
        const query = quickSearch.value.trim();
        if (query) {
          window.location.hash = `/movies?search=${encodeURIComponent(query)}`;
        } else {
          window.location.hash = "/movies";
        }
      };

      quickSearchBtn.addEventListener("click", performSearch);

      quickSearch.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          performSearch();
        }
      });

      // Focus on search input for better UX
      setTimeout(() => quickSearch.focus(), 300);
    }

    // Add some interactive animations
    this.addInteractiveAnimations();
  }

  addInteractiveAnimations() {
    const floatingFilms = document.querySelectorAll(".floating-film");

    floatingFilms.forEach((film, index) => {
      film.addEventListener("click", () => {
        film.style.transform = "scale(1.2) rotate(360deg)";
        film.style.transition = "transform 0.5s ease";

        setTimeout(() => {
          film.style.transform = "";
        }, 500);
      });
    });
  }

  updatePageTitle() {
    document.title = `${this.pageTitle} - Katalog Film Indonesia`;
  }
}
