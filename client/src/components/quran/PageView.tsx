import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

interface PageViewProps {
  currentSurah?: number;
  onPageChange?: (page: number) => void;
}

export default function PageView({ currentSurah, onPageChange }: PageViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch page data
  const fetchPageData = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`);
      const data = await response.json();
      console.log('API Response:', data);
      if (data.code === 200 && data.data) {
        setPageData(data.data);
        onPageChange?.(page);
      } else {
        setError('Failed to load page data: ' + (data.status || 'Unknown error'));
      }
    } catch (err) {
      setError('Error loading page data');
      console.error('Error fetching page:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= 604) {
      setCurrentPage(newPage);
      fetchPageData(newPage);
    }
  };

  // Initial page load
  useEffect(() => {
    fetchPageData(currentPage);
  }, []);

  // Handle surah change
  useEffect(() => {
    if (currentSurah) {
      // TODO: Implement logic to find the starting page for the current surah
      // This would require a mapping of surah numbers to their starting pages
    }
  }, [currentSurah]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {/* Navigation Controls */}
      <div className="flex items-center justify-between w-full mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Select
          value={currentPage.toString()}
          onValueChange={(value) => handlePageChange(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 604 }, (_, i) => i + 1).map((page) => (
              <SelectItem key={page} value={page.toString()}>
                Page {page}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= 604 || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Content */}
      <div className="w-full bg-white rounded-lg shadow-lg p-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-5/6" />
          </div>
        ) : (
          <div className="text-right text-2xl leading-loose font-uthmani">
            {pageData?.text}
          </div>
        )}
      </div>
    </div>
  );
} 