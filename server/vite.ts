import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';
import { storage } from './storage';

async function injectSurahMetaTags(template: string, surahNumber: number): Promise<string> {
  try {
    const surah = await storage.getSurahByNumber(surahNumber);
    if (!surah) return template;

    const title = `Сураи ${surah.name_tajik} | Қуръони Карим`;
    const description = `Хондани Сураи ${surah.name_tajik} бо тарҷумаи тоҷикӣ. Ин сура аз ${surah.verses_count} оят иборат буда дар ${surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'} нозил шудааст. Тарҷума, тафсири осонбаён, тиловат ва тарҷумаи ҳар як калимаҳои онро метавонед дар инҷо дастрас кунед.`;
    const canonicalUrl = `https://www.quran.tj/surah/${surahNumber}`;
    const siteName = 'Қуръони Карим';
    const imageUrl = 'https://www.quran.tj/favicon.ico';
    const keywords = `Қуръон, қуръони карим, куръони карим, тарачумаи куръони карим, тафсир, куръони карим точики, quran in tajik, забони тоҷикӣ, коран, точики, ${surah.name_tajik}, ${surah.name_arabic}, Сураи ${surah.number}, тарҷумаи тоҷикӣ, тафсир`;

    // Replace title
    template = template.replace(
      /<title>.*?<\/title>/,
      `<title>${title}</title>`
    );

    // Replace meta description
    template = template.replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${description}" />`
    );

    // Replace keywords
    template = template.replace(
      /<meta name="keywords" content=".*?" \/>/,
      `<meta name="keywords" content="${keywords}" />`
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
      `<meta property="og:title" content="${title}" />`
    );

    template = template.replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${description}" />`
    );

    template = template.replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="${canonicalUrl}" />`
    );

    template = template.replace(
      /<meta property="og:type" content=".*?" \/>/,
      `<meta property="og:type" content="article" />`
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
      `<meta name="twitter:title" content="${title}" />`
    );

    template = template.replace(
      /<meta name="twitter:description" content=".*?" \/>/,
      `<meta name="twitter:description" content="${description}" />`
    );

    template = template.replace(
      /<meta name="twitter:image" content=".*?" \/>/,
      `<meta name="twitter:image" content="${imageUrl}" />`
    );

    // Add structured data for better SEO
    const structuredData = {
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
      "description": description
    };

    // Add structured data before closing head tag
    template = template.replace(
      /<\/head>/,
      `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>
      </head>`
    );

    return template;
  } catch (error) {
    console.error('Error fetching surah data for meta tags:', error);
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

      // Inject SEO meta tags for Surah pages
      if (url.startsWith('/surah/')) {
        const surahNumber = url.match(/\/surah\/(\d+)/)?.[1];
        if (surahNumber) {
          template = await injectSurahMetaTags(template, parseInt(surahNumber));
        }
      }

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

      // Inject SEO meta tags for Surah pages
      if (url.startsWith('/surah/')) {
        const surahNumber = url.match(/\/surah\/(\d+)/)?.[1];
        if (surahNumber) {
          template = await injectSurahMetaTags(template, parseInt(surahNumber));
        }
      }

      res.send(template);
    } catch (err) {
      res.status(500).send('Error reading index.html');
    }
  });
}
