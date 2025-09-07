import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToHome from '@/components/shared/BackToHome';
import { GlobalOverlayType } from '@/App';
import { 
  Search, 
  BookOpen, 
  Clock,
  Eye,
  Heart,
  Share2,
  Filter,
  Grid3X3,
  List,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import SeoHead from '@/components/shared/SeoHead';

interface ArticleItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  views: number;
  likes: number;
  tags: string[];
  publishDate: string;
  imageUrl: string;
  slug: string;
}

const sampleArticles: ArticleItem[] = [
  {
    id: '1',
    title: 'Фазоилатҳои хондани Қуръон дар рӯз',
    excerpt: 'Дар бораи фазоилатҳои хондани Қуръон дар рӯз ва аҳамияти он дар зиндагии мусулмон',
    content: 'Матни пурраи мақола дар бораи фазоилатҳои хондани Қуръон...',
    category: 'Фазоилатҳо',
    author: 'Устод Абдуллоҳ',
    readTime: '5 дақиқа',
    views: 12345,
    likes: 567,
    tags: ['қуръон', 'фазоилат', 'зикр', 'дуо'],
    publishDate: '2024-01-15',
    imageUrl: '/api/placeholder/400/250',
    slug: 'fazoyilat-khondan-quran'
  },
  {
    id: '2',
    title: 'Таърихи пайғамбарони исломӣ',
    excerpt: 'Таърихи зиндагии пайғамбарони исломӣ ва аҳамияти онҳо дар ташаккули таърихи ислом',
    content: 'Матни пурраи мақола дар бораи таърихи пайғамбарон...',
    category: 'Таърих',
    author: 'Доктор Аҳмад',
    readTime: '12 дақиқа',
    views: 8901,
    likes: 234,
    tags: ['таърих', 'пайғамбарон', 'ислом', 'зиндагӣ'],
    publishDate: '2024-01-12',
    imageUrl: '/api/placeholder/400/250',
    slug: 'tarikh-payghambaron'
  },
  {
    id: '3',
    title: 'Аҳкоми намоз дар ислом',
    excerpt: 'Аҳкоми намоз, шартҳо, фарзҳо ва суннатҳои он дар ислом',
    content: 'Матни пурраи мақола дар бораи аҳкоми намоз...',
    category: 'Аҳком',
    author: 'Шайх Муҳаммад',
    readTime: '8 дақиқа',
    views: 15678,
    likes: 456,
    tags: ['намоз', 'аҳком', 'фарз', 'суннат'],
    publishDate: '2024-01-10',
    imageUrl: '/api/placeholder/400/250',
    slug: 'ahkom-namoz'
  },
  {
    id: '4',
    title: 'Дуоҳои Қуръонӣ ва аҳамияти онҳо',
    excerpt: 'Дуоҳои Қуръонӣ, аҳамияти онҳо ва тарзи хондани онҳо',
    content: 'Матни пурраи мақола дар бораи дуоҳои Қуръонӣ...',
    category: 'Дуоҳо',
    author: 'Устод Исмоил',
    readTime: '6 дақиқа',
    views: 11234,
    likes: 345,
    tags: ['дуо', 'қуръон', 'зикр', 'таввассул'],
    publishDate: '2024-01-08',
    imageUrl: '/api/placeholder/400/250',
    slug: 'dua-khoni-quran'
  },
  {
    id: '5',
    title: 'Ахлоқи исломӣ дар зиндагии рӯзона',
    excerpt: 'Ахлоқи исломӣ, адилӣ, меҳрубонӣ ва дигар хусусиятҳои хуб',
    content: 'Матни пурраи мақола дар бораи ахлоқи исломӣ...',
    category: 'Ахлоқ',
    author: 'Устод Ҳасан',
    readTime: '10 дақиқа',
    views: 9876,
    likes: 289,
    tags: ['ахлоқ', 'адилӣ', 'меҳрубонӣ', 'хусусият'],
    publishDate: '2024-01-05',
    imageUrl: '/api/placeholder/400/250',
    slug: 'akhlok-islami'
  },
  {
    id: '6',
    title: 'Тафсири сураҳои маъмули Қуръон',
    excerpt: 'Тафсири сураҳои маъмули Қуръон ва маънои онҳо',
    content: 'Матни пурраи мақола дар бораи тафсири сураҳо...',
    category: 'Тафсир',
    author: 'Доктор Абдур-Раҳмон',
    readTime: '15 дақиқа',
    views: 14567,
    likes: 678,
    tags: ['тафсир', 'сураҳо', 'қуръон', 'маъно'],
    publishDate: '2024-01-03',
    imageUrl: '/api/placeholder/400/250',
    slug: 'tafsir-surah-khoni'
  }
];

const categories = [
  'Ҳама', 'Фазоилатҳо', 'Таърих', 'Аҳком', 'Дуоҳо', 'Ахлоқ', 'Тафсир', 'Таълимӣ'
];

interface ArticlesProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Articles({ onOpenOverlay }: ArticlesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Ҳама');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredArticles, setFilteredArticles] = useState(sampleArticles);

  // Filter articles based on search and category
  const filterArticles = () => {
    let filtered = sampleArticles;

    if (selectedCategory !== 'Ҳама') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(term) ||
        article.excerpt.toLowerCase().includes(term) ||
        article.author.toLowerCase().includes(term) ||
        article.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredArticles(filtered);
  };

  // Apply filtering when dependencies change
  useState(() => {
    filterArticles();
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterArticles();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterArticles();
  };

  const handleReadArticle = (article: ArticleItem) => {
    // Navigate to article detail page
    console.log('Reading article:', article.title);
    // You can implement navigation here
  };

  const handleLike = (article: ArticleItem) => {
    // Implement like functionality
    console.log('Liking article:', article.title);
  };

  const handleShare = (article: ArticleItem) => {
    // Implement share functionality
    console.log('Sharing article:', article.title);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tg-TJ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Мақолаҳои исломӣ - Маълумотҳо, тафсир ва аҳком"
        description="Мақолаҳои исломӣ дар бораи Қуръон, аҳком, таърих ва ахлоқи исломӣ бо забони тоҷикӣ."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Мақолаҳои исломӣ",
          "description": "Мақолаҳои исломӣ ва маълумотҳо",
          "url": `${window.location.origin}/articles`
        }}
      />
      <Header onOpenOverlay={onOpenOverlay} />
      
      {/* Back to Home Button */}
      <BackToHome variant="creative" position="top-left" />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Мақолаҳои исломӣ
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Маълумотҳо, тафсир, аҳком ва ахлоқи исломӣ бо забони тоҷикӣ
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Ҷустуҷӯи мақолаҳо..."
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

          {/* Articles Grid/List */}
          {filteredArticles.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Article Image */}
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 relative">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    {/* Article Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(article.publishDate)}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Article Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatViews(article.views)} назар</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{article.likes}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => handleReadArticle(article)}
                        className="flex-1"
                        size="sm"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Хондан
                      </Button>
                      <Button 
                        onClick={() => handleLike(article)}
                        variant="outline" 
                        size="sm"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => handleShare(article)}
                        variant="outline" 
                        size="sm"
                      >
                        <Share2 className="h-4 w-4" />
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
                Ягон мақола ёфт нашуд
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