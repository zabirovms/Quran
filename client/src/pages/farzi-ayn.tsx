import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import Header from "@/components/layout/Header";
import { GlobalOverlayType } from "@/App";
import SeoHead from "@/components/shared/SeoHead";

interface FarziAynProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function FarziAynPage({ onOpenOverlay }: FarziAynProps) {
  const [loading, setLoading] = useState(true);
  const [bookContent, setBookContent] = useState("");
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    async function loadOriginalBook() {
      try {
        setLoading(true);
        const response = await fetch("/original_book.html");
        if (!response.ok) throw new Error("Failed to load book content");
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

  useEffect(() => {
    const handleScroll = () => setShowScrollToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Фарзи Айн - дарси такливи мусалмонӣ бо забони тоҷикӣ - Қуръони Карим"
        description="Китоби Фарзи Айн - дарси такливи мусалмонӣ бо забони тоҷикӣ. Матни пурраи китоб барои хониш онлайн."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: "Фарзи Айн",
          description: "Дарси такливи мусалмонӣ бо забони тоҷикӣ",
          inLanguage: "tg",
          publisher: {
            "@type": "Organization",
            name: "Қуръони Карим",
          },
          keywords: "Фарзи Айн, тоҷикӣ, дарси такливи мусалмонӣ, китоби исломӣ",
        }}
      />
      <Header onOpenOverlay={onOpenOverlay} />

      <main
        className="container mx-auto px-4 py-6 flex-grow overflow-y-auto scrollbar-hide"
        style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', serif", lineHeight: 1.6, color: "#333" }}
      >
        <h1 className="text-3xl font-bold text-primary dark:text-primary-foreground mb-8 text-center">
          Фарзи Айн - тоҷикӣ
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading content...</p>
        ) : (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: bookContent }}
          />
        )}

        {showScrollToTop && (
          <Button
            size="icon"
            className="fixed bottom-6 right-6 rounded-full shadow-md z-10"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Қуръон бо Тафсири Осонбаён</p>
        </div>
      </footer>

      <style jsx global>{`
        /* Hide scrollbars for WebKit browsers */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbars for Firefox */
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        /* Optional: Prose styling (requires Tailwind Typography plugin) */
        .prose p {
          margin-bottom: 1em;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: #076E66;
          margin-top: 1.5em;
        }
        @media (prefers-color-scheme: dark) {
          .prose {
            color: #f5f5f5;
          }
          .prose h1, .prose h2, .prose h3, .prose h4 {
            color: #42c2b8;
          }
        }
      `}</style>
    </div>
  );
}
