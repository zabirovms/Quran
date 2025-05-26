/**
 * Utility functions for working with the Uthmani Quran text
 * This module implements optimized loading strategies for Quranic text:
 * 1. Lazy loading - only load data when needed
 * 2. Surah-based chunking - load one surah at a time
 * 3. Local storage caching - store loaded surahs for future visits
 * 4. Memory caching - avoid repeated processing
 */

interface UthmaniWord {
  word_index: number;
  location: string;
  text: string;
}

interface UthmaniData {
  [key: string]: UthmaniWord;
}

// Cache for storing loaded surah data
interface SurahCache {
  [surahNumber: number]: {
    data: UthmaniData;
    timestamp: number;
  }
}

// In-memory cache of loaded surah data
const surahCache: SurahCache = {};

// Cache for processed verse text
const verseTextCache: Record<string, string> = {};

// Constants
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LOCALSTORAGE_PREFIX = 'uthmani_surah_';

/**
 * Load Uthmani data for a specific surah only
 */
export async function loadSurahData(surahNumber: number): Promise<UthmaniData> {
  // First check memory cache
  if (surahCache[surahNumber]) {
    return surahCache[surahNumber].data;
  }
  
  // Then check localStorage cache
  try {
    const cachedData = localStorage.getItem(`${LOCALSTORAGE_PREFIX}${surahNumber}`);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      // Check if cache is still valid
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
        // Store in memory cache and return
        surahCache[surahNumber] = parsed;
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn('Error accessing localStorage:', e);
    // Continue with fetch if localStorage fails
  }
  
  // If not in cache, fetch from server
  try {
    const response = await fetch(`/uthmani_${surahNumber}.json`);
    
    // If surah-specific file not found, fall back to full file but filter for this surah
    if (!response.ok) {
      return loadAndFilterFromFullFile(surahNumber);
    }
    
    const data = await response.json();
    
    // Save to caches
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };
    
    surahCache[surahNumber] = cacheEntry;
    
    try {
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}${surahNumber}`, JSON.stringify(cacheEntry));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
    
    return data;
  } catch (error) {
    console.error(`Error loading Uthmani data for surah ${surahNumber}:`, error);
    return loadAndFilterFromFullFile(surahNumber);
  }
}

/**
 * Fallback method to load from the full file and filter for the specific surah
 */
async function loadAndFilterFromFullFile(surahNumber: number): Promise<UthmaniData> {
  try {
    const response = await fetch('/uthmani.json');
    if (!response.ok) {
      throw new Error(`Failed to load Uthmani Quran data: ${response.status}`);
    }
    
    const fullData = await response.json();
    
    // Filter data for the specific surah
    const surahPrefix = `${surahNumber}:`;
    const filteredData: UthmaniData = {};
    
    Object.keys(fullData).forEach(key => {
      if (key.startsWith(surahPrefix)) {
        filteredData[key] = fullData[key];
      }
    });
    
    // Save to caches
    const cacheEntry = {
      data: filteredData,
      timestamp: Date.now()
    };
    
    surahCache[surahNumber] = cacheEntry;
    
    try {
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}${surahNumber}`, JSON.stringify(cacheEntry));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
    
    return filteredData;
  } catch (error) {
    console.error('Error loading and filtering from full file:', error);
    // Return empty object if all attempts fail
    return {};
  }
}

/**
 * Preload data for a specific surah in the background
 */
export function preloadSurahData(surahNumber: number): void {
  // Don't await, let it load in the background
  loadSurahData(surahNumber).catch(err => 
    console.warn(`Background preload of surah ${surahNumber} failed:`, err)
  );
}

/**
 * Preload adjacent surahs for better navigation experience
 */
export function preloadAdjacentSurahs(currentSurah: number): void {
  if (currentSurah > 1) {
    preloadSurahData(currentSurah - 1);
  }
  if (currentSurah < 114) {
    preloadSurahData(currentSurah + 1);
  }
}

/**
 * Get the complete text for a specific verse by combining all its words
 */
export async function getVerseText(surahNumber: number, ayahNumber: number): Promise<string> {
  // First check verse text cache
  const cacheKey = `${surahNumber}:${ayahNumber}`;
  if (verseTextCache[cacheKey]) {
    return verseTextCache[cacheKey];
  }
  
  // Load surah data
  const data = await loadSurahData(surahNumber);
  
  // Find all words for this verse and sort them by word index
  const wordsForVerse: UthmaniWord[] = [];
  
  // The key format in the JSON is "surah:ayah:word"
  const versePrefix = `${surahNumber}:${ayahNumber}:`;
  
  // Collect all words for this verse
  Object.keys(data).forEach(key => {
    if (key.startsWith(versePrefix)) {
      wordsForVerse.push(data[key]);
    }
  });
  
  // Sort words by their index to maintain correct order
  wordsForVerse.sort((a, b) => a.word_index - b.word_index);
  
  // Process each word to clean it and prepare for proper spacing
  const processedWords = wordsForVerse.map(word => {
    // 1. Remove any verse numbers (Arabic numerals) from the word text
    const noNumbers = word.text.replace(/[\u0660-\u0669]+/g, '');
    // 2. Remove any extra spaces within the word
    const noExtraSpaces = noNumbers.replace(/\s+/g, '');
    // 3. Ensure the word is properly trimmed
    return noExtraSpaces.trim();
  });
  
  // Join words with a proper space between them - use a single space for more compact display
  const verseText = processedWords.join(' ');
  
  // Final cleaning to ensure no verse numbers remain at the end
  const cleanedText = verseText.replace(/[\u0660-\u0669]+$/, '');
  
  // Cache the result
  verseTextCache[cacheKey] = cleanedText || '';
  
  return cleanedText || '';
}

/**
 * Get all verses for a specific surah in batches
 * This is an optimized version that loads verses in chunks
 */
export async function getSurahVerses(surahNumber: number, versesCount: number, batchSize = 10): Promise<string[]> {
  const verses: string[] = new Array(versesCount);
  
  // Pre-load the data for this surah to avoid multiple fetch requests
  const surahData = await loadSurahData(surahNumber);
  
  // Process verses in batches
  const batches = Math.ceil(versesCount / batchSize);
  
  for (let batch = 0; batch < batches; batch++) {
    const start = batch * batchSize + 1;
    const end = Math.min(start + batchSize - 1, versesCount);
    
    // Process this batch of verses
    await Promise.all(
      Array.from({ length: end - start + 1 }, async (_, i) => {
        const verseNumber = start + i;
        const verseText = await getVerseText(surahNumber, verseNumber);
        verses[verseNumber - 1] = verseText;
      })
    );
  }
  
  return verses;
}

/**
 * Get visible verses for a specific surah based on pagination
 */
export async function getVisibleVerses(surahNumber: number, page: number, versesPerPage: number, totalVerses: number): Promise<string[]> {
  const startVerse = (page - 1) * versesPerPage + 1;
  const endVerse = Math.min(startVerse + versesPerPage - 1, totalVerses);
  
  const verses: string[] = [];
  
  // Load only the visible verses
  for (let i = startVerse; i <= endVerse; i++) {
    const verseText = await getVerseText(surahNumber, i);
    verses.push(verseText);
  }
  
  return verses;
}

/**
 * Get words array for a specific verse (for word-by-word analysis)
 */
export async function getVerseWords(surahNumber: number, ayahNumber: number): Promise<UthmaniWord[]> {
  const data = await loadSurahData(surahNumber);
  
  // Find all words for this verse and sort them by word index
  const wordsForVerse: UthmaniWord[] = [];
  
  // The key format in the JSON is "surah:ayah:word"
  const versePrefix = `${surahNumber}:${ayahNumber}:`;
  
  // Collect all words for this verse
  Object.keys(data).forEach(key => {
    if (key.startsWith(versePrefix)) {
      wordsForVerse.push(data[key]);
    }
  });
  
  // Sort words by their index to maintain correct order
  return wordsForVerse.sort((a, b) => a.word_index - b.word_index);
}

/**
 * Convert verse words from Uthmani JSON to the format expected by WordByWordText component
 */
export async function getWordAnalysisForVerse(surahNumber: number, ayahNumber: number): Promise<any[]> {
  const words = await getVerseWords(surahNumber, ayahNumber);
  
  // Convert to the format expected by WordByWordText component
  return words.map((word, index) => ({
    id: word.word_index,
    verse_id: 0, // Not needed for display
    word_position: index + 1,
    word_text: word.text,
    translation: "", // Can be populated later if translation data is available
    created_at: new Date()
  }));
}