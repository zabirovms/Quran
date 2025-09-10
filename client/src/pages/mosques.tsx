import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import SeoHead from '@/components/shared/SeoHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Target } from 'lucide-react';
import { Link } from 'wouter';

// Yandex Maps API key provided by user
const YANDEX_API_KEY = 'e1230ef1-e50f-4148-9b78-a88993bba4c6';

declare global {
  interface Window {
    ymaps?: any;
  }
}

function loadYandexMaps(apiKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.ymaps && window.ymaps.ready) {
      window.ymaps.ready(() => resolve(window.ymaps));
      return;
    }
    const existing = document.getElementById('yandex-maps-sdk');
    if (existing) {
      (window as any).ymaps?.ready(() => resolve((window as any).ymaps));
      return;
    }
    const script = document.createElement('script');
    script.id = 'yandex-maps-sdk';
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      window.ymaps?.ready(() => resolve(window.ymaps));
    };
    script.onerror = () => reject(new Error('Failed to load Yandex Maps'));
    document.head.appendChild(script);
  });
}

interface MosqueMarker {
  id: string;
  name: string;
  address?: string;
  coords: [number, number];
}

export default function MosquesPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingMap, setLoadingMap] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Basic initial center (Dushanbe, Tajikistan)
  const initialCenter: [number, number] = [38.559772, 68.787038];

  useEffect(() => {
    let map: any;
    let mosqueLayer: any;

    loadYandexMaps(YANDEX_API_KEY)
      .then((ymaps) => {
        if (!mapContainerRef.current) return;
        map = new ymaps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 12,
          controls: ['zoomControl', 'geolocationControl', 'typeSelector', 'fullscreenControl'],
        });
        setMapInstance(map);

        // Add a search layer for "масҷид" points using Yandex search API
        // We use ymaps.suggest and ymaps.geocode as simple helpers.
        // For nearby search, we can use ymaps.geocode with a query and bounded area.
        mosqueLayer = new ymaps.GeoObjectCollection({}, {
          preset: 'islands#blueIcon',
          hasBalloon: true,
        });
        map.geoObjects.add(mosqueLayer);

        // Initial search for mosques in the current viewport
        searchMosques(ymaps, map, mosqueLayer, 'масҷид');

        // Update results when map area changes (throttled)
        let throttle: number | null = null;
        map.events.add('boundschange', () => {
          if (throttle) return;
          throttle = window.setTimeout(() => {
            throttle = null;
            searchMosques(ymaps, map, mosqueLayer, searchQuery || 'масҷид');
          }, 800);
        });
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoadingMap(false));

    return () => {
      try {
        if (map) {
          map.destroy();
        }
      } catch (_) {}
    };
  }, []);

  const locateMe = () => {
    if (!mapInstance) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstance.setCenter([latitude, longitude], 14, { duration: 300 });
      },
      () => {
        setError('Имконият нашуд ҷойгиршавии шуморо муайян намоем.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mapInstance || !window.ymaps) return;
    const ymaps = window.ymaps;
    const query = searchQuery.trim() || 'масҷид';
    searchMosques(ymaps, mapInstance, null, query);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <SeoHead 
        title="Суроғаи масҷидҳо"
        description="Ёфтани масҷидҳои наздиктарин дар харитаи Yandex"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'name': 'Суроғаи масҷидҳо',
          'description': 'Ёфтани масҷидҳои наздиктарин дар харитаи Yandex',
        }}
      />

      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm">Ба саҳифаи асосӣ</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Суроғаи масҷидҳо
          </CardTitle>
          <CardDescription>Ҷустуҷӯ ва тамошои масҷидҳо дар наздикии шумо</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              placeholder="Ҷустуҷӯ: масҷид, masjid, mosque ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">Ҷустуҷӯ</Button>
            <Button type="button" variant="outline" onClick={locateMe} title="Ҷойгиршавии ман">
              <Target className="h-4 w-4" />
            </Button>
          </form>

          {error && (
            <div className="text-sm text-red-600 mb-2">{error}</div>
          )}

          <div
            ref={mapContainerRef}
            className="w-full h-[70vh] rounded-md border"
            role="region"
            aria-label="Yandex Map"
          />
          {loadingMap && (
            <div className="mt-3 text-sm text-muted-foreground">Боркунии харита...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function searchMosques(ymaps: any, map: any, collection: any | null, query: string) {
  const currentBounds = map.getBounds();
  if (!currentBounds) return;
  const [southWest, northEast] = currentBounds;

  // Clear existing markers if collection is provided
  if (collection) {
    collection.removeAll();
  }

  ymaps.geocode(query, {
    results: 50,
    boundedBy: currentBounds,
    strictBounds: true,
  }).then((res: any) => {
    const geoObjects = res.geoObjects;
    const count = geoObjects.getLength();
    const newCollection = collection || new ymaps.GeoObjectCollection({}, { preset: 'islands#blueIcon' });
    for (let i = 0; i < count; i++) {
      const obj = geoObjects.get(i);
      const coords = obj.geometry.getCoordinates();
      const name = obj.properties.get('name');
      const description = obj.properties.get('description') || '';
      const address = obj.getAddressLine?.() || obj.properties.get('metaDataProperty.GeocoderMetaData.text');
      const placemark = new ymaps.Placemark(coords, {
        balloonContentHeader: name,
        balloonContentBody: address || description,
        hintContent: name,
      }, {
        preset: 'islands#blueIcon',
        openBalloonOnClick: true,
      });
      newCollection.add(placemark);
    }
    if (!collection) {
      // If we had no collection, add it once
      map.geoObjects.add(newCollection);
    }
  });
}

