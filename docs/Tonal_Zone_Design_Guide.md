# Tonal Zone — UI/UX Design Guide

**Gaya Desain:** Industrial Noir / Technical Audiophile
**Referensi:** Protech Landing Page

---

## 1. Filosofi Desain

Desain ini meminjam bahasa visual dari spec sheet dan dokumen teknis laboratorium, bukan e-commerce yang playful dan colorful. Kesannya presisi, premium, dan "for the serious audiophile" — cocok untuk positioning Tonal Zone yang membidik audiophile sekaligus beginner yang ingin masuk ke hobi ini secara serius.

Prinsip utama:
- Dark-first, tapi tidak monoton — pakai kontras terang/gelap antar section untuk ritme visual
- Tipografi sebagai elemen desain utama, bukan cuma pembawa informasi
- Aksen warna dipakai sangat hemat agar tetap terasa premium, bukan norak
- Sudut tajam (no border-radius) untuk kesan presisi dan mekanis
- Fotografi produk dramatis dengan pencahayaan moody, bukan studio putih flat

---

## 2. Color Palette

| Token | Hex | Penggunaan |
|---|---|---|
| `bg` | `#131313` | Background utama (dark section) |
| `text` | `#F0F0F0` | Teks utama di atas background gelap |
| `accent` | `#D4FF00` | CTA utama, highlight, underline tab aktif, index label — dipakai **hemat**, bukan dominan |
| `border` | `#444748` | Divider tipis, outline card/button, garis antar section |

**Aturan pemakaian aksen:**
- Maksimal 1-2 elemen aksen per viewport (misal: satu tombol utama + satu label kecil). Jangan pernah pakai accent sebagai background besar/section
- Accent tidak dipakai untuk teks paragraf, hanya untuk CTA, tag, angka index, atau underline

**Section terang (inverted, untuk hero/CTA penutup):**
- Background: `#F0F0F0` (atau turunan abu-abu terang)
- Teks: `#131313`
- Tetap pakai accent yang sama untuk konsistensi brand

---

## 3. Typography

| Peran | Font | Karakteristik |
|---|---|---|
| Display / Judul besar | Stack Sans Notch | Ukuran besar (48–96px+), tight leading, dipakai untuk nama produk & hero headline |
| Body / UI / Label | Hanken Grotesk | Semua teks fungsional: navigasi, deskripsi, harga, tombol, form |

**Skala tipografi yang disarankan:**

| Elemen | Font | Size (desktop) | Tracking | Case |
|---|---|---|---|---|
| Hero product name | Stack Sans Notch | 72–96px | tight | UPPERCASE |
| Section heading | Stack Sans Notch | 36–48px | tight | UPPERCASE |
| Eyebrow / kicker label (mis. "HYPE FOR AUDIOPHILE") | Hanken Grotesk | 11–13px | wide (0.15–0.2em) | UPPERCASE |
| Body text / deskripsi | Hanken Grotesk | 14–16px | normal | Sentence case |
| Harga | Hanken Grotesk (medium/semibold) | 20–24px | normal | — |
| Spec label (mis. "DRIVER", "MATERIAL") | Hanken Grotesk | 11px | wide | UPPERCASE |
| Nav item | Hanken Grotesk | 13px | wide | UPPERCASE |
| Button label | Hanken Grotesk (medium) | 13px | wide | UPPERCASE |

Catatan: Stack Sans Notch **hanya** untuk headline besar (judul produk, hero, section title). Jangan dipakai untuk body text atau UI kecil — biar kontras antara "statement besar" dan "informasi fungsional" tetap terasa.

---

## 4. Layout & Grid

- Struktur section jelas dengan divider tipis (`border: #444748`) memisahkan tiap blok konten
- Grid produk: 2–3 kolom untuk card produk, gap konsisten, tanpa rounded corner
- Whitespace generous di hero, padat/grid-dense di bagian katalog
- Elemen dekoratif kecil (tanda `+`) dipakai sebagai penanda transisi antar section — subtle, bukan ilustrasi besar
- Index notation (`[ 001 — 004 ]`) dipakai di kanan-atas section list untuk memperkuat kesan katalog teknis — bisa dipakai di halaman katalog produk Tonal Zone juga (misal `[ 001 — 024 ]` untuk jumlah produk)

---

## 5. Komponen

### Tombol
- **Primary CTA:** Background `#D4FF00`, teks `#131313`, sudut tajam (0px radius), uppercase, letter-spacing wide
- **Secondary/Outline:** Border 1px `#444748` atau `#F0F0F0`, background transparan, teks `#F0F0F0`
- **Dark solid (mis. "Order Now"):** Background `#F0F0F0` atau hitam pekat tergantung kontras section, tanpa radius

### Card Produk
- Border tipis `#444748`, tanpa shadow berlebihan, tanpa radius
- Foto produk dominan, nama produk (Hanken Grotesk, uppercase, medium), harga di bawahnya
- Hover state: sedikit brightness naik atau border berubah ke `#D4FF00`

### Navigasi
- Bar hitam solid, item nav uppercase kecil, tracking lebar
- Tab aktif ditandai underline warna accent (bukan background)

### Form (mis. register email di CTA bawah)
- Input field transparan/dark dengan border `#444748`, placeholder abu-abu redup
- Tombol submit solid terang (`#F0F0F0` bg, teks gelap) atau accent, tanpa radius

### Label Spek Teknis
- Format: label kecil uppercase tracking lebar di atas, value di bawahnya dengan Hanken Grotesk medium — pola ini bisa dipakai di halaman detail produk Tonal Zone untuk menampilkan driver, impedance, sensitivitas, dll (relevan banget untuk niche audio gear)

---

## 6. Fotografi Produk

- Pencahayaan dramatis/moody, bukan studio putih flat — cocok untuk kesan "gear premium"
- Produk sering ditampilkan dengan tekstur latar (kain, permukaan metal, dll), bukan background polos
- Untuk beberapa produk, tampilkan sudut close-up detail (mis. konektor cable, shell IEM) sebagai secondary image

---

## 7. Elemen Berulang Khas Gaya Ini

- Eyebrow text kecil di atas headline (mis. `PTX-09 / INDUSTRIAL AUDIO`) — bisa dipakai Tonal Zone untuk kode SKU atau kategori produk
- Index bracket notation `[ 001 — 004 ]`
- Tanda `+` sebagai divider antar section
- Kombinasi dua tema (dark section vs light/inverted section) untuk hero dan CTA penutup

---

## 8. Penerapan ke Tonal Zone

Beberapa area yang relevan langsung dipakai:
- Halaman detail produk: pola label teknis (driver, sound signature, material) sangat cocok dengan konsep rekomendasi berbasis level pengalaman yang sudah direncanakan
- Halaman katalog: index notation bisa menunjukkan jumlah produk per kategori (IEM/TWS/DAC/cable/eartips)
- CTA "Cek Tonal Graph" ke Squiglink bisa memakai gaya tombol outline/secondary agar tidak bersaing dengan CTA "Checkout"
