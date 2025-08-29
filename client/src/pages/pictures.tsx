import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { GlobalOverlayType } from '@/App';
import { 
  Search, 
  Image, 
  Download, 
  Heart, 
  Share2,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import SeoHead from '@/components/shared/SeoHead';

interface PictureItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  tags: string[];
  likes: number;
  downloads: number;
}

const samplePictures: PictureItem[] = [
  {
    id: '1',
    title: 'Хаттотии "Бисмиллоҳ"',
    description: 'Хаттотии зебои "Бисмиллоҳир-раҳмонир-раҳим" бо услуби настаълиқ',
    category: 'Хаттотӣ',
    imageUrl: '/api/placeholder/400/300',
    tags: ['хаттотӣ', 'бисмиллоҳ', 'настаълиқ'],
    likes: 156,
    downloads: 89
  },
  {
    id: '2',
    title: 'Масҷиди Набавӣ',
    description: 'Сурати зебои Масҷиди Набавӣ дар Мадинаи Мунаввара',
    category: 'Масҷидҳо',
    imageUrl: '/api/placeholder/400/300',
    tags: ['масҷид', 'мадина', 'ислом'],
    likes: 234,
    downloads: 156
  },
  {
    id: '3',
    title: 'Гулҳои исломӣ',
    description: 'Нақши гулҳои зебои исломӣ бо рангҳои гуногун',
    category: 'Нақшҳо',
    imageUrl: '/api/placeholder/400/300',
    tags: ['гулҳо', 'нақш', 'рангҳо'],
    likes: 98,
    downloads: 67
  },
  {
    id: '4',
    title: 'Қуръони Карим',
    description: 'Сурати зебои Қуръони Карим бо хаттотии зебо',
    category: 'Хаттотӣ',
    imageUrl: '/api/placeholder/400/300',
    tags: ['қуръон', 'хаттотӣ', 'ислом'],
    likes: 312,
    downloads: 198
  },
  {
    id: '5',
    title: 'Каъбаи Мушарафа',
    description: 'Сурати зебои Каъбаи Мушарафа дар Масҷидул-ҳаром',
    category: 'Масҷидҳо',
    imageUrl: '/api/placeholder/400/300',
    tags: ['каъба', 'макка', 'ҳаҷ'],
    likes: 445,
    downloads: 289
  },
  {
    id: '6',
    title: 'Дуоҳои Қуръонӣ',
    description: 'Нақши дуоҳои Қуръонӣ бо хаттотии зебо',
    category: 'Хаттотӣ',
    imageUrl: '/api/placeholder/400/300',
    tags: ['дуо', 'хаттотӣ', 'қуръон'],
    likes: 178,
    downloads: 123
  }
];

const categories = [
  'Ҳама', 'Хаттотӣ', 'Масҷидҳо', 'Нақшҳо', 'Таърихӣ', 'Зебоишиносӣ'
];

interface PicturesProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Pictures({ onOpenOverlay }: PicturesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Ҳама');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredPictures, setFilteredPictures] = useState(samplePictures);

  // Filter pictures based on search and category
  const filterPictures = () => {
    let filtered = samplePictures;

    if (selectedCategory !== 'Ҳама') {
      filtered = filtered.filter(pic => pic.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pic => 
        pic.title.toLowerCase().includes(term) ||
        pic.description.toLowerCase().includes(term) ||
        pic.tags.some(tag => tag.toLowerCase().includes(term))
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

  const handleDownload = (picture: PictureItem) => {
    // Implement download functionality
    console.log('Downloading:', picture.title);
  };

  const handleLike = (picture: PictureItem) => {
    // Implement like functionality
    console.log('Liking:', picture.title);
  };

  const handleShare = (picture: PictureItem) => {
    // Implement share functionality
    console.log('Sharing:', picture.title);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Суратҳои исломӣ - Хаттотӣ, масҷидҳо ва нақшҳо"
        description="Суратҳои зебои исломӣ, хаттотӣ, масҷидҳо ва нақшҳо. Боргирии суратҳои исломӣ бо сифати баланд."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Суратҳои исломӣ",
          "description": "Суратҳои зебои исломӣ, хаттотӣ ва нақшҳо",
          "url": `${window.location.origin}/pictures`
        }}
      />
      <Header onOpenOverlay={onOpenOverlay} />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Суратҳои исломӣ
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Хаттотӣ, масҷидҳо, нақшҳо ва суратҳои зебои исломӣ
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Ҷустуҷӯи суратҳо..."
                className="pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
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
                <Card key={picture.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative group">
                    <img
                      src={picture.imageUrl}
                      alt={picture.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(picture)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Боргирӣ
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleLike(picture)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {picture.likes}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleShare(picture)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {picture.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {picture.downloads} боргирӣ
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">{picture.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {picture.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {picture.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Ягон сурат ёфт нашуд
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Лутфан дар ҷустуҷӯ ё категория тағйир диҳед
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