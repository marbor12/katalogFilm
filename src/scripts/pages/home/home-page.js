import ViewTransition from "../../utils/view-transition"

export default class HomePage {
  async render() {
    return `
      <div class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Selamat Datang di Katalog Film Indonesia</h1>
            <p class="hero-description">
              Temukan dan bagikan cerita film-film terbaik Indonesia. 
              Jelajahi koleksi film dari berbagai daerah dan tambahkan film favorit Anda.
            </p>
            <div class="hero-actions">
              <a href="#/movies" class="btn btn-primary">
                <i class="fas fa-film" aria-hidden="true"></i>
                Jelajahi Film
              </a>
              <a href="#/add-movie" class="btn btn-secondary">
                <i class="fas fa-plus" aria-hidden="true"></i>
                Tambah Film
              </a>
            </div>
          </div>
        </div>
      </div>

      <section class="features-section">
        <div class="container">
          <h2 class="section-title">Fitur Unggulan</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
              </div>
              <h3>Peta Lokasi</h3>
              <p>Lihat lokasi syuting film-film Indonesia di peta interaktif</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-camera" aria-hidden="true"></i>
              </div>
              <h3>Upload Foto</h3>
              <p>Ambil foto langsung dengan kamera untuk menambah film baru</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-mobile-alt" aria-hidden="true"></i>
              </div>
              <h3>Responsif</h3>
              <p>Akses aplikasi dengan nyaman di berbagai perangkat</p>
            </div>
          </div>
        </div>
      </section>
    `
  }

  async afterRender() {
    // Add smooth scroll behavior for hero buttons
    const buttons = document.querySelectorAll(".hero-actions .btn")
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        ViewTransition.transitionTo(() => {
          // Navigation will be handled by the router
        })
      })
    })
  }
}
