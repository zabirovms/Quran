import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { GlobalOverlayType } from '@/App';
import { Download, Share2, X, BookOpen } from 'lucide-react';
import SeoHead from '@/components/shared/SeoHead';
import { useEffect } from 'react';

interface PictureItem {
  id: string;
  title: string;
  imagePath: string;
}

// Will load dynamically from Google Cloud Storage (bucket: quran-tajik, prefix: pictures/)
const INITIAL_PICTURES: PictureItem[] = [];


interface PicturesProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Pictures({ onOpenOverlay }: PicturesProps) {
  const [filteredPictures, setFilteredPictures] = useState(INITIAL_PICTURES);
  const [selectedPicture, setSelectedPicture] = useState<PictureItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Build a public URL for a given object name in the bucket.
  const buildPublicUrl = (objectName: string) => {
    const base = 'https://storage.googleapis.com/quran-tajik/';
    // encodeURI preserves slashes but encodes spaces/unicode correctly
    return encodeURI(base + objectName);
  };

  // Fetch all pages of objects from GCS with the given prefix
  useEffect(() => {
    let isCancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const accumulated: any[] = [];
        let pageToken: string | undefined = undefined;
        const endpointBase = 'https://storage.googleapis.com/storage/v1/b/quran-tajik/o';

        do {
          const url = new URL(endpointBase);
          url.searchParams.set('prefix', 'pictures/');
          url.searchParams.set('fields', 'items(name,metadata),nextPageToken');
          if (pageToken) url.searchParams.set('pageToken', pageToken);

          const resp = await fetch(url.toString());
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json();
          const items = Array.isArray(data.items) ? data.items : [];
          accumulated.push(...items);
          pageToken = data.nextPageToken;
        } while (pageToken);

        // Filter out directory placeholders, map to PictureItem
        const pictures: PictureItem[] = accumulated
          .filter((obj) => typeof obj.name === 'string' && /\.(png|jpe?g|webp|gif)$/i.test(obj.name))
          .map((obj) => {
            const name: string = obj.name;
            const fileName = name.split('/').pop() || name;
            const title = fileName.replace(/\.[^.]+$/, '');
            return {
              id: name,
              title,
              imagePath: buildPublicUrl(name),
            } as PictureItem;
          });

        if (!isCancelled) {
          // Optional: sort newest-first by name if names contain dates; otherwise alphabetical
          pictures.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));
          setFilteredPictures(pictures);
        }
      } catch (err: any) {
        if (!isCancelled) setError(err?.message || 'Failed to load images');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      isCancelled = true;
    };
  }, []);

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

  // no counters in minimalist view

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
          {loading ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Боргирии суратҳо...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 dark:text-red-400">Хатогӣ: {error}</p>
            </div>
          ) : filteredPictures.length > 0 ? (
            <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
              {filteredPictures.map((picture) => (
                <Card key={picture.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePictureSelect(picture)}>
                  <div className="bg-gray-200 dark:bg-gray-800 relative overflow-hidden aspect-square">
                    <img 
                      src={picture.imagePath} 
                      alt={picture.title} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        console.error('Image failed to load:', picture.imagePath);
                        e.currentTarget.style.display = 'none';
                        // Show placeholder
                        const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder');
                        if (placeholder) {
                          (placeholder as HTMLElement).style.display = 'flex';
                        }
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', picture.imagePath);
                      }}
                    />
                    <div className="placeholder absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" style={{display: 'none'}}>
                      <div className="text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Сурат боргирӣ нашудааст</p>
                      </div>
                    </div>
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
                // Re-trigger fetch by clearing and letting useEffect run again is not straightforward.
                // Instead, simply attempt to reload the page data.
                window.location.reload();
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
