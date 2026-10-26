# Bagi Rata — web app untuk iPhone

Folder ini berisi aplikasi Bagi Rata versi web yang bisa dipasang di iPhone lewat "Add to Home Screen".

| File | Isi |
|---|---|
| `index.html` | Aplikasinya (semua tampilan dan hitungan) |
| `manifest.webmanifest` | Nama, warna, dan icon saat dipasang di layar utama |
| `sw.js` | Supaya aplikasi tetap terbuka walau tanpa internet |
| `icons/` | Icon BR untuk layar utama iPhone dan Android |

## Cara pasang di iPhone

1. Buka link aplikasi di **Safari**.
2. Ketuk tombol **Share** (kotak dengan panah ke atas).
3. Pilih **Add to Home Screen**, lalu ketuk **Add**.
4. Icon BR muncul di layar utama, dan aplikasi terbuka layar penuh.

Data tiap orang (pemain, biaya, tema, bahasa) tersimpan di HP masing-masing.

## Hosting

Aplikasi ini hanya terdiri dari file statis, jadi bisa dipasang gratis di GitHub Pages:
repo → Settings → Pages → Deploy from a branch → `main` / root.
