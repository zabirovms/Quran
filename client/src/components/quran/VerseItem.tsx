import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Verse } from '@shared/schema';
import { getArabicFontClass, formatArabicNumber } from '@/lib/fonts';
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
import WordByWordText from './WordByWordText';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Collapsible, CollapsibleContent, CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { getVerseText } from '@/lib/uthmaniQuran';

interface VerseItemProps {
  verse: Verse;
  surahName: string;
  isLoading?: boolean;
}

// Cache for storing the Uthmani text to avoid unnecessary re-fetching
const uthmaniTextCache: Record<string, string> = {};

export default function VerseItem({ verse, surahName, isLoading = false }: VerseItemProps) {
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
          // This ensures proper word spacing to match Version 1 requirements
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
  
  // Generate verse image URL from Islamic Network CDN
  const getVerseImageUrl = (highRes = false) => {
    // Extract surah number from the unique key (format: surah:verse)
    const [surahNumber, verseNumber] = verse.unique_key.split(':');
    return highRes
      ? `https://cdn.islamic.network/quran/images/high-resolution/${surahNumber}_${verseNumber}.png`
      : `https://cdn.islamic.network/quran/images/${surahNumber}_${verseNumber}.png`;
  };
  
  // Handle playing audio for this verse
  const handlePlayAudio = () => {
    // Use verse key directly with AlQuran Cloud API
    playAudio(verse.unique_key, {
      surahName: surahName,
      verseNumber: verse.verse_number
    });
  };
  
  // Handle copying verse text with all available translations
  const handleCopyVerse = () => {
    // Build the text to copy with all available content
    let textToCopy = `${arabicText}\n\n`;
    
    // Add transliteration if available
    if (verse.transliteration) {
      textToCopy += `${verse.transliteration}\n\n`;
    }
    
    // Add primary translation
    textToCopy += `${verse.tajik_text}\n\n`;
    
    // Add alternative translation if available
    if (verse.tj_2) {
      textToCopy += `Тарҷумаи дигар:\n${verse.tj_2}\n\n`;
    }
    
    // Add verse reference
    textToCopy += `(${verse.unique_key})`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Нусхабардорӣ шуд",
        description: "Матни оят ба ҳофизаи муваққатӣ нусхабардорӣ шуд.",
        duration: 2000 // 2 seconds duration
      });
    });
  };
  
  // Handle sharing verse with all available translations
  const handleShareVerse = () => {
    // Build the sharing text with essential content
    let shareText = `${arabicText}\n\n`;
    
    // Add transliteration if available (keep sharing text concise)
    if (verse.transliteration) {
      shareText += `${verse.transliteration}\n\n`;
    }
    
    // Add primary translation
    shareText += `${verse.tajik_text}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Quran - ${verse.unique_key}`,
        text: shareText,
        url: `${window.location.href.split('#')[0]}#verse-${verse.unique_key.replace(':', '-')}`
      }).catch(() => {
        // Fallback if share fails
        handleCopyVerse();
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyVerse();
    }
  };
  
  // Handle bookmark toggle
  const toggleBookmark = () => {
    if (isBookmarked && bookmarkId) {
      removeBookmark.mutate(bookmarkId);
      toast({
        title: "Ҳазф шуд",
        description: "Оят аз захирагоҳ ҳазф шуд.",
        duration: 2000 // 2 seconds duration
      });
    } else {
      addBookmark.mutate(verse.id);
      toast({
        title: "Захира шуд", 
        description: "Оят ба захирагоҳ илова шуд.",
        duration: 2000 // 2 seconds duration
      });
    }
  };
  
  // If loading, show a more compact skeleton
  if (isLoading) {
    return (
      <Card className="mb-3 overflow-hidden border border-border/50">
        <div className="flex flex-col">
          <div className="bg-muted/30 px-2 py-1 flex justify-between items-center border-b border-border/30">
            <Skeleton className="w-12 h-5 rounded-sm" />
            <div className="flex space-x-1">
              <Skeleton className="w-5 h-5 rounded-sm" />
              <Skeleton className="w-5 h-5 rounded-sm" />
              <Skeleton className="w-5 h-5 rounded-sm" />
            </div>
          </div>
          <div className="px-2 py-1">
            <Skeleton className="w-full h-8 mb-2" />
            <Skeleton className="w-full h-4 mb-1" />
            <Skeleton className="w-3/4 h-4" />
          </div>
        </div>
      </Card>
    );
  }
  
  const verseId = `verse-${verse.unique_key.replace(':', '-')}`;
  const isBookmarkPending = addBookmark.isPending || removeBookmark.isPending;
  
  return (
    <Card 
      id={verseId} 
      className={`mb-3 overflow-hidden border ${isBookmarked ? 'border-accent' : 'border-border/50'}`}
      data-verse={verse.unique_key}
    >
      {/* More compact layout with horizontal design */}
      <div className="flex flex-col">
        {/* Verse header - very compact */}
        <div className="bg-muted/30 px-2 py-1 flex justify-between items-center border-b border-border/30">
          <div className="flex items-center gap-1">
            {/* Verse number */}
            <div className="bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent border border-primary/20 dark:border-accent/30 h-5 w-auto px-1.5 rounded-sm flex items-center justify-center text-xs font-medium">
              {verse.unique_key}
            </div>
          </div>
          
          {/* Action buttons in a row */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary dark:hover:text-accent"
              onClick={handlePlayAudio}
              title="Шунидани оят"
            >
              <Play className="h-3 w-3" />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-primary dark:hover:text-accent"
                  title="Дидани тасвири оят"
                >
                  <ImageIcon className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-[700px]">
                <DialogTitle className="text-center">Quran Verse {verse.unique_key}</DialogTitle>
                <div className="pt-4 px-4">
                  <AspectRatio ratio={16/9} className="bg-white rounded-lg p-6">
                    <img 
                      src={getVerseImageUrl(true)} 
                      alt={`Quran verse ${verse.unique_key}`}
                      className="object-contain h-full w-full"
                      onError={(e) => {
                        // If high-res image fails, try standard resolution
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('high-resolution')) {
                          target.src = getVerseImageUrl(false);
                        }
                      }}
                    />
                  </AspectRatio>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Surah {surahName}, Verse {verse.verse_number}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary dark:hover:text-accent"
              onClick={handleCopyVerse}
              title="Нусхабардорӣ"
            >
              <Copy className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary dark:hover:text-accent"
              onClick={handleShareVerse}
              title="Мубодила"
            >
              <Share className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${isBookmarked ? "text-accent" : "text-muted-foreground"}`}
              onClick={toggleBookmark}
              disabled={isBookmarkPending || isBookmarkLoading}
              title={isBookmarked ? "Ҳазфи хатчӯб" : "Гузоштани хатчӯб"}
            >
              <BookmarkIcon className={`h-3 w-3 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
        
        {/* Verse content - much more compact */}
        <div className={cn("px-3 py-2", `content-${contentViewMode}`)}>
          {/* Arabic Text - with word-by-word translations */}
          <div className="mb-2">
            <WordByWordText
              surahNumber={parseInt(verse.unique_key.split(':')[0])}
              verseNumber={verse.verse_number}
              plainText={arabicText}
              className={cn(
                "text-right mb-1", 
                `arabic-text-${textSize}`,
                lineSpacing <= 1.3 ? "line-spacing-tight" : 
                lineSpacing <= 1.6 ? "line-spacing-normal" : 
                lineSpacing <= 1.8 ? "line-spacing-relaxed" : "line-spacing-loose"
              )}
            />
          </div>
          
          {/* Transliteration - ultra compact without label */}
          {verse.transliteration && showTransliteration && (
            <div className="border-t border-border/30 pt-0.5 pb-0.5 text-gray-800 dark:text-gray-200">
              <p className={cn(
                "text-sm italic mt-0",
                `translation-text-${textSize}`,
                lineSpacing <= 1.3 ? "line-spacing-tight" : 
                lineSpacing <= 1.6 ? "line-spacing-normal" : 
                lineSpacing <= 1.8 ? "line-spacing-relaxed" : "line-spacing-loose"
              )}>
                {verse.transliteration}
              </p>
            </div>
          )}
          
          {/* Translation - no label, maximum space efficiency */}
          <div className="border-t border-border/30 pt-0.5 pb-0.5 text-gray-800 dark:text-gray-200">
            <p className={cn(
              `translation-text-${textSize}`,
              lineSpacing <= 1.3 ? "line-spacing-tight" : 
              lineSpacing <= 1.6 ? "line-spacing-normal" : 
              lineSpacing <= 1.8 ? "line-spacing-relaxed" : "line-spacing-loose",
              "mt-0"
            )}>
              {translationType === 'tajik' ? (verse.tajik_text || 'Тарҷумаи тоҷикӣ мавҷуд нест') :
               translationType === 'tj_2' ? (verse.tj_2 || 'Тарҷумаи тоҷикӣ 2 мавҷуд нест') :
               translationType === 'tj_3' ? (verse.tj_3 || 'Тарҷумаи тоҷикӣ 3 мавҷуд нест') :
               translationType === 'farsi' ? (verse.farsi || 'Тарҷумаи форсӣ мавҷуд нест') :
               (verse.russian || 'Тарҷумаи русӣ мавҷуд нест')}
            </p>
          </div>
          
          {/* Tafsir content - much more compact */}
          {verse.tafsir && (
            <Collapsible 
              open={isTafsirOpen} 
              onOpenChange={setIsTafsirOpen}
              className="border-t border-border/30 pt-1"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 py-0 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center">
                    <Book className="mr-1 h-3 w-3 text-primary dark:text-accent" /> 
                    <span className="font-medium">Тафсир</span>
                  </div>
                  {isTafsirOpen ? 
                    <ChevronUp className="h-3 w-3 ml-1" /> : 
                    <ChevronDown className="h-3 w-3 ml-1" />
                  }
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-1">
                {/* Tafsir */}
                <div className="p-2 bg-muted/30 rounded-sm">
                  <p className={cn(
                    "text-sm",
                    `tafsir-text-${textSize}`,
                    lineSpacing <= 1.3 ? "line-spacing-tight" : 
                    lineSpacing <= 1.6 ? "line-spacing-normal" : 
                    lineSpacing <= 1.8 ? "line-spacing-relaxed" : "line-spacing-loose"
                  )}>
                    {verse.tafsir}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </Card>
  );
}