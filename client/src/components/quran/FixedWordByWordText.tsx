import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { getArabicFontClass } from '@/lib/fonts';
import { useQuery } from '@tanstack/react-query';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Types for the component props
interface WordByWordTextProps {
  surahNumber: number;
  verseNumber: number;
  plainText: string;
  className?: string;
}

// Global state for tracking the active word
let globalActiveWordKey: string | null = null;
const listeners: Array<(wordKey: string | null) => void> = [];

// Function to set the active word globally
const setGlobalActiveWord = (wordKey: string | null) => {
  globalActiveWordKey = wordKey;
  // Notify all listeners of the change
  listeners.forEach(listener => listener(wordKey));
};

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
  
  // State to track the active word in this component
  const [activeWordKey, setActiveWordKey] = useState<string | null>(null);
  
  // Ref to track if we're showing a tooltip on mobile
  const showingMobileTooltip = useRef(false);
  
  // Subscribe to global active word changes
  useEffect(() => {
    const handleActiveWordChange = (wordKey: string | null) => {
      setActiveWordKey(wordKey);
    };
    
    // Add this component as a listener
    listeners.push(handleActiveWordChange);
    
    // Cleanup when component unmounts
    return () => {
      const index = listeners.indexOf(handleActiveWordChange);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);
  
  // Function to generate a unique key for a word
  const generateWordKey = (surahNum: number, verseNum: number, position: number) => {
    return `${surahNum}:${verseNum}:${position}`;
  };
  
  // Check if a word is currently active
  const isWordActive = (position: number) => {
    const wordKey = generateWordKey(surahNumber, verseNumber, position);
    return activeWordKey === wordKey;
  };
  
  // Function to handle mouse hover interaction
  const handleMouseInteraction = (position: number) => {
    if (!isMobile) {
      const wordKey = generateWordKey(surahNumber, verseNumber, position);
      setGlobalActiveWord(wordKey);
    }
  };
  
  // Function to handle mouse leave interaction
  const handleMouseLeave = () => {
    if (!isMobile) {
      setGlobalActiveWord(null);
    }
  };
  
  // Function to handle touch interaction
  const handleTouchStart = (position: number) => {
    if (isMobile) {
      const wordKey = generateWordKey(surahNumber, verseNumber, position);
      
      // If tapping the same word again, clear it
      if (activeWordKey === wordKey) {
        setGlobalActiveWord(null);
        showingMobileTooltip.current = false;
      } else {
        setGlobalActiveWord(wordKey);
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
          setGlobalActiveWord(null);
          showingMobileTooltip.current = false;
        }
      }
    };
    
    document.addEventListener('click', handlePageTap);
    return () => {
      document.removeEventListener('click', handlePageTap);
    };
  }, [isMobile]);
  
  // Fetch word analysis data from the API
  const { data: wordAnalysis, isLoading, error } = useQuery({
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
  
  // Use the smaller Arabic font size
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
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-3/4 mb-2" />
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