import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft, 
  Settings,
  Bookmark,
  BookOpen,
  Download,
  Share2,
  Info,
  Clock,
  Target
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { SettingsContent } from './SettingsDrawer';

export function RightSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [location] = useLocation();

  // Check screen size on mount and when resized
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Auto-collapse on mobile
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <>
      {/* Mobile overlay when sidebar is expanded */}
      {!collapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setCollapsed(true)}
        ></div>
      )}
    
      {/* Toggle button (always visible) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "fixed z-50 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-2 shadow-md transition-all",
          collapsed 
            ? "right-4 bottom-16" 
            : isMobile 
              ? "right-[calc(250px+0.5rem)] bottom-16" 
              : "right-[calc(280px+0.5rem)] bottom-16"
        )}
        aria-label={collapsed ? "Open settings" : "Close settings"}
      >
        {collapsed ? (
          <Settings className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>
      
      {/* Right Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 right-0 z-40 h-screen bg-background border-l transition-all duration-300 ease-in-out overflow-hidden",
          collapsed 
            ? "w-0 opacity-0" 
            : isMobile 
              ? "w-[250px] opacity-100" 
              : "w-[280px] opacity-100"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3 flex items-center justify-between">
              <span>Танзимот ва амалҳо</span>
              <button 
                onClick={() => setCollapsed(true)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </h2>
          </div>
          
          {/* Quick Actions Section */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Амалҳои зуд</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Bookmark className="mr-2 h-4 w-4" />
                Хатҳо
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Боргирӣ
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                Бахшида
              </Button>
            </div>
          </div>

          {/* Reading Progress Section */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Пешрафти хондан</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Сураҳои хондашуда</span>
                <span className="font-medium">12/114</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Охирин хондашуда: 2 соат пеш</span>
              </div>
            </div>
          </div>

          {/* Current Reading Info */}
          {location.includes('/surah/') && (
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Маълумотҳои ҷори</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Сураи ҷори</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Ояти ҷори</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span>Тафсир</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings content (scrollable) */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold mb-3">Танзимот</h3>
            <SettingsContent />
          </div>
        </div>
      </aside>
    </>
  );
} 