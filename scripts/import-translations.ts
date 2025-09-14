import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';

const QURAN_RU_URL = 'https://cdn.jsdelivr.net/npm/quran-cloud@1.0.0/dist/quran_ru.json';
const QURAN_EN_URL = 'https://cdn.jsdelivr.net/npm/quran-cloud@1.0.0/dist/quran_en.json';
const DATA_DIR = path.join(__dirname, '..', 'data');

interface QuranData {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
  verses: {
    id: number;
    text: string;
    translation: string;
  }[];
}

interface TranslationOutput {
  surahs: {
    id: number;
    name: string;
    transliteration: string;
    verses: {
      id: number;
      text: string;
    }[];
  }[];
}

async function fetchData(url: string): Promise<QuranData[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json() as Promise<QuranData[]>;
}

function transformData(data: QuranData[]): TranslationOutput {
  return {
    surahs: data.map(surahData => ({
      id: surahData.id,
      name: surahData.translation, // This is the surah name translation
      transliteration: surahData.name, // This is the transliterated name
      verses: surahData.verses.map(verse => ({
        id: verse.id,
        text: verse.translation, // This is the verse translation
      })),
    })),
  };
}

async function main() {
  console.log('Starting translation import...');

  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // --- Russian Translations ---
    console.log('Fetching Russian translation data...');
    const russianRawData = await fetchData(QURAN_RU_URL);
    console.log('Processing Russian data...');
    const russianData = transformData(russianRawData);
    const ruFilePath = path.join(DATA_DIR, 'ru.json');
    console.log(`Writing Russian translations to ${ruFilePath}...`);
    await fs.writeFile(ruFilePath, JSON.stringify(russianData, null, 2));
    console.log('Russian translations stored successfully.');

    // --- English Translations ---
    console.log('Fetching English translation data...');
    const englishRawData = await fetchData(QURAN_EN_URL);
    console.log('Processing English data...');
    const englishData = transformData(englishRawData);
    const enFilePath = path.join(DATA_DIR, 'en.json');
    console.log(`Writing English translations to ${enFilePath}...`);
    await fs.writeFile(enFilePath, JSON.stringify(englishData, null, 2));
    console.log('English translations stored successfully.');

  } catch (error) {
    console.error('Error importing translations:', error);
    process.exit(1);
  }

  console.log('Translation import script finished.');
}

main();
