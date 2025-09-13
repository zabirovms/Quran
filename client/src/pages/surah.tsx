import { useState, useEffect, useRef, useCallback } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import SeoHead from '@/components/shared/SeoHead';
import { Surah } from '@/types';
import { getAllSurahs, getSurahByNumber } from '@/lib/surahData';
import { useAudioPlayer } from '@/hooks/useAudio';
import CompactVerseItem from '@/components/quran/CompactVerseItem';
import SmartSticky from '@/components/layout/SmartSticky';
import VerseNavigation from '@/components/quran/VerseNavigation';
import { Button } from '@/components/ui/button';
import { Home, Search, Bookmark, Book, Info, Volume2, Settings, List } from 'lucide-react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { SettingsContent } from '@/components/layout/SettingsDrawer';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface SurahPageProps {
  surah: Surah;
}

const VERSES_PER_PAGE = 10;

export default function SurahPage({ surah }: SurahPageProps) {
  const { playAudio, setPlaylist } = useAudioPlayer();
  const { contentViewMode } = useDisplaySettings();

  const [currentPage, setCurrentPage] = useState(1);
  const [visibleVerses, setVisibleVerses] = useState(surah.verses.slice(0, VERSES_PER_PAGE));
  const [currentVerse, setCurrentVerse] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(surah.verses.length > VERSES_PER_PAGE);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load next page of verses
  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const newVerses = surah.verses.slice(0, nextPage * VERSES_PER_PAGE);
      setVisibleVerses(newVerses);
      setCurrentPage(nextPage);
      setHasNextPage(newVerses.length < surah.verses.length);
      setIsFetchingNextPage(false);
    }, 200);
  }, [currentPage, hasNextPage, isFetchingNextPage, surah.verses]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        loadNextPage();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadNextPage]);

  // Set playlist for audio player
  useEffect(() => {
    const keys = surah.verses.map(v => `${surah.number}:${v.verse_number}`);
    setPlaylist(keys, { surahNumber: surah.number, surahName: surah.name_tajik });
  }, [surah, setPlaylist]);

  const handleVerseNavigation = (verseNumber: number) => {
    setCurrentVerse(verseNumber);
    const verseElement = verseRefs.current[`${surah.number}:${verseNumber}`];
    if (verseElement) {
      const headerHeight = 120;
      const offsetPosition = verseElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <>
      <SeoHead
        title={`Сураи ${surah.name_tajik} (${surah.number}) - Қуръон`}
        description={`Тарҷума ва тафсири Сураи ${surah.name_tajik}. Маълумоти пурра дар бораи сураи ${surah.number}-уми Қуръони Карим.`}
        canonicalUrl={`https://www.quran.tj/surah/${surah.number}`}
      />

      <SmartSticky className="bg-background/80 backdrop-blur-sm border-b">
        <header className="container mx-auto px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-primary">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Асосӣ</span>
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bookmark className="h-5 w-5" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Танзимот</SheetTitle>
                </SheetHeader>
                <SettingsContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <VerseNavigation
          currentVerse={currentVerse}
          totalVerses={surah.verses_count}
          onNavigate={handleVerseNavigation}
          currentSurahNumber={surah.number}
        />
      </SmartSticky>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6 p-6 shadow-lg">
          <h1 className="text-3xl font-bold">{surah.name_tajik}</h1>
          <h2 className="text-2xl font-arabic">{surah.name_arabic}</h2>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Book className="h-4 w-4" /> Сураи {surah.number}
            </span>
            <span className="flex items-center gap-1">
              <List className="h-4 w-4" /> {surah.verses_count} оят
            </span>
            <span className="flex items-center gap-1">
              <Info className="h-4 w-4" /> {surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'}
            </span>
          </div>
          <audio controls className="w-full mt-4">
            <source
              src={`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah.number}.mp3`}
              type="audio/mpeg"
            />
            Your browser does not support the audio element.
          </audio>
          <p className="mt-4">{surah.description}</p>
        </Card>

        {visibleVerses.map((verse) => (
          <CompactVerseItem
            key={verse.verse_number}
            verse={verse}
            surahNumber={surah.number}
            ref={(el) => (verseRefs.current[`${surah.number}:${verse.verse_number}`] = el)}
          />
        ))}
      </main>
    </>
  );
}

// Pre-render all Surah pages at build time
export const getStaticPaths: GetStaticPaths = async () => {
  const surahs = getAllSurahs();
  const paths = surahs.map((s) => ({ params: { surahNumber: s.number.toString() } }));
  return { paths, fallback: false };
};

// Fetch Surah data for each page
export const getStaticProps: GetStaticProps = async (context) => {
  const surahNumber = Number(context.params?.surahNumber);
  const surah = getSurahByNumber(surahNumber);
  return { props: { surah } };
};
