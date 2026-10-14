**Product Requirements Document (PRD)**

**Judul Project :** Tonal Zone

**Nama :** Valenandra Satya Adelaid Pribadi

**Kelas :** XI RPL A

**No Absen :** 35

# **1\. Informasi Proyek**

* Nama Proyek : Tonal Zone

* Versi Dokumen : v1.0

* Tanggal : 22 Juli 2026

# **2\. Overview**

## Latar Belakang

Perangkat personal audio—khususnya *In-Ear Monitor* (IEM), DAC, dan kabel kustom—kini telah bertransformasi dari sekadar alat panggung musisi menjadi kebutuhan esensial masyarakat luas:
1. **Hiburan & Musik Hi-Res**: Tuntutan reproduksi audio beresolusi tinggi (*Lossless*) dengan detail instrumen dan separasi suara yang presisi.
2. **Gaming Kompetitif (*Esports*)**: Tren gamer beralih ke IEM demi akurasi arah suara (*spatial imaging*) dan langkah kaki musuh yang lebih presisi dibanding *headset* konvensional.
3. **Produktivitas & Kreator Konten**: Kebutuhan pemantauan audio instan (*zero-latency*) untuk *streaming*, editing, serta isolasi kebisingan pasif (*passive noise isolation*) saat beraktivitas di ruang publik.

Pergeseran kebutuhan ini didorong oleh ledakan brand *Chi-Fi* (seperti Moondrop, Tangzu, dan EPZ) yang menawarkan kualitas suara *audiophile* dengan harga terjangkau di pasar Indonesia.

Namun, ekosistem belanja online saat ini belum mampu mendukung kebutuhan tersebut secara ideal:
* **Tingginya Risiko *"Blind Buy"***: Minimnya toko fisik audio membuat mayoritas transaksi dilakukan tanpa audisi langsung, sehingga pembeli rentan salah memilih karakter suara (*sound signature*) yang berujung pada kekecewaan (*buyer’s remorse*).
* **Keterbatasan Marketplace Umum**: E-commerce konvensional hanya menyajikan deskripsi generik dan gagal memfasilitasi parameter teknis krusial (konfigurasi driver, impedansi, kecocokan pin kabel, hingga kurva respons frekuensi).
* **Riset yang Terfragmentasi**: Pembeli harus berpindah-pindah antara forum ulasan, situs pengukur grafik frekuensi (seperti Squiglink), dan toko online generik untuk satu keputusan pembelian.

Kesenjangan ini melahirkan kebutuhan akan platform e-commerce vertikal khusus audio. **Tonal Zone** hadir untuk menyatukan kurasi *seller* dan *brand* resmi, panduan rekomendasi berbasis tingkat pengalaman pengguna, serta integrasi data grafik tonal (*tonal graph*) langsung pada titik transaksi demi pengalaman belanja audio yang terarah, aman, dan transparan.

## Tujuan

Tonal Zone dibangun untuk memudahkan audiophile maupun pemula yang baru masuk ke dunia audio dalam menemukan dan membeli gear yang sesuai dengan kebutuhan mereka, melalui platform marketplace yang kurasinya dijaga langsung oleh admin dan dilengkapi rekomendasi produk berbasis tingkat pengalaman pengguna.

## Deskripsi Singkat Produk

Tonal Zone adalah website marketplace multi-vendor khusus gear audio yang mempertemukan seller resmi brand-brand tertentu dengan pembeli. Selain fitur jual-beli standar, platform ini menyediakan panduan rekomendasi produk berdasarkan level pengalaman pengguna serta tautan ke grafik frequency response (tonal graph) dari Squiglink untuk membantu pembeli memahami karakter suara produk sebelum membeli.

## Target Pengguna

Penggemar audio (audiophile) yang mencari produk niche dengan spesifikasi teknis jelas, serta pemula yang baru ingin masuk ke hobi ini dan membutuhkan panduan produk mana yang sesuai untuk mereka.

## Ruang Lingkup

Pengembangan mencakup sisi pembeli (pencarian, rekomendasi, checkout), sisi seller (pendaftaran toko, manajemen produk dan pesanan), serta sisi admin (kurasi brand dan seller). Sistem pembayaran menggunakan payment gateway pihak ketiga, dan proses pencairan dana ke seller ditangani secara manual oleh admin pada tahap awal pengembangan.

# **3\. Problem Statement**

## Permasalahan yang Ingin Diselesaikan

* Belum ada marketplace khusus gear audio di Indonesia yang kurasi brand dan sellernya diverifikasi ketat untuk menghindari produk tiruan.

* Pemula kesulitan memilih produk yang sesuai karena minimnya panduan atau rekomendasi yang disesuaikan dengan tingkat pengalaman mereka.

* Informasi karakter suara (tonal) suatu produk umumnya tersebar di situs pihak ketiga dan tidak terhubung langsung dengan halaman belanja.

## Dampak Permasalahan

* Pembeli berisiko membeli produk tiruan karena tidak ada proses verifikasi seller maupun brand.

* Pemula cenderung salah pilih produk pertama, yang dapat membuat pengalaman awal mereka di hobi ini kurang memuaskan.

* Proses riset sebelum membeli menjadi lebih lama karena pembeli harus berpindah dari platform belanja ke situs referensi lain.

# **4\. Proposed Solution**

## Solusi yang Ditawarkan

* Sistem kurasi dua tahap: admin menyetujui brand yang boleh masuk platform, kemudian seller yang mengajukan diri baru bisa berjualan setelah brand dan tokonya disetujui.

* Fitur rekomendasi berbasis tag produk (level pengalaman, sound signature, budget) yang membantu pembeli menemukan produk sesuai kebutuhan tanpa perlu riset panjang.

* Integrasi tautan ke Squiglink pada tiap halaman produk agar pembeli bisa langsung mengecek tonal graph tanpa berpindah platform.

## Gambaran Umum Aplikasi

Aplikasi berbentuk website marketplace dengan tiga peran utama: pembeli, seller, dan admin. Alur utamanya dimulai dari admin mengelola daftar brand yang diizinkan, seller mendaftar dan mengelola tokonya di bawah brand yang sudah disetujui, kemudian pembeli menjelajahi katalog, memanfaatkan fitur rekomendasi dan tonal graph, lalu melakukan transaksi.

# **5\. User Roles**

| Aktor | Deskripsi | Hak Akses |
| :---- | :---- | :---- |
| Pembeli (Buyer) | Pengguna umum yang mencari dan membeli gear audio, dari beginner sampai audiophile berpengalaman. | Mendaftar akun, mencari & memfilter produk, melihat rekomendasi, mengecek tonal graph, checkout, melihat riwayat pesanan. |
| Seller | Pemilik brand atau reseller resmi yang sudah disetujui admin untuk membuka toko di platform. | Mengajukan pendaftaran toko, mengelola produk & varian miliknya, memproses pesanan masuk, melihat riwayat penjualan toko. |
| Admin | Pengelola platform yang menjaga kualitas dan keaslian produk yang beredar. | Menyetujui/menolak brand baru, menyetujui/menolak pendaftaran seller, memoderasi produk, memantau transaksi. |

# **6\. Functional Requirements**

## 6.1 Modul Pembeli

| Kode | Fitur | Deskripsi | Prioritas |
| :---- | :---- | :---- | :---- |
| FR-01 | Pencarian & Filter Produk | Mencari produk berdasarkan kategori (IEM, TWS, DAC, cable, eartips), brand, rentang harga, dan tanda tangan suara (sound signature). | Tinggi |
| FR-02 | Rekomendasi Berdasarkan Level | Menampilkan produk yang sesuai dengan level pengguna (beginner, intermediate, enthusiast, flagship) melalui filter atau kuis singkat. | Tinggi |
| FR-03 | Cek Tonal Graph | Menampilkan tautan ke grafik frequency response produk di Squiglink pada halaman detail produk. | Sedang |
| FR-04 | Keranjang & Checkout | Menambahkan produk ke keranjang, memilih varian, dan menyelesaikan pembayaran melalui payment gateway. | Tinggi |
| FR-05 | Riwayat Pesanan | Melihat status dan riwayat transaksi yang pernah dilakukan. | Sedang |

## 6.2 Modul Seller

| Kode | Fitur | Deskripsi | Prioritas |
| :---- | :---- | :---- | :---- |
| FR-06 | Pendaftaran Toko | Mengajukan pendaftaran sebagai seller dengan memilih brand yang akan dijual dari daftar brand yang sudah disetujui admin. | Tinggi |
| FR-07 | Pengajuan Brand Baru | Mengajukan brand yang belum terdaftar untuk direview dan disetujui admin sebelum bisa dijual. | Sedang |
| FR-08 | Manajemen Produk | Menambah, mengubah, dan menghapus produk beserta variannya (ukuran eartips, panjang cable, dan sejenisnya). | Tinggi |
| FR-09 | Manajemen Pesanan | Melihat dan memperbarui status pesanan yang masuk ke toko. | Tinggi |

## 6.3 Modul Admin

| Kode | Fitur | Deskripsi | Prioritas |
| :---- | :---- | :---- | :---- |
| FR-10 | Approval Brand | Menyetujui atau menolak brand baru yang diajukan berdasarkan verifikasi keaslian dan legalitas distribusi. | Tinggi |
| FR-11 | Approval Seller | Menyetujui atau menolak pendaftaran toko baru. | Tinggi |
| FR-12 | Moderasi Produk | Meninjau produk yang diunggah seller agar sesuai dengan brand yang disetujui. | Sedang |
| FR-13 | Pemantauan Transaksi | Melihat seluruh transaksi yang terjadi di platform untuk keperluan pengawasan. | Sedang |

# **7\. Non Functional Requirements**

| Aspek | Ketentuan |
| :---- | :---- |
| Performance | Halaman katalog dan detail produk dapat dimuat dalam waktu maksimal 3 detik pada koneksi standar. |
| Security | Autentikasi pengguna menggunakan sistem terenkripsi, data pembayaran tidak disimpan langsung di server aplikasi melainkan diproses melalui payment gateway pihak ketiga. |
| Usability | Antarmuka sederhana dan mudah dipahami, khususnya bagi pengguna beginner yang baru mengenal dunia audio. |
| Compatibility | Dapat diakses melalui browser desktop maupun mobile dengan tampilan yang responsif. |
| Reliability | Sistem mencatat status transaksi secara konsisten agar tidak terjadi kehilangan data pesanan saat proses checkout. |

# **8\. Business Rules**

## Aturan Bisnis yang Berlaku

* Seller hanya dapat menjual produk dari brand yang berstatus "approved". Brand yang belum disetujui, misalnya karena belum ada verifikasi distributor resmi, tidak akan muncul sebagai pilihan saat pendaftaran toko.

* Pendaftaran toko baru wajib melalui proses review admin sebelum toko dapat mulai mengunggah produk.

* Setiap pengajuan brand baru oleh seller akan berstatus "pending" hingga admin melakukan verifikasi.

## Validasi Data

* Email pengguna harus unik dan terverifikasi saat pendaftaran akun.

* Stok produk tidak boleh bernilai negatif dan otomatis berkurang setelah transaksi berhasil.

## Hak Akses

* Seller hanya dapat mengelola data produk dan pesanan milik tokonya sendiri.

* Hanya admin yang memiliki akses untuk mengubah status brand dan status persetujuan toko.

## Ketentuan Penggunaan

* Pembayaran dianggap sah setelah dikonfirmasi oleh payment gateway, bukan berdasarkan klaim sepihak dari pembeli maupun seller.

# **9\. Use Case Diagram**

## Deskripsi Use Case

* Cari & Filter Produk : pembeli menelusuri katalog berdasarkan kategori, brand, harga, dan sound signature.

* Lihat Rekomendasi Berdasarkan Level : sistem menampilkan produk yang sesuai dengan tingkat pengalaman pembeli.

* Cek Tonal Graph : pembeli membuka tautan Squiglink dari halaman detail produk.

* Checkout & Bayar : pembeli menyelesaikan transaksi melalui payment gateway.

* Kelola Produk Toko : seller menambah, mengubah, atau menghapus produk dan variannya.

* Approve Pendaftaran Seller / Brand : admin meninjau dan memutuskan status pengajuan.

# **10\. Wireframe**

## 

# **11\. Entity Relationship Diagram (ERD)**

## Penjelasan Entitas

* profiles : menyimpan data akun pengguna beserta perannya (buyer/seller/admin).

* brands : daftar brand yang diizinkan berjualan di platform, memiliki status approval.

* stores : toko milik seller, terhubung ke satu brand yang sudah disetujui.

* products : produk yang dijual tiap toko, termasuk atribut rekomendasi dan tautan tonal graph.

* product\_variants : varian dari suatu produk, misalnya ukuran eartips atau panjang cable.

* orders & order\_items : mencatat transaksi pembeli beserta rincian produk yang dibeli.

* payments : mencatat status pembayaran tiap transaksi.

## Penjelasan Relasi

* Satu profile (seller) dapat memiliki satu toko; satu brand dapat memiliki banyak toko.

* Satu toko dapat memiliki banyak produk; satu produk dapat memiliki banyak varian.

* Satu pesanan dapat berisi banyak item produk (order\_items) dan memiliki satu data pembayaran.

# **12\. Technology Stack**

* Bahasa Pemrograman : JavaScript / TypeScript

* Front End : Next.js (App Router), Tailwind CSS, shadcn/ui

* Back End : Next.js API Routes / Server Actions

* Framework : Next.js

* Database : PostgreSQL (melalui Supabase)

* Tools : Supabase (Auth, Storage, Database), Midtrans (payment gateway)

* Hosting : Vercel

# **13\. Future Development**

## Fitur yang Akan Dikembangkan

* Sistem payout otomatis ke rekening seller, menggantikan proses pencairan manual oleh admin.

* Fitur kuis interaktif untuk rekomendasi produk yang lebih personal berdasarkan preferensi pembeli.

* Fitur ulasan dan rating produk dari pembeli yang sudah melakukan transaksi.

## Integrasi yang Direncanakan

* Embed grafik tonal langsung dari Squiglink ke halaman produk, menggantikan tautan keluar yang digunakan pada versi awal.

* Integrasi dengan jasa pengiriman untuk pelacakan status pengiriman secara real-time.