import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
// Removed floating BackToHome in favor of inline control
import { Home } from 'lucide-react';
import { Link } from 'wouter';
import { GlobalOverlayType } from '@/App';
import { Download, Share2, X } from 'lucide-react';
import SeoHead from '@/components/shared/SeoHead';

interface PictureItem {
  id: string;
  title: string;
  imagePath: string;
}

const newImages: PictureItem[] = [
  { id: 'n1', title: 'Қуръон 2:286 (Сураи Бақара)', imagePath: '/QuraniQuotes/Қуръон 2^286 (Сураи Бақара).png' },
  { id: 'n2', title: 'Қуръон 24:35 (Сураи Нур)', imagePath: '/QuraniQuotes/Қуръон 24^35 (Сураи Нур).png' },
  { id: 'n3', title: 'Қуръон 29:69 (Сураи Анкабут)', imagePath: '/QuraniQuotes/Қуръон 29^69 (Сураи Анкабут).png' },
  { id: 'n4', title: 'Қуръон 53:32 (Сураи Наҷм)', imagePath: '/QuraniQuotes/Қуръон 53^32 (Сураи Наҷм).png' },
  { id: 'n5', title: 'Қуръон 55:13 (Сураи Раҳмон)', imagePath: '/QurаниQuotes/Қуръон 55^13 (Сураи Раҳмон).png' },
  { id: 'n6', title: 'Қуръон 9:51 (Сураи Тавба)', imagePath: '/QuraniQuotes/Қуръон 9^51 (Сураи Тавба).png' },
];

const quranicQuotes: PictureItem[] = [
  ...newImages,
  { id: '1', title: 'Қуръон 73:2 (Сураи Муззаммил)', imagePath: '/QuraniQuotes/Қуръон 73^2 (Сураи Муззаммил).jpg' },
  { id: '2', title: 'Қуръон 20:55 (Сураи Тоҳо)', imagePath: '/QuraniQuotes/Қуръон 20^55 (Сураи Тоҳо).jpg' },
  { id: '3', title: 'Фазилати Шаби Қадр', imagePath: '/QuraniQuotes/Фазилати Шаби Қадр.jpg' },
  { id: '4', title: 'Қуръон 17:24 (Сураи Исро)', imagePath: '/QuraniQuotes/Қуръон 17^24 (Сураи Исро).jpg' },
  { id: '5', title: 'Дуоҳои Шаби Қадр', imagePath: '/QuraniQuotes/Дуоҳои Шаби Қадр.jpg' },
  { id: '6', title: 'Қуръон 26:32 (Сураи Шуаро)', imagePath: '/QuraniQuotes/Қуръон 26^32 (Сураи Шуаро).jpg' },
  { id: '7', title: 'Такбири Иди Қурбон (Такбироти Ташриқ)', imagePath: '/QuraniQuotes/Такбири Иди Қурбон (Такбироти Ташриқ).jpg' }
];


interface PicturesProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Pictures({ onOpenOverlay }: PicturesProps) {
  const [filteredPictures, setFilteredPictures] = useState(quranicQuotes);
  const [selectedPicture, setSelectedPicture] = useState<PictureItem | null>(null);

  // Filter pictures based on search, category and source
  const filterPictures = () => setFilteredPictures(quranicQuotes);

  // Apply filtering when dependencies change
  useState(() => {
    filterPictures();
  });

  const handleSearch = (_e: React.ChangeEvent<HTMLInputElement>) => {};

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

          {/* Fullscreen Lightbox */}
          {selectedPicture && (
            <div className="fixed inset-0 z-50 bg-black/90">
              {/* Top controls */}
              <div className="absolute top-4 left-0 right-0 mx-auto max-w-7xl px-4 flex items-center justify-between">
                <div className="text-white text-sm opacity-80 truncate max-w-[60%]">
                  {selectedPicture.title}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    onClick={() => handleShare(selectedPicture)}>
                    <Share2 className="h-4 w-4 mr-2" />Мубодила
                  </Button>
                  <Button variant="default" size="sm" className="bg-white text-black hover:bg-white/90"
                    onClick={() => handleDownload(selectedPicture)}>
                    <Download className="h-4 w-4 mr-2" />Боргирӣ
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    onClick={() => setSelectedPicture(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Centered image */}
              <div className="h-full w-full flex items-center justify-center p-6">
                <img src={selectedPicture.imagePath} alt={selectedPicture.title} className="max-h-full max-w-full object-contain rounded-md shadow-2xl" />
              </div>
            </div>
          )}

          {/* Minimalist: no search/filters; pure grid with names only */}

          {/* Pictures Grid/List */}
          {filteredPictures.length > 0 ? (
            <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
              {filteredPictures.map((picture) => (
                <Card key={picture.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePictureSelect(picture)}>
                  <div className="bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                    <img src={picture.imagePath} alt={picture.title} className="w-full h-auto" />
                  </div>
                  <div className="p-3 text-center text-sm font-medium">
                    {picture.title}
                  </div>
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