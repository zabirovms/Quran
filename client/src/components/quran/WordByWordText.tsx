import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { getArabicFontClass } from '@/lib/fonts';
import { useQuery } from '@tanstack/react-query';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { setActiveWord, getActiveWord, subscribeToActiveWord, generateWordKey } from '@/lib/wordSelectionStore';

// Types for the component props
interface WordByWordTextProps {
  surahNumber: number;
  verseNumber: number;
  plainText: string;
  className?: string;
}

/**
 * Displays Arabic text with word-by-word translation on hover
 * Shows Farsi translations from the database
 */
export default function WordByWordText({
  surahNumber,
  verseNumber,
  plainText,
  className
}: WordByWordTextProps) {
  // Get text size settings
  const { textSize } = useDisplaySettings();
  const isMobile = useIsMobile();

  // State to track active word in this component
  const [activeWordState, setActiveWordState] = useState<string | null>(null);

  // Ref to track if we're showing a tooltip on mobile
  const showingMobileTooltip = useRef(false);

  // Sync local state with global store
  useEffect(() => {
    // Subscribe to global active word changes
    const unsubscribe = subscribeToActiveWord((key) => {
      setActiveWordState(key);
    });

    return () => unsubscribe();
  }, []);

  // Check if a word is currently active
  const isWordActive = (position: number) => {
    const wordKey = generateWordKey(surahNumber, verseNumber, position);
    return activeWordState === wordKey;
  };

  // Function to handle mouse hover interaction
  const handleMouseInteraction = (position: number) => {
    if (!isMobile) {
      const wordKey = generateWordKey(surahNumber, verseNumber, position);
      setActiveWord(wordKey);
    }
  };

  // Function to handle mouse leave interaction
  const handleMouseLeave = () => {
    if (!isMobile) {
      setActiveWord(null);
    }
  };

  // Function to handle touch interaction
  const handleTouchStart = (position: number) => {
    if (isMobile) {
      const wordKey = generateWordKey(surahNumber, verseNumber, position);

      // If tapping the same word again, clear it
      if (activeWordState === wordKey) {
        setActiveWord(null);
        showingMobileTooltip.current = false;
      } else {
        setActiveWord(wordKey);
        showingMobileTooltip.current = true;
      }
    }
  };

  // Close any open tooltip when tapping elsewhere on the page
  useEffect(() => {
    if (!isMobile) return;

    const handlePageTap = (e: MouseEvent) => {
      // Check if the click was outside our component
      if (showingMobileTooltip.current) {
        const target = e.target as HTMLElement;
        if (!target.closest('.arabic-word-interactive')) {
          setActiveWord(null);
          showingMobileTooltip.current = false;
        }
      }
    };

    document.addEventListener('click', handlePageTap);
    return () => {
      document.removeEventListener('click', handlePageTap);
    };
  }, [isMobile]);

  // Fetch word analysis data
  // Fetch word analysis data from Uthmani.json file AND from the API
  // This allows us to get the correct Arabic text AND the translations
  const { data: uthmaniData, isLoading: isLoadingUthmani } = useQuery({
    queryKey: ['/uthmani-word-analysis', surahNumber, verseNumber],
    queryFn: async () => {
      // Import the getWordAnalysisForVerse function from the uthmaniQuran library
      const { getWordAnalysisForVerse } = await import('@/lib/uthmaniQuran');
      return getWordAnalysisForVerse(surahNumber, verseNumber);
    },
    enabled: !!surahNumber && !!verseNumber,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  // Fetch translation data from the API
  const { data: apiWordAnalysis, isLoading: isLoadingApi, error } = useQuery({
    queryKey: ['/api/word-analysis', surahNumber, verseNumber],
    queryFn: async () => {
      const response = await fetch(`/api/word-analysis/${surahNumber}/${verseNumber}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!surahNumber && !!verseNumber,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Combine the data sources: Uthmani text with API translations
  const wordAnalysis = useMemo(() => {
    if (!uthmaniData || !apiWordAnalysis) return null;

    // Map the Uthmani words to include translations from the API
    return uthmaniData.map((uthmaniWord, index) => {
      const apiWord = apiWordAnalysis[index] || {};
      return {
        ...uthmaniWord,
        // Use API translation if available
        translation: apiWord.translation || uthmaniWord.translation
      };
    });
  }, [uthmaniData, apiWordAnalysis]);

  // Combined loading state
  const isLoading = isLoadingUthmani || isLoadingApi;

  const arabicFontClass = getArabicFontClass('sm');

  // If loading, return skeleton
  if (isLoading) {
    return (
      <div className={cn("text-right", className)}>
        <div className={cn(
          arabicFontClass,
          'arabic-text',
          `arabic-text-${textSize}`
        )}>
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-3/4 mb-2" />
        </div>
      </div>
    );
  }

  // If error, or if API not ready yet, fall back to plain text
  if (error || !wordAnalysis) {
    return (
      <div className={cn("text-right", className)}>
        <div className={cn(
          arabicFontClass,
          'arabic-text',
          `arabic-text-${textSize}`
        )}>
          {plainText}
        </div>
      </div>
    );
  }

  // Build the actual text with proper spaces for copy-paste functionality
  const renderVerseText = () => {
    if (!wordAnalysis || !Array.isArray(wordAnalysis)) {
      return plainText;
    }

    return (
      <TooltipProvider delayDuration={100}>
        {wordAnalysis.map((word, index) => (
          <React.Fragment key={word.word_position}>
            {/* Add actual space character between words for copy-paste */}
            {index > 0 && ' '}
            <span 
              className="inline-block relative arabic-word-interactive"
              onMouseEnter={() => handleMouseInteraction(word.word_position)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleTouchStart(word.word_position)}
            >
              <Tooltip open={isWordActive(word.word_position)}>
                <TooltipTrigger asChild>
                  <span 
                    className={cn(
                      "px-0 cursor-pointer transition-colors duration-200",
                      isWordActive(word.word_position)
                        ? "text-primary dark:text-accent bg-primary/5 dark:bg-accent/10 rounded px-0.5" 
                        : "hover:text-primary dark:hover:text-accent"
                    )}
                  >
                    {word.word_text.replace(/[\u0660-\u0669]+$/, '').trim()}
                  </span>
                </TooltipTrigger>
                <TooltipContent 
                  side={isMobile ? "top" : "bottom"} 
                  align="center"
                  sideOffset={isMobile ? 10 : 5}
                  className="bg-white dark:bg-gray-800 z-[100] max-w-xs shadow-lg border border-gray-200 dark:border-gray-700 p-3"
                >
                  {/* Translation with increased visibility for mobile */}
                  <div className={cn(
                    "text-base text-gray-700 dark:text-gray-300 font-farsi text-right leading-relaxed",
                    isMobile && "text-lg font-medium"
                  )}>
                    {word.translation || "тарҷума мавҷуд нест"}
                  </div>
                </TooltipContent>
              </Tooltip>
            </span>
          </React.Fragment>
        ))}
      </TooltipProvider>
    );
  };

  return (
    <div className={cn("text-right", className)}>
      <div className={cn(
        arabicFontClass,
        'arabic-text',
        `arabic-text-${textSize}`
      )}>
        {renderVerseText()}
      </div>
    </div>
  );
}