import { useState, useEffect, useRef, useCallback } from 'react';
import { useSurahs, useSurah, useVerses } from '@/hooks/useQuran';
import { useAudioPlayer } from '@/hooks/useAudio';
import { GlobalOverlayType } from '@/App';
import AudioPlayer from '@/components/layout/AudioPlayer';
import CompactVerseItem from '@/components/quran/CompactVerseItem';
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
  MoreHorizontal
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
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

// Number of verses to load initially and per page
const VERSES_PER_PAGE = 10;

export default function Surah({ surahNumber, onOpenOverlay }: SurahProps) {
  const { data: surahs, isLoading: isSurahsLoading } = useSurahs();
  const { data: surah, isLoading: isSurahLoading } = useSurah(surahNumber);
  const { data: allVerses, isLoading: isAllVersesLoading } = useVerses(surahNumber);
  const { playAudio, playSurah, audioState } = useAudioPlayer();
  const { toast } = useToast();
  const { contentViewMode } = useDisplaySettings();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isVersesLoading, setIsVersesLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  
  // Refs for scroll handling and infinite loading
  const scrollTopRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurahInfoOpen, setIsSurahInfoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Preload surah data when component mounts or surah changes
  useEffect(() => {
    if (surahNumber > 0) {
      // Preload current surah data
      preloadSurahData(surahNumber);
      
      // Preload adjacent surahs for faster navigation
      preloadAdjacentSurahs(surahNumber);
      
      // Reset pagination state when surah changes
      setCurrentPage(1);
    }
    
    // Set loading to false after a short delay
    setIsVersesLoading(true);
    const timer = setTimeout(() => {
      setIsVersesLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
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
  
  // Function to load the next page of verses
  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    
    console.log("Loading next page of verses...");
    setIsFetchingNextPage(true);
    
    // Increment the current page
    setCurrentPage(prevPage => prevPage + 1);
    
    // Add a delay to make the loading indicator visible
    setTimeout(() => {
      setIsFetchingNextPage(false);
    }, 800);
  }, [hasNextPage, isFetchingNextPage]);
  
  // Intersection observer for infinite scroll
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !isVersesLoading) {
      console.log("Scroll observer triggered, loading more verses");
      loadNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isVersesLoading, loadNextPage]);
  
  // Setup intersection observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    
    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '0px 0px 300px 0px', // Load more when within 300px of the bottom
      threshold: 0.1,
    });
    
    observer.observe(loadMoreRef.current);
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [observerCallback]);
  
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
  
  // Handle playing the entire surah
  const handlePlaySurah = () => {
    if (!surah) {
      toast({
        title: "Play error",
        description: "Surah information not available",
        variant: "destructive"
      });
      return;
    }
    
    // Use the playSurah function from the top-level hook
    playSurah(surah.number, surah.name_tajik);
    
    toast({
      title: "Playing Surah",
      description: `Now playing Сураи ${surah.name_tajik}`,
    });
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
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {surah && (
        <SeoHead
          title={`Сураи ${surah.name_tajik} (${surah.name_arabic})`}
          description={`Хондани Сураи ${surah.name_tajik} бо тарҷумаи тоҷикӣ. ${surah.verses_count} оят, нозил шуда дар ${surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'}.`}
          structuredData={{
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `Сураи ${surah.name_tajik} - Қуръони Карим бо тарҷумаи тоҷикӣ`,
            "name": surah.name_tajik,
            "alternativeHeadline": surah.name_arabic,
            "author": {
              "@type": "Organization",
              "name": "Қуръони Тоҷикӣ"
            },
            "inLanguage": "tg",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Қуръони Тоҷикӣ",
              "url": window.location.origin
            }
          }}
        />
      )}
      
      {/* New Header - Fixed at the top */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex w-full justify-between space-x-2 md:space-x-4">
            <div className="flex items-center gap-2">
              {/* Hamburger Menu for Surahs List */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex items-center">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Меню</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <div className="space-y-3 mb-6">
                      <Link href="/">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left h-auto py-2"
                        >
                          <Home className="h-5 w-5 mr-2 text-primary dark:text-accent" />
                          <span>Асосӣ</span>
                        </Button>
                      </Link>
                      <Link href="/farzi-ayn">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left h-auto py-2"
                        >
                          <Book className="h-5 w-5 mr-2 text-primary dark:text-accent" />
                          <span>Фарзи Айн</span>
                        </Button>
                      </Link>
                      <Link href="/projects">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left h-auto py-2"
                        >
                          <List className="h-5 w-5 mr-2 text-primary dark:text-accent" />
                          <span>Лоиҳаҳои мо</span>
                        </Button>
                      </Link>
                    </div>

                    <SheetTitle className="mb-2">Сураҳо</SheetTitle>
                    <div className="space-y-1">
                      {surahs?.map((s) => (
                        <Link key={s.id} href={`/surah/${s.number}`}>
                          <Button 
                            variant={s.number === surahNumber ? "secondary" : "ghost"} 
                            className="w-full justify-start text-left h-auto py-2"
                          >
                            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-foreground mr-2 text-sm">
                              {s.number}
                            </span>
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium">{s.name_tajik}</span>
                              <span className="text-xs text-muted-foreground">{s.name_arabic}</span>
                            </div>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex gap-2 items-center">
                  <Home className="h-4 w-4" />
                  <span>Асосӣ</span>
                </Button>
              </Link>
              
              {surah && (
                <div className="flex items-center">
                  <div className="text-xs md:text-sm h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary-foreground flex items-center justify-center border border-primary mx-2">
                    {surahNumber}
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-sm md:text-base font-medium">{surah.name_tajik}</h1>
                    <p className="text-xs text-muted-foreground">{surah.name_arabic}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Search Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onOpenOverlay('search')}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              {/* Bookmarks Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onOpenOverlay('bookmarks')}
              >
                <Bookmark className="h-5 w-5" />
              </Button>
              
              {/* Settings Button */}
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
              
              {/* Play Button - Removed and moved to the surah header */}
              
              {/* The Info button is removed as requested */}
              
              {/* Navigation Buttons */}
              <div className="hidden md:flex items-center gap-1 ml-2">
                {previousSurah && (
                  <Link href={`/surah/${previousSurah}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                
                {nextSurah && (
                  <Link href={`/surah/${nextSurah}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Surah List Drawer */}
      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerContent className="h-[80vh]">
          <div className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Сураҳо</h2>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            
            {isSurahsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-y-auto h-[90%] space-y-1 pr-2 pb-4">
                {surahs && surahs.map((item: any) => (
                  <Link 
                    key={item.number} 
                    href={`/surah/${item.number}`}
                  >
                    <Button
                      variant={item.number === surahNumber ? "secondary" : "ghost"}
                      className="w-full justify-start text-left mb-1 h-auto py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-2 h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {item.number}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name_tajik}</span>
                        <span className="text-xs text-muted-foreground">{item.name_arabic}</span>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Surah Info Drawer */}
      <Drawer open={isSurahInfoOpen} onOpenChange={setIsSurahInfoOpen}>
        <DrawerContent className="h-[80vh]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Дар бораи сура</h2>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            
            {surah && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-arabic">{surah.name_arabic}</h3>
                  <p className="text-base font-medium">{surah.name_tajik}</p>
                  <p className="text-sm text-muted-foreground">{surah.name_english}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-muted-foreground">Шумораи оятҳо</p>
                    <p className="font-medium">{surah.verses_count}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-muted-foreground">Нозилшуда дар</p>
                    <p className="font-medium">{surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-muted-foreground">Ҷузъ</p>
                    <p className="font-medium">{surah.juzs}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-muted-foreground">Тартиби нузул</p>
                    <p className="font-medium">{surah.revelation_order}</p>
                  </div>
                </div>
                
                {surah.description && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Маълумот дар бораи сура:</h4>
                    <p className="text-sm">{surah.description}</p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      handlePlaySurah();
                      setIsSurahInfoOpen(false);
                    }}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Шунидани сура
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Settings Drawer */}
      <SettingsDrawer open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Removed the sidebar with surah lists since we added the hamburger menu for all screen sizes */}
        
        {/* Main content area */}
        <main className="flex-1 max-w-4xl mx-auto w-full p-3 md:p-6" ref={contentRef}>
          <div ref={scrollTopRef}></div>
          
          {/* Add verse navigation component for better verse navigation */}
          {surah && (
            <VerseNavigation 
              surahNumber={surahNumber}
              versesCount={surah.verses_count}
              surahName={surah.name_tajik}
            />
          )}
          
          {/* Surah Header - Combined card */}
          {surah && (
            <Card className="mb-6 overflow-hidden">
              <div className="p-4 pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex">
                    <div className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                        {surah.number}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">{surah.name_tajik}</h2>
                        <p className="text-sm text-muted-foreground">{surah.name_english}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary"
                      onClick={() => setIsSurahInfoOpen(true)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Маълумот</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary"
                      onClick={handlePlaySurah}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Шунидан</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs mb-4">
                  <div className="bg-primary/5 dark:bg-primary/10 p-2 rounded-lg text-center">
                    <p className="text-muted-foreground">Оятҳо</p>
                    <p className="font-medium">{surah.verses_count}</p>
                  </div>
                  <div className="bg-primary/5 dark:bg-primary/10 p-2 rounded-lg text-center">
                    <p className="text-muted-foreground">Нозилшуда</p>
                    <p className="font-medium">{surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'}</p>
                  </div>
                  <div className="bg-primary/5 dark:bg-primary/10 p-2 rounded-lg text-center">
                    <p className="text-muted-foreground">Ҷузъ</p>
                    <p className="font-medium">{surah.juzs}</p>
                  </div>
                  <div className="bg-primary/5 dark:bg-primary/10 p-2 rounded-lg text-center">
                    <p className="text-muted-foreground">Тартиби нузул</p>
                    <p className="font-medium">{surah.revelation_order || '-'}</p>
                  </div>
                </div>
              </div>
              
              {/* Display Bismillah except for Surah At-Tawbah (9) */}
              {surah.number !== 9 && (
                <div className="text-center py-4 px-4 bg-primary/5 dark:bg-primary/10">
                  <p className="font-arabic text-xl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                  <p className="text-sm text-muted-foreground mt-1">Ба номи Худованди бахшандаи меҳрубон</p>
                </div>
              )}
            </Card>
          )}
          
          {/* Verses */}
          <div className="space-y-4 mb-4">
            {isLoading ? (
              // Display skeleton loaders
              Array.from({ length: 5 }).map((_, index) => (
                <CompactVerseItem 
                  key={index}
                  verse={{
                    id: index,
                    surah_id: 0,
                    verse_number: index + 1,
                    arabic_text: "",
                    tajik_text: "",
                    farsi: "",
                    russian: "",
                    tj_2: "",
                    tj_3: "",
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
                <CompactVerseItem 
                  key={verse.id}
                  verse={verse}
                  surahName={surah?.name_tajik || ""}
                />
              ))
            )}
            
            {/* Intersection Observer for Infinite Scroll */}
            {!isAllVersesLoading && allVerses && allVerses.length > 0 && (
              <div 
                ref={loadMoreRef} 
                className="h-20 flex items-center justify-center"
                style={{ display: currentPage * VERSES_PER_PAGE >= allVerses.length ? 'none' : 'flex' }}
              >
                {isFetchingNextPage ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-xs text-muted-foreground mt-2">Боркунии оятҳо...</p>
                  </div>
                ) : hasNextPage ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadNextPage}
                    className="mt-4"
                  >
                    Оятҳои бештар
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">Ҳамаи оятҳо бор карда шуданд</p>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {surah && (
            <div className="grid grid-cols-2 gap-4 mb-10">
              {previousSurah ? (
                <Link href={`/surah/${previousSurah}`}>
                  <Button variant="outline" className="w-full flex items-center justify-center">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="text-sm">Сураи пешина</span>
                  </Button>
                </Link>
              ) : (
                <div></div> // Empty div to maintain grid
              )}
              
              {nextSurah && (
                <Link href={`/surah/${nextSurah}`}>
                  <Button variant="outline" className="w-full flex items-center justify-center">
                    <span className="text-sm">Сураи оянда</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Audio player for verse recitation */}
      <AudioPlayer />
      
      {/* Scroll to top button */}
      {showScrollToTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 right-4 rounded-full z-50 bg-background shadow-md"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}