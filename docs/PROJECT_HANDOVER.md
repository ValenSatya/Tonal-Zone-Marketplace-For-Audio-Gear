# TONALZONE (IEM MARKETPLACE) - PROJECT HANDOVER & CONTEXT

> Dokumen ini adalah jembatan konteks agar di percakapan/chat baru kamu bisa langsung melanjutkan tanpa perlu menjelaskan ulang dari awal. Cukup berikan perintah:
> **baca PROJECT_HANDOVER.md dan lanjutkan [Poin X]**

---

## 1. Aturan Wajib (Golden Rules & Design Language)
1. **STRICTLY DO NOT USE PLAYWRIGHT MCP**: User yang akan mengetes langsung di browser (http://localhost:3000). Jangan pernah jalankan tool MCP Playwright/browser testing otomatis.
2. **Desain & Estetika (Swiss Editorial Minimalism & Industrial Noir)**:
   - **Palet Warna**: Dominan Hitam `#000000`, Abu Gelap `#0d0d0d` / `#141414`, Border Halus `#222222` / `#262626`, dan Putih.
   - **Warna Aksen (`#BFDD25` / Lime)**: Digunakan **SANGAT MINIMAL & SELEKTIF**. HANYA untuk CTA krusial (Tombol Sign In, Tombol Utama Hero, Logo). Jangan gunakan untuk border kartu, badge acak, atau tombol sekunder.
   - **Bentuk (Corner Radius)**: Tombol menggunakan pill kapsul (`rounded-full`), modal dan kartu menggunakan lekukan halus (`rounded-2xl` / `rounded-xl`). **JANGAN** gunakan kotak kaku tajam (`rounded-none`).
3. **Efisiensi Token**: Komunikasi ringkas, padat, straight to the point, dan fokus pada eksekusi kode.

---

## 2. Arsitektur Data & Persistence
Next.js 14 App Router berbasis Client-Side State + localStorage + Custom Event Bus:
- `tonalzone_user`: State sesi pengguna (Buyer, Seller, Admin).
- `tonalzone_custom_products`: Produk yang diunggah Seller (`PENDING`, `APPROVED`, `REJECTED`).
- `tonalzone_admin_products`: Override harga, stok, dan status approval oleh Admin.
- `tonalzone_admin_banners`: CMS Banner promo (Hero, Flash Sale, dll).
- `tonalzone_cart`: Keranjang belanja buyer.
- **Realtime Event Bus**: Setiap perubahan di admin/seller menembakkan Custom Event `productsUpdated` dan `bannersUpdated`. Halaman buyer (`/collection`, `/search`, `FigmaHero`) memasang listener untuk auto-refresh UI seketika tanpa reload browser.

---

## 3. Fitur yang Sudah Selesai (Completed)
1. **Auth & UI Polish**:
   - `Navbar.tsx`: Modal konfirmasi logout modern (`rounded-2xl`, pill button), tombol login beraksen `#BFDD25`.
   - `/login`: Sign in form, submit button aksen `#BFDD25`.
   - `/signup`: Step 1-3 bersih dark aesthetic, pill buttons, genre cards `rounded-xl` dengan radio check.
2. **Dedicated Payment Page (`/checkout/payment`)**:
   - Halaman mandiri pembayaran dengan QRIS asli, countdown timer, breakdown biaya.
   - Mengunci metode pembayaran (untuk ganti metode harus batalkan pesanan; ada modal batal yang mengembalikan barang ke keranjang dan redirect ke `/checkout`).
3. **Integrasi Admin CMS & Storefront**:
   - Hero Banner terhubung dinamis ke CMS banner admin dengan fallback Chu III.
   - Upload produk seller otomatis berstatus PENDING dan masuk ke admin approvals.
   - Hanya produk APPROVED yang muncul di storefront buyer (/collection, /search, detail produk).
   - Override harga dan stok oleh Admin langsung berpengaruh ke katalog buyer.
4. **Pengaturan Rekber & Platform Fee Dinamis (/admin/config/system <-> /checkout)**:
   - Hubungkan `systemSettings` (`escrowFeePercent` default 1.5%, `inspectionWindowHours` default 48 jam) melalui `AdminDataContext` dan `localStorage` (`tonalzone_system_settings`).
   - Persentase biaya penanganan rekber dihitung secara dinamis dari subtotal belanja pada `/checkout` (menggantikan nilai hardcoded $0.10).
   - Masa garansi uji coba akustik pada box garansi dan halaman pembayaran `/checkout/payment` otomatis tersinkronisasi dengan konfigurasi admin.
   - Event bus realtime (`systemSettingsUpdated`) untuk pembaruan instan tanpa refresh.

---

## 4. Antrean Roadmap Fitur Berikutnya

- [x] **POIN 3: Fungsionalkan Pengaturan Rekber / Platform Fee (/admin/config/system <-> /checkout)**
  - Hubungkan escrowFeePercent (default 1.5%) dan inspectionWindowHours (default 48 jam) dari AdminDataContext.
  - Pada src/app/checkout/page.tsx, ganti biaya penanganan hardcoded ($0.10) menjadi persentase dinamis yang dihitung dari total belanja berdasarkan konfigurasi admin.

- [ ] **POIN 4: Sinkronisasi Ekspedisi & Ongkir (/admin/logistics/couriers <-> /checkout)**
  - Hubungkan daftar kurir aktif daricouriers di AdminDataContext ke pilihan pengiriman di src/app/checkout/page.tsx.
  - Jika kurir dinonaktifkan di admin, kurir tersebut hilang dari opsi checkout buyer.

- [ ] **POIN 5: Real Escrow Payouts (/admin/transactions <-> Seller Wallet)**
  - Buat aksi admin 'Release Payout' / pencairan dana rekber benar-benar menambah saldo dompet seller (seller_wallet) dan mencatat riwayat mutasi dana.

- [ ] **POIN 6: Content Policy Anti-Counterfeit Validation (/admin/config/content <-> Seller Product Form)**
  - Validasi kata kunci terlarang ('fake', 'kw', 'clone', 'oem') saat seller menginput produk baru di /seller/products/new.