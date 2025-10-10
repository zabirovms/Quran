import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home } from "lucide-react";
import { ChevronUp } from "lucide-react";
import Header from "@/components/layout/Header";
import { GlobalOverlayType } from "@/App";

interface FarziAynProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

// A helper function to clean the HTML by removing inline styles and specific classes.
function cleanHtml(htmlString) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // Remove all inline 'style' attributes
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(el => {
    el.removeAttribute('style');
  });

  // Remove specific, problematic classes that interfere with styling
  const classesToRemove = ['MsoNormal', 'WordSection1'];
  classesToRemove.forEach(className => {
    const elements = tempDiv.getElementsByClassName(className);
    Array.from(elements).forEach(el => {
      el.classList.remove(className);
    });
  });

  return tempDiv.innerHTML;
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
        const cleanedHtml = cleanHtml(html);
        setBookContent(cleanedHtml);
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
      {/* SEO meta tags are handled server-side for better crawler support */}
      <Header onOpenOverlay={onOpenOverlay} />

      <main
        className="container mx-auto px-4 py-6 flex-grow overflow-y-auto scrollbar-hide"
        style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', serif", lineHeight: 1.6 }}
      >
        <h1 className="text-3xl font-bold text-primary dark:text-primary-foreground mb-8 text-center">
          Фарзи Айн - тоҷикӣ
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading content...</p>
        ) : (
          <div
            className="prose max-w-none text-gray-800 dark:text-gray-100"
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
          body {
            background-color: #1a202c; /* A dark gray background for the body */
          }
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






