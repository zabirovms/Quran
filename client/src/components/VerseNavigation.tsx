import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useLocation } from 'wouter';
import { useSurahs } from '@/hooks/useQuran';

interface VerseNavigationProps {
  currentVerse: number;
  totalVerses: number;
  onNavigate: (verseNumber: number) => void;
  currentSurahNumber: number;
}

export default function VerseNavigation({
  currentVerse,
  totalVerses,
  onNavigate,
  currentSurahNumber
}: VerseNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: surahs, isLoading } = useSurahs();
  const [, navigate] = useLocation();

  const handleVerseClick = (verseNumber: number) => {
    navigate(`/surah/${currentSurahNumber}/verse/${verseNumber}`);
    setIsOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVerseClick(Math.max(1, currentVerse - 1))}
            disabled={currentVerse <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Оят {currentVerse} аз {totalVerses}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVerseClick(Math.min(totalVerses, currentVerse + 1))}
            disabled={currentVerse >= totalVerses}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <List className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Навигатсия</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Сураҳо</h3>
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {surahs?.map((surah) => (
                        <Link 
                          key={surah.number} 
                          href={`/surah/${surah.number}`}
                          className="block"
                        >
                          <Button
                            variant={surah.number === currentSurahNumber ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <span className="w-6 text-center">{surah.number}.</span>
                            <span className="truncate">{surah.name_tajik}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Оятҳо</h3>
                <ScrollArea className="h-[300px] rounded-md border p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: totalVerses }, (_, i) => i + 1).map((verse) => (
                      <Button
                        key={verse}
                        variant={verse === currentVerse ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleVerseClick(verse)}
                        className="w-full"
                      >
                        {verse}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
} 