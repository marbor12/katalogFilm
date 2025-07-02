# Katalog Film - GitHub Pages Deployment

## Permasalahan Umum dan Solusinya

Jika Anda menghadapi masalah dengan deployment GitHub Pages di mana hanya navbar dan footer yang tampil, berikut adalah beberapa solusi yang telah diterapkan:

### 1. Path Base URL

GitHub Pages menghosting aplikasi di subpath berdasarkan nama repository (misalnya: `/katalogFilm/`), bukan di root domain. Solusi:

- Tambahkan tag `<base href="/katalogFilm/">` di `index.html`
- Ubah `publicPath` di webpack menjadi `/katalogFilm/` 
- Perbarui semua URL di `manifest.json` dengan prefix `/katalogFilm/`

### 2. Service Worker Registration

Service worker harus diregistrasi dengan path yang benar. Solusi:

- Gunakan path relatif di `registerServiceWorker()` di `index.js`
- Pastikan file service worker tersedia di path yang diharapkan

### 3. Routing SPA

Hash routing (`#/route`) bekerja lebih baik dengan GitHub Pages. Solusi:

- Gunakan hash routing (seperti yang sudah diimplementasikan)
- Tambahkan file `404.html` dengan redirect script

### 4. Cache Issues

Service worker mungkin menyimpan versi lama. Solusi:

- Implementasi fungsi `unregisterOldServiceWorkers()` untuk unregister service worker lama
- Bersihkan cache untuk memastikan konten terbaru

## Cara Menguji

1. Buka aplikasi di: https://marbor12.github.io/katalogFilm/
2. Buka DevTools (F12) > Console untuk memverifikasi tidak ada error
3. Periksa Network tab untuk memastikan semua resource dimuat dengan benar
4. Test offline capability dengan mematikan koneksi internet

## Troubleshooting

Jika masih mengalami masalah:

1. Bersihkan cache browser: Chrome > Settings > Privacy and Security > Clear browsing data
2. Buka aplikasi di mode Incognito/Private
3. Pastikan JavaScript diaktifkan di browser
4. Periksa Console untuk error spesifik
