# Panduan Desain Bagi Rata

Acuan tampilan aplikasi Bagi Rata. Disusun 26 Oktober 2026 dari icon BR dan mockup iPhone yang sudah disetujui.

Mockup interaktif: https://claude.ai/artifact/EWQwWxcidMEcT5BV6aMee3

## Isi folder

| Folder / file | Isi |
|---|---|
| `icon/Logo_BagiRata.jpeg` | Icon (sejak 28 Okt 2026): huruf BR putih dengan kaki R kuning di atas biru navy |
| `icon/Logo_BagiRata-rumput.jpeg` | Icon lama: huruf BR putih kapur di atas rumput |
| `icon/icon-1024.png`, `icon-180.png`, `icon-120.png` | Ukuran untuk App Store (1024) dan layar iPhone (180, 120) |
| `textures/` | Tekstur latar untuk tiap tema lapangan, bisa diulang tanpa sambungan |
| `tokens.json` | Semua angka desain (warna, font, ukuran, radius) dalam format yang bisa dibaca developer |
| `mockups/bagi-rata-iphone.html` | Mockup iPhone final, bisa dibuka di browser |
| `mockups/bagi-rata.html` | Mockup versi komputer (alat hitung) |

## Arah desain

Diambil dari icon: lapangan tenis sungguhan, garis kapur putih, dan huruf tebal yang membulat. Layar berlatar permukaan lapangan, dan semua isian ada di kartu polos supaya tetap mudah dibaca.

## Huruf

- **Outfit** (tebal 700–800) untuk judul layar, angka besar, dan tombol utama. Bentuknya mirip huruf BR di icon.
- **Plus Jakarta Sans** (400–700) untuk semua teks lain. Huruf ini dibuat oleh desainer Indonesia.
- Keduanya gratis di Google Fonts.

| Elemen | Huruf | Ukuran | Tebal |
|---|---|---|---|
| Judul layar | Outfit | 32 | 800 |
| Judul bagian (huruf besar) | Outfit | 13 | 700 |
| Teks isian | Plus Jakarta Sans | 17 | 400 |
| Angka total di bar bawah | Outfit | 19 | 700 |
| Catatan kecil | Plus Jakarta Sans | 13 | 500 |

## Warna

**Putih kapur `#f4f2ea`** dipakai untuk garis lapangan, judul di atas latar lapangan, dan bingkai bar total.

### Tema lapangan (bisa dipilih di Setelan)

| Tema | Permukaan | Gelap | Utama | Terang | Header | Aksen (terang / gelap) |
|---|---|---|---|---|---|---|
| Wimbledon (bawaan) | Rumput + garis potongan diagonal | `#193e0c` | `#2c580b` | `#497718` | `#193e0c` | `#3a7012` / `#8cc63f` |
| Roland-Garros | Tanah liat | `#6e2a10` | `#b4512a` | `#c8693c` | `#7a3014` | `#a8431d` / `#f2925f` |
| Australian Open | Hard court | `#0b3d70` | `#1766b3` | `#3080cb` | `#0d4a86` | `#1462ad` / `#6ab4ff` |
| US Open | Hard court, area luar hijau | `#1c3a62` | `#2e5c90` | `#4170a6` | `#4c7d43` | `#2a5a8f` / `#82b6ee` |

Aksen dipakai untuk tombol pilihan yang aktif, nama yang dipilih, sakelar, link "+ Tambah", dan tombol "Kirim ke WhatsApp".

### Warna dasar

| | Mode terang | Mode gelap |
|---|---|---|
| Kartu | `#ffffff` | `#1b1e1c` |
| Teks | `#16201a` | `#eef2ee` |
| Teks pudar | `#69736c` | `#9ba39d` |
| Garis pemisah | `#dde2dc` | `#323833` |
| Hapus / bahaya | `#c8372d` | `#ff6b5e` |

## Elemen

- **Header:** tekstur lapangan yang digelapkan, icon BR 48×48 dengan bingkai kapur, judul dan subjudul, tombol Setelan (roda gigi) di kanan, dan satu garis kapur 3px di bawahnya.
- **Latar layar:** tekstur lapangan dengan lapisan gelap 22% (mode terang) atau 55% (mode gelap). Khusus rumput ditambah garis potongan diagonal.
- **Kartu:** putih polos, sudut 16, tinggi baris minimal 44, jarak tepi 16. Semua isian harus di dalam kartu.
- **Judul bagian:** huruf besar putih kapur dengan bayangan tipis, langsung di atas latar lapangan.
- **Catatan:** teks putih di atas kotak gelap transparan (32%), sudut 10.
- **Tombol pilihan:** gaya iOS. Yang aktif berwarna aksen dengan teks putih.
- **Nama pemain (chip):** bentuk kapsul. Yang dipilih berwarna aksen.
- **Bar total:** di atas tab bar, warna gelap tema dengan bingkai garis kapur ganda, angka pakai Outfit.
- **Tab bar:** 5 tab (Sesi, Pemain, Biaya, Makanan, Tagihan). Yang aktif berwarna aksen.
- **Pesan WhatsApp:** gelembung hijau ala WhatsApp, isi persis sesuai format pesan.

## Bahasa dan angka

- Bahasa Indonesia (bawaan) dan English. Di versi English, "rb" jadi "k" dan nama hari dalam bahasa Inggris.
- Rupiah ditulis dengan titik ribuan (600.000) yang muncul otomatis saat mengetik.

## Format pesan WhatsApp

```
COS Match #4 (Home)

VS TDP

Sabtu, 17 Oct
📍Nordic Ancol (Lapangan 2)
18:00-22:00

Adrian - 224rb
...

BCA 6300102008 a/n Winarto Kusuma
```

## Tema Default (27 Okt 2026)

Tema kelima di Setelan bernama **Default**, diambil dari design system Court Finder (https://claude.ai/artifact/DeV1LpMb9decq1zCzv855C). Hanya berlaku saat tema ini dipilih; empat tema Grand Slam tidak berubah.

- Gaya soft UI: kartu "menonjol" dan isian "tertekan ke dalam", tanpa garis tepi dan tanpa tekstur lapangan.
- Warna: navy `#14234f` (kartu dan latar), `#101d44` (isian), bayangan `#1c3066` / `#0b1534`, teks `#f5f7fc`, teks pudar `#8e9cc6`, satu aksen kuning `#fbc02d`.
- Huruf judul: Exo 2 miring (italic), sama seperti logo Court Finder.

## Tampilan Terpandu dan Standar (27 Okt 2026)

Satu aplikasi dengan dua tampilan. Tombol dua ikon di sebelah roda gigi (dan pilihan "Tampilan" di Setelan) mengganti antara:

- **Terpandu:** satu halaman per langkah (Pertandingan, Waktu & Tempat, Pembayaran, Pemain, Biaya, Makanan, Tagihan), dengan tombol Kembali/Lanjut dan garis kemajuan di atas.
- **Standar (bawaan):** lima tab di bawah (Sesi, Pemain, Biaya, Makanan, Tagihan).

Datanya sama, jadi berganti tampilan tidak menghapus isian.

## Bentuk soft UI di semua tema (27 Okt 2026)

Bentuk elemen dari tema Default sekarang dipakai di semua tema. Warna tiap tema tetap.

- Kartu berwarna sama dengan lapangan (warna "Utama" tema) dan terlihat menonjol. Bayangan terang memakai warna "Terang", bayangan gelap memakai warna "Gelap".
- Kotak isian, tombol pilihan, stepper, dan chip terlihat tertekan ke dalam, dengan warna sedikit lebih gelap dari kartu.
- Huruf judul dan label: Exo 2 tebal (judul miring). Isian dan teks lain: huruf sistem iPhone (SF).
- Aksen tetap warna aksen gelap tiap tema. Kalau aksen kurang terbaca sebagai teks di atas kartu, otomatis dibuat lebih terang sampai kontrasnya minimal 4.5:1.
- Khusus tema Default: header polos tanpa garis kapur, dan catatan tanpa kotak gelap.
