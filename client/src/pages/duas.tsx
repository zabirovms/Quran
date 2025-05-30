import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Book, Search } from 'lucide-react';
import DuaCard from '@/components/quran/DuaCard';
import duasData from '@/data/quranic_duas.json';

interface Dua {
  surah: number;
  verse: number;
  arabic: string;
  transliteration: string;
  tajik: string;
}

export default function DuasPage() {
  const [duas] = useState<Dua[]>(duasData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDuas = duas.filter((dua: Dua) => 
    dua.arabic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dua.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dua.tajik.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `Сура ${dua.surah}, Оят ${dua.verse}`.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          <div className="flex w-full justify-between items-center">
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
      <main className="container max-w-3xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Дуоҳои Қуръонӣ</h1>
          <p className="text-muted-foreground text-sm md:text-base mb-4">
            Маҷмӯаи дуоҳо аз Қуръони карим
          </p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ҷустуҷӯи дуо..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredDuas.map((dua, index) => (
            <DuaCard
              key={index}
              surah={dua.surah}
              verse={dua.verse}
              arabic={dua.arabic}
              transliteration={dua.transliteration}
              tajik={dua.tajik}
            />
          ))}
        </div>
      </main>
    </div>
  );
}