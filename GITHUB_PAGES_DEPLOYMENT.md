# Katalog Film - PWA Deployment Guide

## GitHub Pages Deployment

Untuk melakukan deploy aplikasi ini ke GitHub Pages, ikuti langkah-langkah berikut:

1. Pastikan repository GitHub sudah tersedia dan terhubung dengan repository lokal Anda.

2. Build aplikasi dan deploy ke GitHub Pages:

   ```bash
   npm run deploy:gh-pages
   ```

3. Cek pengaturan repository GitHub Anda di bagian "Settings > Pages" untuk memastikan deployment berhasil.

4. Situs Anda akan tersedia di: `https://[username].github.io/[repository-name]`

## Langkah-langkah Manual (Jika diperlukan)

1. Build aplikasi:

   ```bash
   npm run build
   ```

2. Commit dan push perubahan ke GitHub:

   ```bash
   git add .
   git commit -m "Update aplikasi untuk deployment"
   git push origin main
   ```

3. Deploy folder `dist` ke branch `gh-pages`:
   ```bash
   npm run deploy:gh-pages
   ```

## Pemecahan Masalah

Jika hanya navbar dan footer yang tampil tanpa konten utama:

1. Pastikan JavaScript tidak diblokir oleh browser atau ekstensi.
2. Buka DevTools (F12) dan periksa tab Console untuk error.
3. Coba buka dalam mode Incognito/Private.
4. Hapus cache browser Anda:

   - Chrome: Settings > Privacy and Security > Clear browsing data
   - Firefox: Options > Privacy & Security > Cookies and Site Data > Clear Data

5. Jika Anda menggunakan domain kustom, pastikan CNAME dikonfigurasi dengan benar.

## Pengujian PWA

1. Pastikan aplikasi berfungsi dalam mode offline:

   ```bash
   npm run test:pwa
   ```

2. Gunakan Chrome Lighthouse untuk menguji skor PWA:
   - Buka aplikasi di Chrome
   - Buka DevTools > Lighthouse > Generate report
