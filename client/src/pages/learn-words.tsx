import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Home, ChevronLeft, ChevronRight, Check, X, Award, Settings, Info, RefreshCw, Book, Shuffle, Moon, Sun, Volume2, Play, Pause, Timer, BookOpen, Clock, Flame, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import SeoHead from '@/components/shared/SeoHead';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input'; // Assuming you have an Input component

interface QuranWord {
  rank: number;
  word: string;
  translation_tajik: string;
  transliteration_tajik: string;
  example: string;
  example_transliteration: string;
  example_translation: string;
  reference: string;
}

// Game modes
type GameMode = 'flashcards' | 'quiz' | 'match' | 'typing' | 'listening';

// Game difficulty levels
type GameDifficulty = 'beginner' | 'intermediate' | 'advanced';

export default function LearnWords() {
  const [words, setWords] = useState<QuranWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('flashcards');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('beginner');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [wordsLearned, setWordsLearned] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizOptions, setQuizOptions] = useState<QuranWord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [matchPairs, setMatchPairs] = useState<{ id: number, word: QuranWord, isMatched: boolean, isSelected: boolean }[]>([]);
  const [firstSelected, setFirstSelected] = useState<number | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [wordCount, setWordCount] = useState(20);
  const [studyWords, setStudyWords] = useState<QuranWord[]>([]);
  const [typingInput, setTypingInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false); // State to manage settings dialog
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false); // State to manage stats dialog


  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load words data
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch('/data/top_100_words.json');
        if (!response.ok) {
          throw new Error(`Failed to load Quran words: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid data format: expected non-empty array');
        }
        setWords(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Quran words:', error);
        toast({
          title: "Хато",
          description: "Калимаҳо бор карда нашуд. Лутфан саҳифаро аз нав бор кунед.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchWords();

    // Load saved progress
    const savedWordsLearned = localStorage.getItem('wordsLearned');
    const savedDifficulty = localStorage.getItem('wordsDifficulty');
    const savedWordCount = localStorage.getItem('wordsCount');
    const savedTimer = localStorage.getItem('wordsTimer');
    const savedBestStreak = localStorage.getItem('bestStreak');
    const savedShowTranslation = localStorage.getItem('showTranslation');
    const savedShowTransliteration = localStorage.getItem('showTransliteration');


    if (savedWordsLearned) setWordsLearned(JSON.parse(savedWordsLearned));
    if (savedDifficulty) setDifficulty(savedDifficulty as GameDifficulty);
    if (savedWordCount) setWordCount(parseInt(savedWordCount));
    if (savedTimer) setTimer(parseInt(savedTimer));
    if (savedBestStreak) setBestStreak(parseInt(savedBestStreak));
    if (savedShowTranslation) setShowTranslation(JSON.parse(savedShowTranslation));
    if (savedShowTransliteration) setShowTransliteration(JSON.parse(savedShowTransliteration));

    // Initialize audio element
    audioRef.current = new Audio();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Effect to initialize study words whenever 'words', 'difficulty', or 'wordCount' change
  useEffect(() => {
    if (words.length > 0) {
      initializeStudyWords(words);
    }
  }, [words, difficulty, wordCount, gameMode]); // Added gameMode as a dependency

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1;
          localStorage.setItem('wordsTimer', newTime.toString());
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning]);

  // Initialize study words based on difficulty and word count
  const initializeStudyWords = (allWords: QuranWord[]) => {
    let poolSize = 0;
    switch (difficulty) {
      case 'beginner':
        poolSize = 10; // First 10 words
        break;
      case 'intermediate':
        poolSize = 20; // First 20 words
        break;
      case 'advanced':
        poolSize = 30; // First 30 words
        break;
    }
    setWordCount(poolSize);

    const wordPool = allWords.slice(0, poolSize);
    const shuffled = [...wordPool].sort(() => Math.random() - 0.5);
    setStudyWords(shuffled.slice(0, wordCount));

    // Reset game state
    setCurrentWordIndex(0);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
    setGameCompleted(false);
    setTypingInput('');
    setIsListening(false);
    setShowExample(false);
    setSelectedAnswer(null); // Reset selected answer for quiz

    // Initialize game mode specific states
    if (gameMode === 'quiz') {
      generateQuizOptions(0, shuffled.slice(0, wordCount));
    } else if (gameMode === 'match') {
      generateMatchPairs(shuffled.slice(0, Math.min(8, wordCount))); // Max 8 words for match game
    }
  };

  // Save progress to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('wordsLearned', JSON.stringify(wordsLearned));
      localStorage.setItem('wordsDifficulty', difficulty);
      localStorage.setItem('wordsCount', wordCount.toString());
      localStorage.setItem('bestStreak', bestStreak.toString());
      localStorage.setItem('showTranslation', JSON.stringify(showTranslation));
      localStorage.setItem('showTransliteration', JSON.stringify(showTransliteration));

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordsLearned, difficulty, wordCount, isLoading, bestStreak, showTranslation, showTransliteration]);

  // Generate random options for quiz mode
  const generateQuizOptions = (index: number, wordsList: QuranWord[] = studyWords) => {
    if (wordsList.length === 0 || index >= wordsList.length) return;

    const correctWord = wordsList[index];
    let options = [correctWord];

    const otherWords = words.filter(w => w.rank !== correctWord.rank); // Use allWords for diverse options
    const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
    options = [...options, ...shuffled.slice(0, 3)].filter(Boolean); // Ensure no undefined options

    // If less than 4 options, pad with duplicates (shouldn't happen with 100 words)
    while (options.length < 4) {
      options.push(correctWord);
    }

    setQuizOptions(options.sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
    setRevealAnswers(false);
  };

  // Generate pairs for matching game
  const generateMatchPairs = (wordsList: QuranWord[] = studyWords) => {
    if (wordsList.length < 2) {
      setMatchPairs([]);
      return;
    }

    const gameWords = wordsList.slice(0, Math.min(8, wordsList.length)); // Take up to 8 words
    const pairs: { id: number, word: QuranWord, isMatched: boolean, isSelected: boolean }[] = [];

    gameWords.forEach((word, index) => {
      pairs.push({
        id: index * 2,
        word,
        isMatched: false,
        isSelected: false
      });

      pairs.push({
        id: index * 2 + 1,
        word,
        isMatched: false,
        isSelected: false
      });
    });

    setMatchPairs(pairs.sort(() => Math.random() - 0.5));
    setFirstSelected(null);
  };

  // Handle card flip in flashcard mode
  const flipCard = () => {
    setIsFlipped(!isFlipped);

    if (audioEnabled && audioRef.current) {
      audioRef.current.src = '/sounds/card-flip.mp3';
      audioRef.current.play().catch(e => console.error('Error playing audio:', e));
    }
  };

  // Move to next or previous word
  const navigateWord = (direction: 'next' | 'prev') => {
    if (studyWords.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentWordIndex + 1);
      if (newIndex >= studyWords.length) {
        setGameCompleted(true);
        setIsTimerRunning(false); // Stop timer when game completes
        toast({
          title: "Офарин!",
          description: "Шумо ҳама калимаҳоро омӯхтед!",
        });
        return; // Prevent navigating past the last word
      }
    } else {
      newIndex = (currentWordIndex - 1 + studyWords.length) % studyWords.length;
    }

    setCurrentWordIndex(newIndex);
    setIsFlipped(false);
    setTypingInput('');
    setShowExample(false);

    if (gameMode === 'quiz') {
      generateQuizOptions(newIndex);
    }

    if (audioEnabled && audioRef.current) {
      audioRef.current.src = '/sounds/card-slide.mp3';
      audioRef.current.play().catch(e => console.error('Error playing audio:', e));
    }
  };

  // Mark word as learned
  const markAsLearned = (rank: number) => {
    if (!wordsLearned.includes(rank)) {
      setWordsLearned(prev => [...prev, rank]);
      setScore(prev => prev + 5);
      setStreak(prev => prev + 1);

      toast({
        title: "Хуб!",
        description: "Шумо ин калимаро омӯхтед!",
      });
    }
  };

  // Check answer in quiz mode
  const checkAnswer = (index: number) => {
    if (selectedAnswer !== null || revealAnswers) return;

    setSelectedAnswer(index);
    setRevealAnswers(true);

    const isCorrect = quizOptions[index]?.rank === studyWords[currentWordIndex]?.rank;

    if (isCorrect) {
      setScore(prev => prev + 10);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(currentBest => Math.max(currentBest, newStreak));
        return newStreak;
      });
      markAsLearned(studyWords[currentWordIndex].rank);

      toast({
        title: "Дуруст!",
        description: "Ҷавоби шумо дуруст аст!",
      });
    } else {
      setStreak(0);
      toast({
        title: "Нодуруст!",
        description: `Ҷавоби дуруст: ${studyWords[currentWordIndex]?.translation_tajik || ''}`,
      });
    }
  };

  // Handle match selection
  const handleMatchSelection = (id: number) => {
    const clickedPair = matchPairs.find(pair => pair.id === id);
    if (!clickedPair || clickedPair.isMatched || clickedPair.isSelected) return;

    setMatchPairs(prev => prev.map(pair =>
      pair.id === id ? { ...pair, isSelected: true } : pair
    ));

    if (firstSelected === null) {
      setFirstSelected(id);
    } else {
      const firstWord = matchPairs.find(pair => pair.id === firstSelected)?.word;
      const secondWord = clickedPair.word;

      if (firstWord && secondWord && firstWord.rank === secondWord.rank) {
        setMatchPairs(prev => prev.map(pair =>
          pair.id === id || pair.id === firstSelected
            ? { ...pair, isMatched: true, isSelected: false }
            : pair
        ));

        setScore(prev => prev + 5);
        setStreak(prev => {
          const newStreak = prev + 1;
          setBestStreak(currentBest => Math.max(currentBest, newStreak));
          return newStreak;
        });
        markAsLearned(firstWord.rank);

        toast({
          title: "Дуруст!",
          description: "Шумо ҷуфтро дуруст пайдо кардед!",
        });

        const allMatched = matchPairs.every(pair => pair.isMatched || pair.id === id || pair.id === firstSelected);
        if (allMatched) {
          setGameCompleted(true);
          setIsTimerRunning(false);
          toast({
            title: "Офарин!",
            description: "Шумо ҳамаи ҷуфтҳоро ёфтед!",
          });
        }

      } else {
        setMatchPairs(prev => prev.map(pair =>
          pair.id === id || pair.id === firstSelected
            ? { ...pair, isSelected: false }
            : pair
        ));

        setStreak(0);
        toast({
          title: "Нодуруст!",
          description: "Ин ҷуфт нодуруст аст!",
        });
      }

      setFirstSelected(null);
    }
  };

  // Handle typing game
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setTypingInput(input);

    if (studyWords.length > 0 && input.toLowerCase() === studyWords[currentWordIndex].translation_tajik.toLowerCase()) {
      setScore(prev => prev + 10);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(currentBest => Math.max(currentBest, newStreak));
        return newStreak;
      });
      markAsLearned(studyWords[currentWordIndex].rank);

      toast({
        title: "Дуруст!",
        description: "Шумо калимаро дуруст навиштед!",
      });

      setTimeout(() => {
        navigateWord('next');
      }, 1000);
    }
  };

  // Handle listening game
  const handleListening = () => {
    if (!isListening && studyWords[currentWordIndex]?.word) {
      setIsListening(true);
      // Implement text-to-speech for the word
      const utterance = new SpeechSynthesisUtterance(studyWords[currentWordIndex].word);
      utterance.lang = 'ar-SA'; // Set language to Arabic for Quranic words
      utterance.onend = () => setIsListening(false);
      speechSynthesis.speak(utterance);
    }
  };

  // Reset game
  const resetGame = () => {
    initializeStudyWords(words);
    setTimer(0);
    setIsTimerRunning(false);
    setGameCompleted(false);
    setWordsLearned([]); // Clear learned words on reset
    setScore(0);
    setStreak(0);
    // Close dialogs on reset
    setIsSettingsDialogOpen(false);
    setIsStatsDialogOpen(false);
  };

  // Change game mode
  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode);
    setIsTimerRunning(false); // Pause timer when changing mode
    resetGame(); // Reset game state for new mode
  };

  // Change difficulty
  const changeDifficulty = (newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    setIsTimerRunning(false); // Pause timer when changing difficulty
    let newWordCount;
    switch (newDifficulty) {
      case 'beginner':
        newWordCount = 10;
        break;
      case 'intermediate':
        newWordCount = 20;
        break;
      case 'advanced':
        newWordCount = 30;
        break;
      default:
        newWordCount = 20;
    }
    setWordCount(newWordCount);
    resetGame(); // Reset game state for new difficulty
  };

  // Calculate progress
  const calculateProgress = () => {
    if (studyWords.length === 0) return 0;
    const currentProgress = (currentWordIndex / studyWords.length) * 100;
    return Math.min(currentProgress, 100); // Ensure it doesn't exceed 100
  };

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentWord = studyWords[currentWordIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
      <SeoHead
        title="Омӯзиши калимаҳои Қуръон"
        description="Калимаҳои аз ҳама бештар истифодашавандаро дар Қуръон тавассути шеваҳои интерактивӣ омӯзед."
      />

      {/* Fixed Header Bar for Mobile */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-primary truncate mx-2">
          Омӯзиши калимаҳо
        </h1>
        <div className="flex items-center gap-2">
          {/* Stats Dialog Trigger */}
          <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trophy className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Омори омӯзиш</DialogTitle>
                <DialogDescription>
                  Пешрафти худро дар омӯзиши калимаҳои Қуръон бубинед.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Калимаҳои омӯхташуда</p>
                  <p className="text-2xl font-bold">{wordsLearned.length}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Вақти омӯзиш</p>
                  <p className="text-2xl font-bold">{formatTime(timer)}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Занҷири ҷорӣ</p>
                  <p className="text-2xl font-bold">{streak}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Беҳтарин занҷир</p>
                  <p className="text-2xl font-bold">{bestStreak}</p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Бастан
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Settings Dialog Trigger */}
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Танзимоти бозӣ</DialogTitle>
                <DialogDescription>
                  Интихобҳои худро барои омӯзиш танзим кунед.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="game-settings" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="game-settings">Бозӣ</TabsTrigger>
                  <TabsTrigger value="display-audio">Намоиш & Аудио</TabsTrigger>
                </TabsList>
                <TabsContent value="game-settings" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty-select">Сатҳи душворӣ</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(value) => changeDifficulty(value as GameDifficulty)}
                    >
                      <SelectTrigger id="difficulty-select">
                        <SelectValue placeholder="Сатҳро интихоб кунед" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Осон (10 калима)</SelectItem>
                        <SelectItem value="intermediate">Миёна (20 калима)</SelectItem>
                        <SelectItem value="advanced">Душвор (30 калима)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="game-mode-select">Намуди бозӣ</Label>
                    <Select
                      value={gameMode}
                      onValueChange={(value) => changeGameMode(value as GameMode)}
                    >
                      <SelectTrigger id="game-mode-select">
                        <SelectValue placeholder="Намудро интихоб кунед" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flashcards">Флешкартаҳо</SelectItem>
                        <SelectItem value="quiz">Саволу ҷавоб</SelectItem>
                        <SelectItem value="match">Мувофиқат</SelectItem>
                        <SelectItem value="typing">Навиштан</SelectItem>
                        <SelectItem value="listening">Гӯш кардан</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => setIsTimerRunning(prev => !prev)}
                    variant="outline"
                    className="w-full"
                  >
                    {isTimerRunning ? <><Pause className="mr-2 h-4 w-4" /> Таваққуф</> : <><Play className="mr-2 h-4 w-4" /> Оғози вақтсанҷ</>}
                  </Button>
                  <Button
                    onClick={resetGame}
                    variant="secondary"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Бозӣ оғоз кардан
                  </Button>
                </TabsContent>
                <TabsContent value="display-audio" className="space-y-4 py-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="show-translation">Тарҷумаро нишон диҳед</Label>
                    <Switch
                      id="show-translation"
                      checked={showTranslation}
                      onCheckedChange={(checked) => setShowTranslation(checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="show-transliteration">Транслитератсияро нишон диҳед</Label>
                    <Switch
                      id="show-transliteration"
                      checked={showTransliteration}
                      onCheckedChange={(checked) => setShowTransliteration(checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="audio-enabled">Аудиo фаъол аст</Label>
                    <Switch
                      id="audio-enabled"
                      checked={audioEnabled}
                      onCheckedChange={(checked) => setAudioEnabled(checked)}
                    />
                  </div>
                  <Button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    variant="outline"
                    className="w-full"
                  >
                    {theme === 'dark' ? <><Sun className="mr-2 h-4 w-4" /> Равшан</> : <><Moon className="mr-2 h-4 w-4" /> Торик</>}
                  </Button>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Бастан
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Game Section - Directly visible */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-6">
            <div className="flex justify-between items-center w-full">
              {gameMode !== 'match' && ( // Progress bar for sequential modes
                <Progress value={calculateProgress()} className="flex-1 max-w-xs sm:max-w-sm mx-auto" />
              )}
            </div>

            {gameCompleted && (
              <div className="text-center text-lg font-semibold text-primary mb-4">
                Бозӣ ба охир расид!
                <Button onClick={resetGame} className="mt-4 w-full sm:w-auto">Бозӣ оғоз кардан</Button>
              </div>
            )}

            {!gameCompleted && studyWords.length > 0 && (
              <>
                    {/* Flashcards Mode */}
                    {gameMode === 'flashcards' && currentWord && (
                      <motion.div
                        key={currentWordIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center space-y-4 w-full"
                      >
                        <Card
                          className="w-full max-w-xl aspect-video cursor-pointer perspective-1000 select-none"
                          onClick={flipCard}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={isFlipped ? 'back' : 'front'}
                              initial={{ rotateY: 0 }}
                              animate={{ rotateY: isFlipped ? 180 : 0 }}
                              transition={{ duration: 0.6, ease: 'easeInOut' }}
                              className="relative w-full h-full rounded-2xl shadow-xl"
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                              {/* Front Face - (No changes needed here) */}
                              <div
                                className="absolute w-full h-full flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-100 px-6 py-8 shadow-md"
                                style={{ backfaceVisibility: 'hidden' }}
                              >
                                <h3 className="text-5xl font-bold mb-3 text-right text-slate-900 leading-snug">{currentWord.word}</h3>
                                {showTransliteration && (
                                  <p className="text-lg text-slate-500 text-right">{currentWord.transliteration_tajik}</p>
                                )}
                                <Badge variant="secondary" className="mt-6 text-sm py-1 px-3">
                                  Зинаи #{currentWord.rank}
                                </Badge>
                              </div>

                              {/* Back Face */}
                              <div
                                className="absolute inset-0 flex flex-col items-start justify-start rounded-2xl bg-gradient-to-br from-slate-100 to-white px-6 py-6 shadow-md overflow-y-auto"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                              >
                                {/* Translation */}
                                {showTranslation && (
                                  <p className="text-2xl font-semibold text-slate-900 leading-snug mb-4 text-center w-full">
                                    {currentWord.translation_tajik}
                                  </p>
                                )}

                                {/* Example Section */}
                                {showExample && currentWord.example && (
                                  <div className="w-full space-y-2">
                                    {/* Arabic Example */}
                                    <p className="text-right text-xl font-bold text-indigo-900 select-text leading-snug" dir="rtl">
                                      {currentWord.example}
                                    </p>

                                    {/* Transliteration */}
                                    <p className="text-sm italic text-indigo-700 select-text leading-snug">
                                      {currentWord.example_transliteration}
                                    </p>

                                    {/* Translation */}
                                    <p className="text-base text-slate-700 select-text leading-snug">
                                      {currentWord.example_translation}
                                    </p>
                                  </div>
                                )}
                              </div>

                            </motion.div>
                          </AnimatePresence>
                        </Card>


                    <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
                      <Button onClick={() => setShowExample(prev => !prev)} variant="outline" className="flex-1">
                        <Info className="mr-2 h-4 w-4" /> Намуна {showExample ? 'пинҳон кардан' : 'нишон додан'}
                      </Button>
                      <Button
                        onClick={() => markAsLearned(currentWord.rank)}
                        disabled={wordsLearned.includes(currentWord.rank)}
                        variant="default"
                        className="flex-1"
                      >
                        {wordsLearned.includes(currentWord.rank) ? 'Омӯхта шуд' : 'Омӯхтам'}
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleListening}
                              disabled={isListening}
                              className="flex-shrink-0"
                            >
                              <Volume2 className={cn("h-5 w-5", { "animate-pulse": isListening })} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Калимаро гӯш кунед</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex gap-2 w-full justify-center">
                      <Button
                        onClick={() => navigateWord('prev')}
                        variant="outline"
                        disabled={currentWordIndex === 0}
                        className="flex-1"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Пеш
                      </Button>
                      <Button
                        onClick={() => navigateWord('next')}
                        variant="outline"
                        disabled={currentWordIndex === studyWords.length - 1 && !gameCompleted}
                        className="flex-1"
                      >
                        Баъд <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Quiz Mode */}
                {gameMode === 'quiz' && currentWord && (
                  <div className="flex flex-col items-center space-y-6 w-full">
                    <Card className="w-full p-6 text-center bg-primary-foreground min-h-[120px] flex justify-center items-center">
                      <CardContent className="p-0">
                        <p className="text-4xl font-bold mb-2 text-right leading-tight">{currentWord.word}</p>
                        {showTransliteration && (
                          <p className="text-lg text-muted-foreground text-right">{currentWord.transliteration_tajik}</p>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleListening}
                                disabled={isListening}
                                className="mt-2"
                              >
                                <Volume2 className={cn("h-5 w-5", { "animate-pulse": isListening })} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Калимаро гӯш кунед</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardContent>
                    </Card>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {quizOptions.map((option, index) => (
                        <Button
                          key={index}
                          variant={
                            selectedAnswer === index
                              ? (option.rank === currentWord.rank ? 'success' : 'destructive')
                              : (revealAnswers && option.rank === currentWord.rank ? 'success' : 'outline')
                          }
                          onClick={() => checkAnswer(index)}
                          disabled={revealAnswers}
                          className={cn("text-lg py-6 h-auto transition-colors duration-200", {
                            "bg-green-100 text-green-800 border-2 border-green-500 dark:bg-green-900 dark:text-green-200": revealAnswers && option.rank === currentWord.rank,
                            "bg-red-100 text-red-800 border-2 border-red-500 dark:bg-red-900 dark:text-red-200": revealAnswers && selectedAnswer === index && option.rank !== currentWord.rank,
                          })}
                        >
                          {option.translation_tajik}
                          {revealAnswers && option.rank === currentWord.rank && <Check className="ml-2 h-4 w-4" />}
                          {revealAnswers && selectedAnswer === index && option.rank !== currentWord.rank && <X className="ml-2 h-4 w-4" />}
                        </Button>
                      ))}
                    </div>
                    {revealAnswers && (
                      <Button onClick={() => navigateWord('next')} className="mt-4 w-full sm:w-auto">
                        Калимаи навбатӣ <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Match Mode */}
                {gameMode === 'match' && (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {matchPairs.map((pair) => (
                      <motion.div
                        key={pair.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: pair.isMatched ? 0 : 1, scale: pair.isMatched ? 0.5 : 1 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "p-4 text-center cursor-pointer rounded-lg shadow-sm transition-all duration-200 border-2 h-24 flex items-center justify-center",
                          pair.isMatched && "bg-green-100 dark:bg-green-900 opacity-0 pointer-events-none",
                          pair.isSelected && "border-primary ring-2 ring-primary",
                          !pair.isMatched && !pair.isSelected && "hover:shadow-md bg-card"
                        )}
                        onClick={() => handleMatchSelection(pair.id)}
                      >
                        <CardContent className="p-0 flex flex-col items-center justify-center">
                          {pair.id % 2 === 0 ? ( // Even IDs for Arabic word, odd for Tajik translation
                            <p className="text-xl font-bold text-right">{pair.word.word}</p>
                          ) : (
                            <p className="text-base">{pair.word.translation_tajik}</p>
                          )}
                        </CardContent>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Typing Mode */}
                {gameMode === 'typing' && currentWord && (
                  <div className="flex flex-col items-center space-y-4 w-full">
                    <Card className="w-full p-6 text-center bg-primary-foreground min-h-[120px] flex justify-center items-center">
                      <CardContent className="p-0">
                        <p className="text-4xl font-bold mb-2 text-right leading-tight">{currentWord.word}</p>
                        {showTransliteration && (
                          <p className="text-lg text-muted-foreground text-right">{currentWord.transliteration_tajik}</p>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleListening}
                                disabled={isListening}
                                className="mt-2"
                              >
                                <Volume2 className={cn("h-5 w-5", { "animate-pulse": isListening })} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Калимаро гӯш кунед</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardContent>
                    </Card>
                    <Input
                      type="text"
                      value={typingInput}
                      onChange={handleTyping}
                      placeholder="Тарҷумаро ин ҷо нависед..."
                      className={cn(
                        "w-full p-3 border rounded-md text-center text-lg bg-input",
                        typingInput.length > 0 && typingInput.toLowerCase() === currentWord.translation_tajik.toLowerCase()
                          ? "border-green-500 ring-2 ring-green-500"
                          : typingInput.length > 0 && typingInput.toLowerCase() !== currentWord.translation_tajik.toLowerCase()
                            ? "border-red-500 ring-2 ring-red-500"
                            : ""
                      )}
                    />
                    <div className="flex gap-2 w-full justify-center">
                      <Button onClick={() => navigateWord('prev')} variant="outline" disabled={currentWordIndex === 0} className="flex-1">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Пеш
                      </Button>
                      <Button
                        onClick={() => typingInput.toLowerCase() === currentWord.translation_tajik.toLowerCase() ? navigateWord('next') : toast({
                          title: "Хато",
                          description: "Лутфан ҷавоби дурустро ворид кунед.",
                          variant: "destructive",
                        })}
                        variant="outline"
                        className="flex-1"
                      >
                        Баъд <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Listening Mode */}
                {gameMode === 'listening' && currentWord && (
                  <div className="flex flex-col items-center space-y-4 w-full">
                    <Card className="w-full p-6 text-center bg-primary-foreground min-h-[200px] flex justify-center items-center">
                      <CardContent className="p-0 flex flex-col items-center justify-center">
                        <Button
                          variant="default"
                          size="lg"
                          onClick={handleListening}
                          disabled={isListening}
                          className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                        >
                          <Volume2 className={cn("h-10 w-10 text-white", { "animate-pulse": isListening })} />
                        </Button>
                        <p className="text-xl text-muted-foreground mb-4">Калимаро гӯш кунед ва тарҷумаи онро фикр кунед.</p>

                        <AnimatePresence mode='wait'>
                          {isFlipped && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="w-full"
                            >
                              {showTranslation && (
                                <p className="text-3xl font-semibold mb-2 text-center">{currentWord.translation_tajik}</p>
                              )}
                              {showTransliteration && (
                                <p className="text-lg text-muted-foreground text-center">{currentWord.transliteration_tajik}</p>
                              )}
                              {showExample && currentWord.example && (
                                <div className="mt-4 p-3 bg-muted rounded-md w-full text-center text-sm">
                                  <p className="italic text-muted-foreground mb-1">Намуна:</p>
                                  <p className="text-base text-right font-medium">{currentWord.example}</p>
                                  <p className="text-sm text-muted-foreground text-right">{currentWord.example_transliteration}</p>
                                  <p className="italic text-muted-foreground">{currentWord.example_translation}</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                    <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
                      <Button onClick={flipCard} variant="secondary" className="flex-1">
                        {isFlipped ? 'Пинҳон кардан' : 'Ҷавобро нишон диҳед'}
                      </Button>
                      <Button onClick={() => setShowExample(prev => !prev)} variant="outline" className="flex-1">
                        <Info className="mr-2 h-4 w-4" /> Намуна {showExample ? 'пинҳон кардан' : 'нишон додан'}
                      </Button>
                    </div>
                    <div className="flex gap-2 w-full justify-center">
                      <Button onClick={() => navigateWord('prev')} variant="outline" disabled={currentWordIndex === 0} className="flex-1">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Пеш
                      </Button>
                      <Button onClick={() => navigateWord('next')} variant="outline" className="flex-1">
                        Баъд <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
