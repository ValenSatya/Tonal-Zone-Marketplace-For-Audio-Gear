# Activity Diagrams - Tonal Zone Marketplace

Dokumentasi resmi Activity Diagram untuk sistem e-commerce & marketplace IEM **Tonal Zone**.
Semua diagram mematuhi standar UML dengan aturan:
1. **Single Endpoint:** Setiap diagram hanya memiliki **1 titik mulai (start)** dan **1 titik akhir (stop)**. Seluruh cabang keputusan (sukses/gagal/ditolak) digabungkan kembali (*merged*) ke satu *endpoint*.
2. **System-Only Fork & Join:** Elemen konkurensi (`fork` dan `join`) **hanya berada di dalam swimlane `Sistem`**. Aksi aktor manusia berjalan sekuensial.

---

## 1. Activity Diagram: Checkout & Pembayaran Escrow

Diagram ini memodelkan proses checkout oleh Pembeli, penguncian stok, pembuatan rekening penampung (*Escrow Vault*), hingga konfirmasi pembayaran.

```plantuml
@startuml Activity_Checkout_Escrow
title Activity Diagram: Checkout & Pembayaran Escrow (Tonal Zone)

|Pembeli|
start
:Buka Halaman Keranjang / Cart;
:Klik "Lanjut ke Checkout";
:Pilih Alamat Pengiriman & Kurir Ekspedisi;
:Pilih Metode Pembayaran;
:Klik "Bayar Sekarang";

|Sistem Tonal Zone|
:Menerima Data Transaksi Checkout;
:Cek Ketersediaan Stok Produk;

if (Stok Produk Masih Tersedia?) then (Ya)
  fork
    :Kunci Kuota Stok Produk di Database;
  fork again
    :Buat Record Order & Invoice Transaksi;
  fork again
    :Inisialisasi Status Escrow Vault ("HOLDING");
  end fork

  :Tampilkan Kode Bayar / QRIS / VA;

  |Pembeli|
  :Lakukan Pembayaran Tagihan;

  |Sistem Tonal Zone|
  :Terima Webhook Konfirmasi Pembayaran;
  
  fork
    :Update Status Pesanan Menjadi "PAID";
  fork again
    :Kirim Notifikasi Pesanan Baru ke Seller;
  fork again
    :Kirim Bukti Pembayaran ke Email Pembeli;
  end fork

  :Tampilkan Halaman Pembayaran Berhasil;
else (Tidak)
  :Tampilkan Pesan Error "Stok Produk Tidak Mencukupi";
endif

:Selesai Alur Checkout;
stop
@enduml
```

---

## 2. Activity Diagram: Membuka Toko & Verifikasi Seller (KYC)

Diagram ini memodelkan pengajuan pembukaan toko oleh pengguna, verifikasi berkas legalitas/KYC oleh Admin, dan aktivasi merchant.

```plantuml
@startuml Activity_Buka_Toko_KYC
title Activity Diagram: Membuka Toko & Verifikasi KYC Seller (Tonal Zone)

|User (Calon Seller)|
start
:Akses Menu "Buka Toko / Registrasi Merchant";
:Isi Formulir Profil Toko & Rekening Payout;
:Upload Dokumen KTP & Surat Izin Usaha / Brand;
:Klik "Kirim Pengajuan Toko";

|Sistem Tonal Zone|
:Validasi Kelengkapan Format Berkas;
fork
  :Simpan Berkas KYC dengan Status "PENDING";
fork again
  :Teruskan Notifikasi Antrean ke Dashboard Admin;
end fork

|Admin|
:Buka Menu "Seller Verifications";
:Periksa Dossier Identitas & Legalitas Toko;

if (Keputusan Verifikasi Admin?) then (Setujui Toko)
  |Admin|
  :Klik "Approve Seller";
  
  |Sistem Tonal Zone|
  fork
    :Update Role User Menjadi "Seller";
  fork again
    :Aktifkan Halaman Toko di Katalog Marketplace;
  fork again
    :Kirim Email Notifikasi Selamat & Akses Seller Portal;
  end fork
else (Tolak Pengajuan)
  |Admin|
  :Input Alasan Penolakan;
  :Klik "Reject Seller";
  
  |Sistem Tonal Zone|
  :Update Status Pengajuan Menjadi "REJECTED";
  :Kirim Email Pemberitahuan Alasan Penolakan;
endif

|Sistem Tonal Zone|
:Catat Log Audit Verifikasi Seller;
:Selesai Alur Verifikasi Toko;
stop
@enduml
```

---

## 3. Activity Diagram: Mengelola Pesanan Masuk & Pengiriman (Fulfillment)

Diagram ini memodelkan proses pemenuhan pesanan oleh Seller, input nomor resi kurir, pemantauan pengiriman, masa inspeksi 2x24 jam, hingga pelepasan dana *Escrow* ke *Seller*.

```plantuml
@startuml Activity_Fulfillment_Pengiriman
title Activity Diagram: Mengelola Pesanan & Pelepasan Escrow (Tonal Zone)

|Seller|
start
:Buka Seller Portal -> Menu "Pesanan Masuk";
:Pilih Pesanan Baru Berstatus "PAID";
:Kemas Produk IEM & Pasang Segel Hologram;
:Serahkan Paket ke Kurir Ekspedisi;
:Input Nomor Resi (AWB) ke Sistem;

|Sistem Tonal Zone|
:Validasi Nomor Resi;
fork
  :Update Status Pesanan Menjadi "SHIPPED";
fork again
  :Hubungkan Tracking API Ekspedisi;
fork again
  :Kirim Notifikasi Resi Pengiriman ke Pembeli;
end fork

|Pembeli|
:Terima Paket Fisik IEM dari Kurir;
:Lakukan Uji Coba Suara & Cek Kelengkapan;

if (Kondisi Barang Sesuai?) then (Sesuai / Tanpa Masalah)
  |Pembeli|
  :Klik "Pesanan Selesai / Terima Barang";

  |Sistem Tonal Zone|
  fork
    :Update Status Pesanan Menjadi "COMPLETED";
  fork again
    :Cairkan Dana dari Escrow Vault ke Saldo Payout Seller;
  fork again
    :Kirim Notifikasi Pencairan Dana Sukses ke Seller;
  end fork
else (Ada Kerusakan / Palsu)
  |Pembeli|
  :Ajukan Komplain & Upload Bukti Unboxing;

  |Sistem Tonal Zone|
  :Update Status Escrow Menjadi "DISPUTED";
  :Teruskan Kasus ke Panel Mediasi Arbitrase Admin;
endif

|Sistem Tonal Zone|
:Perbarui Riwayat Transaksi;
:Selesai Alur Pengiriman & Escrow;
stop
@enduml
```

---

## 4. Activity Diagram: Mengelola Produk & Moderasi QC

Diagram ini memodelkan input katalog IEM oleh Seller dan proses Quality Check (QC) oleh Admin sebelum produk tayang di etalase publik.

```plantuml
@startuml Activity_Moderasi_Produk
title Activity Diagram: Mengelola Produk & Moderasi QC (Tonal Zone)

|Seller|
start
:Buka Menu "Kelola Produk" -> Klik "Tambah Produk";
:Isi Data IEM (Nama, Brand, Driver, Signature, Harga, Stok);
:Upload Foto Produk & Dokumen Frekuensi Respon;
:Klik "Simpan & Ajukan Moderasi";

|Sistem Tonal Zone|
:Validasi Kelengkapan Data Produk;
fork
  :Simpan Data Produk dengan Status "PENDING";
fork again
  :Kirim Notifikasi Antrean QC ke Admin;
end fork

|Admin|
:Buka Menu "Product Moderation";
:Periksa Kelayakan Deskripsi & Sound Signature;

if (Hasil Quality Check Admin?) then (Lolos QC)
  |Admin|
  :Klik "Approve Product";

  |Sistem Tonal Zone|
  fork
    :Update Status Produk Menjadi "APPROVED";
  fork again
    :Publish Produk ke Etalase Marketplace Publik;
  fork again
    :Kirim Notifikasi Produk Live ke Seller;
  end fork
else (Tidak Sesuai Standar)
  |Admin|
  :Input Catatan Perbaikan / Alasan Penolakan;
  :Klik "Reject Product";

  |Sistem Tonal Zone|
  :Update Status Produk Menjadi "REJECTED";
  :Kirim Catatan Revisi ke Dashboard Seller;
endif

|Sistem Tonal Zone|
:Catat Log Audit Moderasi Produk;
:Selesai Alur Moderasi Produk;
stop
@enduml
```

---

## 5. Activity Diagram: Pendaftaran Akun & Autentikasi

Diagram ini memodelkan registrasi akun baru oleh Guest dan pembuatan token autentikasi.

```plantuml
@startuml Activity_Pendaftaran_Akun
title Activity Diagram: Pendaftaran Akun & Autentikasi (Tonal Zone)

|Guest|
start
:Buka Halaman Registrasi;
:Input Nama Lengkap, Email, dan Password;
:Klik Tombol "Daftar Akun";

|Sistem Tonal Zone|
:Cek Ketersediaan Email di Database;

if (Email Sudah Terdaftar?) then (Ya)
  :Tampilkan Pesan Error "Email Sudah Digunakan";
else (Belum)
  fork
    :Enkripsi Password & Buat Record Pengguna Baru;
  fork again
    :Generate Token Sesi Autentikasi;
  fork again
    :Kirim Email Selamat Datang;
  end fork

  :Arahkan Pengguna ke Homepage (Status: Logged In);
endif

:Selesai Alur Registrasi;
stop
@enduml
```
