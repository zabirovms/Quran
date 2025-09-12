import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { GlobalOverlayType } from '@/App';
import { Download, Share2, X, BookOpen } from 'lucide-react';
import SeoHead from '@/components/shared/SeoHead';

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
    console.log('Downloading picture:', picture.title);
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = picture.imagePath;
    link.download = `${picture.title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    setSelectedPicture(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SeoHead
          title="Суратҳо - Қуръони Карим"
          description="Суратҳо ва иқтибосҳо аз Қуръони Карим"
        />
        <Header onOpenOverlay={onOpenOverlay} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Суратҳо бор карда мешаванд...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <SeoHead
          title="Суратҳо - Қуръони Карим"
          description="Суратҳо ва иқтибосҳо аз Қуръони Карим"
        />
        <Header onOpenOverlay={onOpenOverlay} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Хато дар бор кардани суратҳо</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Аз нав кӯшиш кардан
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Суратҳо - Қуръони Карим"
        description="Суратҳо ва иқтибосҳо аз Қуръони Карим"
      />
      <Header onOpenOverlay={onOpenOverlay} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">Суратҳо ва иқтибосҳо</h1>
          <p className="text-center text-muted-foreground">
            Суратҳо ва иқтибосҳои зебо аз Қуръони Карим
          </p>
        </div>

        {/* Pictures Grid/List */}
        {filteredPictures.length > 0 ? (
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
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Суратҳо ёфт нашуд</h3>
            <p className="text-muted-foreground">
              Дар айни замон суратҳо мавҷуд нестанд. Лутфан баъдтар кӯшиш кунед.
            </p>
          </div>
        )}

        {/* Picture Modal */}
        {selectedPicture && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedPicture.title}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLike(selectedPicture)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Дӯст доштан
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(selectedPicture)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Ҳамроҳ кардан
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(selectedPicture)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Боргирӣ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCloseModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <img
                  src={selectedPicture.imagePath}
                  alt={selectedPicture.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                  onError={(e) => {
                    console.error('Image failed to load in modal:', selectedPicture.imagePath);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}