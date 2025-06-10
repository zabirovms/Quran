import { useState, useEffect, useRef, useCallback } from 'react';
import { useSurahs, useSurah, useVerses } from '@/hooks/useQuran';
import { useAudioPlayer } from '@/hooks/useAudio';
import { GlobalOverlayType } from '@/App';
import AudioPlayer from '@/components/layout/AudioPlayer';
import CompactVerseItem from '@/components/quran/CompactVerseItem';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import SmartSticky from '@/components/layout/SmartSticky';
import VerseNavigation from '@/components/quran/VerseNavigation';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  Search, 
  Bookmark, 
  Book, 
  Info,
  Home,
  Menu,
  X,
  ArrowUp,
  List,
  Volume2,
  ChevronDown,
  Settings,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import SeoHead from '@/components/shared/SeoHead';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SettingsDrawer, SettingsContent } from "@/components/layout/SettingsDrawer";
import { preloadSurahData, preloadAdjacentSurahs } from '@/lib/uthmaniQuran';

interface SurahProps {
  surahNumber: number;
  initialVerseNumber?: number;
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

// Number of verses to load initially and per page
const VERSES_PER_PAGE = 10;

export default function Surah({ surahNumber, initialVerseNumber, onOpenOverlay }: SurahProps) {
  const { data: surahs, isLoading: isSurahsLoading } = useSurahs();
  const { data: surah, isLoading: isSurahLoading } = useSurah(surahNumber);
  const { data: allVerses, isLoading: isAllVersesLoading } = useVerses(surahNumber);
  const { playAudio, playSurah, audioState } = useAudioPlayer();
  const { toast } = useToast();
  const { contentViewMode } = useDisplaySettings();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleVerses, setVisibleVerses] = useState<any[]>([]);
  const [isVersesLoading, setIsVersesLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  // Refs for scroll handling and infinite loading
  const scrollTopRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const initialScrollComplete = useRef<boolean>(false);

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurahInfoOpen, setIsSurahInfoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // New state for current verse
  const [currentVerse, setCurrentVerse] = useState(initialVerseNumber || 1);

  // Preload surah data when component mounts or surah changes
  useEffect(() => {
    if (surahNumber > 0) {
      // Preload current surah data
      preloadSurahData(surahNumber);

      // Preload adjacent surahs for faster navigation
      preloadAdjacentSurahs(surahNumber);

      // Reset pagination state when surah changes
      setCurrentPage(1);
      setVisibleVerses([]);

      // Scroll to top when surah changes
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }
  }, [surahNumber]);

  // Save the last read position
  useEffect(() => {
    if (surah && surahNumber > 0) {
      const lastReadPosition = {
        surahNumber: surah.number,
        surahName: surah.name_tajik,
        verseNumber: 1, // Default to first verse
        verseKey: `${surah.number}:1`
      };

      localStorage.setItem('lastReadPosition', JSON.stringify(lastReadPosition));
    }
  }, [surah, surahNumber]);

  // Update hasNextPage when data or page changes
  useEffect(() => {
    if (allVerses && allVerses.length > 0) {
      // Determine if there are more verses to load
      const endIndex = currentPage * VERSES_PER_PAGE;
      setHasNextPage(endIndex < allVerses.length);
    }
  }, [allVerses, currentPage]);

  // Function to load the next page of verses - optimized for speed
  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    console.log("Loading more verses, new page:", currentPage + 1);
    setIsFetchingNextPage(true);

    // Increment the current page which will trigger the useEffect to load more verses
    setCurrentPage(prevPage => prevPage + 1);

    // Use a shorter delay to improve perceived performance
    setTimeout(() => {
      setIsFetchingNextPage(false);
    }, 300);
  }, [hasNextPage, isFetchingNextPage, currentPage]);

  // Create a scrollable element reference for infinite scrolling
  const loadingElementRef = useRef<HTMLDivElement>(null);

  // Handle scrolling to specific verse when provided with initialVerseNumber
  useEffect(() => {
    // Only run when we have verses loaded and initialVerseNumber is provided
    if (allVerses && allVerses.length > 0 && initialVerseNumber && !initialScrollComplete.current) {
      // Check if we need more pages of verses first
      const neededPage = Math.ceil(initialVerseNumber / VERSES_PER_PAGE);
      if (neededPage > currentPage) {
        // Load more pages to include the target verse
        console.log(`Loading more pages to reach verse ${initialVerseNumber}`);
        setCurrentPage(neededPage);
      } else {
        // We already have the verse loaded, so we can scroll to it
        const verseKey = `${surahNumber}:${initialVerseNumber}`;

        // Small delay to ensure DOM is updated
        setTimeout(() => {
          const verseElement = verseRefs.current[verseKey];
          if (verseElement) {
            console.log(`Scrolling to verse ${verseKey}`);
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight the verse temporarily
            verseElement.classList.add('highlight-verse');
            setTimeout(() => {
              verseElement.classList.remove('highlight-verse');
            }, 3000);

            // Mark as complete so we don't keep trying to scroll
            initialScrollComplete.current = true;
          }
        }, 1000);
      }
    }
  }, [allVerses, initialVerseNumber, currentPage, surahNumber]);

  // Simple and reliable scroll loading
  useEffect(() => {
    // Skip if there's no more verses to load
    if (!hasNextPage || isAllVersesLoading) return;

    // Track if we're already loading to prevent multiple simultaneous loads
    let isLoadingMore = false;

    function checkScrollPosition() {
      // If we're already loading, don't try to load more
      if (isLoadingMore || isFetchingNextPage) return;

      // Get scroll position and document height
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate distance from bottom
      const distanceFromBottom = documentHeight - (scrollY + windowHeight);

      // If we're close to the bottom (800px), load more
      if (distanceFromBottom < 800) {
        console.log(`Loading more verses - ${distanceFromBottom}px from bottom`);
        isLoadingMore = true;
        loadNextPage();

        // Reset loading flag after a delay
        setTimeout(() => {
          isLoadingMore = false;
        }, 500);
      }
    }

    // Add scroll event listener with passive flag for better performance
    window.addEventListener('scroll', checkScrollPosition, { passive: true });

    // Initial check in case the page doesn't have enough content to scroll
    setTimeout(checkScrollPosition, 500);

    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [hasNextPage, loadNextPage, isFetchingNextPage, isAllVersesLoading]);



  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleVerseNavigation = (verseNumber: number) => {
    setCurrentVerse(verseNumber);
    const verseElement = document.getElementById(`verse-${verseNumber}`);
    if (verseElement) {
      // Calculate the offset to account for the sticky header and navigation
      const headerHeight = 120; // Approximate height of both sticky elements
      const elementPosition = verseElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handlePlaySurah = () => {
    if (surah) {
      const firstVerse = surah.verses[0];
      if (firstVerse) {
        handleVerseNavigation(firstVerse.verse_number);
      }
    }
  };

  // Handle scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle pagination
  const getPreviousSurahNumber = () => {
    return surahNumber > 1 ? surahNumber - 1 : null;
  };

  const getNextSurahNumber = () => {
    return surahNumber < 114 ? surahNumber + 1 : null;
  };

  const previousSurah = getPreviousSurahNumber();
  const nextSurah = getNextSurahNumber();

  const isLoading = isSurahsLoading || isSurahLoading || isVersesLoading;

  // Update current verse when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const verses = document.querySelectorAll('[id^="verse-"]');
      let closestVerse = 1;
      let closestDistance = Infinity;

      verses.forEach((verse) => {
        const rect = verse.getBoundingClientRect();
        const distance = Math.abs(rect.top);
        if (distance < closestDistance) {
          closestDistance = distance;
          const verseId = verse.id;
          const verseNumber = parseInt(verseId.split('-')[2]);
          if (!isNaN(verseNumber)) {
            closestVerse = verseNumber;
          }
        }
      });

      setCurrentVerse(closestVerse);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`${surah?.name_tajik} - Қуръони Карим`}
        description={`Сураи ${surah?.name_tajik} аз Қуръони Карим бо тарҷума ва тафсири тоҷикӣ`}
      />

      <SmartSticky className="bg-background/80 backdrop-blur-sm border-b">
        <header className="container mx-auto px-4 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-primary hover:text-primary/80">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-1xl font-bold text-foreground">
                  Ба Асосӣ
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => onOpenOverlay('search')}>
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenOverlay('bookmarks')}>
                <Bookmark className="h-5 w-5" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle>Танзимот</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <SettingsContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
        <div className="border-t">
          <VerseNavigation 
            currentVerse={currentVerse} 
            totalVerses={surah?.verses_count || 0} 
            onNavigate={handleVerseNavigation}
            currentSurahNumber={surahNumber}
          />
        </div>
      </SmartSticky>

      <main className="container mx-auto px-4 py-8">
        <div ref={scrollTopRef}></div>

        {/* Surah Information Card with Accordion */}
        {surah && !isSurahLoading && (
          <Card className="mb-6 overflow-hidden bg-gradient-to-b from-white to-white/20 dark:from-gray-800 dark:to-gray-800/20 shadow-md md:shadow-lg">
            <div className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="info" className="border-0">
                  <div className="flex flex-col items-center text-center">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-accent">{surah.name_tajik}</h1>
                      <h2 className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-arabic mt-1">
                        {surah.name_arabic}
                      </h2>
                      <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center">
                        <span>Сураи {surah.number}</span>
                        <span className="mx-2">•</span>
                        <span>{surah.verses_count} оят</span>
                        <span className="mx-2">•</span>
                        <span>{surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'}</span>
                        <span className="flex items-center gap-1 ml-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1 py-0 h-6 text-primary" 
                            onClick={handlePlaySurah}
                          >
                            <Volume2 className="h-3 w-3" />
                            <span className="text-xs">Тиловат</span>
                          </Button>
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className="text-sm font-medium text-muted-foreground mr-2">Маълумот</span>
                      <AccordionTrigger className="pt-0 h-6">
                        <span className="sr-only">Toggle surah info</span>
                      </AccordionTrigger>
                    </div>
                  </div>

                  <AccordionContent>
                    <div className="mt-4">
                      <div className="flex items-center gap-4 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handlePlaySurah}
                        >
                          <Volume2 className="h-4 w-4" />
                          <span>Тиловат</span>
                        </Button>
                      </div>

                      <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
                        <p>{surah.description || 'Маълумот дар бораи ин сура мавҷуд нест.'}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </Card>
        )}

        {/* Surah Header Skeleton */}
        {isSurahLoading && (
          <Card className="mb-6 overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        )}

        {/* Bismillah for the verses */}
        {surah && surah.number !== 1 && surah.number !== 9 && (
          <div className="py-6 px-4 mb-6 text-center">
            <p className="font-arabic text-2xl md:text-3xl leading-normal tracking-normal mx-auto w-fit text-center text-gray-800 dark:text-gray-100">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}


        {/* Verses */}
        <div className={cn("space-y-6 mb-8", `content-${contentViewMode}`)}>
          {isAllVersesLoading ? (
            // Show loading skeletons for verses when initially loading
            Array.from({ length: 10 }).map((_, index) => (
              <CompactVerseItem 
                key={index}
                verse={{
                  id: 0,
                  surah_id: 0,
                  verse_number: 0,
                  arabic_text: "",
                  transliteration: null,
                  tajik_text: "",
                  tj_2: null,
                  tj_3: null,
                  farsi: null,
                  russian: null,
                  tafsir: null,
                  page: null,
                  juz: null,
                  unique_key: ""
                }}
                surahName=""
                isLoading={true}
              />
            ))
          ) : (
            // Display loaded verses
            allVerses && allVerses.slice(0, currentPage * VERSES_PER_PAGE).map(verse => (
              <div 
                key={verse.id} 
                ref={el => verseRefs.current[verse.unique_key] = el}
                id={`verse-${verse.unique_key}`}
              >
                <CompactVerseItem 
                  verse={verse}
                  surahName={surah?.name_tajik || ""}
                />
              </div>
            ))
          )}

          {/* Intersection Observer for Infinite Scroll */}
          {!isAllVersesLoading && allVerses && allVerses.length > 0 && (
            <div 
              ref={loadingElementRef} 
              className="h-20 flex items-center justify-center"
              style={{ display: currentPage * VERSES_PER_PAGE >= allVerses.length ? 'none' : 'flex' }}
            >
              {isFetchingNextPage ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  <p className="text-xs text-muted-foreground mt-2">Боркунии оятҳо...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-xs text-muted-foreground">Скрол кунед барои дидани оятҳои дигар</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {surah && (
          <div className="grid grid-cols-2 gap-4 mb-10">
            {previousSurah ? (
              <Link href={`/surah/${previousSurah}`} className="w-full">
                <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                  <div className="p-4 flex items-center">
                    <ChevronLeft className="h-5 w-5 mr-2 text-primary dark:text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Сураи қаблӣ</p>
                      <p className="font-medium">
                        {surahs && surahs.find((s: any) => s.number === previousSurah)?.name_tajik || `Сураи ${previousSurah}`}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ) : (
              <div></div>
            )}

            {nextSurah ? (
              <Link href={`/surah/${nextSurah}`} className="w-full">
                <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                  <div className="p-4 flex items-center justify-between">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Сураи баъдӣ</p>
                      <p className="font-medium">
                        {surahs && surahs.find((s: any) => s.number === nextSurah)?.name_tajik || `Сураи ${nextSurah}`}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 ml-2 text-primary dark:text-accent" />
                  </div>
                </Card>
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        )}
      </main>

      {/* Audio player */}
      <AudioPlayer />
    </div>
  );
}
