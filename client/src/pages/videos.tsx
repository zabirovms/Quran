import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
// Removed floating BackToHome in favor of inline control
import { Home } from 'lucide-react';
import { Link } from 'wouter';
import { GlobalOverlayType } from '@/App';
import { Search, Play } from 'lucide-react';
import SeoHead from '@/components/shared/SeoHead';

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
    console.log('Selected video:', video.title, 'YouTube ID:', video.youtubeId);
    setSelectedVideo(video);
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
      
      {/* Inline Back to Home */}
      <div className="container mx-auto px-4 mt-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex gap-2 items-center text-primary hover:text-primary/90">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Асосӣ</span>
          </Button>
        </Link>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Видеоҳои Қуръонӣ
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Тиловати Қуръон, дуоҳо ва маълумотҳои исломӣ бо субтитрҳои тоҷикӣ
            </p>
          </div>

          {/* Selected Video Player - simplified header */}
          {selectedVideo && (
            <div className="mb-8">
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{selectedVideo.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video w-full bg-gray-900">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedVideo.youtubeId)}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                  <div className="p-4 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-4">
                      <span>Тиловаткунанда: <span className="font-medium text-foreground">{selectedVideo.reciter}</span></span>
                      <span>Забон: <span className="font-medium text-foreground">{selectedVideo.language}</span></span>
                      <span>Давра: <span className="font-medium text-foreground">{selectedVideo.duration}</span></span>
                      <Button variant="outline" size="sm" onClick={() => setSelectedVideo(null)} className="ml-auto">Бастан</Button>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Category filter only */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Ҷустуҷӯи видеоҳо..."
                className="pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Категория:</span>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            
          </div>

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
                    
                    {/* Subtitles Badge */}
                    <div className="absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs">
                      {video.subtitles.length} забон
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <Badge variant="outline" className="text-xs mb-2">
                      {video.category}
                    </Badge>
                    
                    <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="space-y-2 mb-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Тиловаткунанда:</span>
                        <span className="font-medium">{video.reciter}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Забон:</span>
                        <span className="font-medium">{video.language}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoSelect(video);
                      }}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Дидан
                    </Button>
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

      <Footer />
    </div>
  );
} 