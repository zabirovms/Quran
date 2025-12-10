import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, lazy, Suspense } from "react";
import SearchOverlay from "./components/overlay/SearchOverlay";
import BookmarksOverlay from "./components/overlay/BookmarksOverlay";
import { DisplayProvider } from "./hooks/useDisplaySettings";
import { ThemeProvider } from "./hooks/useTheme";
import { AuthProvider } from "./hooks/useAuth";
import { AudioProvider } from "./hooks/useAudio";
import CookieConsent from "@/components/layout/CookieConsent";
import { LeftSidebar } from "@/components/layout/LeftSidebar";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/home"));
const Surah = lazy(() => import("@/pages/surah"));
const FarziAyn = lazy(() => import("@/pages/farzi-ayn"));
const Projects = lazy(() => import("@/pages/projects"));
const TasbeehCounter = lazy(() => import("@/pages/tasbeeh"));
const LearnWords = lazy(() => import("@/pages/learn-words"));
const DuasPage = lazy(() => import("@/pages/duas"));
const PicturesPage = lazy(() => import("@/pages/pictures"));
const DownloadsPage = lazy(() => import("@/pages/downloads"));
const VideosPage = lazy(() => import("@/pages/videos"));
const ArticlesPage = lazy(() => import("@/pages/articles"));
const NotFound = lazy(() => import("@/pages/not-found"));
const LoginPage = lazy(() => import("@/pages/login"));
const MosquesPage = lazy(() => import("@/pages/mosques"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));

// Loading component for better UX
const PageLoader = () => (
  <div className="page-loader">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Global context for overlays
export type GlobalOverlayType = 'search' | 'bookmarks' | null;

function Router() {
  const [activeOverlay, setActiveOverlay] = useState<GlobalOverlayType>(null);

  const closeOverlay = () => setActiveOverlay(null);
  const openOverlay = (type: GlobalOverlayType) => setActiveOverlay(type);

  return (
    <>
      <SearchOverlay 
        isOpen={activeOverlay === 'search'} 
        onClose={closeOverlay} 
      />
      <BookmarksOverlay 
        isOpen={activeOverlay === 'bookmarks'} 
        onClose={closeOverlay} 
      />
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={() => <HomePage onOpenOverlay={openOverlay} />} />
            <Route path="/surah/:number">
              {(params) => <Surah surahNumber={Number(params.number)} onOpenOverlay={openOverlay} />}
            </Route>
            <Route path="/surah/:number/verse/:verseNumber">
              {(params) => <Surah 
                surahNumber={Number(params.number)} 
                initialVerseNumber={Number(params.verseNumber)} 
                onOpenOverlay={openOverlay} 
              />}
            </Route>
            <Route path="/farzi-ayn" component={() => <FarziAyn onOpenOverlay={openOverlay} />} />
            <Route path="/projects" component={() => <Projects onOpenOverlay={openOverlay} />} />
            <Route path="/tasbeeh" component={TasbeehCounter} />
            <Route path="/learn-words" component={LearnWords} />
            <Route path="/duas" component={DuasPage} />
            <Route path="/pictures" component={() => <PicturesPage onOpenOverlay={openOverlay} />} />
            <Route path="/downloads" component={() => <DownloadsPage onOpenOverlay={openOverlay} />} />
            <Route path="/videos" component={() => <VideosPage onOpenOverlay={openOverlay} />} />
            <Route path="/articles" component={() => <ArticlesPage onOpenOverlay={openOverlay} />} />
            <Route path="/mosques" component={MosquesPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/privacy" component={() => <PrivacyPage onOpenOverlay={openOverlay} />} />
            <Route component={NotFound} />
          </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AudioProvider>
          <DisplayProvider>
            <TooltipProvider>
              <CookieConsent />
              <LeftSidebar />
              <Router />
            </TooltipProvider>
          </DisplayProvider>
        </AudioProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
