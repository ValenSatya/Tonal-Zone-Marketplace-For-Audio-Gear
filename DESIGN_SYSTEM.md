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
| **Canvas Background** | `#030303` | Latar belakang utama seluruh aplikasi. Hitam pekat pekat ultra-noir. |
| **Surface Card** | `#050505` | Kontainer kartu, modul pilihan/tier, input box, dan item list. |
| **Primary Text** | `#FAF9F6` | Teks utama, judul, dan elemen aktif berkontras tinggi. |
| **Secondary Text** | `#8E8E93` / `#71717A` | Subjudul, deskripsi paragraf, dan metadata sekunder. |
| **Accent Lime** | `#BFDD25` / `#D4FF00` | **Visual Fatigue Reduction Rule (Ala YouTube):** Digunakan **HANYA** pada: (1) Hover tombol CTA yang sangat penting (misal `Buy Now` / `Beli Sekarang`), (2) Tombol utama di Hero banner, dan (3) Logo Tonal Zone. **Sisanya murni hitam dan putih.** Tidak digunakan pada navbar hover, rating bars, border, atau badge biasa. |

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

## 4. Struktur Tata Letak & Sistem Corner Radius (Corner Radius & Nested System)

Berdasarkan prinsip *Strategic Border Radius & Concentric Nested Curves* (*Muzli, Designary, Design Bootcamp*):

### A. Skala Radius Sistemik (Token Hierarchy)
Hindari angka acak tanpa aturan. Gunakan skala proporsional yang selaras dengan hierarki ukuran komponen:

| Token | Nilai Radius | Kategori & Peran Semantik | Contoh Penerapan |
| :--- | :--- | :--- | :--- |
| **`radius-xs`** | **`4px`** | Micro elements & nested thumbnails | Thumbnail gambar produk di dalam kartu produk |
| **`radius-sm`** | **`8px`** | Nested inner controls ($R_{outer} - P = 8\text{px}$) | Frequency Zone bar di dalam kartu grafik, bilah kontrol audio dengan margin 16px, item list model |
| **`radius-md`** | **`12px`** | Secondary nested containers ($24\text{px} - 12\text{px} = 12\text{px}$) | Dropdown menu items, selector cards, small modal widgets |
| **`radius-lg`** | **`16px`** | Standalone medium cards | Kartu model audio, kartu editorial sound signature |
| **`radius-xl`** | **`24px`** | Major containers & outer section canvas | Kontainer SVG grafik utama, container hero media, outer card comparator |
| **`radius-pill`** | **`9999px` (`rounded-full`)** | Standalone interactive triggers & pills | Tombol CTA (Primary/Secondary), input search bar, filter tabs, toggle switches, badge probe |

### B. Rumus Konsentris Elemen Bersarang (Perfect Nested Rounded Corners Formula)
Ketika suatu elemen bersarang di dalam kontainer yang memiliki padding atau margin, **DILARANG menggunakan radius yang sama** karena akan menciptakan distorsi optik (sudut tampak menjepit / tidak alami).

Gunakan rumus kelengkungan konsentris sempurna:
$$\mathbf{R_{\text{inner}} = R_{\text{outer}} - \text{Padding}}$$
$$\mathbf{R_{\text{outer}} = R_{\text{inner}} + \text{Padding}}$$

* **Contoh:** Kontainer luar memiliki $R_{\text{outer}} = 24\text{px}$ dan padding/jarak $P = 16\text{px}$, maka elemen di dalamnya **wajib** memiliki $R_{\text{inner}} = 24 - 16 = \mathbf{8\text{px}}$.
* Jika elemen berbentuk *Pill* (`rounded-full`) bersarang di dalam container pill dengan padding $4\text{px}$ (`p-1`), elemen dalam dan luar tetap konsentris sebagai full pill.

### C. Zero Stroke / Zero Border pada Solid Background
* Jika komponen menggunakan background solid (`#141414`, `#181818`, `#1e1e1e`, `#080808`, atau `bg-white`), **DILARANG memberikan garis tepi/border/stroke**.
* Pemisahan visual dan kedalaman dicapai secara elegan melalui elevasi natural bayangan dan kontras warna bertingkat, bukan garis bingkai.

### D. Hirarki Tombol (Button Styling)
* **Primary CTA:** Tombol putih solid modern (`bg-white hover:bg-[#e8e8e8] text-[#131313] font-bold rounded-full shadow`), tanpa border.
* **Secondary Action:** Tombol pill gelap minimalis (`bg-[#1e1e1e] hover:bg-[#282828] text-[#a0a0a0] hover:text-white rounded-full`), tanpa border.
* **Icon Button:** Bulat sempurna (`rounded-full`) dengan background `#1e1e1e` atau `#242424`, tanpa border.

---

## 5. Aturan Anti-AI Slop (Strict Prohibitions)

* **DILARANG** menggunakan simbol klise seperti `//`, `[]`, atau `•` pada judul, badge, atau label teks.
* **DILARANG** membuat tata letak 3 kartu sejajar identik dengan gradasi background berat dan border neon tebal.
* **DILARANG** menambahkan telemetri palsu, widget osiloskop penuh stiker, atau gimmick visual yang membebani mata.
* **DILARANG** menggunakan warna hijau neon `#BFDD25` secara berlebihan hingga mendominasi layar.
