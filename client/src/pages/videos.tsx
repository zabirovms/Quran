import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { GlobalOverlayType } from '@/App';
import { Search, Play } from 'lucide-react';
import SeoHead from '@/components/shared/SeoHead';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  category: string;
  reciter: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  youtubeId: string;
  subtitles: string[];
  language: string;
  uploadDate: string;
}

const sampleVideos: VideoItem[] = [
  {
    id: '1',
    title: 'Сураи Муъминун (Сура Ал-Муминун)',
    description: 'Тиловати зебои Сураи Муъминун бо тарҷумаи тоҷикӣ ва субтитрҳо',
    category: 'Сураҳо',
    reciter: 'Шайх Абдур-Раҳмон ас-Судайс',
    duration: '15:32',
    thumbnailUrl: `https://img.youtube.com/vi/oPrXRnF7rCo/maxresdefault.jpg`,
    videoUrl: 'https://youtu.be/oPrXRnF7rCo',
    youtubeId: 'oPrXRnF7rCo',
    subtitles: ['Тоҷикӣ', 'Русӣ', 'Инглисӣ'],
    language: 'Арабӣ',
    uploadDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Сураи Фотиҳа (Сура Ал-Фатиха)',
    description: 'Тиловати хушовози Сураи Фотиҳа бо тафсири осонбаён',
    category: 'Сураҳо',
    reciter: 'Шайх Мишари Рашид ал-Афаси',
    duration: '8:45',
    thumbnailUrl: `https://img.youtube.com/vi/2DARwxIBTY0/maxresdefault.jpg`,
    videoUrl: 'https://youtu.be/2DARwxIBTY0',
    youtubeId: '2DARwxIBTY0',
    subtitles: ['Тоҷикӣ', 'Русӣ'],
    language: 'Арабӣ',
    uploadDate: '2024-01-12'
  },
  {
    id: '3',
    title: 'Сураи Набаъ (Сура Ан-Наба)',
    description: 'Тиловати зебои Сураи Набаъ бо тарҷума ва тафсир',
    category: 'Сураҳо',
    reciter: 'Шайх Аҳмад ал-Аҷми',
    duration: '12:18',
    thumbnailUrl: `https://img.youtube.com/vi/rApE4VAfqg8/maxresdefault.jpg`,
    videoUrl: 'https://youtu.be/rApE4VAfqg8',
    youtubeId: 'rApE4VAfqg8',
    subtitles: ['Тоҷикӣ', 'Русӣ', 'Инглисӣ'],
    language: 'Арабӣ',
    uploadDate: '2024-01-10'
  },
  {
    id: '4',
    title: 'Сураи Ар-Раҳмон (Сура Ар-Рахман)',
    description: 'Тиловати зебои Сураи Ар-Раҳмон бо тарҷума ва тафсир',
    category: 'Сураҳо',
    reciter: 'Шайх Абдур-Раҳмон ас-Судайс',
    duration: '18:25',
    thumbnailUrl: `https://img.youtube.com/vi/nsipUP3Tk0Q/maxresdefault.jpg`,
    videoUrl: 'https://youtu.be/nsipUP3Tk0Q',
    youtubeId: 'nsipUP3Tk0Q',
    subtitles: ['Тоҷикӣ', 'Русӣ', 'Инглисӣ'],
    language: 'Арабӣ',
    uploadDate: '2024-01-08'
  }
];

const categories = [
  'Ҳама', 'Сураҳо', 'Дуоҳо', 'Фарзҳо', 'Таърих', 'Тафсир', 'Таълимӣ'
];

// Simplified: focusing on categories and search only

interface VideosProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Videos({ onOpenOverlay }: VideosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Ҳама');
  const [filteredVideos, setFilteredVideos] = useState(sampleVideos);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Filter videos based on search, category and language
  const filterVideos = () => {
    let filtered = sampleVideos;

    if (selectedCategory !== 'Ҳама') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(term) ||
        video.description.toLowerCase().includes(term) ||
        video.reciter.toLowerCase().includes(term)
      );
    }

    setFilteredVideos(filtered);
  };

  // Apply filtering when dependencies change
  useEffect(() => {
    filterVideos();
  }, [searchTerm, selectedCategory]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // language filter removed

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  // removed likes/share for a minimal UI

  const handleWatchOnYouTube = (video: VideoItem) => {
    window.open(video.videoUrl, '_blank');
  };

  // views formatting removed

  // Generate YouTube embed URL with proper parameters
  const getYouTubeEmbedUrl = (youtubeId: string) => {
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&showinfo=1&controls=1&autoplay=0`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Видеоҳои Қуръонӣ - Тиловат бо субтитрҳои тоҷикӣ"
        description="Видеоҳои тиловати Қуръон, дуоҳо ва маълумотҳои исломӣ бо субтитрҳои тоҷикӣ."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Видеоҳои Қуръонӣ",
          "description": "Видеоҳои тиловати Қуръон бо субтитрҳо",
          "url": `${window.location.origin}/videos`
        }}
      />
      <Header onOpenOverlay={onOpenOverlay} />
      {/* Hero with search */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/15 via-accent/10 to-transparent" />
        <div className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Видеоҳои Қуръонӣ</h1>
            <p className="text-muted-foreground mb-6">Тиловатҳо ва дарсҳо бо тарҷумаи тоҷикӣ. Ҷустуҷӯ кунед ё категорияро интихоб намоед.</p>
            <div className="relative">
              <Input type="text" placeholder="Ҷустуҷӯи видеоҳо…" className="pl-10 h-12 text-base" value={searchTerm} onChange={handleSearch} />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories scroller */}
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          {categories.map((category) => (
            <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => handleCategoryChange(category)}>
              {category}
            </Button>
          ))}
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">

          {/* Videos Grid */}
          {filteredVideos.length > 0 ? (
            <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleVideoSelect(video)}>
                  {/* Video Thumbnail */}
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative group">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-8 w-8 ml-1 text-gray-800" />
                      </div>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {video.duration}
                    </div>
                    {/* Category */}
                    <div className="absolute top-2 left-2 bg-primary/80 text-primary-foreground px-2 py-1 rounded text-xs">
                      {video.category}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.reciter}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Ягон видео ёфт нашуд
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Лутфан дар ҷустуҷӯ ё филтрҳо тағйир диҳед
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Ҳама');
              }}>
                Тоза кардани филтрҳо
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Player */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="p-0 sm:max-w-3xl">
          {selectedVideo && (
            <div className="w-full">
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.youtubeId)}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <DialogHeader>
                  <DialogTitle className="text-base md:text-lg">{selectedVideo.title}</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{selectedVideo.reciter}</span> • {selectedVideo.language} • {selectedVideo.duration}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
} 