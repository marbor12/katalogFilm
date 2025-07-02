# MVP Architecture Implementation

## Gambaran Umum

Proyek ini telah diimplementasikan menggunakan pola arsitektur **Model-View-Presenter (MVP)** untuk memisahkan tanggung jawab dan meningkatkan maintainability kode. Implementasi ini memastikan pemisahan yang jelas antara logika bisnis, presentasi, dan akses data.

## Struktur MVP

### 1. Model (Data Layer)

**Lokasi**: `src/scripts/data/`

- **MovieAPI** (`movie-api.js`): Mengelola semua operasi data terkait film
  - `getAllMovies()`: Mengambil daftar semua film
  - `getMovieDetail(id)`: Mengambil detail film berdasarkan ID
  - `addMovie(movieData)`: Menambah film baru
  - `login(email, password)`: Autentikasi login
  - `register(name, email, password)`: Registrasi pengguna baru
  - `logout()`: Logout pengguna
  - `getAuthToken()`: Mengambil token autentikasi
  - `isLoggedIn()`: Mengecek status login
  - `getCurrentUser()`: Mengambil data pengguna aktif

### 2. View (Presentation Layer)

**Lokasi**: `src/scripts/pages/`

View bertanggung jawab untuk:

- Rendering UI components
- Event handling (user interactions)
- Menampilkan data yang diterima dari Presenter
- **TIDAK** mengandung logika bisnis

#### Pages yang Diimplementasikan:

- **HomePage** (`home/home-page.js`)
- **MoviesPage** (`movies/movies-page.js`)
- **AddMoviePage** (`add-movie/add-movie-page.js`)
- **MovieDetailPage** (`movie-detail/movie-detail-page.js`)
- **LoginPage** (`auth/login-page.js`)
- **RegisterPage** (`auth/register-page.js`)

### 3. Presenter (Business Logic Layer)

**Lokasi**: `src/scripts/presenters/`

Presenter bertanggung jawab untuk:

- Menghubungkan View dan Model
- Mengandung logika bisnis
- Validasi data
- Error handling
- State management

#### Presenters yang Diimplementasikan:

##### BasePresenter (`base-presenter.js`)

- Kelas dasar untuk semua presenter
- Menyediakan metode common seperti error handling
- Konsistensi dalam implementasi MVP pattern

##### MoviesPresenter (`movies-presenter.js`)

- Mengelola logika untuk halaman daftar film
- Methods:
  - `init()`: Inisialisasi dan load movies
  - `loadMovies()`: Load data dari API
  - `onMovieDetailClick(movieId)`: Handle navigasi ke detail
  - `onRetryClick()`: Handle retry saat error
  - `getFormattedMovieData(movie)`: Format data untuk view

##### AddMoviePresenter (`add-movie-presenter.js`)

- Mengelola logika penambahan film baru
- Methods:
  - `onFormSubmit(formData)`: Handle submit form
  - `validateFormData(formData)`: Validasi data form
  - `onPhotoCaptured(photoBlob)`: Handle foto yang diambil
  - `onLocationSelected(location)`: Handle pemilihan lokasi
  - `onFieldValidation(fieldName, value)`: Real-time validation

##### MovieDetailPresenter (`movie-detail-presenter.js`)

- Mengelola logika halaman detail film
- Methods:
  - `init(movieId)`: Load detail film berdasarkan ID
  - `loadMovieDetail()`: Mengambil data dari API
  - `onShareMovie()`: Handle sharing film
  - `onBackToMovies()`: Navigate kembali ke daftar

##### AuthPresenter (`auth-presenter.js`)

- Mengelola logika autentikasi (login & register)
- Methods:
  - `onLogin(loginData)`: Handle proses login
  - `onRegister(registerData)`: Handle proses registrasi
  - `validateLoginData(loginData)`: Validasi data login
  - `validateRegisterData(registerData)`: Validasi data registrasi
  - `onLogout()`: Handle logout

## Implementasi Pattern

### Cara Kerja MVP dalam Proyek

1. **View** menerima user input dan memanggil method yang sesuai di **Presenter**
2. **Presenter** memproses logika bisnis dan validasi
3. **Presenter** memanggil **Model** untuk operasi data
4. **Presenter** mengupdate **View** dengan hasil yang diperoleh

### Contoh Flow: Menambah Film Baru

```javascript
// 1. User submit form di AddMoviePage (View)
async handleSubmit(e) {
  const formData = new FormData(e.target);
  await this.presenter.onFormSubmit(formData); // Panggil Presenter
}

// 2. AddMoviePresenter memproses dan validasi
async onFormSubmit(formData) {
  if (!this.validateFormData(formData)) {
    this.view.showValidationErrors(this.validationErrors);
    return;
  }

  const movieData = this.prepareMovieData(formData);
  const result = await this.model.addMovie(movieData); // Panggil Model

  this.view.showSuccess('Film berhasil ditambahkan!'); // Update View
}

// 3. MovieAPI (Model) melakukan API call
static async addMovie(movieData) {
  const response = await fetch(ENDPOINTS.ADD_STORY, {
    method: "POST",
    body: formData,
    headers
  });
  return responseJson;
}
```

## Keuntungan Implementasi MVP

### 1. Separation of Concerns

- **Model**: Fokus pada data dan API calls
- **View**: Fokus pada UI rendering dan user interactions
- **Presenter**: Fokus pada logika bisnis dan koordinasi

### 2. Testability

- Presenter dapat di-unit test secara independen
- Mock dependencies untuk testing
- Validasi logika bisnis terpisah dari UI

### 3. Maintainability

- Perubahan pada satu layer tidak mempengaruhi layer lain
- Kode lebih terorganisir dan mudah dibaca
- Reusability komponen

### 4. Scalability

- Mudah menambah fitur baru
- Pattern yang konsisten
- Struktur yang jelas untuk development tim

## Panduan Development

### Menambah Fitur Baru

1. **Buat Model** (jika diperlukan) di `data/`
2. **Buat Presenter** di `presenters/` yang extends `BasePresenter`
3. **Buat/Update View** di `pages/` yang menggunakan presenter
4. **Pastikan** View tidak mengakses Model secara langsung

### Best Practices

1. **View** hanya boleh:

   - Render UI
   - Handle DOM events
   - Memanggil methods presenter
   - Menampilkan data dari presenter

2. **Presenter** harus:

   - Mengandung semua logika bisnis
   - Melakukan validasi
   - Menghandle error
   - Mengkoordinasi Model dan View

3. **Model** fokus pada:
   - API calls
   - Data transformation
   - Caching (jika diperlukan)

## Error Handling

Implementasi MVP ini menggunakan consistent error handling:

```javascript
// Di BasePresenter
handleError(error, fallbackMessage = 'Terjadi kesalahan yang tidak diketahui') {
  console.error('Presenter error:', error);
  const errorMessage = error.message || fallbackMessage;
  this.view.showError(errorMessage);
}
```

Setiap presenter menggunakan method ini untuk error handling yang konsisten di seluruh aplikasi.

## Validasi Data

Validasi dilakukan di layer Presenter untuk memastikan:

- Data yang diterima dari View valid
- Business rules terpenuhi
- Error messages yang konsisten

Contoh validasi:

```javascript
validateFormData(formData) {
  this.validationErrors = {};
  let isValid = true;

  if (!formData.get('description')?.trim()) {
    this.validationErrors.description = 'Deskripsi harus diisi';
    isValid = false;
  }

  return isValid;
}
```

## Kesimpulan

Implementasi MVP pattern ini memastikan:

- ✅ **Separation of Concerns**: Setiap layer memiliki tanggung jawab yang jelas
- ✅ **No Business Logic in Views**: View hanya handle presentation
- ✅ **Centralized Business Logic**: Semua logika bisnis ada di Presenter
- ✅ **Testable Architecture**: Presenter dapat di-test secara independen
- ✅ **Maintainable Code**: Struktur yang jelas dan terorganisir

Proyek ini sekarang mengikuti prinsip MVP architecture dengan benar dan siap untuk development dan maintenance jangka panjang.
