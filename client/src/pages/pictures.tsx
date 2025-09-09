import { useState } from 'react';
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
import { 
  Search, 
  Heart,
  Share2,
  Download,
  Eye,
  Filter,
  Grid3X3,
  List,
  BookOpen,
  Star,
  Calendar,
  User
} from 'lucide-react';
import SeoHead from '@/components/shared/SeoHead';

interface PictureItem {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  surah: string;
  verse: string;
  author: string;
  imagePath: string;
  likes: number;
  views: number;
  uploadDate: string;
  tags: string[];
}

const quranicQuotes: PictureItem[] = [
  {
    id: '1',
    title: 'Қуръон 73:2 (Сураи Муззаммил)',
    description: 'Иқтибоси зебо аз Сураи Муззаммил - ояти 2',
    category: 'Иқтибосҳо',
    source: 'Сураи Муззаммил',
    surah: '73',
    verse: '2',
    author: 'Хаттот',
    imagePath: '/QuraniQuotes/Қуръон 73^2 (Сураи Муззаммил).jpg',
    likes: 156,
    views: 2340,
    uploadDate: '2024-01-15',
    tags: ['Сураи Муззаммил', 'Оят 2', 'Хаттотӣ', 'Исломӣ']
  },
  {
    id: '2',
    title: 'Қуръон 20:55 (Сураи Тоҳо)',
    description: 'Иқтибоси зебо аз Сураи Тоҳо - ояти 55',
    category: 'Иқтибосҳо',
    source: 'Сураи Тоҳо',
    surah: '20',
    verse: '55',
    author: 'Хаттот',
    imagePath: '/QuraniQuotes/Қуръон 20^55 (Сураи Тоҳо).jpg',
    likes: 234,
    views: 3456,
    uploadDate: '2024-01-12',
    tags: ['Сураи Тоҳо', 'Оят 55', 'Хаттотӣ', 'Исломӣ']
  },
  {
    id: '3',
    title: 'Фазилати Шаби Қадр',
    description: 'Иқтибоси зебо дар бораи фазилати Шаби Қадр',
    category: 'Фазилатҳо',
    source: 'Шаби Қадр',
    surah: '97',
    verse: '1-5',
    author: 'Хаттот',
    imagePath: '/QuraniQuotes/Фазилати Шаби Қадр.jpg',
    likes: 189,
    views: 2789,
    uploadDate: '2024-01-10',
    tags: ['Шаби Қадр', 'Фазилат', 'Хаттотӣ', 'Исломӣ']
  },
  {
    id: '4',
    title: 'Қуръон 17:24 (Сураи Исро)',
    description: 'Иқтибоси зебо аз Сураи Исро - ояти 24',
    category: 'Иқтибосҳо',
    source: 'Сураи Исро',
    surah: '17',
    verse: '24',
    author: 'Хаттот',
    imagePath: '/QuraniQuotes/Қуръон 17^24 (Сураи Исро).jpg',
    likes: 145,
    views: 2123,
    uploadDate: '2024-01-08',
    tags: ['Сураи Исро', 'Оят 24', 'Хаттотӣ', 'Исломӣ']
  },
  {
    id: '5',
    title: 'Дуоҳои Шаби Қадр',
    description: 'Иқтибоси зебо аз дуоҳои Шаби Қадр',
    category: 'Дуоҳо',
    source: 'Шаби Қадр',
    surah: '97',
    verse: '1-5',
    author: 'Хаттот',
    imagePath: '/QuraniQuotes/Дуоҳои Шаби Қадр.jpg',
    likes: 267,
    views: 3890,
    uploadDate: '2024-01-05',
    tags: ['Шаби Қадр', 'Дуоҳо', 'Хаттотӣ', 'Исломӣ']
  },
  {
    id: '6',
    title: 'Қуръон 26:32 (Сураи Шуаро)',
    description: 'Иқтибоси зебо аз Сураи Шуаро - ояти 32',
    category: 'Иқтибосҳо',
    source: 'Сураи Шуаро',
    surah: '26',
    verse: '32',
    author: 'Хаттот',
    imagePath: '/QuraniQuotes/Қуръон 26^32 (Сураи Шуаро).jpg',
    likes: 178,
    views: 2567,
    uploadDate: '2024-01-03',
    tags: ['Сураи Шуаро', 'Оят 32', 'Хаттотӣ', 'Исломӣ']
  },
  {
    id: '7',
    title: 'Такбири Иди Қурбон (Такбироти Ташриқ)',
    description: 'Иқтибоси зебо аз такбироти Иди Қурбон',
    category: 'Такбирҳо',
    source: 'Иди Қурбон',
    surah: '22',
    verse: '28',
    author: 'Хаттот',
    imagePath: '/QuraniQuotes/Такбири Иди Қурбон (Такбироти Ташриқ).jpg',
    likes: 198,
    views: 3123,
    uploadDate: '2024-01-01',
    tags: ['Иди Қурбон', 'Такбир', 'Хаттотӣ', 'Исломӣ']
  }
];

const categories = [
  'Ҳама', 'Иқтибосҳо', 'Фазилатҳо', 'Дуоҳо', 'Такбирҳо'
];

const sources = [
  'Ҳама', 'Сураи Муззаммил', 'Сураи Тоҳо', 'Шаби Қадр', 'Сураи Исро', 'Сураи Шуаро', 'Иди Қурбон'
];

interface PicturesProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Pictures({ onOpenOverlay }: PicturesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Ҳама');
  const [selectedSource, setSelectedSource] = useState('Ҳама');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredPictures, setFilteredPictures] = useState(quranicQuotes);
  const [selectedPicture, setSelectedPicture] = useState<PictureItem | null>(null);

  // Filter pictures based on search, category and source
  const filterPictures = () => {
    let filtered = quranicQuotes;

    if (selectedCategory !== 'Ҳама') {
      filtered = filtered.filter(picture => picture.category === selectedCategory);
    }

    if (selectedSource !== 'Ҳама') {
      filtered = filtered.filter(picture => picture.source === selectedSource);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(picture => 
        picture.title.toLowerCase().includes(term) ||
        picture.description.toLowerCase().includes(term) ||
        picture.author.toLowerCase().includes(term) ||
        picture.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredPictures(filtered);
  };

  // Apply filtering when dependencies change
  useState(() => {
    filterPictures();
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterPictures();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterPictures();
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    filterPictures();
  };

  const handlePictureSelect = (picture: PictureItem) => {
    setSelectedPicture(picture);
  };

  const handleLike = (picture: PictureItem) => {
    // Implement like functionality
    console.log('Liking picture:', picture.title);
  };

  const handleShare = (picture: PictureItem) => {
    // Implement share functionality
    console.log('Sharing picture:', picture.title);
  };

  const handleDownload = (picture: PictureItem) => {
    // Implement download functionality
    const link = document.createElement('a');
    link.href = picture.imagePath;
    link.download = picture.title;
    link.click();
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Иқтибосҳо аз Қуръон - суратҳо исломӣ"
        description="Иқтибосҳои зебо аз Қуръони Карим бо хаттотии исломӣ ва суратҳои зебо."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Иқтибосҳо аз Қуръон",
          "description": "Суратҳои исломӣ аз Қуръони Карим",
          "url": `${window.location.origin}/pictures`
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
              Иқтибосҳо аз Қуръон
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              суратҳо исломӣ
            </p>
          </div>

          {/* Selected Picture Modal */}
          {selectedPicture && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <div className="max-w-4xl w-full max-h-full overflow-auto bg-white dark:bg-gray-900 rounded-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">{selectedPicture.title}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {selectedPicture.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {selectedPicture.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {selectedPicture.surah}:{selectedPicture.verse}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {selectedPicture.author}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPicture(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <img
                    src={selectedPicture.imagePath}
                    alt={selectedPicture.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleLike(selectedPicture)}
                        variant="outline"
                        size="sm"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {selectedPicture.likes}
                      </Button>
                      <Button
                        onClick={() => handleShare(selectedPicture)}
                        variant="outline"
                        size="sm"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Бахшида
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleDownload(selectedPicture)}
                      variant="default"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Боргирӣ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Ҷустуҷӯи иқтибосҳо..."
                className="pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {/* Category and Source Filters */}
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
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Манбаъ:</span>
                {sources.map((source) => (
                  <Badge
                    key={source}
                    variant={selectedSource === source ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleSourceChange(source)}
                  >
                    {source}
                  </Badge>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Pictures Grid/List */}
          {filteredPictures.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredPictures.map((picture) => (
                <Card key={picture.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handlePictureSelect(picture)}>
                  {/* Picture */}
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                    <img
                      src={picture.imagePath}
                      alt={picture.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Overlay with info */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-center text-white">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm">Назар кардан</span>
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs">
                      {picture.category}
                    </div>
                    
                    {/* Source Badge */}
                    <div className="absolute top-2 right-2 bg-secondary/90 text-white px-2 py-1 rounded text-xs">
                      {picture.source}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {picture.surah}:{picture.verse}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatViews(picture.views)} назар
                      </span>
                    </div>
                    
                    <h3 className="font-semibold mb-2 line-clamp-2">{picture.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {picture.description}
                    </p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Манбаъ:</span>
                        <span className="font-medium">{picture.source}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Хаттот:</span>
                        <span className="font-medium">{picture.author}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePictureSelect(picture);
                        }}
                        className="flex-1"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Назар
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(picture);
                        }}
                        variant="outline" 
                        size="sm"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {picture.likes}
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(picture);
                        }}
                        variant="outline" 
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Ягон иқтибос ёфт нашуд
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Лутфан дар ҷустуҷӯ ё филтрҳо тағйир диҳед
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Ҳама');
                setSelectedSource('Ҳама');
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