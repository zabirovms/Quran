import { Helmet } from 'react-helmet';
import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  imageUrl?: string;
  type?: 'website' | 'article';
  structuredData?: object;
  keywords?: string[];
  author?: string;
}

export default function SeoHead({
  title,
  description,
  canonicalUrl,
  imageUrl,
  type = 'website',
  structuredData,
  keywords = [],
  author = 'Қуръон Тоҷикӣ'
}: SeoHeadProps) {
  const siteName = 'Қуръони Карим';
  const fullUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const fullTitle = `${title} | ${siteName}`;
  const image = imageUrl || '/logo.png';
  const defaultKeywords = ['қуръон', 'қуръони карим', 'тоҷикӣ', 'тарҷума', 'тафсир', 'тиловат', 'транслитератсия', 'забони тоҷикӣ', 'исломӣ'];
  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  useEffect(() => {
    if (!structuredData) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [structuredData]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="tg_TJ" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0c4532" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      
      <meta httpEquiv="Content-Language" content="tg" />
      <meta name="geo.region" content="TJ" />
    </Helmet>
  );
}