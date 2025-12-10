import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';
import { storage } from './storage';

// SEO data for different page types
const pageSeoData = {
  home: {
    title: 'Қуръони Карим - Куръон бо тарҷумаи тоҷикӣ ва тафсири осонбаён',
    description: 'Хондани Қуръони Карим бо тарҷумаи тоҷикӣ, тафсири осонбаён ва тиловат. Ҳамаи 114 сура бо тарҷумаи калима ба калима, тафсир ва талаффузи осон.',
    keywords: 'Қуръон, қуръони карим, куръони карим, тарачумаи куръони карим, тафсир, куръони карим точики, quran in tajik, забони тоҷикӣ, коран, точики, тарҷумаи тоҷикӣ, тафсир, тиловат'
  },
  'learn-words': {
    title: 'Омӯхтани калимаҳои Қуръон - 100 калимаи асосӣ | Қуръони Карим',
    description: 'Омӯхтани калимаҳои Қуръон бо тарҷумаи тоҷикӣ. 100 калимаи асосӣ, талаффуз, маъно ва истифодаи онҳо дар Қуръони Карим.',
    keywords: 'Қуръон, калимаҳои Қуръон, омӯхтани калима, талаффуз, маъно, забони тоҷикӣ, қуръони карим, точики'
  },
  duas: {
    title: 'Дуъоҳои Қуръонӣ - Дуъоҳо аз Қуръони Карим | Қуръони Карим',
    description: 'Дуъоҳои Қуръонӣ бо тарҷумаи тоҷикӣ ва тафсири осонбаён. Дуъоҳои марбут ба ҳар як оят ва сураи Қуръон.',
    keywords: 'дуъо, дуъоҳои Қуръонӣ, дуъо аз Қуръон, Қуръон, тарҷумаи тоҷикӣ, точики, қуръони карим'
  },
  tasbeeh: {
    title: 'Тақвими Тасбеҳ - Ҳисобкунии зикр | Қуръони Карим',
    description: 'Тақвими тасбеҳ барои ҳисобкунии зикр ва тасбеҳ. Асбоби осон барои зикри Қуръонӣ ва дуъоҳо.',
    keywords: 'тасбеҳ, тақвим, зикр, ҳисобкунӣ, Қуръон, точики, қуръони карим'
  },
  downloads: {
    title: 'Боргирӣ - Қуръон, PDF, аудио файлҳо | Қуръони Карим',
    description: 'Боргирии Қуръони Карим, PDF файлҳо, аудио тиловат ва дигар манбаъҳои исломӣ бо тарҷумаи тоҷикӣ.',
    keywords: 'боргирӣ, PDF, аудио, тиловат, Қуръон, қуръони карим, точики, файлҳо'
  },
  articles: {
    title: 'Мақолаҳо - Тафсир, илм ва ислом | Қуръони Карим',
    description: 'Мақолаҳои тафсирии Қуръон, илми исломӣ ва маълумоти муфид оид ба Қуръони Карим бо забони тоҷикӣ.',
    keywords: 'мақолаҳо, тафсир, илми исломӣ, Қуръон, қуръони карим, точики, маълумот'
  },
  videos: {
    title: 'Видеоҳо - Тафсир, тиловат ва дарсҳо | Қуръони Карим',
    description: 'Видеоҳои тафсирии Қуръон, тиловат, дарсҳои исломӣ ва маълумоти муфид бо забони тоҷикӣ.',
    keywords: 'видеоҳо, тафсир, тиловат, дарсҳо, Қуръон, қуръони карим, точики'
  },
  pictures: {
    title: 'Аксҳо - Суратҳои Қуръонӣ ва исломӣ | Қуръони Карим',
    description: 'Аксҳо ва суратҳои Қуръонӣ, калимаҳои муқаддас ва дизайнҳои исломӣ барои истифодаи шахсӣ.',
    keywords: 'аксҳо, суратҳо, Қуръонӣ, исломӣ, дизайн, қуръони карим, точики'
  },
  projects: {
    title: 'Лоиҳаҳо - Барномаҳои исломӣ | Қуръони Карим',
    description: 'Лоиҳаҳои исломӣ, барномаҳои Қуръонӣ ва дигар манбаъҳои муфид барои омӯхтани ислом.',
    keywords: 'лоиҳаҳо, барномаҳо, исломӣ, Қуръонӣ, манбаъҳо, қуръони карим, точики'
  },
  mosques: {
    title: 'Масҷидҳо - Масҷидҳои Тоҷикистон | Қуръони Карим',
    description: 'Рӯйхати масҷидҳои Тоҷикистон, маълумоти ҷойгиршавӣ ва таърихчаи онҳо.',
    keywords: 'масҷидҳо, Тоҷикистон, ҷойгиршавӣ, таърих, ислом, точики'
  },
  'farzi-ayn': {
    title: 'Фарзи Айни тоҷикӣ | Қуръони Карим',
    description: 'Фарзи айни точики. Сураҳои кутоҳ, дуо, дуоҳои тоҷикӣ, тарзи намоз хондан',
    keywords: 'фарзи айн, дуо, ислом, вазифаҳо, масъулиятҳо, точики, қуръони карим'
  },
  'privacy-policy': {
    title: 'Сиёсати Махфият - Қуръон бо Тафсири Осонбаён',
    description: 'Сиёсати махфияти барномаи Қуръон бо Тафсири Осонбаён. Маълумоти пурра оид ба ҷамъоварӣ, истифода ва нигоҳдории маълумоти шумо.',
    keywords: 'сиёсати махфият, махфият, Қуръон, қуръони карим, маълумоти шахсӣ, точики, privacy policy'
  }
};

async function injectPageMetaTags(template: string, url: string): Promise<string> {
  try {
    let seoData;
    let canonicalUrl = `https://www.quran.tj${url}`;
    
    // Handle Surah pages
    if (url.startsWith('/surah/')) {
      const surahNumber = url.match(/\/surah\/(\d+)/)?.[1];
      if (surahNumber) {
        const surah = await storage.getSurahByNumber(parseInt(surahNumber));
        if (surah) {
          seoData = {
            title: `Сураи ${surah.name_tajik} | Қуръони Карим`,
            description: `Хондани Сураи ${surah.name_tajik} бо тарҷумаи тоҷикӣ. Ин сура аз ${surah.verses_count} оят иборат буда дар ${surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'} нозил шудааст. Тарҷума, тафсири осонбаён, тиловат ва тарҷумаи ҳар як калимаҳои онро метавонед дар инҷо дастрас кунед.`,
            keywords: `Қуръон, қуръони карим, куръони карим, тарачумаи куръони карим, тафсир, куръони карим точики, quran in tajik, забони тоҷикӣ, коран, точики, ${surah.name_tajik}, ${surah.name_arabic}, Сураи ${surah.number}, тарҷумаи тоҷикӣ, тафсир`
          };
        }
      }
    } else {
      // Handle other pages
      const pageKey = url.slice(1) || 'home'; // Remove leading slash, default to home
      seoData = pageSeoData[pageKey as keyof typeof pageSeoData];
    }
    
    if (!seoData) return template;

    const siteName = 'Қуръони Карим';
    const imageUrl = 'https://www.quran.tj/favicon.ico';

    // Replace title
    template = template.replace(
      /<title>.*?<\/title>/,
      `<title>${seoData.title}</title>`
    );

    // Replace meta description
    template = template.replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${seoData.description}" />`
    );

    // Replace keywords
    template = template.replace(
      /<meta name="keywords" content=".*?" \/>/,
      `<meta name="keywords" content="${seoData.keywords}" />`
    );

    // Add canonical URL
    template = template.replace(
      /<meta name="theme-color" content="#0c4532" \/>/,
      `<meta name="theme-color" content="#0c4532" />
      <link rel="canonical" href="${canonicalUrl}" />`
    );

    // Update Open Graph tags
    template = template.replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${seoData.title}" />`
    );

    template = template.replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${seoData.description}" />`
    );

    template = template.replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="${canonicalUrl}" />`
    );

    // Set appropriate og:type based on page
    const ogType = url.startsWith('/surah/') ? 'article' : 'website';
    template = template.replace(
      /<meta property="og:type" content=".*?" \/>/,
      `<meta property="og:type" content="${ogType}" />`
    );

    template = template.replace(
      /<meta property="og:site_name" content=".*?" \/>/,
      `<meta property="og:site_name" content="${siteName}" />`
    );

    template = template.replace(
      /<meta property="og:image" content=".*?" \/>/,
      `<meta property="og:image" content="${imageUrl}" />`
    );

    // Update Twitter meta tags
    template = template.replace(
      /<meta name="twitter:title" content=".*?" \/>/,
      `<meta name="twitter:title" content="${seoData.title}" />`
    );

    template = template.replace(
      /<meta name="twitter:description" content=".*?" \/>/,
      `<meta name="twitter:description" content="${seoData.description}" />`
    );

    template = template.replace(
      /<meta name="twitter:image" content=".*?" \/>/,
      `<meta name="twitter:image" content="${imageUrl}" />`
    );

    // Add structured data for better SEO
    let structuredData;
    if (url.startsWith('/surah/')) {
      // Surah-specific structured data
      const surahNumber = url.match(/\/surah\/(\d+)/)?.[1];
      if (surahNumber) {
        const surah = await storage.getSurahByNumber(parseInt(surahNumber));
        if (surah) {
          structuredData = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `Сураи ${surah.name_tajik} - Қуръони Карим бо тарҷумаи тоҷикӣ`,
            "name": surah.name_tajik,
            "alternativeHeadline": surah.name_arabic,
            "author": {
              "@type": "Organization",
              "name": "Қуръони Тоҷикӣ"
            },
            "inLanguage": "tg",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Қуръони Тоҷикӣ",
              "url": "https://www.quran.tj"
            },
            "datePublished": new Date().toISOString(),
            "description": seoData.description
          };
        }
      }
    } else {
      // General page structured data
      structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": seoData.title,
        "description": seoData.description,
        "url": canonicalUrl,
        "inLanguage": "tg",
        "isPartOf": {
          "@type": "WebSite",
          "name": "Қуръони Тоҷикӣ",
          "url": "https://www.quran.tj"
        },
        "datePublished": new Date().toISOString()
      };
    }

    // Add structured data before closing head tag
    if (structuredData) {
      template = template.replace(
        /<\/head>/,
        `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>
        </head>`
      );
    }

    return template;
  } catch (error) {
    console.error('Error injecting meta tags:', error);
    return template;
  }
}

const viteLogger = createLogger();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server }
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      // Inject SEO meta tags for all pages
      template = await injectPageMetaTags(template, url);

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, serve from the dist directory
  const distPath = path.resolve(__dirname, "..", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files from the dist directory
  app.use(express.static(distPath, {
    index: false, // Don't serve index.html for directory requests
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set proper headers for PDF files
      if (path.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'public, max-age=2592000'); // 1 month
      }
    }
  }));

  // Serve index.html for all other routes with meta tag injection
  app.get('*', async (req, res) => {
    const url = req.originalUrl;
    const indexPath = path.resolve(distPath, 'index.html');
    
    try {
      // Read the index.html file
      const data = await fs.promises.readFile(indexPath, 'utf8');
      let template = data;

      // Inject SEO meta tags for all pages
      template = await injectPageMetaTags(template, url);

      res.send(template);
    } catch (err) {
      res.status(500).send('Error reading index.html');
    }
  });
}
