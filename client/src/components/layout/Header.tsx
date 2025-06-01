import { Home } from 'lucide-react'; // Add Home icon import
import { useTheme } from '@/hooks/useTheme';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { GlobalOverlayType } from '@/App';
import { Surah } from '@shared/schema';
import { Link, useLocation } from 'wouter';
import { 
  Search, BookmarkIcon, ChevronLeft, ChevronRight, 
  Menu, FolderKanban, Settings, BookOpen
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';
import { HeaderSettings } from './HeaderSettings';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

interface HeaderProps {
  surahs?: Surah[];
  currentSurah?: Surah;
  versesCount?: number;
  onOpenOverlay: (type: GlobalOverlayType) => void;
  isLoading?: boolean;
}

export default function Header({ 
  surahs = [], 
  currentSurah, 
  versesCount = 0, 
  onOpenOverlay,
  isLoading = false 
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { wordByWordMode, toggleWordByWordMode } = useDisplaySettings();
  const [location, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigate to the previous/next surah if available
  const goToPreviousSurah = () => {
    if (!currentSurah || currentSurah.number <= 1) return;
    navigate(`/surah/${currentSurah.number - 1}`);
  };

  const goToNextSurah = () => {
    if (!currentSurah || currentSurah.number >= 114) return;
    navigate(`/surah/${currentSurah.number + 1}`);
  };

  // Handle surah selection
  const handleSurahChange = (value: string) => {
    navigate(`/surah/${value}`);
  };

  // Handle verse selection
  const handleVerseChange = (value: string) => {
    if (!currentSurah) return;
    const verseElement = document.getElementById(`verse-${currentSurah.number}-${value}`);
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isFarziAynPage = location === '/farzi-ayn';
  const isProjectsPage = location === '/projects';
  const isHomePage = location === '/';

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isHomePage && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 dark:text-gray-300"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px]">
                <SheetHeader>
                  <SheetTitle>Меню</SheetTitle>
                </SheetHeader>
                <div className="py-6 px-1 space-y-3">
                  <Link
                    href="/"
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <BookOpen className="h-5 w-5 text-primary dark:text-accent" />
                    <span>Асосӣ</span>
                  </Link>
                  <Link
                    href="/farzi-ayn"
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <BookOpen className="h-5 w-5 text-primary dark:text-accent" />
                    <span>Фарзи Айн</span>
                  </Link>
                  <Link
                    href="/projects"
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <FolderKanban className="h-5 w-5 text-primary dark:text-accent" />
                    <span>Лоиҳаҳои мо</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {(isFarziAynPage || isProjectsPage) ? (
            <Link href="/">
              <Button variant="ghost" size="icon" aria-label="Home">
                <Home className="h-5 w-5 text-primary dark:text-accent" />
              </Button>
            </Link>
          ) : (
            <Link href="/">
              <h1 className="text-xl font-bold text-primary dark:text-accent cursor-pointer">
                Қуръони Карим
              </h1>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {isHomePage && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenOverlay('search')}
                aria-label="Search"
              >
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenOverlay('bookmarks')}
                aria-label="Bookmarks"
              >
                <BookmarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Theme Toggle">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex items-center justify-between w-full">
                      <span>Dark Mode</span>
                      <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
      
      {currentSurah && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-2">
            {/* Mobile layout - stacked */}
            <div className="md:hidden space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 w-3/4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Сура:</span>
                  <Select 
                    value={currentSurah.number.toString()} 
                    onValueChange={handleSurahChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select Surah" />
                    </SelectTrigger>
                    <SelectContent>
                      {surahs.map(surah => (
                        <SelectItem key={surah.id} value={surah.number.toString()}>
                          {surah.number}. {surah.name_tajik}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousSurah}
                    disabled={!currentSurah || currentSurah.number <= 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextSurah}
                    disabled={!currentSurah || currentSurah.number >= 114}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Оят:</span>
                <Select 
                  onValueChange={handleVerseChange}
                  disabled={isLoading || !versesCount}
                >
                  <SelectTrigger className="w-[80px] h-8">
                    <SelectValue placeholder="#" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: versesCount }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Desktop layout - side by side */}
            <div className="hidden md:flex md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Сура:</span>
                  <Select 
                    value={currentSurah.number.toString()} 
                    onValueChange={handleSurahChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Select Surah" />
                    </SelectTrigger>
                    <SelectContent>
                      {surahs.map(surah => (
                        <SelectItem key={surah.id} value={surah.number.toString()}>
                          {surah.number}. {surah.name_tajik}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Оят:</span>
                  <Select 
                    onValueChange={handleVerseChange}
                    disabled={isLoading || !versesCount}
                  >
                    <SelectTrigger className="w-[80px] h-8">
                      <SelectValue placeholder="#" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: versesCount }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousSurah}
                  disabled={!currentSurah || currentSurah.number <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextSurah}
                  disabled={!currentSurah || currentSurah.number >= 114}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
