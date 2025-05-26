import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import Surah from "@/pages/surah";
import FarziAyn from "@/pages/farzi-ayn";
import Projects from "@/pages/projects";
import TasbeehCounter from "@/pages/tasbeeh";
import LearnWords from "@/pages/learn-words";
import { useState } from "react";
import SearchOverlay from "./components/overlay/SearchOverlay";
import BookmarksOverlay from "./components/overlay/BookmarksOverlay";
import { DisplayProvider } from "./hooks/useDisplaySettings";
import { ThemeProvider } from "./hooks/useTheme";
import { AuthProvider } from "./hooks/useAuth";
import DuasPage from "@/pages/duas";


// Global context for overlays
export type GlobalOverlayType = 'search' | 'bookmarks' | null;

function Router() {
  const [activeOverlay, setActiveOverlay] = useState<GlobalOverlayType>(null);

  const closeOverlay = () => setActiveOverlay(null);
  const openOverlay = (type: GlobalOverlayType) => setActiveOverlay(type);

  return (
    <div className="min-h-screen flex flex-col">
      <SearchOverlay 
        isOpen={activeOverlay === 'search'} 
        onClose={closeOverlay} 
      />
      
      <BookmarksOverlay 
        isOpen={activeOverlay === 'bookmarks'} 
        onClose={closeOverlay} 
      />
      
      {/* Settings now moved directly to header */}
      
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
    </div>
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
