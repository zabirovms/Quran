import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { GlobalOverlayType } from '@/App';
import { 
  Search, 
  Download, 
  FileText, 
  BookOpen,
  File,
  Clock,
  Star,
  Filter,
  Grid3X3,
  List,
  Eye,
  ExternalLink
} from 'lucide-react';
import SeoHead from '@/components/shared/SeoHead';

interface DownloadItem {
  id: string;
  title: string;
  description: string;
  category: string;
  fileSize: string;
  format: string;
  language: string;
  downloads: number;
  rating: number;
  lastUpdated: string;
  downloadUrl: string;
  previewUrl?: string;
}

const sampleDownloads: DownloadItem[] = [
  {
    id: '1',
    title: 'Қуръони Карим - Тарҷумаи тоҷикӣ',
    description: 'Қуръони Карим бо тарҷумаи пурраи тоҷикӣ ва тафсири осонбаён',
    category: 'Қуръон',
    fileSize: '259 MB',
    format: 'PDF',
    language: 'Тоҷикӣ',
    downloads: 12456,
    rating: 4.8,
    lastUpdated: '2024-01-15',
    downloadUrl: '/test-quran.pdf',
    previewUrl: '/test-quran.pdf'
  },
  {
    id: '2',
    title: 'Қуръони Карим - Тарҷумаи русӣ',
    description: 'Қуръони Карим бо тарҷумаи русӣ ва тафсир',
    category: 'Қуръон',
    fileSize: '18.7 MB',
    format: 'PDF',
    language: 'Русӣ',
    downloads: 8923,
    rating: 4.6,
    lastUpdated: '2024-01-10',
    downloadUrl: '/downloads/quran-russian.pdf'
  },
  {
    id: '3',
    title: 'Дуоҳои Қуръонӣ - Маҷмӯа',
    description: 'Маҷмӯаи дуоҳои Қуръонӣ бо тарҷума ва тафсир',
    category: 'Дуоҳо',
    fileSize: '3.4 MB',
    format: 'PDF',
    language: 'Тоҷикӣ',
    downloads: 5678,
    rating: 4.7,
    lastUpdated: '2024-01-08',
    downloadUrl: '/downloads/duas-collection.pdf'
  },
  {
    id: '4',
    title: 'Фарзҳои исломӣ - Дастури амалӣ',
    description: 'Дастури амалии фарзҳои исломӣ бо тавзеҳот',
    category: 'Фарзҳо',
    fileSize: '8.9 MB',
    format: 'PDF',
    language: 'Тоҷикӣ',
    downloads: 3456,
    rating: 4.5,
    lastUpdated: '2024-01-05',
    downloadUrl: '/downloads/islamic-duties.pdf'
  },
  {
    id: '5',
    title: 'Қиссаҳои пайғамбарон - Ҷилди 1',
    description: 'Қиссаҳои зиндагии пайғамбарони исломӣ',
    category: 'Таърих',
    fileSize: '12.3 MB',
    format: 'PDF',
    language: 'Тоҷикӣ',
    downloads: 7890,
    rating: 4.9,
    lastUpdated: '2024-01-12',
    downloadUrl: '/downloads/prophets-stories-1.pdf'
  },
  {
    id: '6',
    title: 'Қуръони Карим - Аудио файлҳо',
    description: 'Аудио файлҳои тиловати Қуръон бо сураҳои маъмул',
    category: 'Аудио',
    fileSize: '45.6 MB',
    format: 'ZIP',
    language: 'Арабӣ',
    downloads: 12345,
    rating: 4.7,
    lastUpdated: '2024-01-14',
    downloadUrl: '/downloads/quran-audio.zip'
  }
];

const categories = [
  'Ҳама', 'Қуръон', 'Дуоҳо', 'Фарзҳо', 'Таърих', 'Аудио', 'Китобҳо'
];

const formats = ['Ҳама', 'PDF', 'DOCX', 'TXT', 'ZIP', 'EPUB'];

interface DownloadsProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Downloads({ onOpenOverlay }: DownloadsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Ҳама');
  const [selectedFormat, setSelectedFormat] = useState('Ҳама');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredDownloads, setFilteredDownloads] = useState(sampleDownloads);

  // Filter downloads based on search, category and format
  const filterDownloads = () => {
    let filtered = sampleDownloads;

    if (selectedCategory !== 'Ҳама') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedFormat !== 'Ҳама') {
      filtered = filtered.filter(item => item.format === selectedFormat);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.language.toLowerCase().includes(term)
      );
    }

    setFilteredDownloads(filtered);
  };

  // Apply filtering when dependencies change
  useState(() => {
    filterDownloads();
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterDownloads();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterDownloads();
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    filterDownloads();
  };

  const handleDownload = (item: DownloadItem) => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = `${window.location.origin}${item.downloadUrl}`;
    link.download = item.title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Downloading:', item.title);
  };

  const handlePreview = (item: DownloadItem) => {
    if (item.previewUrl) {
      // Simple approach - just open the PDF directly
      const pdfUrl = `${window.location.origin}${item.previewUrl}`;
      console.log('Opening PDF URL:', pdfUrl);
      window.open(pdfUrl, '_blank');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Боргирии Қуръон ва матнҳои исломӣ - PDF, аудио ва дигар форматҳо"
        description="Боргирии Қуръони Карим, дуоҳо, фарзҳои исломӣ ва матнҳои дигар бо форматҳои гуногун."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Боргирии матнҳои исломӣ",
          "description": "Боргирии Қуръон ва матнҳои исломӣ",
          "url": `${window.location.origin}/downloads`
        }}
      />
      <Header onOpenOverlay={onOpenOverlay} />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Download className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
              Боргирии матнҳо
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Қуръони Карим, дуоҳо, фарзҳои исломӣ ва матнҳои дигар бо имконияти намоиш ва боргирӣ
            </p>
            <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {filteredDownloads.length} файл
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Матнҳои исломӣ
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Ҷустуҷӯи матнҳо..."
                className="pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {/* Category and Format Filters */}
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
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Формат:</span>
                {formats.map((format) => (
                  <Badge
                    key={format}
                    variant={selectedFormat === format ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleFormatChange(format)}
                  >
                    {format}
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

          {/* Downloads Grid/List */}
          {filteredDownloads.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredDownloads.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.language}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                        {item.format}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* File Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Андозаи файл:</span>
                      <span className="font-medium">{item.fileSize}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Забон:</span>
                      <span className="font-medium">{item.language}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Боргирӣ:</span>
                      <span className="font-medium">{item.downloads.toLocaleString()}</span>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {renderStars(item.rating)}
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          ({item.rating})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.lastUpdated).toLocaleDateString('tg-TJ')}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {item.previewUrl && (
                        <Button 
                          onClick={() => handlePreview(item)}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Намоиш
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleDownload(item)}
                        className="flex-1"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Боргирӣ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Ягон файл ёфт нашуд
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Лутфан дар ҷустуҷӯ ё филтрҳо тағйир диҳед
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Ҳама');
                setSelectedFormat('Ҳама');
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