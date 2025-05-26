import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft, 
  Settings,
  Home,
  BookOpen
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { SettingsContent } from './SettingsDrawer';

export function Sidebar() {
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
      
      {/* Sidebar */}
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
          {/* Sidebar header with navigation links */}
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3 flex items-center justify-between">
              <span>Quran App</span>
              <button 
                onClick={() => setCollapsed(true)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </h2>
            
            <nav className="space-y-2">
              <Link href="/">
                <Button
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start",
                    location === "/" && "bg-muted"
                  )}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Асосӣ
                </Button>
              </Link>
              
              <Link href="/farzi-ayn">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    location === "/farzi-ayn" && "bg-muted"
                  )}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Фарзи Айн
                </Button>
              </Link>
            </nav>
          </div>
          
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