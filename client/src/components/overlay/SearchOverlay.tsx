import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getArabicFontClass } from '@/lib/fonts';
import { useSurahs, useSearchVerses } from '@/hooks/useQuran';
import { useToast } from '@/hooks/use-toast';
import { Search, X, AlertCircle, BookText } from 'lucide-react';
import { useLocation } from 'wouter';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<'arabic' | 'tajik' | 'both'>('both');
  const [selectedSurah, setSelectedSurah] = useState<string | undefined>(undefined);
  const [searchActive, setSearchActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get list of surahs for the dropdown
  const { data: surahs, isLoading: isSurahsLoading } = useSurahs();
  
  // Only search when user has typed something and pressed Enter or clicked Search
  const { 
    data: searchResults, 
    isLoading: isSearching,
    error: searchError
  } = useSearchVerses(
    searchActive ? query : '', 
    language,
    selectedSurah && selectedSurah !== 'all' ? parseInt(selectedSurah) : undefined
  );
  
  // Handle search errors
  useEffect(() => {
    if (searchError) {
      console.error("Search error:", searchError);
      setError("Хатогӣ дар ҷустуҷӯ. Лутфан дубора кӯшиш кунед.");
      toast({
        title: "Хатогӣ дар ҷустуҷӯ",
        description: "Ҳангоми ҷустуҷӯ хатогӣ рӯх дод. Лутфан дубора кӯшиш кунед.",
        variant: "destructive"
      });
    } else {
      setError(null);
    }
  }, [searchError, toast]);
  
  // Reset search state when closing the overlay
  useEffect(() => {
    if (!isOpen) {
      setSearchActive(false);
    }
  }, [isOpen]);
  
  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      setSearchActive(true);
    }
  };
  
  // Handle navigation to a verse
  const navigateToVerse = (verseKey: string) => {
    const [surahNum, verseNum] = verseKey.split(':');
    // Use the dedicated verse route instead of hash for proper scrolling
    navigate(`/surah/${surahNum}/verse/${verseNum}`);
    onClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <SheetContent side="right" className="w-full md:max-w-md overflow-y-auto">
        <SheetHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <SheetTitle className="text-lg font-bold">Ҷустуҷӯ дар Қуръон</SheetTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <div className="py-4">
          <form onSubmit={handleSearch}>
            <div className="relative mb-4">
              <Input 
                type="text" 
                placeholder="Ҷустуҷӯ (масалан, 2:255)" 
                className="pl-10 pr-4 py-2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <Button 
                type="submit" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2"
                disabled={!query.trim()}
              >
                Ҷустуҷӯ
              </Button>
            </div>
          
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <div className="flex-1">
                <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Забон</Label>
                <Select 
                  value={language} 
                  onValueChange={(value) => setLanguage(value as 'arabic' | 'tajik' | 'both')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arabic">Арабӣ</SelectItem>
                    <SelectItem value="tajik">Тоҷикӣ</SelectItem>
                    <SelectItem value="both">Ҳарду</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Сура</Label>
                <Select 
                  value={selectedSurah} 
                  onValueChange={setSelectedSurah}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ҳамаи сураҳо" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Ҳамаи сураҳо</SelectItem>
                    {Array.isArray(surahs) && surahs.map((surah) => (
                      <SelectItem key={surah.id} value={surah.number.toString()}>
                        {surah.number}. {surah.name_tajik}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
          
          <div className="mt-4 flex-1 overflow-hidden rounded-md border">
            <ScrollArea className="h-[calc(100vh-300px)]">
              {!searchActive && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>Барои ҷустуҷӯ рақам ё матнро ворид кунед</p>
                </div>
              )}
              
              {searchActive && isSearching && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p>Ҷустуҷӯ...</p>
                </div>
              )}
              
              {searchActive && !isSearching && searchResults?.length === 0 && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Ягон натиҷа ёфт нашуд</p>
                </div>
              )}
              
              {searchActive && !isSearching && searchResults && searchResults.length > 0 && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map(verse => (
                    <div 
                      key={verse.id} 
                      className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigateToVerse(verse.unique_key)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-primary dark:text-accent">
                          {verse.unique_key}
                        </span>
                      </div>
                      <div className={`${getArabicFontClass('sm')} mb-2 line-clamp-2`}>
                        {verse.arabic_text}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {verse.tajik_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
