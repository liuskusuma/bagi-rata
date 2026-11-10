# Bagi Rata — web app untuk iPhone

Folder ini berisi aplikasi Bagi Rata versi web yang bisa dipasang di iPhone lewat "Add to Home Screen".

| File | Isi |
|---|---|
| `index.html` | Aplikasinya (semua tampilan dan hitungan) |
| `manifest.webmanifest` | Nama, warna, dan icon saat dipasang di layar utama |
| `k.html` | Halaman klaim untuk teman yang membuka link |
| `sw.js` | Supaya aplikasi tetap terbuka walau tanpa internet |
| `icons/` | Icon BR untuk layar utama iPhone dan Android |

## Cara pasang di iPhone

1. Buka link aplikasi di **Safari**.
2. Ketuk tombol **Share** (kotak dengan panah ke atas).
3. Pilih **Add to Home Screen**, lalu ketuk **Add**.
4. Icon BR muncul di layar utama, dan aplikasi terbuka layar penuh.

Data tiap orang (pemain, biaya, tema, bahasa) tersimpan di HP masing-masing.

## Olahraga dan Split Bill

Saat aplikasi dibuka, pengguna memilih **Olahraga** (lapangan, jam main, bola atau kok, makanan; jenisnya Tenis, Padel, Bulutangkis, Pickleball, Futsal, atau Lainnya) atau **Split Bill** (hanya orang, item nota, service/pajak, dan biaya lain yang dibagi rata). Isian kedua jenis disimpan terpisah. "Ingat pilihan saya" melewati layar pilihan; jenis tagihan bisa diganti lewat tombol di header atau di Setelan.

Hitungan semua olahraga sama (lapangan dibagi per jam per orang). Olahraga yang dipilih hanya mengubah ikon, contoh judul, dan baris biaya awal: Tenis (ballboy, bola baru), Padel (bola baru, sewa raket), Bulutangkis (kok), Pickleball (bola baru), Futsal (wasit, air minum), Lainnya (hanya lapangan). Baris biaya yang belum diisi ikut berganti saat olahraga diganti; yang sudah diisi tidak diubah. Kalau judul kosong, baris pertama pesan WA memakai nama olahraganya.

## Klaim lewat link

Di halaman Makanan ada **Klaim lewat link**. Penagih membuat link dan mengirimnya ke grup WhatsApp. Teman membuka `k.html` (tanpa install), memilih nama, dan mencentang item "Per orang" yang dia pesan. Item "Dibagi" tetap diatur penagih. Klaim yang masuk otomatis mencentang nama di aplikasi penagih. Setelah tagihan dikirim ke WhatsApp, klaim ditutup dan teman bisa mengetuk "Saya sudah transfer" (boleh dengan screenshot). Penagih melihat statusnya di halaman Tagihan dan mengetuk Diterima.

Data link disimpan di Cloudflare Worker `worker/` dengan database D1 (lihat `worker/README.md`).

## Hosting

Aplikasi ini hanya terdiri dari file statis, jadi bisa dipasang gratis di GitHub Pages:
repo → Settings → Pages → Deploy from a branch → `main` / root.
