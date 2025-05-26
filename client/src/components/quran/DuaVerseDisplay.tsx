import React, { useState, useEffect } from 'react';
import { useVerse } from '@/hooks/useQuran';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DuaVerseDisplayProps {
  surah: number;
  verse: number;
  startWord: number;
}

const DuaVerseDisplay: React.FC<DuaVerseDisplayProps> = ({ surah, verse, startWord }) => {
  const verseKey = `${surah}:${verse}`;
  const { data: verseData, isLoading } = useVerse(verseKey);
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    if (verseData?.arabic_text) {
      // Split the verse text into words
      // This is a simple split by spaces, but we might need a more sophisticated approach for Arabic
      const wordsArray = verseData.arabic_text.split(' ');
      setWords(wordsArray);
    }
  }, [verseData]);

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!verseData) {
    return null;
  }

  return (
    <Card className="mb-4 overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10">
      <CardContent className="pt-6">
        <div className="mb-2 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Сураи {surah}, Оят {verse}
          </div>
        </div>

        <div className="text-right font-arabic text-xl md:text-2xl leading-loose mb-4 whitespace-pre-line">
          {words.map((word, index) => (
            <span 
              key={index} 
              className={`inline-block ${index < startWord - 1 ? 'opacity-50 blur-[0.5px]' : 'font-bold'}`}
            >
              {word}{' '}
            </span>
          ))}
        </div>

        <div className="text-sm text-muted-foreground text-right">
          {verseData.tajik_text}
        </div>
      </CardContent>
    </Card>
  );
};

export default DuaVerseDisplay;