import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSurahs } from '@/hooks/useQuran';
import { getArabicFontClass } from '@/lib/fonts';
import Header from '@/components/layout/Header';
import { GlobalOverlayType } from '@/App';
import { 
  Search, BookOpen, ChevronRight, ArrowUp, ArrowDown, Book
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Surah } from '@shared/schema';
import SeoHead from '@/components/shared/SeoHead';

interface LastReadSection {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  verseKey: string;
}

interface HomeProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

// Popular Surahs for quick access
interface PopularSurah {
  number: number;
  name_tajik: string;
  name_english: string;
  name_arabic: string;
}

const popularSurahs: PopularSurah[] = [
  { number: 36, name_tajik: "Ёсин", name_english: "Ya-Sin", name_arabic: "يس" },
  { number: 67, name_tajik: "Мулк", name_english: "Al-Mulk", name_arabic: "الملك" },
  { number: 55, name_tajik: "Раҳмон", name_english: "Ar-Rahman", name_arabic: "الرحمن" },
  { number: 18, name_tajik: "Каҳф", name_english: "Al-Kahf", name_arabic: "الكهف" },
];

export default function Home({ onOpenOverlay }: HomeProps) {
  const { data: surahs = [], isLoading } = useSurahs();
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRead, setLastRead] = useState<LastReadSection | null>(null);
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');
  
  // Function to scroll to top or bottom
  const scrollToPosition = (direction: 'top' | 'bottom') => {
    if (direction === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    setScrollDirection(direction === 'top' ? 'bottom' : 'top');
  };

  // Filter surahs based on search term
  const filterSurahs = useCallback(() => {
    if (!surahs || !surahs.length) return;
    
    if (!searchTerm) {
      setFilteredSurahs(surahs);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = surahs.filter(
      surah => 
        surah.name_tajik.toLowerCase().includes(term) ||
        surah.name_english.toLowerCase().includes(term) ||
        surah.number.toString().includes(term)
    );
    
    setFilteredSurahs(filtered);
  }, [surahs, searchTerm]);
  
  // Apply filtering when dependencies change
  useEffect(() => {
    filterSurahs();
  }, [filterSurahs]);
  
  // Check local storage for last read position
  useEffect(() => {
    const storedPosition = localStorage.getItem('lastReadPosition');
    if (storedPosition) {
      const position = JSON.parse(storedPosition) as LastReadSection;
      setLastRead(position);
    }
  }, []);
  
  // Render surah list item
  const renderSurahItem = (surah: Surah) => (
    <Link 
      key={surah.id} 
      href={`/surah/${surah.number}`}
      className="block"
    >
      <Card className="mb-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary dark:bg-accent text-white font-medium">
                {surah.number}
              </div>
              <div>
                <h3 className="font-medium">{surah.name_tajik}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {surah.name_english} • {surah.verses_count} оят
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={getArabicFontClass('sm')}>{surah.name_arabic}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
  
  // Render loading skeleton for surah list
  const renderSkeletonItem = (index: number) => (
    <Card key={index} className="mb-2">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="w-16 h-6" />
        </div>
      </CardContent>
    </Card>
  );
  
  // Render popular surah link
  const renderPopularSurahLink = (surah: PopularSurah) => {
    const baseLinkClass = "block p-2 rounded-md";
    const inactiveLinkClass = `${baseLinkClass} hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
    
    return (
      <Link 
        key={surah.number} 
        href={`/surah/${surah.number}`}
        className={inactiveLinkClass}
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">{surah.name_tajik}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {surah.name_english}
            </p>
          </div>
          <span className={getArabicFontClass('sm')}>{surah.name_arabic}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Қуръони Карим - Тафсири Осонбаён бо забони тоҷикӣ"
        description="Қуръони Карим бо тарҷумаи тоҷикӣ, тафсир, талаффуз ва тиловат. Хондани Қуръон онлайн барои тоҷикзабонон."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Қуръони Карим",
          "description": "Қуръони Карим бо тарҷума ва тафсири тоҷикӣ. Тафсири осонбаёни Қуръон оят ба оят.",
          "url": window.location.origin,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${window.location.origin}/?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          },
          "keywords": "Куръон, Қуръони Карим, тарҷумаи тоҷикӣ, тафсир, тиловат, талаффуз, тоҷикӣ, забони точики"
        }}
      />
      <Header onOpenOverlay={onOpenOverlay} />
      
      {/* Scroll to top/bottom button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed bottom-5 right-5 z-30 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700"
        onClick={() => scrollToPosition(scrollDirection)}
      >
        {scrollDirection === 'top' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      </Button>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Қуръон бо Тафсири Осонбаён 
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Қуръони шариф бо тарҷума ва тафсири тоҷикӣ
            </p>
          </div>
          
          {/* Popular Surahs Section - Moved to the top */}
          <div className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 p-5 rounded-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-primary dark:text-accent mb-4 text-center">
              Сураҳои маъмул
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularSurahs.map(surah => (
                <Link 
                  key={surah.number}
                  href={`/surah/${surah.number}`}
                  className="flex flex-col items-center p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <span className={`${getArabicFontClass('md')} text-primary dark:text-accent mb-1`}>{surah.name_arabic}</span>
                  <span className="font-medium text-sm">{surah.name_tajik}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{surah.name_english}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Islamic Tools Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary dark:text-accent mb-4">
              Абзорҳои исломӣ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tasbeeh Counter Card */}
              <Link href="/tasbeeh" className="block h-full">
                <Card className="h-full bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 hover:shadow-md transition-all border-emerald-200/50 dark:border-emerald-800/30">
                  <CardContent className="p-4 h-full flex flex-col">
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-lg mb-1">Тасбеҳгӯяк</h3>
                    <p className="text-sm text-emerald-700/80 dark:text-emerald-300/70 mb-3">
                      Абзори интерактивии зикрҳои исломӣ барои шумориши тасбеҳ
                    </p>
                    <div className="flex items-center mt-auto">
                      <span className="inline-block bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-300 rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M21 6H3"></path>
                          <circle cx="12" cy="14" r="6"></circle><path d="M12 10v4l2 2"></path>
                        </svg>
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Истифода бурдан</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Farzi Ayn Book Card */}
              <Link href="/farzi-ayn" className="block h-full">
                <Card className="h-full bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 hover:shadow-md transition-all border-amber-200/50 dark:border-amber-800/30">
                  <CardContent className="p-4 h-full flex flex-col">
                    <h3 className="font-bold text-amber-800 dark:text-amber-300 text-lg mb-1">Фарзи Айн</h3>
                    <p className="text-sm text-amber-700/80 dark:text-amber-300/70 mb-3">
                      Китоби "Фарзи Айн" бо забони тоҷикӣ барои омӯзиши усули дин
                    </p>
                    <div className="flex items-center mt-auto">
                      <Book className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                      <span className="text-xs text-amber-600 dark:text-amber-400">Хондан</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Learn Quran Words Card */}
              <Link href="/learn-words" className="block h-full">
                <Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 hover:shadow-md transition-all border-blue-200/50 dark:border-blue-800/30">
                  <CardContent className="p-4 h-full flex flex-col">
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 text-lg mb-1">Омӯзиши луғат</h3>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/70 mb-3">
                      100 калимаи серистеъмолтарини Қуръонро бо усули бозӣ омӯзед
                    </p>
                    <div className="flex items-center mt-auto">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 9h.01"/>
                        <path d="M19 9a7 7 0 1 0-13-3"/>
                        <path d="M3 13a7 7 0 0 0 13 3"/>
                        <path d="M16 19a7 7 0 0 0 4-11"/>
                        <path d="M9 21a7 7 0 0 0 8-4"/>
                      </svg>
                      <span className="text-xs text-blue-600 dark:text-blue-400">Омӯхтан</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Quranic Duas Card */}
              <Link href="/duas" className="block h-full">
                <Card className="h-full bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 hover:shadow-md transition-all border-purple-200/50 dark:border-purple-800/30">
                  <CardContent className="p-4 h-full flex flex-col">
                    <h3 className="font-bold text-purple-800 dark:text-purple-300 text-lg mb-1">Дуоҳои Қуръонӣ</h3>
                    <p className="text-sm text-purple-700/80 dark:text-purple-300/70 mb-3">
                      Маҷмӯаи дуоҳо аз Қуръони карим бо нишондиҳии қисми дуо
                    </p>
                    <div className="flex items-center mt-auto">
                      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 6.1H3"/>
                        <path d="M21 12.1H3"/>
                        <path d="M15.1 18H3"/>
                      </svg>
                      <span className="text-xs text-purple-600 dark:text-purple-400">Дуоҳо</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
          
          {/* Quick Access - Last Read Position */}
          <div className="grid md:grid-cols-12 gap-6 mb-6">
            {/* Last Read Section - Now in a prominent position */}
            <div className="md:col-span-7">
              {lastRead ? (
                <Card className="h-full bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-primary/20 dark:border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary dark:text-accent" />
                      <span className="text-primary dark:text-accent">Саҳифаи охирон хондашуда</span>
                    </CardTitle>
                    <CardDescription>
                      Аз ҳамон ҷое, ки қатъ карда будед хонданро идома диҳед.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Сураи {lastRead.surahName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ояти {lastRead.verseNumber}</p>
                      </div>
                      <Link href={`/surah/${lastRead.surahNumber}#verse-${lastRead.verseKey.replace(':', '-')}`}>
                        <Button>
                          Идома додан
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 border-primary/10 dark:border-accent/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary dark:text-accent" />
                      <span className="text-primary dark:text-accent">Хонданро оғоз кунед</span>
                    </CardTitle>
                    <CardDescription>
                      Шумо ҳоло ҳеҷ сураро нахондаед.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/surah/1">
                      <Button className="w-full">
                        Аз сураи Фотиҳа оғоз кунед
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Compact Search Box */}
            <div className="md:col-span-5">
              <Card className="h-full p-2">
                <CardContent className="p-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Ҷустуҷӯи сура..."
                      className="pl-10 py-2 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4 text-primary dark:text-accent">Рӯйхати сураҳо</h2>
            
            {isLoading ? (
              // Show loading skeletons
              Array.from({ length: 10 }).map((_, index) => renderSkeletonItem(index))
            ) : filteredSurahs && filteredSurahs.length > 0 ? (
              // Show filtered surahs in a 3-column grid on larger screens
              <div className="hidden md:grid md:grid-cols-3 md:gap-3">
                {filteredSurahs.map(surah => (
                  <Link 
                    key={surah.id} 
                    href={`/surah/${surah.number}`}
                    className="block"
                  >
                    <Card className="mb-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-full">
                      <CardContent className="p-3">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary dark:bg-accent text-white font-medium mb-2">
                            {surah.number}
                          </div>
                          <span className={`${getArabicFontClass('sm')} mb-1`}>{surah.name_arabic}</span>
                          <h3 className="font-medium text-sm">{surah.name_tajik}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {surah.verses_count} оят
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              // On mobile, show the original list view
            ) : (
              // Show "no results" message
              <Card className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">Ягон сура ёфт нашуд</p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Тоза кардани ҷустуҷӯ
                </Button>
              </Card>
            )}
            
            {/* Mobile surah list view */}
            {!isLoading && filteredSurahs && filteredSurahs.length > 0 && (
              <div className="md:hidden">
                {filteredSurahs.map(surah => renderSurahItem(surah))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-8">
        <div className="container mx-auto px-4 max-w-3xl">
          
          {/* Social Links - Enhanced for better visibility */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">Шабакаҳои иҷтимоӣ</h3>
            <div className="flex justify-center items-center space-x-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm">
              <a 
                href="https://www.instagram.com/balkhiverse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-2 shadow-md">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Instagram</span>
              </a>
              <a 
                href="https://t.me/balkhiverses" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mb-2 shadow-md">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.568 7.382c-.12.55-.45.678-.913.422l-2.53-1.862-1.219 1.175c-.138.134-.253.247-.516.247l.181-2.572 4.693-4.237c.203-.18-.044-.282-.316-.101L9.36 12.756l-2.532-.806c-.55-.172-.56-.557.128-.825l9.873-3.8c.42-.167.789.106.586.897z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Telegram</span>
              </a>
              <a 
                href="https://www.facebook.com/aloliddinibalhi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-2 shadow-md">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Facebook</span>
              </a>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p>Қуръон бо Тафсири Осонбаён &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
