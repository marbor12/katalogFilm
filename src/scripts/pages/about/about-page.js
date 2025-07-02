export default class AboutPage {
  async render() {
    return `
      <section class="about-section">
        <div class="container">
          <div class="page-header">
            <h1 class="page-title">
              <i class="fas fa-info-circle" aria-hidden="true"></i>
              Tentang Katalog Film Indonesia
            </h1>
          </div>

          <div class="about-content">
            <div class="about-intro">
              <p class="lead">
                Katalog Film Indonesia adalah platform untuk mengeksplorasi dan berbagi 
                informasi tentang film-film terbaik dari berbagai daerah di Indonesia.
              </p>
            </div>

            <div class="about-features">
              <h2>Fitur Aplikasi</h2>
              <div class="features-list">
                <div class="feature-item">
                  <i class="fas fa-film" aria-hidden="true"></i>
                  <div>
                    <h3>Katalog Film</h3>
                    <p>Jelajahi koleksi film Indonesia dengan informasi lengkap dan gambar berkualitas</p>
                  </div>
                </div>
                <div class="feature-item">
                  <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                  <div>
                    <h3>Peta Interaktif</h3>
                    <p>Lihat lokasi syuting film di peta dengan marker dan popup informatif</p>
                  </div>
                </div>
                <div class="feature-item">
                  <i class="fas fa-camera" aria-hidden="true"></i>
                  <div>
                    <h3>Upload Foto</h3>
                    <p>Ambil foto langsung dengan kamera untuk menambahkan film baru</p>
                  </div>
                </div>
                <div class="feature-item">
                  <i class="fas fa-universal-access" aria-hidden="true"></i>
                  <div>
                    <h3>Aksesibilitas</h3>
                    <p>Dibangun dengan standar aksesibilitas untuk semua pengguna</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="about-tech">
              <h2>Teknologi</h2>
              <p>Aplikasi ini dibangun menggunakan:</p>
              <ul>
                <li>Single-Page Application (SPA) dengan routing hash</li>
                <li>Model-View-Presenter (MVP) architecture</li>
                <li>Leaflet untuk peta interaktif</li>
                <li>Camera API untuk pengambilan foto</li>
                <li>View Transition API untuk transisi halus</li>
                <li>Semantic HTML dan ARIA untuk aksesibilitas</li>
              </ul>
            </div>

            <div class="about-contact">
              <h2>Kontak</h2>
              <p>Untuk pertanyaan atau saran, silakan hubungi kami melalui:</p>
              <div class="contact-info">
                <div class="contact-item">
                  <i class="fas fa-envelope" aria-hidden="true"></i>
                  <span>info@katalogfilm.id</span>
                </div>
                <div class="contact-item">
                  <i class="fas fa-globe" aria-hidden="true"></i>
                  <span>www.katalogfilm.id</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `
  }

  async afterRender() {
    // Add any interactive functionality if needed
  }
}
