const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  PageBreak,
  BorderStyle,
  convertInchesToTwip,
  UnderlineType,
} = require("docx");

async function generateDocx() {
  const imagePath = path.resolve(__dirname, "../Group 8.png");
  let imageBuffer = null;
  if (fs.existsSync(imagePath)) {
    imageBuffer = fs.readFileSync(imagePath);
  } else {
    console.warn("Image file not found at:", imagePath);
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 24, // 12pt
            color: "000000",
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              after: 140,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          // 1. Assertion
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "1. Assertion (Klaim Utama / Hero Section)",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: convertInchesToTwip(0.4) },
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "•  Fungsi: ",
                bold: true,
                size: 23,
              }),
              new TextRun({
                text: "Menarik perhatian pengunjung seketika di bagian paling atas (Hero Banner).",
                size: 23,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: '"Dengarkan Setiap Detail, Rasakan Kemurnian Suara bersama Tonal Zone."',
                italics: true,
                size: 23,
              }),
            ],
          }),

          // 2. Reason
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "2. Reason (Alasan Keunggulan / Features Section)",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: convertInchesToTwip(0.4) },
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "•  Fungsi: ",
                bold: true,
                size: 23,
              }),
              new TextRun({
                text: "Menjelaskan mengapa Tonal Zone menjadi solusi tepat bagi pencinta audio (kurasi presisi akustik, transparansi kurva respons frekuensi, keaslian unit, dan transaksi escrow aman).",
                size: 23,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: '"Kami memastikan setiap IEM dan perangkat audio terkurasi secara ketat dengan transparansi grafik frekuensi respons nyata, jaminan keaslian unit 100%, serta didukung sistem transaksi rekening bersama (escrow) yang melindungi pembeli dan penjual secara aman."',
                italics: true,
                size: 23,
              }),
            ],
          }),

          // 3. Evidence
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "3. Evidence (Bukti Sosial & Statistik / Social Proof Section)",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: convertInchesToTwip(0.4) },
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "•  Fungsi: ",
                bold: true,
                size: 23,
              }),
              new TextRun({
                text: "Membangun kepercayaan calon pembeli dan komunitas audiophile (Trust & Credibility).",
                size: 23,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: '"50+ Model IEM & DAC Terkurasi • 10.000+ Audiophile Puas • 100% Produk Terverifikasi & Dilindungi Sistem Escrow Tonal Zone."',
                italics: true,
                size: 23,
              }),
            ],
          }),

          // 4. Conclusion
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "4. Conclusion (Ajakan Bertindak / Call-to-Action Button)",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: convertInchesToTwip(0.4) },
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "•  Fungsi: ",
                bold: true,
                size: 23,
              }),
              new TextRun({
                text: "Mengarahkan pengunjung untuk segera mencari model IEM yang cocok, membandingkan grafik suara, atau melakukan pembelian.",
                size: 23,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: '"Mulai cari IEM impianmu sekarang dan amankan perangkat audio terbaikmu hari ini!"',
                italics: true,
                size: 23,
              }),
            ],
          }),

          // PAGE 2: Visual Hero Section
          new Paragraph({
            children: [new PageBreak()],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: "TAMPILAN HERO SECTION TONAL ZONE",
                bold: true,
                size: 26,
              }),
            ],
          }),

          ...(imageBuffer
            ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 200 },
                  children: [
                    new ImageRun({
                      data: imageBuffer,
                      transformation: {
                        width: 580, // width in points
                        height: 326, // 16:9 ratio
                      },
                    }),
                  ],
                }),
              ]
            : []),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: 'Visual Mockup Hero Section dengan Slogan Bahasa Indonesia: "Dengarkan Setiap Detail, Rasakan Kemurnian Suara"',
                italics: true,
                size: 20,
                color: "555555",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const outputPath = path.resolve(__dirname, "../matriks tonal zone.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log("Successfully generated:", outputPath);
}

generateDocx().catch((err) => {
  console.error("Error generating docx:", err);
  process.exit(1);
});
