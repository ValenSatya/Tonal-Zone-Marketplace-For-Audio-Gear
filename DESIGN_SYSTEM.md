# Tonal Zone — Design System & UI Guidelines

## 1. Filosofi Desain (Core Philosophy)
Tonal Zone mengusung estetika **Swiss Editorial Minimalism & Industrial Noir** yang terinspirasi oleh standar hardware audio kelas atas (*Teenage Engineering, AIAIAI Audio, Bang & Olufsen*) dan prinsip desain internasional (*Dieter Rams, Swiss International Typographic Style*).

* **Purity & Function:** Setiap elemen visual harus memiliki fungsi esensial. Hindari ornamen dekoratif tanpa tujuan.
* **Negative Space (Whitespace):** Berikan ruang bernapas yang lapang di setiap section (`py-28` hingga `py-36`).
* **Confidence in Typography:** Tipografi besar yang tenang dan terstruktur lebih berkelas dibanding tumpukan kotak/kartu warna-warni.

---

## 2. Palet Warna (Color Palette)

| Token | Hex Code | Peran & Penggunaan |
| :--- | :--- | :--- |
| **Canvas Background** | `#0E0E0E` / `#0A0A0A` | Latar belakang utama seluruh aplikasi. Hitam pekat netral. |
| **Primary Text** | `#FAF9F6` | Teks utama, judul, dan elemen aktif berkontras tinggi. |
| **Secondary Text** | `#8E8E93` / `#71717A` | Subjudul, deskripsi paragraf, dan metadata sekunder. |
| **Hairline Dividers** | `#1C1C1C` / `#222222` | Garis batas struktural 1px yang halus dan tidak mencolok. |
| **Accent Lime** | `#D4FF00` | Digunakan secara **sangat hemat** (tombol checkout utama, titik status aktif penting). |

---

## 3. Standar Tipografi (Typography Hierarchy)

1. **Section Headers (Editorial Style):**
   - Kategori kecil di atas: Monospace, `text-xs`, `tracking-[0.25em]`, warna `#71717A`, huruf kapital.
   - Judul Utama: `font-heading`, `text-4xl` hingga `text-6xl`, bobot `font-light` atau `font-bold` berkontras tinggi.
   - Paragraf Pengantar: `font-sans`, `text-sm`, `text-[#8E8E93]`, `leading-relaxed`, dibatasi lebar `max-w-xl`.

2. **Daftar & Penomoran (Selectors):**
   - Format nomor: `01`, `02`, `03` sederhana dengan jarak tab horizontal yang rapi.
   - State Aktif: Teks putih tegas `#FAF9F6`, garis bawah halus atau dot minimalis.
   - State Inaktif: Teks abu-abu redup `#555555` dengan transisi hover ke putih.

---

## 4. Struktur Tata Letak (Layout Guidelines)

* **Sudut Tajam (0px Border Radius):** Seluruh tombol, container, dan divider menggunakan `rounded-none`.
* **Asymmetric Master-Detail:** Gunakan tata letak asimetris 2 kolom (contoh: 5 kolom untuk selector daftar tipografi, 7 kolom untuk visualisasi kurva & detail konten).
* **Kontras Satu Nafas:** Pertahankan tema gelap pekat di seluruh alur halaman untuk menjaga konsistensi brand Tonal Zone.

---

## 5. Aturan Anti-AI Slop (Strict Prohibitions)

* **DILARANG** menggunakan simbol klise seperti `//`, `[]`, atau `•` pada judul, badge, atau label teks.
* **DILARANG** membuat tata letak 3 kartu sejajar identik dengan gradasi background berat dan border neon tebal.
* **DILARANG** menambahkan telemetri palsu, widget osiloskop penuh stiker, atau gimmick visual yang membebani mata.
* **DILARANG** menggunakan warna hijau neon `#D4FF00` secara berlebihan hingga mendominasi layar.
