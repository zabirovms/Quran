import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSurahs } from '@/hooks/useQuran';
import { getArabicFontClass } from '@/lib/fonts';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Қуръон бо Тафсири Осонбаён 
            </h1>
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
            <h2 className="text-xl font-bold text-primary dark:text-accent mb-4 text-center">
              Абзорҳои исломӣ
            </h2>
            <div className="max-w-[600px] mx-auto">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 16,
                    centeredSlides: false
                  }
                }}
                centeredSlides={true}
                loop={true}
                autoplay={{ 
                  delay: 3000, 
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true
                }}
                className="py-2"
              >
                {/* Tasbeeh Counter Card */}
                <SwiperSlide>
                  <Link href="/tasbeeh" className="block h-full">
                    <Card className="h-full bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 hover:shadow-md transition-all border-emerald-200/50 dark:border-emerald-800/30">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                          <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-base font-semibold mb-1">Тасбеҳгӯяк</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Шумориши зикрҳо ва дуоҳо
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </SwiperSlide>

                {/* Learn Words Card */}
                <SwiperSlide>
                  <Link href="/learn-words" className="block h-full">
                    <Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 hover:shadow-md transition-all border-blue-200/50 dark:border-blue-800/30">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                          <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-base font-semibold mb-1">Омӯзиши калимаҳо</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Омӯзиши калимаҳои Қуръон
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </SwiperSlide>

                {/* Duas Card */}
                <SwiperSlide>
                  <Link href="/duas" className="block h-full">
                    <Card className="h-full bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 hover:shadow-md transition-all border-purple-200/50 dark:border-purple-800/30">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                          <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-base font-semibold mb-1">Дуоҳо</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Дуоҳои Қуръонӣ
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>


          {/* Quick Access - Stacked Layout for All Screens */}
          <div className="flex flex-col gap-4 mb-4">
            {/* Last Read Section - Full Width Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-primary/20 dark:border-accent/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary dark:text-accent" />
                  <span className="text-primary dark:text-accent">
                    {lastRead ? "Охирин хондашуда" : "Оғоз кунед"}
                  </span>
                </CardTitle>
                <CardDescription className="text-sm">
                  {lastRead
                    ? "Аз ҳамон ҷо идома диҳед."
                    : "Ҳоло ҳеҷ сура хонда нашудааст."}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-3">
                {lastRead ? (
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-sm">
                        Сураи {lastRead.surahName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ояти {lastRead.verseNumber}
                      </p>
                    </div>
                    <Link
                      href={`/surah/${lastRead.surahNumber}#verse-${lastRead.verseKey.replace(':', '-')}`}
                    >
                      <Button size="sm">
                        Идома
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href="/surah/1">
                    <Button className="w-full sm:w-auto" size="sm">
                      Сураи Фотиҳа
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Search Box - Full Width Card Below */}
            <Card className="p-2">
              <CardContent className="p-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Ҷустуҷӯи сура..."
                    className="pl-9 py-2 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 text-primary dark:text-accent text-center">Рӯйхати сураҳо</h2>

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

      <Footer />
    </div>
  );
}
