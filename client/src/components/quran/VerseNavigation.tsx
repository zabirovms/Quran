import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface VerseNavigationProps {
  surahName: string;
  surahNumber: number;
  versesCount: number;
}

export default function VerseNavigation({ 
  surahName, 
  surahNumber, 
  versesCount 
}: VerseNavigationProps) {
  const [visibleNav, setVisibleNav] = useState(false);

  // Show navigation when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setVisibleNav(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to specific verse and highlight it
  const scrollToVerse = (verseNumber: number) => {
    const verseElement = document.getElementById(`verse-${surahNumber}-${verseNumber}`);
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight effect
      verseElement.classList.add('verse-highlight');
      setTimeout(() => {
        verseElement.classList.remove('verse-highlight');
      }, 2000);
    }
  };

  return (
    <div className={`sticky top-[64px] z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm py-2 px-4 mb-4 rounded-lg transition-opacity duration-300 ${visibleNav ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-gray-600 dark:text-gray-400">Сураи {surahName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 h-8"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp className="h-3 w-3" />
            <span className="text-xs">Боло</span>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 h-8"
              >
                <ChevronDown className="h-3 w-3" />
                <span className="text-xs">Оятҳо</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle>Ба оят гузаред</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-4 overflow-y-auto max-h-[40vh] p-2">
                {Array.from({ length: versesCount }).map((_, i) => (
                  <Button 
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 w-8"
                    onClick={() => {
                      scrollToVerse(i + 1);
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}