import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronUp, Home } from "lucide-react";
import Header from "@/components/layout/Header";
import { GlobalOverlayType } from "@/App";
import { Link } from "wouter";
import SeoHead from "@/components/shared/SeoHead";

interface FarziAynProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function FarziAynPage({ onOpenOverlay }: FarziAynProps) {
  const [loading, setLoading] = useState(true);
  const [bookContent, setBookContent] = useState("");
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Load the original book content
  useEffect(() => {
    async function loadOriginalBook() {
      try {
        setLoading(true);
        const response = await fetch("/original_book.html");
        if (!response.ok) {
          throw new Error("Failed to load book content");
        }
        
        const html = await response.text();
        setBookContent(html);
      } catch (error) {
        console.error("Error loading book:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadOriginalBook();
  }, []);

  // Set up scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Create an iframe with the book content
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Palatino Linotype', 'Book Antiqua', serif;
            line-height: 1.6;
            padding: 20px;
            color: #333;
          }
          h1, h2, h3, h4 {
            color: #076E66;
            margin-top: 1.5em;
          }
          p {
            margin-bottom: 1em;
          }
          .book-content {
            max-width: 100%;
          }
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1a1a1a;
              color: #f5f5f5;
            }
            h1, h2, h3, h4 {
              color: #42c2b8;
            }
          }
        </style>
      </head>
      <body>${bookContent}</body>
    </html>
  `;

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Фарзи Айн - дарси такливи мусалмонӣ бо забони тоҷикӣ - Қуръони Карим"
        description="Китоби Фарзи Айн - дарси такливи мусалмонӣ бо забони тоҷикӣ. Матни пурраи китоб барои хониш онлайн."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Book",
          "name": "Фарзи Айн",
          "description": "Дарси такливи мусалмонӣ бо забони тоҷикӣ",
          "inLanguage": "tg",
          "publisher": {
            "@type": "Organization",
            "name": "Қуръони Карим"
          },
          "keywords": "Фарзи Айн, тоҷикӣ, дарси такливи мусалмонӣ, китоби исломӣ"
        }}
      />
      <Header onOpenOverlay={onOpenOverlay} />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary dark:text-primary-foreground">
            Фарзи Айн - тоҷикӣ
          </h1>
        </div>

        <Card className="shadow-md">
          {loading ? (
            <div className="p-6 space-y-6">
              <Skeleton className="h-8 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <iframe
              srcDoc={iframeContent}
              title="Фарзи Айн - тоҷикӣ"
              className="w-full h-[80vh] border-0"
            />
          )}
        </Card>

        {showScrollToTop && (
          <Button
            size="icon"
            className="fixed bottom-6 right-6 rounded-full shadow-md z-10"
            onClick={scrollToTop}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Қуръон бо Тафсири Осонбаён</p>
        </div>
      </footer>
    </div>
  );
}