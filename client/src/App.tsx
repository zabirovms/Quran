import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, lazy, Suspense } from "react";
import SearchOverlay from "./components/overlay/SearchOverlay";
import BookmarksOverlay from "./components/overlay/BookmarksOverlay";
import { DisplayProvider } from "./hooks/useDisplaySettings";
import { ThemeProvider } from "./hooks/useTheme";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "@/components/layout/Layout";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/home"));
const Surah = lazy(() => import("@/pages/surah"));
const FarziAyn = lazy(() => import("@/pages/farzi-ayn"));
const Projects = lazy(() => import("@/pages/projects"));
const TasbeehCounter = lazy(() => import("@/pages/tasbeeh"));
const LearnWords = lazy(() => import("@/pages/learn-words"));
const DuasPage = lazy(() => import("@/pages/duas"));
const NotFound = lazy(() => import("@/pages/not-found"));

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
      <Layout onOpenOverlay={openOverlay}>
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
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Layout>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DisplayProvider>
          <TooltipProvider>
            <Router />
          </TooltipProvider>
        </DisplayProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
