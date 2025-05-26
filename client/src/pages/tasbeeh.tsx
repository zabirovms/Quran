import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Check, Vibrate, RotateCcw, Settings, Share, Info, Home, Moon, Sun, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import SeoHead from '@/components/shared/SeoHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Tasbeeh {
  arabic: string;
  tajik_transliteration: string;
  tajik_translation: string;
}

export default function TasbeehCounter() {
  const [tasbeehs, setTasbeehs] = useState<Tasbeeh[]>([]);
  const [currentTasbeehIndex, setCurrentTasbeehIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(33);
  const [isLoading, setIsLoading] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completedTasbeehs, setCompletedTasbeehs] = useState<number>(0);
  const [lastVibration, setLastVibration] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Load tasbeehs data
  useEffect(() => {
    const fetchTasbeehs = async () => {
      try {
        const response = await fetch('/tasbeehs.json');
        if (!response.ok) {
          throw new Error('Failed to load tasbeehs');
        }
        const data = await response.json();
        setTasbeehs(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading tasbeehs:', error);
        setIsLoading(false);
      }
    };

    fetchTasbeehs();

    // Load saved data from localStorage
    const savedCount = localStorage.getItem('tasbeehCount');
    const savedTasbeehIndex = localStorage.getItem('currentTasbeehIndex');
    const savedTargetCount = localStorage.getItem('targetCount');
    const savedVibrationEnabled = localStorage.getItem('vibrationEnabled');
    const savedCompletedTasbeehs = localStorage.getItem('completedTasbeehs');

    if (savedCount) setCount(parseInt(savedCount));
    if (savedTasbeehIndex) setCurrentTasbeehIndex(parseInt(savedTasbeehIndex));
    if (savedTargetCount) setTargetCount(parseInt(savedTargetCount));
    if (savedVibrationEnabled) setVibrationEnabled(savedVibrationEnabled === 'true');
    if (savedCompletedTasbeehs) setCompletedTasbeehs(parseInt(savedCompletedTasbeehs));
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (saveHistory && !isLoading) {
      localStorage.setItem('tasbeehCount', count.toString());
      localStorage.setItem('currentTasbeehIndex', currentTasbeehIndex.toString());
      localStorage.setItem('targetCount', targetCount.toString());
      localStorage.setItem('vibrationEnabled', vibrationEnabled.toString());
      localStorage.setItem('completedTasbeehs', completedTasbeehs.toString());
    }
  }, [count, currentTasbeehIndex, targetCount, vibrationEnabled, completedTasbeehs, saveHistory, isLoading]);

  // Handle count increment with haptic feedback
  const incrementCount = () => {
    // Provide haptic feedback if enabled and supported
    if (vibrationEnabled && 'vibrate' in navigator) {
      // Prevent too frequent vibrations (throttle to 100ms)
      const now = Date.now();
      if (now - lastVibration > 100) {
        navigator.vibrate(25);
        setLastVibration(now);
      }
    }

    const newCount = count + 1;
    setCount(newCount);

    // Check if reached target
    if (newCount >= targetCount) {
      // Reset count and show completion dialog
      setCount(0);
      setCompletedTasbeehs(prev => prev + 1);
      setShowCompletionDialog(true);
    }
  };

  // Reset counter
  const resetCounter = () => {
    setCount(0);
  };

  // Change tasbeeh
  const changeTasbeeh = (index: number) => {
    setCurrentTasbeehIndex(index);
    resetCounter();
  };

  // Get current tasbeeh
  const currentTasbeeh = tasbeehs[currentTasbeehIndex] || {
    arabic: '',
    tajik_transliteration: '',
    tajik_translation: ''
  };

  return (
    <>
      <SeoHead 
        title="Тасбеҳ | Қуръони Карим"
        description="Тасбеҳгӯяк барои зикрҳои Исломӣ бо забони тоҷикӣ ва арабӣ"
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        {/* Header */}
        <header className="border-b px-4 py-3 bg-background/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm">Асосӣ</span>
            </Link>

            <div className="text-center flex-1 flex justify-center">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Тасбеҳгӯяк
              </h1>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <SettingsDialog 
                vibrationEnabled={vibrationEnabled}
                setVibrationEnabled={setVibrationEnabled}
                targetCount={targetCount}
                setTargetCount={setTargetCount}
                saveHistory={saveHistory}
                setSaveHistory={setSaveHistory}
                resetAll={() => {
                  setCount(0);
                  setCompletedTasbeehs(0);
                  localStorage.removeItem('tasbeehCount');
                  localStorage.removeItem('completedTasbeehs');
                }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col px-4 py-6 overflow-hidden max-w-md mx-auto w-full">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Tabs defaultValue="counter" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="counter" className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  Тасбеҳгӯяк
                </TabsTrigger>
                <TabsTrigger value="collection" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Зикрҳо
                </TabsTrigger>
              </TabsList>

              <TabsContent value="counter" className="mt-0">
                {/* Compact mobile-friendly layout */}
                <div className="h-[calc(100vh-170px)] flex flex-col">
                  {/* Tasbeeh selector and counter info in one row */}
                  <div className="flex flex-col md:flex-row gap-3 mb-3">
                    {/* Tasbeeh selector - more compact */}
                    <div className="flex-1">
                      <Carousel className="h-[90px]">
                        <CarouselContent>
                          {tasbeehs.map((tasbeeh, index) => (
                            <CarouselItem key={index} className="basis-full">
                              <Card 
                                className={cn(
                                  "border shadow-sm cursor-pointer transition-all h-full",
                                  index === currentTasbeehIndex ? 
                                    "border-primary/50 bg-primary/5 dark:bg-primary/10" : 
                                    "hover:border-muted-foreground/20"
                                )}
                                onClick={() => changeTasbeeh(index)}
                              >
                                <CardContent className="p-3 flex flex-col items-center justify-center h-full">
                                  <div className="text-center">
                                    <p className="font-arabic text-lg text-foreground leading-tight">
                                      {tasbeeh.arabic}
                                    </p>
                                    <p className="text-xs font-medium text-primary dark:text-primary/90 mt-1 line-clamp-1">
                                      {tasbeeh.tajik_transliteration}
                                    </p>
                                  </div>

                                  {index === currentTasbeehIndex && (
                                    <div className="absolute top-1 right-1">
                                      <Check className="h-3 w-3 text-primary" />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                    </div>

                    {/* Counter info - moved to top right */}
                    <div className="flex items-center justify-center md:justify-end">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-muted-foreground">
                          Шумораи хатм: {completedTasbeehs}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={resetCounter}
                          className="h-8 w-8"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Compact counter display and touch area */}
                  <div className="flex flex-col flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
                      {/* Left column - counter circle */}
                      <div className="flex items-center justify-center md:col-span-1">
                        <div className="relative w-[130px] h-[130px]" ref={counterRef}>
                          {/* Progress circle */}
                          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="8"
                              className="text-muted/10"
                            />

                            {/* Progress arc */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="10"
                              strokeLinecap="round"
                              strokeDasharray={`${(count / targetCount) * 263.8} 263.8`}
                              className="text-primary transition-all duration-300 ease-out"
                            />
                          </svg>

                          {/* Inner text */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={count}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.2 }}
                                transition={{ duration: 0.2 }}
                                className="text-3xl font-bold text-foreground"
                              >
                                {count}
                              </motion.div>
                            </AnimatePresence>
                            <p className="text-xs text-muted-foreground">
                              аз {targetCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right column - touch area */}
                      <div className="flex-1 flex items-center justify-center md:col-span-2">
                        <div 
                          className="w-full h-full rounded-xl bg-gradient-to-b from-primary/5 to-primary/10 flex items-center justify-center 
                            cursor-pointer active:from-primary/10 active:to-primary/20 active:scale-[0.98] transition-all duration-150 
                            border border-primary/20 shadow-sm select-none touch-none"
                          onClick={incrementCount}
                        >
                          <p className="text-primary/80 dark:text-primary/90 font-medium text-sm">
                            Барои шуморидан зер кунед
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom section - tasbeeh info */}
                    <div className="mt-3 p-2 bg-muted/10 rounded-lg border border-muted/20">
                      <p className="text-xs text-center text-muted-foreground line-clamp-2">
                        {currentTasbeeh.tajik_translation}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="collection" className="mt-0">
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
                    Зикрҳои исломӣ
                  </h2>

                  <div className="grid grid-cols-1 gap-4">
                    {tasbeehs.map((tasbeeh, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Card className="overflow-hidden border border-primary/10 dark:border-primary/5 hover:shadow-md transition-all duration-300 group">
                          <div className="bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 h-2"></div>
                          <CardContent className="p-4">
                            <div className="flex flex-col space-y-3">
                              <div className="text-center">
                                <p className="font-arabic text-xl mb-2 leading-relaxed">
                                  {tasbeeh.arabic}
                                </p>
                                <p className="text-sm font-medium text-primary dark:text-primary/90">
                                  {tasbeeh.tajik_transliteration}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-primary/5 dark:border-primary/10 text-center">
                                <p className="text-xs text-muted-foreground">
                                  {tasbeeh.tajik_translation}
                                </p>
                              </div>

                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full mt-2 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-colors"
                                onClick={() => changeTasbeeh(index)}
                              >
                                Шуморидан
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>

        {/* Completion dialog */}
        <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
          <DialogContent className="max-w-xs sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">
                <span className="block text-xl mb-2">✨ Тасбеҳ пурра шуд ✨</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Шумо {targetCount} маротиба ин зикрро хондед
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="my-4 text-center">
              <p className="font-arabic text-2xl mb-2">{currentTasbeeh.arabic}</p>
              <p className="text-sm">{currentTasbeeh.tajik_transliteration}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => setShowCompletionDialog(false)}>
                Идома додан
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Тасбеҳ',
                      text: `Ман ${targetCount} маротиба "${currentTasbeeh.tajik_transliteration}" хондам.`
                    }).catch(console.error);
                  }
                }}
              >
                <Share className="h-4 w-4 mr-2" />
                Мубодила
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

// Settings dialog component
function SettingsDialog({
  vibrationEnabled,
  setVibrationEnabled,
  targetCount,
  setTargetCount,
  saveHistory,
  setSaveHistory,
  resetAll
}: {
  vibrationEnabled: boolean;
  setVibrationEnabled: (value: boolean) => void;
  targetCount: number;
  setTargetCount: (value: number) => void;
  saveHistory: boolean;
  setSaveHistory: (value: boolean) => void;
  resetAll: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Танзимот</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Vibration toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vibration" className="flex items-center gap-2">
                <Vibrate className="h-4 w-4" />
                <span>Ларзиш</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Ларзиши телефон ҳангоми зер кардан
              </p>
            </div>
            <Switch 
              id="vibration" 
              checked={vibrationEnabled}
              onCheckedChange={setVibrationEnabled}
            />
          </div>

          {/* Target counter */}
          <div className="space-y-2">
            <Label htmlFor="target-count">Шумораи мақсад</Label>
            <div className="flex gap-2">
              {[33, 99, 100, 500].map(count => (
                <Button
                  key={count}
                  variant={targetCount === count ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setTargetCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Save history toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="save-history">Нигоҳдории таърих</Label>
              <p className="text-xs text-muted-foreground">
                Нигоҳдории шумора ва танзимот
              </p>
            </div>
            <Switch 
              id="save-history" 
              checked={saveHistory}
              onCheckedChange={setSaveHistory}
            />
          </div>

          {/* Reset all data */}
          <div className="pt-2">
            <Button 
              variant="destructive" 
              className="w-full" 
              size="sm"
              onClick={resetAll}
            >
              Тоза кардани ҳамаи маълумот
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}