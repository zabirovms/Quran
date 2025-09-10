import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home,
  BookOpen,
  Image,
  Download,
  Video,
  FileText,
  Book,
  FolderKanban,
  Settings,
  User,
  Menu
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

export function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [location] = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Handle hover events on the button
  const handleButtonMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (!isMobile) {
      setCollapsed(false);
    }
  };

  const handleButtonMouseLeave = () => {
    if (!isMobile) {
      hoverTimeoutRef.current = setTimeout(() => {
        setCollapsed(true);
      }, 300); // Small delay to prevent flickering
    }
  };

  // Handle hover events on the sidebar
  const handleSidebarMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovering(true);
  };

  const handleSidebarMouseLeave = () => {
    if (!isMobile) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovering(false);
        setCollapsed(true);
      }, 300);
    }
  };

  // Handle toggle from header or mobile
  const handleToggle = () => setCollapsed(c => !c);

  useEffect(() => {
    const toggleHandler = () => setCollapsed(c => !c);
    const openHandler = () => {
      if (isMobile) return;
      setCollapsed(false);
      setIsHovering(true);
    };
    const closeHandler = () => {
      if (isMobile) return;
      // Only close if not actively hovering sidebar to avoid flicker
      if (!isHovering) setCollapsed(true);
    };
    window.addEventListener('toggle-left-sidebar' as any, toggleHandler as any);
    window.addEventListener('open-left-sidebar' as any, openHandler as any);
    window.addEventListener('close-left-sidebar' as any, closeHandler as any);
    return () => {
      window.removeEventListener('toggle-left-sidebar' as any, toggleHandler as any);
      window.removeEventListener('open-left-sidebar' as any, openHandler as any);
      window.removeEventListener('close-left-sidebar' as any, closeHandler as any);
    };
  }, [isMobile, isHovering]);

  const navigationItems = [
    {
      href: "/",
      icon: Home,
      label: "Асосӣ",
      description: "Саҳифаи асосӣ"
    },
    {
      href: "/farzi-ayn",
      icon: BookOpen,
      label: "Фарзи Айн",
      description: "Фарзҳои исломӣ"
    },
    {
      href: "/tasbeeh",
      icon: Book,
      label: "Тасбеҳгӯяк",
      description: "Шумориши зикрҳо"
    },
    {
      href: "/learn-words",
      icon: BookOpen,
      label: "Омӯзиши калимаҳо",
      description: "Калимаҳои Қуръон"
    },
    {
      href: "/duas",
      icon: BookOpen,
      label: "Дуоҳо",
      description: "Дуоҳои Қуръонӣ"
    },
    {
      href: "/pictures",
      icon: Image,
      label: "Иқтибосҳо аз Қуръон",
      description: "суратҳо исломӣ"
    },
    {
      href: "/downloads",
      icon: Download,
      label: "Боргирӣ",
      description: "Қуръон ба PDF"
    },
    {
      href: "/videos",
      icon: Video,
      label: "Видеоҳо",
      description: "Тиловат бо субтитр"
    },
    {
      href: "/articles",
      icon: FileText,
      label: "Мақолаҳо",
      description: "Маълумотҳои исломӣ"
    },
    {
      href: "/projects",
      icon: FolderKanban,
      label: "Лоиҳаҳо",
      description: "Лоиҳаҳои мо"
    }
  ];

  return (
    <>
      {/* Mobile overlay when sidebar is expanded */}
      {!collapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setCollapsed(true)}
        ></div>
      )}
    
      {/* Toggle button removed to avoid floating overlap; controlled via header */}
      
      {/* Left Sidebar */}
      <aside 
        ref={sidebarRef}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-background border-r transition-all duration-300 ease-in-out overflow-hidden",
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
              <span className="text-primary dark:text-accent">Қуръони Карим</span>
              <button 
                onClick={() => setCollapsed(true)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </h2>
          </div>
          
          {/* Navigation menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-auto py-3 px-3",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex flex-col items-start text-left">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs opacity-70">{item.description}</span>
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User section at bottom */}
          <div className="p-4 border-t">
            <Link href="/login">
              <Button className="w-full justify-start gap-3" variant="outline">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Вуруд / Сабтином</p>
                  <p className="text-xs text-muted-foreground">Ба ҳисоби худ ворид шавед</p>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
} 