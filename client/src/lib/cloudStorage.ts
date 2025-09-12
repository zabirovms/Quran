/**
 * Utility functions for Google Cloud Storage integration
 */

export interface CloudImage {
  id: string;
  title: string;
  imagePath: string;
}

/**
 * Build a public URL for a given object name in the Google Cloud Storage bucket
 */
export const buildPublicUrl = (objectName: string): string => {
  const base = 'https://storage.googleapis.com/quran-tajik/';
  return encodeURI(base + objectName);
};

/**
 * Fetch images from Google Cloud Storage with a specific prefix
 */
export const fetchCloudImages = async (prefix: string = 'pictures/', limit: number = 4): Promise<CloudImage[]> => {
  try {
    const accumulated: any[] = [];
    let pageToken: string | undefined = undefined;
    const endpointBase = 'https://storage.googleapis.com/storage/v1/b/quran-tajik/o';

    do {
      const url = new URL(endpointBase);
      url.searchParams.set('prefix', prefix);
      url.searchParams.set('fields', 'items(name,metadata),nextPageToken');
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const resp = await fetch(url.toString());
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const items = Array.isArray(data.items) ? data.items : [];
      accumulated.push(...items);
      pageToken = data.nextPageToken;
    } while (pageToken && accumulated.length < limit * 2); // Fetch a bit more to ensure we have enough after filtering

    // Filter out directory placeholders, map to CloudImage
    const images: CloudImage[] = accumulated
      .filter((obj) => typeof obj.name === 'string' && /\.(png|jpe?g|webp|gif)$/i.test(obj.name))
      .slice(0, limit) // Limit to requested number
      .map((obj) => {
        const name: string = obj.name;
        const fileName = name.split('/').pop() || name;
        const title = fileName.replace(/\.[^.]+$/, '');
        return {
          id: name,
          title,
          imagePath: buildPublicUrl(name),
        };
      });

    return images;
  } catch (error) {
    console.error('Error fetching cloud images:', error);
    return [];
  }
};

/**
 * Get featured Quranic quote images for the home page
 */
export const getFeaturedImages = async (): Promise<CloudImage[]> => {
  return fetchCloudImages('pictures/', 4);
};
