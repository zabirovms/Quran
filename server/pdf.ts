import puppeteer from "puppeteer";
import { storage } from "./storage";

export async function generateSurahPdfBuffer(surahNumber: number): Promise<Uint8Array> {
  const surah = await storage.getSurahByNumber(surahNumber);
  if (!surah) {
    throw Object.assign(new Error("Surah not found"), { status: 404 });
  }
  const verses = await storage.getVersesBySurah(surah.id);

  const html = buildSurahHtml({
    surahArabicName: surah.name_arabic,
    surahTajikName: surah.name_tajik,
    surahEnglishName: surah.name_english,
    surahNumber: surah.number,
    verses: verses.map(v => ({
      number: v.verse_number,
      arabic: v.arabic_text,
      tajik: v.tajik_text,
      tafsir: v.tafsir || ""
    }))
  });

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "16mm", right: "16mm" }
    });
    await page.close();
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

function buildSurahHtml(input: {
  surahArabicName: string;
  surahTajikName: string;
  surahEnglishName: string;
  surahNumber: number;
  verses: { number: number; arabic: string; tajik: string; tafsir: string }[];
}): string {
  const verseBlocks = input.verses.map(v => `
    <section class="verse">
      <div class="verse-header">${input.surahNumber}:${v.number}</div>
      <div class="arabic" dir="rtl">${escapeHtml(v.arabic)}</div>
      <div class="tajik" dir="ltr">${escapeHtml(v.tajik)}</div>
      ${v.tafsir ? `<div class="tafsir" dir="ltr">${escapeHtml(v.tafsir)}</div>` : ""}
    </section>
  `).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Surah ${input.surahNumber} – ${escapeHtml(input.surahEnglishName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 20mm 16mm; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'Noto Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif; color: #111; }
    .cover {
      text-align: center;
      margin-bottom: 12mm;
      padding-bottom: 8mm;
      border-bottom: 2px solid #e5e7eb;
    }
    .surah-ar { font-family: 'Noto Naskh Arabic', serif; font-size: 28px; line-height: 1.4; direction: rtl; }
    .surah-tj { font-size: 18px; margin-top: 4px; color: #374151; }
    .surah-en { font-size: 14px; color: #6b7280; }
    .meta { margin-top: 4px; font-size: 12px; color: #6b7280; }
    .verse { page-break-inside: avoid; margin-bottom: 10mm; }
    .verse-header { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .arabic { font-family: 'Noto Naskh Arabic', serif; font-size: 22px; line-height: 2.0; text-align: right; margin-bottom: 6px; }
    .tajik { font-size: 14px; line-height: 1.6; margin-bottom: 6px; }
    .tafsir { font-size: 13px; line-height: 1.6; color: #374151; background: #f9fafb; border-left: 3px solid #e5e7eb; padding: 8px 10px; }
    .footer { position: fixed; bottom: 10mm; left: 0; right: 0; text-align: center; font-size: 11px; color: #9ca3af; }
  </style>
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:;">
  </head>
<body>
  <div class="cover">
    <div class="surah-ar" dir="rtl">${escapeHtml(input.surahArabicName)}</div>
    <div class="surah-tj">${escapeHtml(input.surahTajikName)}</div>
    <div class="surah-en">${escapeHtml(input.surahEnglishName)}</div>
    <div class="meta">Surah ${input.surahNumber} • Verses: ${input.verses.length}</div>
  </div>
  ${verseBlocks}
  <div class="footer">Generated from quran.tj</div>
</body>
</html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

