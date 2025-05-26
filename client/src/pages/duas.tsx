import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import DuaVerseDisplay from '@/components/quran/DuaVerseDisplay';
import { Button } from '@/components/ui/button';
import { Home, Book, Search } from 'lucide-react';

// Type for the Dua entries
interface DuaEntry {
  surah: number;
  verse: number;
  start_word: number;
}

export default function DuasPage() {
  const [duas, setDuas] = useState<DuaEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the duas data
    fetch('/api/duas')
      .then(response => response.json())
      .then(data => {
        setDuas(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading duas:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex w-full justify-between space-x-2 md:space-x-4">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex gap-2 items-center">
                  <Home className="h-4 w-4" />
                  <span>Асосӣ</span>
                </Button>
              </Link>
              <Link href="/duas">
                <Button variant="ghost" size="sm" className="flex gap-2 items-center">
                  <Book className="h-4 w-4" />
                  <span>Дуоҳо</span>
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/search">
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Дуоҳои Қуръонӣ</h1>
          <p className="text-muted-foreground">
            Маҷмӯаи дуоҳо аз Қуръони карим. Қисми дуо бо ранги баланд нишон дода шудааст.
          </p>
        </div>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {duas.map((dua, index) => (
              <DuaVerseDisplay
                key={index}
                surah={dua.surah}
                verse={dua.verse}
                startWord={dua.start_word}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}