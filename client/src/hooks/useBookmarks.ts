import { useState, useEffect, useCallback } from 'react';
import { Verse } from '@shared/schema';

interface LocalBookmark {
  id: string; // unique identifier
  verseId: number;
  verseKey: string; // format: "surah:verse"
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  tajikText: string;
  surahName: string;
  createdAt: number; // timestamp
}

interface BookmarkWithVerse {
  bookmark: LocalBookmark;
  verse: Verse;
}

const BOOKMARKS_STORAGE_KEY = 'quran_bookmarks';

// Helper functions for localStorage
const getBookmarksFromStorage = (): LocalBookmark[] => {
  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading bookmarks from localStorage:', error);
    return [];
  }
};

const saveBookmarksToStorage = (bookmarks: LocalBookmark[]): void => {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks to localStorage:', error);
  }
};

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<LocalBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const storedBookmarks = getBookmarksFromStorage();
    setBookmarks(storedBookmarks);
    setIsLoading(false);
  }, []);

  // Update localStorage when bookmarks change
  useEffect(() => {
    if (!isLoading) {
      saveBookmarksToStorage(bookmarks);
    }
  }, [bookmarks, isLoading]);

  return {
    data: bookmarks,
    isLoading,
    refetch: useCallback(() => {
      const storedBookmarks = getBookmarksFromStorage();
      setBookmarks(storedBookmarks);
    }, [])
  };
}

export function useAddBookmark() {
  const { data: bookmarks, refetch } = useBookmarks();

  const mutate = useCallback(async (verseData: {
    verseId: number;
    verseKey: string;
    surahNumber: number;
    verseNumber: number;
    arabicText: string;
    tajikText: string;
    surahName: string;
  }) => {
    const newBookmark: LocalBookmark = {
      id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...verseData,
      createdAt: Date.now()
    };

    const updatedBookmarks = [...(bookmarks || []), newBookmark];
    saveBookmarksToStorage(updatedBookmarks);
    refetch();

    return newBookmark;
  }, [bookmarks, refetch]);

  return { mutate };
}

export function useRemoveBookmark() {
  const { data: bookmarks, refetch } = useBookmarks();

  const mutate = useCallback(async (bookmarkId: string) => {
    const updatedBookmarks = (bookmarks || []).filter(b => b.id !== bookmarkId);
    saveBookmarksToStorage(updatedBookmarks);
    refetch();
  }, [bookmarks, refetch]);

  return { mutate };
}

export function useIsVerseBookmarked(verseId: number) {
  const { data: bookmarks, isLoading } = useBookmarks();
  
  if (isLoading || !bookmarks) {
    return { isBookmarked: false, bookmarkId: null, isLoading };
  }
  
  const bookmark = bookmarks.find(b => b.verseId === verseId);
  
  return {
    isBookmarked: !!bookmark,
    bookmarkId: bookmark?.id || null,
    isLoading
  };
}

// Helper function to get bookmarks with verse data
export function useBookmarksWithVerses() {
  const { data: bookmarks, isLoading } = useBookmarks();
  
  // For localStorage bookmarks, we already have the verse data embedded
  // So we can return it directly without needing to fetch from server
  const bookmarksWithVerses: BookmarkWithVerse[] = (bookmarks || []).map(bookmark => ({
    bookmark,
    verse: {
      id: bookmark.verseId,
      surah_id: bookmark.surahNumber,
      verse_number: bookmark.verseNumber,
      arabic_text: bookmark.arabicText,
      tajik_text: bookmark.tajikText,
      unique_key: bookmark.verseKey,
      // Add other required fields with default values
      transliteration: null,
      tj_2: null,
      tj_3: null,
      farsi: null,
      russian: null,
      tafsir: null,
      page: null,
      juz: null
    }
  }));

  return {
    data: bookmarksWithVerses,
    isLoading
  };
}
