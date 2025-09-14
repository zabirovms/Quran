import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Surah, Verse, SurahWithTranslation, VerseWithTranslation } from '@shared/schema';

async function fetcher<T>(key: string): Promise<T> {
  const response = await fetch(key);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export function useSurahs() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useQuery<SurahWithTranslation[]>({
    queryKey: [`/api/surahs?lang=${lang}`],
    queryFn: ({ queryKey }) => fetcher(queryKey[0]),
    staleTime: Infinity,
  });
}

export function useSurah(surahNumber: number) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useQuery<SurahWithTranslation>({
    queryKey: [`/api/surahs/${surahNumber}?lang=${lang}`],
    queryFn: ({ queryKey }) => fetcher(queryKey[0]),
    enabled: !!surahNumber && surahNumber > 0,
  });
}

export function useVerses(surahNumber: number) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useQuery<VerseWithTranslation[]>({
    queryKey: [`/api/surahs/${surahNumber}/verses?lang=${lang}`],
    queryFn: ({ queryKey }) => fetcher(queryKey[0]),
    enabled: !!surahNumber && surahNumber > 0,
  });
}

export function useVerse(key: string) {
  return useQuery<Verse>({
    queryKey: [`/api/verses/${key}`],
    enabled: !!key && /^\d+:\d+$/.test(key),
  });
}

export function useSearchVerses(query: string, language?: 'arabic' | 'tajik' | 'both', surahId?: number) {
  const queryParams = new URLSearchParams();
  if (query) queryParams.append('q', query);
  if (language) queryParams.append('language', language);
  if (surahId) queryParams.append('surah', surahId.toString());

  return useQuery<Verse[]>({
    queryKey: [`/api/search?${queryParams.toString()}`],
    enabled: !!query, // Only run query when we have a search term
  });
}
