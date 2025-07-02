import MovieAPI from "../data/movie-api";

class AuthMiddleware {
  static requireAuth() {
    if (!MovieAPI.isLoggedIn()) {
      window.location.hash = "#/login";
      return false;
    }
    return true;
  }

  static requireGuest() {
    if (MovieAPI.isLoggedIn()) {
      window.location.hash = "#/";
      return false;
    }
    return true;
  }

  static updateNavigation() {
    const navList = document.getElementById("nav-list");
    if (!navList) return;

    const isLoggedIn = MovieAPI.isLoggedIn();
    const currentUser = MovieAPI.getCurrentUser();

    if (isLoggedIn) {
      // User is logged in - show authenticated navigation
      navList.innerHTML = `
        <li><a href="#/" aria-label="Halaman Beranda"><i class="fas fa-home" aria-hidden="true"></i> Beranda</a></li>
        <li><a href="#/movies" aria-label="Daftar Film"><i class="fas fa-film" aria-hidden="true"></i> Film</a></li>
        <li><a href="#/add-movie" aria-label="Tambah Film Baru"><i class="fas fa-plus" aria-hidden="true"></i> Tambah Film</a></li>
        <li><a href="#/about" aria-label="Tentang Aplikasi"><i class="fas fa-info-circle" aria-hidden="true"></i> Tentang</a></li>
        <li class="nav-user">
          <span class="user-info">
            <i class="fas fa-user" aria-hidden="true"></i>
            ${currentUser?.name || "User"}
          </span>
        </li>
        <li><a href="#" id="logout-btn" aria-label="Keluar dari Akun"><i class="fas fa-sign-out-alt" aria-hidden="true"></i> Keluar</a></li>
      `;

      // Add logout functionality
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.logout();
        });
      }
    } else {
      // User is not logged in - show guest navigation
      navList.innerHTML = `
        <li><a href="#/" aria-label="Halaman Beranda"><i class="fas fa-home" aria-hidden="true"></i> Beranda</a></li>
        <li><a href="#/about" aria-label="Tentang Aplikasi"><i class="fas fa-info-circle" aria-hidden="true"></i> Tentang</a></li>
        <li><a href="#/login" aria-label="Masuk ke Akun"><i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk</a></li>
        <li><a href="#/register" aria-label="Daftar Akun Baru"><i class="fas fa-user-plus" aria-hidden="true"></i> Daftar</a></li>
      `;
    }
  }

  static logout() {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      MovieAPI.logout();
      window.location.hash = "#/";
      this.updateNavigation();
    }
  }
}

export default AuthMiddleware;
