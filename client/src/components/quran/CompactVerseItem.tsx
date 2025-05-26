import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Verse } from '@shared/schema';
import { 
  Play, Copy, Share, BookmarkIcon, Image as ImageIcon,
  ChevronDown, ChevronUp, Book, MoreHorizontal
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudio';
import { useToast } from '@/hooks/use-toast';
import { useIsVerseBookmarked, useAddBookmark, useRemoveBookmark } from '@/hooks/useBookmarks';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import WordByWordText from './FixedWordByWordText';
import { 
  Collapsible, CollapsibleContent, CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { getVerseText } from '@/lib/uthmaniQuran';

interface CompactVerseItemProps {
  verse: Verse;
  surahName: string;
  isLoading?: boolean;
}

// Cache for storing the Uthmani text to avoid unnecessary re-fetching
const uthmaniTextCache: Record<string, string> = {};

export default function CompactVerseItem({ verse, surahName, isLoading = false }: CompactVerseItemProps) {
  const { playAudio } = useAudioPlayer();
  const { toast } = useToast();
  const { 
    wordByWordMode,
    textSize,
    lineSpacing,
    contentViewMode,
    showTransliteration,
    translationType
  } = useDisplaySettings();
  
  const { isBookmarked, bookmarkId, isLoading: isBookmarkLoading } = useIsVerseBookmarked(verse.id);
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  
  // State for tafsir collapsible and Arabic text
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);
  const [arabicText, setArabicText] = useState<string>(verse.arabic_text);
  const [isBookmarkPending, setIsBookmarkPending] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  // Close tafsir when verse changes
  useEffect(() => {
    setIsTafsirOpen(false);
  }, [verse.id]);
  
  // Load Uthmani text from JSON file
  useEffect(() => {
    const [surahNumber, verseNumber] = verse.unique_key.split(':').map(Number);
    
    // Check if we already have this verse in cache
    const cacheKey = verse.unique_key;
    if (uthmaniTextCache[cacheKey]) {
      setArabicText(uthmaniTextCache[cacheKey]);
      return;
    }
    
    // Otherwise fetch from the JSON file
    getVerseText(surahNumber, verseNumber)
      .then((text) => {
        if (text) {
          // Format the text with proper spacing for recitation
          const formattedText = text
            .replace(/\s+/g, ' ')  // Normalize spaces
            .trim();               // Remove extra spaces
            
          // Save to cache
          uthmaniTextCache[cacheKey] = formattedText;
          setArabicText(formattedText);
        }
      })
      .catch((error) => {
        console.error('Error loading Uthmani text:', error);
        // Fallback to the database version if there's an error
        setArabicText(verse.arabic_text);
      });
  }, [verse.unique_key, verse.arabic_text]);

  // Handle bookmark toggle
  const toggleBookmark = () => {
    if (isBookmarked && bookmarkId) {
      setIsBookmarkPending(true);
      removeBookmark.mutate(bookmarkId, {
        onSuccess: () => {
          toast({
            title: "Хатмича ҳазф шуд",
            description: `Ояти ${verse.unique_key} аз хатмичаҳо ҳазф шуд`,
          });
          setIsBookmarkPending(false);
        },
        onError: () => {
          toast({
            title: "Хато ҳангоми ҳазфи хатмича",
            description: "Лутфан дубора кӯшиш кунед",
            variant: "destructive",
          });
          setIsBookmarkPending(false);
        },
      });
    } else {
      setIsBookmarkPending(true);
      addBookmark.mutate(
        verse.id,
        {
          onSuccess: () => {
            toast({
              title: "Хатмича илова шуд",
              description: `Ояти ${verse.unique_key} ба хатмичаҳо илова шуд`,
            });
            setIsBookmarkPending(false);
          },
          onError: () => {
            toast({
              title: "Хато ҳангоми иловаи хатмича",
              description: "Лутфан дубора кӯшиш кунед",
              variant: "destructive",
            });
            setIsBookmarkPending(false);
          },
        }
      );
    }
  };

  // Handle playing audio for this verse
  const handlePlayAudio = () => {
    playAudio(verse.unique_key, {
      surahName,
      verseNumber: verse.verse_number
    });
  };

  // Handle copying verse to clipboard
  const handleCopyVerse = () => {
    const textToCopy = `${arabicText}\n\n${verse.tajik_text}\n\n${verse.unique_key}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Нусхабардорӣ шуд",
        description: "Матни оят ба ҳофизаи муваққатӣ нусхабардорӣ шуд",
      });
    }).catch((err) => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Хато ҳангоми нусхабардорӣ",
        description: "Имкон надорад, ки матнро нусхабардорӣ кунед",
        variant: "destructive",
      });
    });
  };

  // Handle sharing verse 
  const handleShareVerse = () => {
    let shareText = `${arabicText}\n\n`;
    
    if (verse.transliteration) {
      shareText += `${verse.transliteration}\n\n`;
    }
    
    shareText += `${verse.tajik_text}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Quran - ${verse.unique_key}`,
        text: shareText,
        url: `${window.location.href.split('#')[0]}#verse-${verse.unique_key.replace(':', '-')}`
      }).catch(() => {
        handleCopyVerse();
      });
    } else {
      handleCopyVerse();
    }
  };

  // Generate verse image URL
  const getVerseImageUrl = (highRes = false) => {
    const [surahNumber, verseNumber] = verse.unique_key.split(':');
    return highRes
      ? `https://cdn.islamic.network/quran/images/high-resolution/${surahNumber}_${verseNumber}.png`
      : `https://cdn.islamic.network/quran/images/${surahNumber}_${verseNumber}.png`;
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card className="border shadow-sm mb-2">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-1 border-b border-border bg-muted/20">
            <div className="flex items-center space-x-1">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="w-5 h-5 rounded" />
            </div>
            <Skeleton className="w-12 h-4" />
          </div>
          <div className="p-2">
            <Skeleton className="w-full h-10 mb-1" />
            <Skeleton className="w-full h-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      id={`verse-${verse.unique_key.replace(':', '-')}`}
      className="mb-2 scroll-mt-16"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card className={cn(
        "border shadow-sm transition-colors", 
        isBookmarked ? "bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800" : "",
        hovered ? "border-muted-foreground/20" : "border-border"
      )}>
        <CardContent className="p-0">
          {/* Ultra-compact header */}
          <div className="flex justify-between items-center p-1 border-b border-gray-100/50 dark:border-gray-700/50">
            <div className="flex items-center gap-1">
              {/* Verse key in circle */}
              <div className="bg-primary/90 dark:bg-primary/80 text-white min-w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium px-1">
                {verse.unique_key}
              </div>
              
              {/* Essential controls */}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0.5 text-gray-500 hover:text-primary"
                onClick={handlePlayAudio}
                title="Тиловат"
              >
                <Play className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon" 
                className={`h-5 w-5 p-0.5 ${isBookmarked ? "text-amber-500" : "text-gray-400 hover:text-primary"}`}
                onClick={toggleBookmark}
                disabled={isBookmarkPending || isBookmarkLoading}
                title={isBookmarked ? "Хатмичаро хориҷ кунед" : "Ҳамчун хатмича нигоҳ доред"}
              >
                <BookmarkIcon className={`h-3 w-3 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
            </div>
            
            {/* Other actions */}
            <div className="flex gap-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0.5 text-gray-400 hover:text-primary"
                    title="Расми оят"
                  >
                    <ImageIcon className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xs sm:max-w-sm">
                  <DialogTitle className="text-xs text-center">Оят {verse.unique_key}</DialogTitle>
                  <AspectRatio ratio={16/9} className="bg-white rounded-lg p-2">
                    <img 
                      src={getVerseImageUrl(true)}
                      alt={`Verse ${verse.unique_key}`}
                      className="object-contain h-full w-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('high-resolution')) {
                          target.src = getVerseImageUrl(false);
                        }
                      }}
                    />
                  </AspectRatio>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0.5 text-gray-400 hover:text-primary"
                onClick={handleCopyVerse}
                title="Нусхабардорӣ"
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0.5 text-gray-400 hover:text-primary"
                onClick={handleShareVerse}
                title="Мубодила"
              >
                <Share className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Content - Ultra compact */}
          <div className="p-2">
            {/* Arabic Text */}
            <div className="mb-1">
              <WordByWordText
                surahNumber={parseInt(verse.unique_key.split(':')[0])}
                verseNumber={verse.verse_number}
                plainText={arabicText}
                className={cn(
                  "text-right", 
                  `arabic-text-${textSize}`,
                  lineSpacing <= 1.3 ? "leading-tight" : 
                  lineSpacing <= 1.6 ? "leading-normal" : 
                  lineSpacing <= 1.8 ? "leading-relaxed" : "leading-loose"
                )}
              />
            </div>
            
            {/* Transliteration - Ultra compact */}
            {verse.transliteration && showTransliteration && (
              <div className="border-t border-gray-100/40 dark:border-gray-700/40 pt-1 mb-1">
                <p className="text-[9px] text-gray-500 dark:text-gray-400">Талаффуз:</p>
                <p className="italic text-xs">
                  {verse.transliteration}
                </p>
              </div>
            )}
            
            {/* Translation - Ultra compact */}
            <div className="border-t border-gray-100/40 dark:border-gray-700/40 pt-1">
              <p className="text-[9px] text-gray-500 dark:text-gray-400">
                {translationType === 'tajik' ? 'Тарҷумаи тоҷикӣ:' : 
                 translationType === 'tj_2' ? 'Тарҷумаи тоҷикӣ 2:' :
                 translationType === 'tj_3' ? 'Тарҷумаи тоҷикӣ 3:' :
                 translationType === 'farsi' ? 'Тарҷумаи форсӣ:' :
                 'Тарҷумаи русӣ:'}
              </p>
              <p className="text-xs">
                {translationType === 'tajik' ? verse.tajik_text : 
                 translationType === 'tj_2' ? verse.tj_2 || verse.tajik_text : 
                 translationType === 'tj_3' ? verse.tj_3 || verse.tajik_text : 
                 translationType === 'farsi' ? verse.farsi || verse.tajik_text : 
                 verse.russian || verse.tajik_text}
              </p>
            </div>
            
            {/* Tafsir toggle - Ultra compact */}
            {verse.tafsir && (
              <Collapsible 
                open={isTafsirOpen} 
                onOpenChange={setIsTafsirOpen}
                className="border-t border-gray-100/40 dark:border-gray-700/40 pt-1 mt-1"
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex w-full justify-between items-center p-0 h-5 hover:bg-transparent"
                  >
                    <div className="flex items-center text-primary dark:text-primary">
                      <Book className="h-2 w-2 mr-1" />
                      <span className="font-medium text-[9px]">Тафсири оят</span>
                    </div>
                    {isTafsirOpen ? 
                      <ChevronUp className="h-2 w-2 text-gray-500" /> : 
                      <ChevronDown className="h-2 w-2 text-gray-500" />
                    }
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1">
                  <div className="text-gray-800 dark:text-gray-200 text-xs">
                    {verse.tafsir}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}