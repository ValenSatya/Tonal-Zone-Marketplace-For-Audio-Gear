# Tonal Zone — Struktur Menu Dashboard Admin

## 1. Dashboard / Overview
- Ringkasan angka penting: total transaksi hari ini, jumlah seller aktif, jumlah pengajuan pending (brand & seller), produk baru masuk
- Grafik sederhana penjualan (mingguan/bulanan)

## 2. Manajemen Brand
- **Daftar Brand** — semua brand dengan status (approved/pending/rejected)
- **Approval Brand Baru** — antrian pengajuan brand dari seller, dengan detail yang diajukan (nama brand, bukti distributor resmi/dokumen pendukung) untuk direview
- **Edit Brand** — ubah info brand, logo, atau ubah status jadi rejected kalau ternyata bermasalah di kemudian hari

## 3. Manajemen Seller
- **Daftar Seller/Toko** — semua toko dengan status dan brand yang mereka bawa
- **Approval Pendaftaran Toko** — antrian toko baru yang menunggu persetujuan
- **Detail Seller** — riwayat penjualan toko, rating, jumlah komplain (kalau ada)
- **Suspend/Nonaktifkan Toko** — buat kasus pelanggaran (misal ketahuan jual barang KW)

## 4. Manajemen Produk
- **Semua Produk** — list lintas toko, bisa difilter kategori (IEM/TWS/DAC/cable/eartips)
- **Moderasi Produk** — antrian produk baru yang perlu direview sebelum tayang (cek kesesuaian dengan brand yang disetujui)
- **Kelola Tag Rekomendasi** — set/edit experience_level, sound_signature per produk kalau seller belum mengisi dengan benar

## 5. Manajemen Transaksi
- **Semua Pesanan** — monitoring seluruh order lintas toko dan status pembayarannya
- **Pencairan Dana ke Seller** — pencatatan/konfirmasi pencairan dana (payout masih manual pada tahap MVP)
- **Dispute/Komplain** — penanganan masalah pesanan (produk tidak sesuai, dll)

## 6. Manajemen Pengguna
- **Daftar Pembeli** — data akun buyer (untuk keperluan support)
- **Role Management** — pengaturan level akses admin (super admin vs moderator), untuk pengembangan lanjutan

## 7. Manajemen Kategori & Atribut Produk
- **Kategori Produk** — kelola daftar kategori (IEM, TWS, DAC, cable, eartips) agar bisa ditambah tanpa mengubah kode
- **Atribut Rekomendasi** — kelola daftar opsi `experience_level` (beginner/intermediate/enthusiast/flagship) dan `sound_signature` (neutral/warm/v-shaped/bright/basshead) yang dipakai di fitur rekomendasi

## 8. Manajemen Konten Homepage
- **Featured Products** — pilih/pin produk yang tampil di section "Best Sellers" dan "New Arrival" di landing page
- **Banner/Promo** — kelola banner promosi yang tampil di halaman utama

## 9. Pengaturan Sistem
- **Kelola Akun Admin** — tambah/hapus akun admin lain beserta level aksesnya
- **Pengaturan Payment Gateway** — konfigurasi terkait integrasi Midtrans

## 10. Log Aktivitas
- **Audit Trail** — riwayat seluruh tindakan sensitif admin (approve/reject brand, approve/reject seller, suspend toko, moderasi produk) sebagai jejak akuntabilitas

## 11. Laporan
- **Laporan Penjualan** — per brand, per toko, per periode
- **Laporan Aktivitas Approval** — histori keputusan approve/reject sebagai jejak akuntabilitas
