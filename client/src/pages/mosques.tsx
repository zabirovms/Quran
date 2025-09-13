import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
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
  const searchControlRef = useRef<any>(null);
  const mosqueLayerRef = useRef<any>(null);
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

        // Collection for our placemarks
        mosqueLayer = new ymaps.GeoObjectCollection({}, {
          preset: 'islands#blueIcon',
          hasBalloon: true,
        });
        map.geoObjects.add(mosqueLayer);
        mosqueLayerRef.current = mosqueLayer;

        // Use Yandex SearchControl so results include organizations
        const searchControl = new ymaps.control.SearchControl({
          options: {
            provider: 'yandex#search',
            noPlacemark: true,
            useMapBounds: true,
            noPopup: true,
            noCentering: true,
          }
        });
        map.controls.add(searchControl);
        searchControlRef.current = searchControl;

        // Initial search for mosques in the current viewport (with fallbacks)
        runSearch(ymaps, map, mosqueLayer, searchControl, ['масҷид', 'мечеть', 'mosque', 'masjid']);
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

  // This useEffect is no longer needed as the map container is always in the DOM
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (mapInstance && mapContainerRef.current) {
  //       mapInstance.container.fitToViewport();
  //     }
  //   }, 100);
  //   return () => clearTimeout(timer);
  // }, [mapInstance]);

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
    if (!mapInstance || !window.ymaps || !searchControlRef.current) return;
    const ymaps = window.ymaps;
    const query = (searchQuery || '').trim();

    const coordMatch = query.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        mapInstance.setCenter([lat, lon], 15, { duration: 300 });
      }
    }

    const searchControl = searchControlRef.current;
    runSearch(ymaps, mapInstance, mosqueLayerRef.current, searchControl, [query || 'масҷид', 'мечеть', 'mosque', 'masjid']);
  };

  const searchCurrentArea = () => {
    if (!mapInstance || !window.ymaps || !searchControlRef.current) return;
    const ymaps = window.ymaps;
    const searchControl = searchControlRef.current;
    const query = (searchQuery || 'масҷид').trim();
    runSearch(ymaps, mapInstance, mosqueLayerRef.current, searchControl, [query, 'мечеть', 'mosque', 'masjid']);
  };

  return (
    <div className="mx-auto px-2 md:px-4 py-2 md:py-6">
      {/* Mobile sticky top bar */}
      <div className="md:hidden sticky top-0 z-20 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-2 py-2">
          <Link href="/">
            <Button variant="ghost" size="sm">Асосӣ</Button>
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4" /> Масҷидҳо
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 p-2 pb-3">
          <Input
            placeholder="Ҷустуҷӯ: масҷид, мечеть, mosque ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" className="shrink-0">Ҷустуҷӯ</Button>
        </form>
        {error && (
          <div className="px-3 pb-3 text-sm text-red-600">{error}</div>
        )}
      </div>

      <div className="md:grid md:grid-cols-12 gap-4 md:h-[calc(100vh-7rem)]">
        {/* Left side: Search bar and info for desktop */}
        <div className="hidden md:block md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Суроғаи масҷидҳо
              </CardTitle>
              <CardDescription>Ҷустуҷӯ ва тамошои масҷидҳо дар наздикии шумо</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Ҷустуҷӯ: масҷид, мечеть, mosque ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" className="shrink-0">Ҷустуҷӯ</Button>
              </form>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={locateMe} title="Ҷойгиршавии ман">
                  <Target className="h-4 w-4 mr-2" /> Ҷойгиршавии ман
                </Button>
                <Button type="button" variant="secondary" onClick={searchCurrentArea}>
                  Ҷустуҷӯ дар ин минтақа
                </Button>
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <div className="text-xs text-muted-foreground">
                Маслиҳат: Барои натиҷаи бештар калимаҳои дигарро низ санҷед — "мечеть", "mosque", "masjid".
              </div>
              <div>
                <Link href="/">
                  <Button variant="ghost" size="sm">Ба саҳифаи асосӣ</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side: Map container. This is a single element now. */}
        <div className="md:col-span-8 relative">
          <div
            ref={mapContainerRef}
            className="w-full rounded-md border h-[calc(100vh-11rem)] md:h-full md:min-h-[60vh]"
            role="region"
            aria-label="Yandex Map"
          />
          {loadingMap && (
            <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
              Боркунии харита...
            </div>
          )}
        </div>
      </div>

      {/* Floating mobile controls */}
      <div className="md:hidden fixed right-3 bottom-24 z-20 flex flex-col gap-2">
        <Button type="button" size="icon" onClick={locateMe} title="Ҷойгиршавии ман" className="shadow-lg">
          <Target className="h-5 w-5" />
        </Button>
        <Button type="button" variant="secondary" onClick={searchCurrentArea} className="shadow-lg">
          Ҷустуҷӯ дар ин минтақа
        </Button>
      </div>
    </div>
  );
}

async function runSearch(
  ymaps: any,
  map: any,
  collection: any | null,
  searchControl: any,
  queries: string[]
) {
  const bounds = map.getBounds();
  if (!bounds) return;

  const targetCollection = collection || new ymaps.GeoObjectCollection({}, { preset: 'islands#blueIcon' });
  if (collection) {
    targetCollection.removeAll();
  }

  searchControl.options.set('boundedBy', bounds);
  searchControl.options.set('strictBounds', true);
  searchControl.options.set('useMapBounds', true);

  const seen = new Set<string>();

  for (const q of queries) {
    const query = (q || '').trim();
    if (!query) continue;
    try {
      await searchControl.search(query);
      const results = searchControl.getResultsArray();
      for (const obj of results) {
        const coords = obj.geometry.getCoordinates();
        const name = obj.properties.get('name');
        const description = obj.properties.get('description') || '';
        const address = obj.getAddressLine?.() || obj.properties.get('metaDataProperty.GeocoderMetaData.text');
        const key = `${name}|${coords[0].toFixed(6)},${coords[1].toFixed(6)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const placemark = new ymaps.Placemark(coords, {
          balloonContentHeader: name,
          balloonContentBody: address || description,
          hintContent: name,
        }, {
          preset: 'islands#blueIcon',
          openBalloonOnClick: true,
        });
        targetCollection.add(placemark);
      }
    } catch (err) {
    }
  }

  if (!collection) {
    map.geoObjects.add(targetCollection);
  }
}
