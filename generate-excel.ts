import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

export const MASTER_PRODUCTS = [
  // 1-4. Bass Audio Official Store (Multi-brand Retailer: Max under 9jt)
  {
    StoreName: "Bass Audio Official Store",
    StoreCity: "Jakarta Pusat",
    ProductName: "Moondrop Blessing 3",
    Brand: "Moondrop",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "2DD+4BA Hybrid IEM with 3D Printed Acoustic Tube",
    Description: "Flagship hybrid earphone generasi terbaru dari Moondrop dengan konfigurasi Horizontally Opposed Double Dynamic Driver (H.O.D.D.D.U.S) untuk bass presisi dan 4 custom Balanced Armature untuk vokal jernih transparan.",
    PriceUSD: 319.99,
    PriceIDR: 4999000,
    Stock: 25,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0023/9255/5595/files/moondrop-blessing3-0-thumb.jpg?v=1712155735"
  },
  {
    StoreName: "Bass Audio Official Store",
    StoreCity: "Jakarta Pusat",
    ProductName: "Simgot EA1000 Fermat",
    Brand: "Simgot",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "1DD + 1PR Dual-Cavity Dynamic Driver IEM with Replaceable Nozzles",
    Description: "IEM single dynamic kelas menengah atas dari Simgot dengan teknologi diafragma SDG dan passive radiator untuk hentakan bass berbobot, imaging presisi, dan vokal jernih memukau.",
    PriceUSD: 219.99,
    PriceIDR: 3450000,
    Stock: 20,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "BRIGHT",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/203A2258.jpg?v=1696906918"
  },
  {
    StoreName: "Bass Audio Official Store",
    StoreCity: "Jakarta Selatan",
    ProductName: "Kiwi Ears Orchestra Lite",
    Brand: "Kiwi Ears",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "8 Balanced Armature Drivers per Side Audiophile In-Ear Monitor",
    Description: "IEM all-BA 8-driver per sisi dengan tuning referensi alami yang sangat seimbang, separasi instrumen terpisah rapi, isolasi suara superior, dan kenyamanan housing resin medis.",
    PriceUSD: 249.0,
    PriceIDR: 3850000,
    Stock: 15,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0023/9255/5595/files/kiwi-ears-orch-lite-thumb-three.webp?v=1734709078"
  },
  {
    StoreName: "Bass Audio Official Store",
    StoreCity: "Surabaya",
    ProductName: "Tangzu Wan'er S.G Studio Edition",
    Brand: "Tangzu",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm PET Diaphragm Dynamic Driver Studio Tuned Reference",
    Description: "IEM entry-level favorit dengan tuning referensi netral yang dirancang khusus untuk monitoring vokal natural, clarity seimbang, dan bass yang terkontrol rapi.",
    PriceUSD: 21.0,
    PriceIDR: 325000,
    Stock: 85,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/1_1_6de22a9c-f831-4360-8118-a3efa7fe26b3.jpg?v=1740021487"
  },

  // 5-9. Kuping Sensi (Audiophile Retailer: Max under 9jt)
  {
    StoreName: "Kuping Sensi",
    StoreCity: "Bandung",
    ProductName: "Sennheiser HD 560S",
    Brand: "Sennheiser",
    Category: "HEADPHONES",
    SpecsSummary: "Open-Back Circumaural Reference Headphone with E.A.R. Acoustic Refinement",
    Description: "Headphone open-back referensi dengan akurasi tonal linier, soundstage luas, dan reproduksi vokal serta instrumen yang sangat transparan dan jujur untuk analitik audio.",
    PriceUSD: 199.0,
    PriceIDR: 3150000,
    Stock: 18,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/products/HD560S.png?v=1762457796"
  },
  {
    StoreName: "Kuping Sensi",
    StoreCity: "Bandung",
    ProductName: "Hifiman Edition XS",
    Brand: "Hifiman",
    Category: "HEADPHONES",
    SpecsSummary: "Stealth Magnet Planar Magnetic Open-Back Headphone",
    Description: "Headphone planar magnetik dengan diafragma skala nanometer dan magnet stealth transparan akustik untuk soundstage megah dan separasi instrumen terpisah sempurna.",
    PriceUSD: 449.0,
    PriceIDR: 7100000,
    Stock: 15,
    Condition: "Brand New Sealed",
    ExperienceLevel: "ENTHUSIAST",
    SoundSignature: "BRIGHT",
    Images: "https://cdn.shopify.com/s/files/1/0023/9255/5595/products/HIFIMAN-Edition-XS-Planar-Magnetic-Open-Back-Headphones.jpg?v=1641989998"
  },
  {
    StoreName: "Kuping Sensi",
    StoreCity: "Denpasar (Bali)",
    ProductName: "Topping DX3 Pro+",
    Brand: "Topping",
    Category: "DAC/AMP",
    SpecsSummary: "Desktop DAC & Headphone AMP ES9038Q2M Bluetooth 5.0 LDAC",
    Description: "DAC dan amplifier headphone desktop serbaguna bertenaga tinggi dengan chip ESS Sabre ES9038Q2M, modul NFCA ultra-low noise, dan decoding hingga DSD512 PCM 768kHz.",
    PriceUSD: 199.0,
    PriceIDR: 3150000,
    Stock: 20,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/1791/0383/products/ToppingDX3ProBlack1024x1024.jpg?v=1707787646"
  },
  {
    StoreName: "Kuping Sensi",
    StoreCity: "Denpasar (Bali)",
    ProductName: "FiiO K7 Balanced Desktop DAC/AMP",
    Brand: "FiiO",
    Category: "DAC/AMP",
    SpecsSummary: "Truly Balanced Desktop DAC & Headphone AMP Dual AK4493SEQ THX AAA 788+",
    Description: "DAC/Amp desktop balance sejati dengan dual AK4493S, teknologi amplifikasi THX AAA 788+, dan keluaran tenaga hingga 2000mW untuk menggerakkan segala jenis headphone.",
    PriceUSD: 199.99,
    PriceIDR: 3190000,
    Stock: 14,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0023/9255/5595/files/fiio-k-7-thumb-two.webp?v=1732906763"
  },
  {
    StoreName: "Kuping Sensi",
    StoreCity: "Medan",
    ProductName: "Sony NW-A306 Android Walkman DAP",
    Brand: "Sony",
    Category: "DIGITAL AUDIO PLAYERS",
    SpecsSummary: "Hi-Res Audio Android Walkman DAP with S-Master HX & DSEE Ultimate",
    Description: "Pemutar musik portabel kompak berbasis Android dengan amplifikasi digital murni S-Master HX, DSEE Ultimate AI upscaling, dan daya tahan baterai hingga 36 jam.",
    PriceUSD: 349.99,
    PriceIDR: 5490000,
    Stock: 10,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/files/assets_Asset_Hierarchy_Consumer_Assets_Portable_Electronics_Walkman_Walkman_MP3_Player_2023_NW-A306_eComm_Product_Images_NWA306B_03_NW-A300_H_angle_front_Playcopy_ed939287-7530-4d78-a71d-a7db18fdbd01.jpg?v=1762466721"
  },

  // 10-12. Tangzu Official
  {
    StoreName: "Tangzu Official",
    StoreCity: "Semarang",
    ProductName: "Tangzu Fudu Verse 1",
    Brand: "Tangzu",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "1DD + 2BA Hybrid IEM with CNC Aluminum Faceplate & Tang Sancai Tips",
    Description: "IEM hybrid kolaborasi Tangzu dengan konfigurasi 10mm Dynamic Driver dan 2 custom Balanced Armatures, menghadirkan suara warm-smooth, vokal tebal, dan kenyamanan eartips Tang Sancai.",
    PriceUSD: 89.0,
    PriceIDR: 1390000,
    Stock: 35,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/1__1_13.jpg?v=1755243373"
  },
  {
    StoreName: "Tangzu Official",
    StoreCity: "Yogyakarta",
    ProductName: "Tangzu Nezha Flagship",
    Brand: "Tangzu",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "Tribrid 6BA + 1EST + Piezoelectric Flagship IEM with Electroplated Shell",
    Description: "IEM flagship mahakarya Tangzu dengan konfigurasi 6 Balanced Armature, 1 Sonion Electrostatic driver, dan driver Piezo PZT untuk resolusi suara tingkat dewa dan detail panggung 3D luar biasa.",
    PriceUSD: 399.0,
    PriceIDR: 6250000,
    Stock: 10,
    Condition: "Brand New Sealed",
    ExperienceLevel: "FLAGSHIP",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/0f491dd5b19401736c48e869eb24b11.jpg?v=1699426099"
  },
  {
    StoreName: "Tangzu Official",
    StoreCity: "Surabaya",
    ProductName: "Tangzu Tang Sancai Medical Silicone Eartips (Set)",
    Brand: "Tangzu",
    Category: "ACCESSORIES",
    SpecsSummary: "Medical Grade Silicone Eartips with Matte Textured Pattern (S/M/L)",
    Description: "Eartip berpaten dengan pola relief mikroskopis untuk melepaskan tekanan udara pada kanal telinga, meningkatkan kenyamanan, dan menghasilkan vokal yang jernih tanpa sibilance.",
    PriceUSD: 14.0,
    PriceIDR: 220000,
    Stock: 150,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/tangsancai-1.png?v=1685429748"
  },

  // 13-17. Moondrop Official
  {
    StoreName: "Moondrop Official",
    StoreCity: "Semarang",
    ProductName: "Moondrop Chu II",
    Brand: "Moondrop",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm High-Performance Dynamic Driver with Al-Mg Alloy Dome & Detachable Cable",
    Description: "IEM entry level terpopuler di dunia dengan diafragma paduan Aluminium-Magnesium, bodi zinc alloy kokoh, nozzle kuningan yang dapat diganti, dan tuning VDSF Target yang seimbang natural.",
    PriceUSD: 18.99,
    PriceIDR: 299000,
    Stock: 200,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "V_SHAPE",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/5_2f49efbf-6c26-47eb-b6ad-795661381cbb.jpg?v=1689072074"
  },
  {
    StoreName: "Moondrop Official",
    StoreCity: "Yogyakarta",
    ProductName: "Moondrop Kato",
    Brand: "Moondrop",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm ULT Dynamic Driver with Replaceable Acoustic Nozzle Stainless Steel",
    Description: "IEM single dynamic legendaris dengan driver ULT generasi ketiga, diafragma DLC komposit, bodi stainless steel MIM mirror-polished, dan suara warm-neutral organik yang sangat musikal.",
    PriceUSD: 189.99,
    PriceIDR: 2950000,
    Stock: 40,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/products/Untitled-1_7e52a52d-b08f-4411-82ed-508f87b24c24b.jpg?v=1762458596"
  },
  {
    StoreName: "Moondrop Official",
    StoreCity: "Surabaya",
    ProductName: "Moondrop Variations",
    Brand: "Moondrop",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "Tribrid 1DD + 2BA + 2EST Electrostatic In-Ear Monitor",
    Description: "IEM referensi kelas atas dengan perpaduan 10mm LCP Dynamic Driver untuk sub-bass berbobot, 2 Softears BA untuk midrange vokal natural, dan dual Sonion EST untuk treble udara tanpa batas.",
    PriceUSD: 520.0,
    PriceIDR: 8190000,
    Stock: 15,
    Condition: "Brand New Sealed",
    ExperienceLevel: "ENTHUSIAST",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0023/9255/5595/files/moondrop-variations-main.png?v=1700569557"
  },
  {
    StoreName: "Moondrop Official",
    StoreCity: "Surabaya",
    ProductName: "Moondrop Dawn Pro Portable DAC/AMP",
    Brand: "Moondrop",
    Category: "DAC/AMP",
    SpecsSummary: "Dual CS43131 High-Performance DAC Chips 3.5mm SE & 4.4mm Balanced",
    Description: "Dongle DAC portabel kompak berdesain bodi aluminium CNC dengan chip ganda CS43131, volume independen 100 tingkat, dan distorsi ultra-rendah 0.00014% THD+N.",
    PriceUSD: 49.99,
    PriceIDR: 780000,
    Stock: 80,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/6_9ba20667-4051-4e9c-9f79-c1d1d0cd80fe.jpg?v=1756273127"
  },
  {
    StoreName: "Moondrop Official",
    StoreCity: "Surabaya",
    ProductName: "Moondrop Space Travel TWS",
    Brand: "Moondrop",
    Category: "WIRELESS & TWS",
    SpecsSummary: "Bluetooth 5.3 ANC True Wireless Earbuds with 13mm Titanium Dome Driver",
    Description: "TWS bertema anime cyberpunk dengan active noise cancellation (ANC) 35dB, latensi rendah 55ms untuk gaming, dan tuning kurva VDSF khas audiophile.",
    PriceUSD: 24.99,
    PriceIDR: 390000,
    Stock: 120,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/1_ca06ca06-726e-4725-b7b7-a0f3d3e9c415.jpg?v=1764839370"
  },

  // 18-20. Kinera Audio Official
  {
    StoreName: "Kinera Audio Official",
    StoreCity: "Surabaya",
    ProductName: "Kinera Celest Wyvern Pro Gaming IEM",
    Brand: "Kinera",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm LCP Diaphragm Dynamic Driver with Detachable Boom Microphone",
    Description: "IEM gaming dan musik dengan tema naga mitologi Tiongkok, diafragma LCP berkecepatan tinggi untuk akurasi positioning step suara dan mikrofon boom detachable jernih untuk voice chat.",
    PriceUSD: 29.0,
    PriceIDR: 450000,
    Stock: 60,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "V_SHAPE",
    Images: "https://www.headphonezone.in/cdn/shop/files/Headphone-Zone-Kinera-Celest-Wyvern-Pro-01.jpg?v=1698994098&width=800"
  },
  {
    StoreName: "Kinera Audio Official",
    StoreCity: "Surabaya",
    ProductName: "Kinera Celest Pandamon 2.0",
    Brand: "Kinera",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm Enhanced SPD (Square Planar Driver) 2.0 In-Ear Earphone",
    Description: "IEM berbasis Square Planar Driver generasi kedua yang memberikan transien cepat, tekstur bass punchy, dan panggung suara terbuka yang bebas distorsi harmonik.",
    PriceUSD: 59.0,
    PriceIDR: 920000,
    Stock: 40,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0257/3333/3066/files/Concept-Kart-Kinera-Celest-Pandamon-IEM-Silver-1-_12.jpg?v=1692363445"
  },
  {
    StoreName: "Kinera Audio Official",
    StoreCity: "Surabaya",
    ProductName: "Kinera Imperial Nanna 2.0 Pro",
    Brand: "Kinera",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "Tribrid 1DD + 1BA + 2 Sonion EST Flagship Hand-Painted IEM",
    Description: "IEM flagship seni lukis tangan dengan perpaduan 7mm Dynamic Driver, Sonion BA, dan dual Sonion Electrostatic driver untuk reproduksi vokal magis dan treble berkilau yang anggun.",
    PriceUSD: 949.0,
    PriceIDR: 14900000,
    Stock: 6,
    Condition: "Brand New Sealed",
    ExperienceLevel: "FLAGSHIP",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/products/150006x.jpg?v=1762457578"
  },

  // 21-22. Tanchjim Official Store
  {
    StoreName: "Tanchjim Official Store",
    StoreCity: "Surabaya",
    ProductName: "Tanchjim Tanya DSP Edition",
    Brand: "Tanchjim",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "7mm Micro Dynamic Driver with Type-C DSP DAC Built-in Cable",
    Description: "Bullet-style earphone mikro yang sangat nyaman digunakan untuk tidur atau bepergian, dilengkapi chip DSP Type-C dengan filter koreksi akustik tingkat profesional.",
    PriceUSD: 23.99,
    PriceIDR: 375000,
    Stock: 90,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0257/3333/3066/files/Concept-Kart-TANCHJIM-Tanya-Wired-IEM-with-Mic-Silver-8.jpg?v=1682946697"
  },
  {
    StoreName: "Tanchjim Official Store",
    StoreCity: "Surabaya",
    ProductName: "Tanchjim Origin Flagship Dynamic IEM",
    Brand: "Tanchjim",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm 5th Gen DMT Dynamic Driver Stainless Steel Housing with Replaceable Filters",
    Description: "Flagship single dynamic driver dari Tanchjim dengan teknologi sirkuit magnetik DMT generasi kelima, bodi stainless steel mewah, dan kejernihan vokal resolusi tinggi.",
    PriceUSD: 259.99,
    PriceIDR: 4090000,
    Stock: 20,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/1_2ae876b1-a36e-433b-848d-4d3a00159fd3.jpg?v=1706861135"
  },

  // 23-24. Tin HiFi Official Store
  {
    StoreName: "Tin hifi Official ",
    StoreCity: "Surabaya",
    ProductName: "Tin HiFi C2 Mech Warrior",
    Brand: "Tin HiFi",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm PU + LCP Composite Diaphragm Aviation Grade Aluminum Shell",
    Description: "IEM budget berdesain mecha futuristik berbahan aluminium penerbangan, menyajikan suara seimbang dengan bass berdefinisi tinggi dan treble yang renyah tanpa menusuk telinga.",
    PriceUSD: 29.0,
    PriceIDR: 450000,
    Stock: 70,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "V_SHAPE",
    Images: "https://cdn.shopify.com/s/files/1/0257/3333/3066/files/Concept-Kart-Tin-HiFi-C3-Wired-IEM-Black-2-_8_4d2a2f10-dc24-4673-bcd4-05cc0132f7d1.jpg?v=1682921010"
  },
  {
    StoreName: "Tin hifi Official ",
    StoreCity: "Surabaya",
    ProductName: "Tin HiFi T3 Plus",
    Brand: "Tin HiFi",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm LCP Dynamic Driver with 3D Resin Marble Faceplate",
    Description: "IEM favorit audiophile dengan faceplate bermotif marmer elegan, menghasilkan suara warm-engaging yang empuk untuk genre pop, akustik, dan jazz.",
    PriceUSD: 69.0,
    PriceIDR: 1080000,
    Stock: 35,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/products/9c0b4dfb9f.jpg?v=1762460390"
  },

  // 25-27. EPZ Official Store
  {
    StoreName: "EPZ Official Store",
    StoreCity: "Surabaya",
    ProductName: "EPZ Q1 Pro",
    Brand: "EPZ",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm Dual-Cavity PU+LCP Dynamic Driver 3D DLP Resin Shell",
    Description: "IEM resin cetak 3D dengan ergonomi lekuk telinga sempurna, menyajikan separasi vokal intim dan sub-bass yang bertenaga untuk penggunaan sehari-hari.",
    PriceUSD: 36.0,
    PriceIDR: 560000,
    Stock: 55,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0257/3333/3066/files/Concept-Kart-EPZ-Q1Pro-Iem-NoMic-Blu-1_9.jpg?v=1708940606"
  },
  {
    StoreName: "EPZ Official Store",
    StoreCity: "Surabaya",
    ProductName: "EPZ 530 Flagship",
    Brand: "EPZ",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "5 Balanced Armature (Sonion + Knowles) Drivers with Stabilized Wood Faceplate",
    Description: "IEM flagship murni multi-BA dengan faceplate kayu stabilisasi artistik, distorsi rendah, dan keakuratan tonal tingkat monitor panggung profesional.",
    PriceUSD: 499.0,
    PriceIDR: 7850000,
    Stock: 10,
    Condition: "Brand New Sealed",
    ExperienceLevel: "ENTHUSIAST",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/products/JIN_7796-scaled.jpg?v=1759442454"
  },
  {
    StoreName: "EPZ Official Store",
    StoreCity: "Surabaya",
    ProductName: "EPZ TP50 Portable DAC/AMP",
    Brand: "EPZ",
    Category: "DAC/AMP",
    SpecsSummary: "Dual CS43198 Flagship DAC with OLED Display & 4.4mm Balanced 240mW Output",
    Description: "DAC/Amp portabel berlayar OLED informatif dengan dual chip Cirrus Logic CS43198, dukungan DSD256, dan keluaran tenaga seimbang 4.4mm yang bersih bebas desis.",
    PriceUSD: 119.0,
    PriceIDR: 1870000,
    Stock: 25,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0257/3333/3066/files/Concept-Kart-Epz-Tp50-Dac_Amp-1_1_ac5d57de-c036-4743-b8d4-00056cb11eea.jpg?v=1711523829"
  },

  // 28-29. Kiwi Ears Official Store
  {
    StoreName: "Kiwi Ears Official Store",
    StoreCity: "Surabaya",
    ProductName: "Kiwi Ears Cadenza",
    Brand: "Kiwi Ears",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm Beryllium-Coated Dynamic Driver with 3D Medical Resin Housing",
    Description: "IEM budget legendaris dengan diafragma berlapis Beryllium yang menghadirkan respon bass cepat, tonalitas warm-balanced yang musikal, dan kenyamanan pemakaian luar biasa.",
    PriceUSD: 35.0,
    PriceIDR: 545000,
    Stock: 110,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0023/9255/5595/files/kiw-cadenza-2-thumb.webp?v=1770067306"
  },
  {
    StoreName: "Kiwi Ears Official Store",
    StoreCity: "Surabaya",
    ProductName: "Kiwi Ears Quintet",
    Brand: "Kiwi Ears",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "Quadbrid IEM (1 Diamond-Like Carbon DD + 2 BA + 1 Planar + 1 PZT Driver)",
    Description: "IEM revolusioner dengan 4 jenis driver berbeda per sisi (DLC DD, Dual Knowles BA, Micro Planar, dan Bone Conductor PZT) untuk resolusi panggung suara 3D dan detail frekuensi lengkap.",
    PriceUSD: 219.0,
    PriceIDR: 3450000,
    Stock: 25,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0023/9255/5595/files/kiwi-ears-quintet-thumb-three.webp?v=1734717472"
  },

  // 30-31. EarFun Official Store
  {
    StoreName: "Earfun Official Store",
    StoreCity: "Surabaya",
    ProductName: "EarFun Free Pro 3 TWS",
    Brand: "EarFun",
    Category: "WIRELESS & TWS",
    SpecsSummary: "Qualcomm QCC3072 aptX Adaptive ANC Wireless Earbuds with Snapdragon Sound",
    Description: "TWS ultra-kompak bersertifikasi Hi-Res Wireless dengan dukungan codec Snapdragon Sound aptX Adaptive, QuietSmart 2.0 ANC hingga 43dB, dan mode gaming latensi rendah 55ms.",
    PriceUSD: 79.99,
    PriceIDR: 1250000,
    Stock: 65,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "V_SHAPE",
    Images: "https://cdn.shopify.com/s/files/1/0257/3333/3066/products/Concept-Kart-TIN-HiFi-T3-Plus-Wired-IEM-Black-17.jpg?v=1669371152"
  },
  {
    StoreName: "Earfun Official Store",
    StoreCity: "Surabaya",
    ProductName: "EarFun Wave Pro ANC Headphones",
    Brand: "EarFun",
    Category: "HEADPHONES",
    SpecsSummary: "40mm DLC Dynamic Driver Wireless Over-Ear Headphone with LDAC & 80H Playtime",
    Description: "Headphone wireless over-ear dengan daya tahan baterai fantastis 80 jam, sertifikasi Hi-Res Audio LDAC, peredam bising aktif hybrid 45dB, dan bantalan telinga busa memori empuk.",
    PriceUSD: 89.99,
    PriceIDR: 1410000,
    Stock: 40,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "BASSHEAD",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/products/HD560S.png?v=1762457796"
  },

  // 32-35. Sony Official Store
  {
    StoreName: "Sony Official Store",
    StoreCity: "Surabaya",
    ProductName: "Sony IER-M9 Audiophile Stage Monitor",
    Brand: "Sony",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "5 Balanced Armature System with Integrated Magnesium Inner Housing",
    Description: "IEM stage monitor profesional kelas referensi dari Sony dengan 5 driver BA asli Sony, housing dalam magnesium terintegrasi, kapasitor film kelas audio, dan isolasi akustik superior.",
    PriceUSD: 999.99,
    PriceIDR: 15999000,
    Stock: 8,
    Condition: "Brand New Sealed",
    ExperienceLevel: "FLAGSHIP",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/files/assets_Asset_Hierarchy_Consumer_Assets_Portable_Electronics_Walkman_Walkman_MP3_Player_2023_NW-A306_eComm_Product_Images_NWA306B_03_NW-A300_H_angle_front_Playcopy_ed939287-7530-4d78-a71d-a7db18fdbd01.jpg?v=1762466721"
  },
  {
    StoreName: "Sony Official Store",
    StoreCity: "Surabaya",
    ProductName: "Sony IER-Z1R Flagship In-Ear Headphones",
    Brand: "Sony",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "HD Hybrid Driver System (12mm Dynamic + BA + 5mm Super Tweeter) Zirconium Housing",
    Description: "Puncak mahakarya in-ear Sony buatan tangan di Jepang dengan bodi Zirconium tahan karat, panggung suara atmosferik megah, dan kedalaman sub-bass paling bertenaga di kelas flagship.",
    PriceUSD: 1699.99,
    PriceIDR: 26999000,
    Stock: 4,
    Condition: "Brand New Sealed",
    ExperienceLevel: "FLAGSHIP",
    SoundSignature: "V_SHAPE",
    Images: "https://cdn.shopify.com/s/files/1/0153/8863/files/Headphone-Zone-Sony-IER-Z1R-01.jpg?v=1688026093"
  },
  {
    StoreName: "Sony Official Store",
    StoreCity: "Surabaya",
    ProductName: "Sony WH-1000XM5 Wireless ANC Headphones",
    Brand: "Sony",
    Category: "HEADPHONES",
    SpecsSummary: "30mm Precision Driver with Dual Processor V1 & QN1 Active Noise Canceling",
    Description: "Headphone peredam bising terbaik di kelasnya dengan 8 mikrofon pengurang kebisingan, prosesor ganda V1 & QN1, transmisi Hi-Res LDAC, dan kenyamanan desain kulit sintetis lembut.",
    PriceUSD: 399.99,
    PriceIDR: 5999000,
    Stock: 30,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/files/WH-1000XM6_black.png?v=1762469123"
  },
  {
    StoreName: "Sony Official Store",
    StoreCity: "Surabaya",
    ProductName: "Sony MDR-7506 Professional Studio Monitor",
    Brand: "Sony",
    Category: "HEADPHONES",
    SpecsSummary: "40mm Neodymium Driver Closed-Back Studio Reference Monitor Headphones",
    Description: "Headphone standar industri rekaman dunia selama puluhan tahun, menawarkan respon frekuensi akurat dan presisi tinggi untuk monitoring vokal, podcasting, dan mixing studio.",
    PriceUSD: 99.0,
    PriceIDR: 1550000,
    Stock: 50,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "BRIGHT",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/files/114436_original_local_1200x1050_v3_convertedcopy.jpg?v=1762467468"
  },

  // 36-38. Sennheiser Official Store
  {
    StoreName: "Sennheiser Official Store",
    StoreCity: "Surabaya",
    ProductName: "Sennheiser IE 200",
    Brand: "Sennheiser",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "7mm TrueResponse Transducer with Dual-Tuning Eartip Feature",
    Description: "Pintu gerbang menuju suara audiophile sejati dengan driver 7mm TrueResponse buatan Irlandia, fitur dual-tuning pada nozzle untuk memilih bass bertenaga atau vokal terbuka.",
    PriceUSD: 149.95,
    PriceIDR: 2399000,
    Stock: 45,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0153/8863/files/Headphone-Zone-Sennheiser-IE200-Black-Gallary-001.jpg?v=1787221531"
  },
  {
    StoreName: "Sennheiser Official Store",
    StoreCity: "Surabaya",
    ProductName: "Sennheiser IE 600",
    Brand: "Sennheiser",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "7mm TrueResponse Driver in 3D-Printed AMLOY-ZR01 Amorphous Zirconium Shell",
    Description: "IEM inovatif dengan bodi paduan logam amorf Zirkonium cetak 3D sekuat baja luar angkasa, resonator D2CA ganda, dan karakter suara vokal holografis yang jernih memukau.",
    PriceUSD: 699.95,
    PriceIDR: 10999000,
    Stock: 12,
    Condition: "Brand New Sealed",
    ExperienceLevel: "ENTHUSIAST",
    SoundSignature: "V_SHAPE",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/files/IE600-1.png?v=1762461080"
  },
  {
    StoreName: "Sennheiser Official Store",
    StoreCity: "Surabaya",
    ProductName: "Sennheiser HD 600 Audiophile Classic",
    Brand: "Sennheiser",
    Category: "HEADPHONES",
    SpecsSummary: "Open-Back Circumaural Dynamic Audiophile Reference Headphones 300 Ohms",
    Description: "Legenda abadi dunia headphone audiophile dengan tonalitas paling alami dan vokal paling netral yang pernah diciptakan, menjadi tolok ukur referensi mastering akustik global.",
    PriceUSD: 449.95,
    PriceIDR: 6999000,
    Stock: 20,
    Condition: "Brand New Sealed",
    ExperienceLevel: "ENTHUSIAST",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0065/4432/6771/products/Sennheiser_HD_600_Over-Ear_Open-Back_Headphones_on_sale.jpg?v=1762457349"
  },

  // 39-43. CSI ZONE Store
  {
    StoreName: "CSI ZONE Store",
    StoreCity: "Surabaya",
    ProductName: "Simgot EA500 LM",
    Brand: "Simgot",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "2nd Gen Lithium-Magnesium Dome Dynamic Driver with 3 Tuning Nozzles",
    Description: "IEM jawara kelas budget-to-mid dengan diafragma kubah Lithium-Magnesium, bodi logam cor die-cast kokoh, dan 3 pilihan nozzle filter akustik kuningan/stainless steel.",
    PriceUSD: 89.99,
    PriceIDR: 1399000,
    Stock: 50,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "BRIGHT",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/IMG_0047.jpg?v=1705473967"
  },
  {
    StoreName: "CSI ZONE Store",
    StoreCity: "Surabaya",
    ProductName: "Simgot SuperMix 4",
    Brand: "Simgot",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "Quadbrid Hybrid (1DD + 1BA + 1 Micro Planar + 1 PZT Transducer)",
    Description: "IEM quadbrid paling bernilai tinggi yang memadukan 4 jenis teknologi transduser dengan 4-way crossover RC independen untuk staging suara holografis tanpa cacat.",
    PriceUSD: 149.99,
    PriceIDR: 2350000,
    Stock: 30,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/IMG_5216.jpg?v=1715847035"
  },
  {
    StoreName: "CSI ZONE Store",
    StoreCity: "Surabaya",
    ProductName: "AFUL Performer 5",
    Brand: "AFUL Acoustics",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "1DD + 4BA Hybrid IEM with EnvisionTEC 3D-Printed Acoustic Tube & RLC Network",
    Description: "IEM hybrid berpaten tabung akustik ultra-panjang 60mm untuk sub-bass elastis dan sirkuit pembagian frekuensi RLC untuk respon vokal bebas distorsi.",
    PriceUSD: 219.99,
    PriceIDR: 3450000,
    Stock: 22,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0153/8863/files/Headphone-Zone-AFUL-Performer-7-_5_2_-4.4mm-Gallary-01.jpg?v=1787306489"
  },
  {
    StoreName: "CSI ZONE Store",
    StoreCity: "Surabaya",
    ProductName: "AFUL Performer 8",
    Brand: "AFUL Acoustics",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "1DD + 7BA Flagship Hybrid IEM with High-Precision 3D Resin Enclosure",
    Description: "IEM hybrid 8 driver per sisi dengan resolusi micro-detail setingkat studio rekaman profesional, separasi instrumen terpisah rapi, dan treble yang sangat airy.",
    PriceUSD: 369.99,
    PriceIDR: 5790000,
    Stock: 14,
    Condition: "Brand New Sealed",
    ExperienceLevel: "ENTHUSIAST",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0153/8863/files/Headphone-Zone-AFUL-Performer-8S-3.5mm-Gallary-002.jpg?v=1778579657"
  },
  {
    StoreName: "CSI ZONE Store",
    StoreCity: "Surabaya",
    ProductName: "QKZ x HBB Hades Dual Dynamic Basshead IEM",
    Brand: "QKZ",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "Dual 9mm + 7mm LCP Diaphragm Dynamic Drivers Collab with Bad Guy Good Audio Reviews",
    Description: "IEM monster basshead hasil kolaborasi bersama reviewer HBB, ditenagai dual LCP dynamic driver untuk menghasilkan dentuman sub-bass masif bagi pecinta genre EDM dan hip-hop.",
    PriceUSD: 49.99,
    PriceIDR: 780000,
    Stock: 40,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "BASSHEAD",
    Images: "https://cdn.shopify.com/s/files/1/0153/8863/files/Headphone-Zone-QKZ-x-HBB-Hades-gallery-7.jpg?v=1709360146"
  },

  // 44. Verus Audio Official Store (IEM Cables & Custom Craft)
  {
    StoreName: "Verus Audio Official Store",
    StoreCity: "Surabaya",
    ProductName: "Verus Audio Artemis 8-Core OCC Silver-Plated Modular IEM Cable",
    Brand: "Verus Audio",
    Category: "CABLES & ADAPTERS",
    SpecsSummary: "8-Core Handcrafted 6N OCC Silver-Plated Copper Cable with Modular 3.5mm/4.4mm Plugs & 0.78 2-Pin",
    Description: "Kabel upgrade IEM buatan tangan (handcrafted) dari Verus Audio berbahan kawat tembaga murni 6N OCC lapis perak 8-core. Menghadirkan peningkatan resolusi suara, staging panggung lebih megah, vokal berbobot jernih, dan sistem plug modular 3.5mm & 4.4mm praktis.",
    PriceUSD: 59.0,
    PriceIDR: 925000,
    Stock: 40,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/products/TripowinNoire-7.jpg?v=1639722508"
  },

  // 45. Xinhs Official Store
  {
    StoreName: "Xinhs Official Store",
    StoreCity: "Surabaya",
    ProductName: "XINHS 8-Core Graphene Silver-Plated Copper IEM Cable",
    Brand: "XINHS",
    Category: "CABLES & ADAPTERS",
    SpecsSummary: "8-Core Hybrid Graphene + Single Crystal Copper Silver-Plated 0.78 2-Pin to 4.4mm Balanced",
    Description: "Kabel upgrade IEM rajutan tangan 8-core berkonduktivitas tinggi berbahan hybrid tembaga monokristalin lapis perak dan graphene untuk kejernihan vokal dan panggung suara lebih lebar.",
    PriceUSD: 45.0,
    PriceIDR: 710000,
    Stock: 60,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/products/1_5_7cb48c37-e9c1-4b50-a670-77f04a974b49.jpg?v=1667301161"
  },

  // 46. KBEAR Official Store
  {
    StoreName: "KBEAR Official Store",
    StoreCity: "Surabaya",
    ProductName: "KBEAR Ormosia",
    Brand: "KBEAR",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "1DD + 2BA Hybrid Earphone CNC Aluminum Faceplate 0.78 2Pin",
    Description: "IEM hybrid ramah di kantong dengan bodi aluminium CNC elegan, menghadirkan respon bass dynamic yang empuk dan kejernihan vokal dual balanced armature.",
    PriceUSD: 39.0,
    PriceIDR: 610000,
    Stock: 50,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0257/3333/3066/products/Concept-Kart-KBEAR-8-Core-Limpid-Pro-Upgrade-Cable-For-IEM-Silver-2_3c5c9147-b479-4690-8beb-73834e6487e2.jpg?v=1669379687"
  },

  // 47. Effect Audio Official Store
  {
    StoreName: "Effect Audio Official Store",
    StoreCity: "Surabaya",
    ProductName: "Effect Audio Ares S Flagship Upgrade Cable",
    Brand: "Effect Audio",
    Category: "CABLES & ADAPTERS",
    SpecsSummary: "UP-OCC Pure Copper 4-Wire 24 AWG with Modular ConX 2-Pin/MMCX & TermX Connectors",
    Description: "Kabel upgrade IEM tembaga murni UP-OCC legendaris buatan Singapura dengan teknologi geometri multi-strand, memperkaya bobot vokal pria, tekstur bass mendalam, dan kehangatan suara alami.",
    PriceUSD: 199.0,
    PriceIDR: 3150000,
    Stock: 15,
    Condition: "Brand New Sealed",
    ExperienceLevel: "ENTHUSIAST",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0911/4281/6054/files/AresSII_-1.jpg?v=1742888288"
  },

  // 48-50. Truthear Official Store
  {
    StoreName: "Truthear Official Store",
    StoreCity: "Surabaya",
    ProductName: "Truthear GATE",
    Brand: "Truthear",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm Dynamic Driver with Carbon LCP Diaphragm & Transparent Shell",
    Description: "IEM budget penerus Truthear Hola dengan diafragma Carbon LCP, distorsi ultra-rendah di bawah 0.2%, dan tuning neutral-smooth yang sangat nyaman didengarkan berjam-jam.",
    PriceUSD: 19.99,
    PriceIDR: 315000,
    Stock: 150,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "NEUTRAL",
    Images: "https://www.headphonezone.in/cdn/shop/files/Headphone-zone-ooopusX-Op-22-Gallary-030.jpg?v=1785913287&width=800"
  },
  {
    StoreName: "Truthear Official Store",
    StoreCity: "Surabaya",
    ProductName: "Truthear HEXA",
    Brand: "Truthear",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "1DD + 3BA Hybrid In-Ear Monitor DLP 3D-Printed Acoustic Structure",
    Description: "IEM hybrid patokan (benchmark) di bawah 1 juta rupiah dengan 1 Dynamic Driver poliuretan untuk bass bersih dan 3 Balanced Armature custom untuk vokal transparan dan imaging presisi.",
    PriceUSD: 79.99,
    PriceIDR: 1250000,
    Stock: 75,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/1791/0383/files/TruthearHexa1024x1024.jpg?v=1709186773"
  },
  {
    StoreName: "Truthear Official Store",
    StoreCity: "Surabaya",
    ProductName: "Truthear NOVA",
    Brand: "Truthear",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "1DD + 4BA Hybrid IEM with DLP 3D Medical Resin & Harman Target 2019 Tuning",
    Description: "IEM hybrid 5 driver yang disetel presisi mendekati kurva Harman Target 2019, menghadirkan sub-bass yang punchy, vokal wanita yang sangat forward dan jernih, serta separasi instrumen terpisah rapi.",
    PriceUSD: 149.99,
    PriceIDR: 2350000,
    Stock: 30,
    Condition: "Brand New Sealed",
    ExperienceLevel: "INTERMEDIATE",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/1791/0383/files/TruthearNova201024x1024.jpg?v=1709186626"
  },

  // 51. ThieAudio Official Store
  {
    StoreName: "ThieAudio Official Store ",
    StoreCity: "Surabaya",
    ProductName: "Thieaudio Monarch MKIII Flagship Tribrid IEM",
    Brand: "Thieaudio",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "Tribrid IEM (2 Dynamic Drivers IMPACT2 + 6 BA + 2 Electrostatic Drivers)",
    Description: "IEM kelas endgame legendaris dengan sistem isobaric sub-woofer IMPACT2 ganda untuk hentakan bass bertenaga tanpa mengorbankan kejernihan midrange, serta dual electrostatic driver Sonion untuk ekstensi treble tanpa batas.",
    PriceUSD: 999.0,
    PriceIDR: 15750000,
    Stock: 8,
    Condition: "Brand New Sealed",
    ExperienceLevel: "FLAGSHIP",
    SoundSignature: "NEUTRAL",
    Images: "https://cdn.shopify.com/s/files/1/0023/9255/5595/files/thieaudio-monarch-mk3-0-thumb.jpg?v=1689965513"
  },

  // 52. 7Hz Official Store
  {
    StoreName: "7hz  Official Store",
    StoreCity: "Surabaya",
    ProductName: "7Hz x Crinacle Zero:2",
    Brand: "7Hz",
    Category: "IN-EAR MONITORS",
    SpecsSummary: "10mm High-Performance Dynamic Driver with Upgraded PU+LCP Diaphragm",
    Description: "IEM kolaborasi bersama reviewer Crinacle generasi kedua dengan peningkatan tekstur sub-bass lebih berbobot, midrange tonal natural, dan kabel tembaga lapis perak bebas kusut.",
    PriceUSD: 24.99,
    PriceIDR: 390000,
    Stock: 180,
    Condition: "Brand New Sealed",
    ExperienceLevel: "BEGINNER",
    SoundSignature: "WARM",
    Images: "https://cdn.shopify.com/s/files/1/0040/7201/3924/files/203A4941_1_7561cf09-026c-4fe6-958d-1c7b5ee37a4f.jpg?v=1739258197"
  }
];

export function generateExcel() {
  const worksheet = XLSX.utils.json_to_sheet(MASTER_PRODUCTS);

  worksheet["!cols"] = [
    { wch: 28 }, // StoreName
    { wch: 18 }, // StoreCity
    { wch: 38 }, // ProductName
    { wch: 18 }, // Brand
    { wch: 22 }, // Category
    { wch: 48 }, // SpecsSummary
    { wch: 70 }, // Description
    { wch: 12 }, // PriceUSD
    { wch: 14 }, // PriceIDR
    { wch: 8 },  // Stock
    { wch: 20 }, // Condition
    { wch: 18 }, // ExperienceLevel
    { wch: 16 }, // SoundSignature
    { wch: 55 }, // Images
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Master_Products");

  // Output paths in tonal-zone and workspace root
  const paths = [
    path.resolve(process.cwd(), "tonalzone_master_products_template.xlsx"),
    path.resolve(process.cwd(), "..", "tonalzone_master_products_template.xlsx"),
    path.resolve(process.cwd(), "..", "tonalzone_master_products_updated.xlsx"),
  ];

  paths.forEach((targetPath) => {
    try {
      XLSX.writeFile(workbook, targetPath);
      console.log(`[Success] Native Excel created: ${targetPath}`);
    } catch (e: any) {
      console.error(`[Warning] Could not write to ${targetPath}:`, e.message);
    }
  });

  // CSV outputs
  const csvStandard = XLSX.utils.sheet_to_csv(worksheet, { FS: "," });
  const csvSemicolon = XLSX.utils.sheet_to_csv(worksheet, { FS: ";" });

  [
    path.resolve(process.cwd(), "tonalzone_master_products_template.csv"),
    path.resolve(process.cwd(), "..", "tonalzone_master_products_template.csv"),
  ].forEach((targetPath) => {
    try {
      fs.writeFileSync(targetPath, "\uFEFF" + csvStandard, "utf-8");
      console.log(`[Success] Comma CSV created: ${targetPath}`);
    } catch (e: any) {}
  });

  [
    path.resolve(process.cwd(), "tonalzone_master_products_semicolon.csv"),
    path.resolve(process.cwd(), "..", "tonalzone_master_products_semicolon.csv"),
  ].forEach((targetPath) => {
    try {
      fs.writeFileSync(targetPath, "\uFEFF" + csvSemicolon, "utf-8");
      console.log(`[Success] Semicolon CSV created: ${targetPath}`);
    } catch (e: any) {}
  });
}

generateExcel();

