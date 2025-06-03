import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; // CardContent is not directly used, only Card
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
import { Home, ChevronLeft, ChevronRight, Check, X, Award, Settings, Info, RefreshCw, Book, Shuffle, Moon, Sun, Volume2, Play, Pause, Timer, BookOpen, Clock, Flame, Trophy, VolumeX } from 'lucide-react'; // Added VolumeX for mute
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
import { Input } from '@/components/ui/input';

// --- Interfaces ---
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

// --- Types ---
type GameMode = 'flashcards' | 'quiz' | 'match' | 'typing' | 'listening';
type GameDifficulty = 'beginner' | 'intermediate' | 'advanced';

// --- Constants (for better maintainability) ---
const DIFFICULTY_WORD_COUNTS = {
  beginner: 10,
  intermediate: 20,
  advanced: 30,
};
const MATCH_GAME_MAX_WORDS = 8; // Max words to display in match game
const QUIZ_OPTIONS_COUNT = 4; // Number of options for quiz

// --- Helper Functions ---
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function LearnWords() {
  // --- State Variables ---
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
  const [wordCount, setWordCount] = useState(DIFFICULTY_WORD_COUNTS.beginner); // Initialized with beginner count
  const [studyWords, setStudyWords] = useState<QuranWord[]>([]);
  const [typingInput, setTypingInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  // --- Hooks & Refs ---
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typingInputRef = useRef<HTMLInputElement>(null); // Ref for typing input

  // --- Game Logic Functions ---

  // Function to initialize study words based on difficulty and word count
  const initializeStudyWords = useCallback((allWords: QuranWord[]) => {
    const poolSize = DIFFICULTY_WORD_COUNTS[difficulty];
    const wordPool = allWords.slice(0, poolSize);
    const shuffled = [...wordPool].sort(() => Math.random() - 0.5);
    setStudyWords(shuffled.slice(0, poolSize)); // Set study words based on difficulty pool size
    setWordCount(poolSize); // Update word count to match difficulty

    // Reset game state
    setCurrentWordIndex(0);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
    setGameCompleted(false);
    setTypingInput('');
    setIsListening(false);
    setShowExample(false);
    setSelectedAnswer(null);

    // Initialize game mode specific states
    if (gameMode === 'quiz') {
      generateQuizOptions(0, shuffled.slice(0, poolSize));
    } else if (gameMode === 'match') {
      generateMatchPairs(shuffled.slice(0, Math.min(MATCH_GAME_MAX_WORDS, poolSize)));
    }
  }, [difficulty, gameMode]); // Dependencies for useCallback

  // Generate random options for quiz mode
  const generateQuizOptions = useCallback((index: number, wordsList: QuranWord[] = studyWords) => {
    if (wordsList.length === 0 || index >= wordsList.length) return;

    const correctWord = wordsList[index];
    let options = [correctWord];

    // Filter out the correct word to get other options
    const otherWords = words.filter(w => w.rank !== correctWord.rank);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);

    // Add 3 random incorrect options
    options = [...options, ...shuffledOthers.slice(0, QUIZ_OPTIONS_COUNT - 1)];

    // Shuffle options to randomize correct answer position
    setQuizOptions(options.sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
    setRevealAnswers(false);
  }, [words, studyWords]); // Dependencies for useCallback

  // Generate pairs for matching game
  const generateMatchPairs = useCallback((wordsList: QuranWord[] = studyWords) => {
    if (wordsList.length < 2) {
      setMatchPairs([]);
      return;
    }

    const gameWords = wordsList.slice(0, Math.min(MATCH_GAME_MAX_WORDS, wordsList.length));
    const pairs: { id: number, word: QuranWord, isMatched: boolean, isSelected: boolean }[] = [];

    gameWords.forEach((word, index) => {
      pairs.push({ id: index * 2, word, isMatched: false, isSelected: false });
      pairs.push({ id: index * 2 + 1, word, isMatched: false, isSelected: false });
    });

    setMatchPairs(pairs.sort(() => Math.random() - 0.5));
    setFirstSelected(null);
  }, [studyWords]); // Dependencies for useCallback

  // Mark word as learned
  const markAsLearned = useCallback((rank: number) => {
    if (!wordsLearned.includes(rank)) {
      setWordsLearned(prev => [...prev, rank]);
      setScore(prev => prev + 5);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(currentBest => Math.max(currentBest, newStreak));
        return newStreak;
      });
      toast({
        title: "Хуб!",
        description: "Шумо ин калимаро омӯхтед!",
      });
    }
  }, [wordsLearned, toast]); // Dependencies for useCallback

  // Move to next or previous word
  const navigateWord = useCallback((direction: 'next' | 'prev') => {
    if (studyWords.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentWordIndex + 1;
      if (newIndex >= studyWords.length) {
        setGameCompleted(true);
        setIsTimerRunning(false);
        toast({
          title: "Офарин!",
          description: "Шумо ҳама калимаҳоро омӯхтед!",
        });
        return;
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
  }, [currentWordIndex, studyWords, gameMode, audioEnabled, generateQuizOptions, toast]); // Dependencies for useCallback

  // Reset game
  const resetGame = useCallback(() => {
    initializeStudyWords(words);
    setTimer(0);
    setIsTimerRunning(false);
    setGameCompleted(false);
    setWordsLearned([]); // Clear learned words on reset
    setScore(0);
    setStreak(0);
    setIsSettingsDialogOpen(false);
    setIsStatsDialogOpen(false);
  }, [initializeStudyWords, words]); // Dependencies for useCallback

  // Change game mode
  const changeGameMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setIsTimerRunning(false);
    resetGame();
  }, [resetGame]); // Dependencies for useCallback

  // Change difficulty
  const changeDifficulty = useCallback((newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    setIsTimerRunning(false);
    const newWordCount = DIFFICULTY_WORD_COUNTS[newDifficulty];
    setWordCount(newWordCount);
    resetGame();
  }, [resetGame]); // Dependencies for useCallback

  // --- Handlers ---

  // Handle card flip in flashcard mode
  const flipCard = () => {
    setIsFlipped(!isFlipped);
    if (audioEnabled && audioRef.current) {
      audioRef.current.src = '/sounds/card-flip.mp3';
      audioRef.current.play().catch(e => console.error('Error playing audio:', e));
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
        className: "bg-green-500 text-white"
      });
    } else {
      setStreak(0);
      toast({
        title: "Нодуруст!",
        description: `Ҷавоби дуруст: ${studyWords[currentWordIndex]?.translation_tajik || ''}`,
        variant: "destructive",
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
          className: "bg-green-500 text-white"
        });

        // Check if all pairs are matched after this selection
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
        // Incorrect match, reset selections after a short delay
        setStreak(0);
        toast({
          title: "Нодуруст!",
          description: "Ин ҷуфт нодуруст аст!",
          variant: "destructive",
        });
        setTimeout(() => {
          setMatchPairs(prev => prev.map(pair =>
            pair.id === id || pair.id === firstSelected
              ? { ...pair, isSelected: false }
              : pair
          ));
        }, 800); // Briefly show incorrect selection
      }
      setFirstSelected(null);
    }
  };

  // Handle typing game input
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
        className: "bg-green-500 text-white"
      });
      setTimeout(() => {
        navigateWord('next');
      }, 1000);
    }
  };

  // Handle listening game (Text-to-Speech)
  const handleListening = () => {
    if (!isListening && studyWords[currentWordIndex]?.word) {
      setIsListening(true);
      const utterance = new SpeechSynthesisUtterance(studyWords[currentWordIndex].word);
      utterance.lang = 'ar-SA';
      utterance.onend = () => setIsListening(false);
      speechSynthesis.speak(utterance);
    }
  };

  // --- Effects ---

  // Load words data and saved progress
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

    // Load saved progress from localStorage
    const savedWordsLearned = localStorage.getItem('wordsLearned');
    const savedDifficulty = localStorage.getItem('wordsDifficulty');
    const savedWordCount = localStorage.getItem('wordsCount'); // This might be redundant if difficulty dictates count
    const savedTimer = localStorage.getItem('wordsTimer');
    const savedBestStreak = localStorage.getItem('bestStreak');
    const savedShowTranslation = localStorage.getItem('showTranslation');
    const savedShowTransliteration = localStorage.getItem('showTransliteration');
    const savedGameMode = localStorage.getItem('gameMode') as GameMode; // Load game mode

    if (savedWordsLearned) setWordsLearned(JSON.parse(savedWordsLearned));
    if (savedDifficulty) setDifficulty(savedDifficulty as GameDifficulty);
    if (savedWordCount) setWordCount(parseInt(savedWordCount)); // Keep for now in case of custom word counts later
    if (savedTimer) setTimer(parseInt(savedTimer));
    if (savedBestStreak) setBestStreak(parseInt(savedBestStreak));
    if (savedShowTranslation) setShowTranslation(JSON.parse(savedShowTranslation));
    if (savedShowTransliteration) setShowTransliteration(JSON.parse(savedShowTransliteration));
    if (savedGameMode) setGameMode(savedGameMode);

    audioRef.current = new Audio();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Effect to initialize study words whenever 'words', 'difficulty', or 'gameMode' change
  useEffect(() => {
    if (words.length > 0) {
      initializeStudyWords(words);
    }
  }, [words, difficulty, gameMode, initializeStudyWords]);

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
    return () => { // Cleanup on unmount or when effect re-runs
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Save progress to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('wordsLearned', JSON.stringify(wordsLearned));
      localStorage.setItem('wordsDifficulty', difficulty);
      localStorage.setItem('wordsCount', wordCount.toString());
      localStorage.setItem('bestStreak', bestStreak.toString());
      localStorage.setItem('showTranslation', JSON.stringify(showTranslation));
      localStorage.setItem('showTransliteration', JSON.stringify(showTransliteration));
      localStorage.setItem('gameMode', gameMode); // Save game mode
    }
  }, [wordsLearned, difficulty, wordCount, isLoading, bestStreak, showTranslation, showTransliteration, gameMode]);

  // Focus typing input when game mode changes to typing
  useEffect(() => {
    if (gameMode === 'typing' && typingInputRef.current) {
      typingInputRef.current.focus();
    }
  }, [gameMode, currentWordIndex]); // Refocus when word changes too

  // --- Render Logic ---
  const currentWord = studyWords[currentWordIndex];
  const calculateProgress = () => {
    if (studyWords.length === 0) return 0;
    // For sequential modes, progress is based on current index
    if (gameMode === 'flashcards' || gameMode === 'quiz' || gameMode === 'typing' || gameMode === 'listening') {
      return (currentWordIndex / studyWords.length) * 100;
    }
    // For match game, progress is based on matched pairs
    if (gameMode === 'match') {
      const totalPairs = matchPairs.length / 2;
      const matchedCount = matchPairs.filter(p => p.isMatched).length / 2;
      return totalPairs > 0 ? (matchedCount / totalPairs) * 100 : 0;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
      <SeoHead
        title="Омӯзиши калимаҳои Қуръон"
        description="Калимаҳои аз ҳама бештар истифодашавандаро дар Қуръон тавассути шеваҳои интерактивӣ омӯзед."
      />

      {/* --- Fixed Header Bar for Mobile --- */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Home className="h-5 w-5" />
            <span className="sr-only">Ба саҳифаи асосӣ</span>
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
                <span className="sr-only">Омор</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-md rounded-lg">
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
                  <Button type="button" variant="secondary" className="w-full">
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
                <span className="sr-only">Танзимот</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-lg rounded-lg">
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
                        <SelectItem value="beginner">Осон ({DIFFICULTY_WORD_COUNTS.beginner} калима)</SelectItem>
                        <SelectItem value="intermediate">Миёна ({DIFFICULTY_WORD_COUNTS.intermediate} калима)</SelectItem>
                        <SelectItem value="advanced">Душвор ({DIFFICULTY_WORD_COUNTS.advanced} калима)</SelectItem>
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
                      onCheckedChange={setShowTranslation}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="show-transliteration">Транслитератсияро нишон диҳед</Label>
                    <Switch
                      id="show-transliteration"
                      checked={showTransliteration}
                      onCheckedChange={setShowTransliteration}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="audio-enabled">Аудио фаъол аст</Label>
                    <Switch
                      id="audio-enabled"
                      checked={audioEnabled}
                      onCheckedChange={setAudioEnabled}
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
                  <Button type="button" variant="secondary" className="w-full">
                    Бастан
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* --- Main Game Section --- */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg space-y-6">
          {gameMode !== 'match' && (
            <div className="flex justify-between items-center w-full">
              <Progress value={calculateProgress()} className="flex-1 max-w-xs sm:max-w-sm mx-auto" />
            </div>
          )}

          {gameCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-lg font-semibold text-primary mb-4 p-4 bg-card rounded-lg shadow-md"
            >
              Бозӣ ба охир расид! Офарин!
              <Button onClick={resetGame} className="mt-4 w-full">
                Бозӣ оғоз кардан
              </Button>
            </motion.div>
          )}

          {!gameCompleted && studyWords.length > 0 && (
            <>
              {/* --- Flashcards Mode --- */}
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
                    className="w-full max-w-xl aspect-video cursor-pointer perspective-1000 select-none bg-card rounded-2xl shadow-xl overflow-hidden"
                    onClick={flipCard}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isFlipped ? 'back' : 'front'}
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        className="relative w-full h-full"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Front Face */}
                        <div
                          className="absolute w-full h-full flex flex-col items-center justify-center p-6"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <h3 className="text-5xl font-bold mb-3 text-right text-foreground leading-snug break-words">
                            {currentWord.word}
                          </h3>
                          {showTransliteration && (
                            <p className="text-lg text-muted-foreground text-right mt-2 break-words">
                              {currentWord.transliteration_tajik}
                            </p>
                          )}
                          <Badge variant="secondary" className="mt-6 text-sm py-1 px-3">
                            Зинаи #{currentWord.rank}
                          </Badge>
                        </div>
                        {/* Back Face */}
                        <div
                          className="absolute inset-0 flex flex-col items-start justify-start p-6 overflow-y-auto"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          {showTranslation && (
                            <p className="text-2xl font-semibold text-foreground leading-snug mb-4 text-center w-full break-words">
                              {currentWord.translation_tajik}
                            </p>
                          )}
                          {showExample && currentWord.example && (
                            <Accordion type="single" collapsible className="w-full mt-4">
                              <AccordionItem value="example-section" className="border-b-0">
                                <AccordionTrigger className="text-base font-medium text-primary hover:no-underline px-0 py-2">
                                  <Info className="mr-2 h-4 w-4" /> Намунаи истифода
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 px-0">
                                  <div className="w-full space-y-2 text-left">
                                    <p className="text-right text-xl font-bold text-indigo-700 select-text leading-snug" dir="rtl">
                                      {currentWord.example}
                                    </p>
                                    <p className="text-sm italic text-indigo-500 select-text leading-snug">
                                      {currentWord.example_transliteration}
                                    </p>
                                    <p className="text-base text-muted-foreground select-text leading-snug">
                                      {currentWord.example_translation}
                                    </p>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </Card>

                  <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
                    {/* Simplified Example Button */}
                    {currentWord.example && (
                       <Button onClick={() => setShowExample(prev => !prev)} variant="outline">
                           {showExample ? 'Намунаро пинҳон кунед' : 'Намунаро нишон диҳед'}
                       </Button>
                    )}
                    <Button
                      onClick={() => markAsLearned(currentWord.rank)}
                      disabled={wordsLearned.includes(currentWord.rank)}
                      className="w-full"
                    >
                      {wordsLearned.includes(currentWord.rank) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Омӯхта шудааст
                        </>
                      ) : (
                        <>
                          <Book className="mr-2 h-4 w-4" /> Омӯхтам
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* --- Quiz Mode --- */}
              {gameMode === 'quiz' && currentWord && (
                <motion.div
                  key={currentWordIndex}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center space-y-6 w-full"
                >
                  <Card className="w-full p-6 text-center shadow-md bg-card">
                    <p className="text-sm text-muted-foreground mb-2">Калимаи Арабӣ:</p>
                    <h3 className="text-4xl font-bold text-foreground leading-snug mb-4">{currentWord.word}</h3>
                    {showTransliteration && (
                      <p className="text-lg text-muted-foreground mb-4">{currentWord.transliteration_tajik}</p>
                    )}
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {quizOptions.map((option, index) => (
                      <motion.div
                        key={option.rank}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant={
                            selectedAnswer === null
                              ? 'outline'
                              : quizOptions[index]?.rank === currentWord.rank
                                ? 'success' // Custom variant for correct
                                : selectedAnswer === index
                                  ? 'destructive' // Custom variant for incorrect selected
                                  : 'outline'
                          }
                          onClick={() => checkAnswer(index)}
                          disabled={revealAnswers}
                          className={cn(
                            "w-full h-auto py-4 text-center text-lg font-medium whitespace-normal break-words",
                            revealAnswers && quizOptions[index]?.rank === currentWord.rank && 'border-2 border-green-500',
                            revealAnswers && selectedAnswer === index && quizOptions[index]?.rank !== currentWord.rank && 'border-2 border-red-500',
                          )}
                        >
                          {showTranslation && option.translation_tajik}
                          {!showTranslation && option.word} {/* Fallback if translation hidden */}
                          {revealAnswers && quizOptions[index]?.rank === currentWord.rank && (
                            <Check className="ml-2 h-5 w-5 text-green-500" />
                          )}
                          {revealAnswers && selectedAnswer === index && quizOptions[index]?.rank !== currentWord.word && (
                            <X className="ml-2 h-5 w-5 text-red-500" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  {revealAnswers && (
                    <Button onClick={() => navigateWord('next')} className="w-full mt-4">
                      Калимаи навбатӣ <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              )}

              {/* --- Match Mode --- */}
              {gameMode === 'match' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 max-w-2xl mx-auto"
                >
                  {matchPairs.map(pair => (
                    <motion.div
                      key={pair.id}
                      className={cn(
                        "relative flex items-center justify-center rounded-lg p-3 sm:p-4 aspect-square shadow-md cursor-pointer transition-all duration-200",
                        pair.isMatched
                          ? "bg-green-100 dark:bg-green-900 border-green-500 opacity-70"
                          : pair.isSelected
                            ? "bg-primary text-primary-foreground scale-105"
                            : "bg-card hover:bg-muted/80",
                        "border-2"
                      )}
                      onClick={() => handleMatchSelection(pair.id)}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: pair.isMatched ? 1 : 1.03 }}
                    >
                      <span className="text-lg sm:text-xl font-semibold text-center leading-tight break-words">
                        {showTranslation && pair.id % 2 === 0 ? pair.word.word : pair.word.translation_tajik}
                        {!showTranslation && pair.id % 2 === 0 ? pair.word.word : pair.word.word} {/* Fallback if translation hidden */}
                      </span>
                      {pair.isMatched && (
                        <Check className="absolute top-2 right-2 h-5 w-5 text-green-600 dark:text-green-300" />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* --- Typing Mode --- */}
              {gameMode === 'typing' && currentWord && (
                <motion.div
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center space-y-6 w-full"
                >
                  <Card className="w-full p-6 text-center shadow-md bg-card">
                    <p className="text-sm text-muted-foreground mb-2">Калимаи Арабӣ:</p>
                    <h3 className="text-4xl font-bold text-foreground leading-snug mb-4">{currentWord.word}</h3>
                    {showTransliteration && (
                      <p className="text-lg text-muted-foreground mb-4">{currentWord.transliteration_tajik}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Тарҷумаро дар поён нависед:</p>
                  </Card>
                  <Input
                    type="text"
                    placeholder="Тарҷумаи тоҷикӣ"
                    value={typingInput}
                    onChange={handleTyping}
                    className="w-full max-w-sm text-center text-lg py-6"
                    ref={typingInputRef}
                  />
                  {typingInput.toLowerCase() !== currentWord.translation_tajik.toLowerCase() && typingInput.length > 0 && (
                    <p className="text-red-500 text-sm">Хато: Кӯшиш кунед {currentWord.translation_tajik}</p>
                  )}
                </motion.div>
              )}

              {/* --- Listening Mode --- */}
              {gameMode === 'listening' && currentWord && (
                <motion.div
                  key={currentWordIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center space-y-6 w-full"
                >
                  <Card className="w-full p-6 text-center shadow-md bg-card">
                    <p className="text-sm text-muted-foreground mb-2">Калимаро гӯш кунед ва тарҷумаи онро бидонед:</p>
                    <h3 className="text-4xl font-bold text-foreground leading-snug mb-4">
                      {showTranslation && currentWord.translation_tajik}
                      {!showTranslation && "Тарҷумаро пинҳон кардед"}
                    </h3>
                    {showTransliteration && (
                      <p className="text-lg text-muted-foreground mb-4">{currentWord.transliteration_tajik}</p>
                    )}
                  </Card>
                  <Button
                    onClick={handleListening}
                    disabled={isListening}
                    className="w-full max-w-sm h-16 text-xl"
                  >
                    {isListening ? (
                      <>
                        <Volume2 className="mr-2 h-6 w-6 animate-pulse" /> Гӯш карда истодааст...
                      </>
                    ) : (
                      <>
                        <Volume2 className="mr-2 h-6 w-6" /> Гӯш кардан
                      </>
                    )}
                  </Button>
                  <div className="flex gap-2 w-full max-w-sm">
                    <Button
                      onClick={() => markAsLearned(currentWord.rank)}
                      disabled={wordsLearned.includes(currentWord.rank)}
                      className="flex-1"
                    >
                      {wordsLearned.includes(currentWord.rank) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Омӯхта шудааст
                        </>
                      ) : (
                        <>
                          <Book className="mr-2 h-4 w-4" /> Омӯхтам
                        </>
                      )}
                    </Button>
                    <Button onClick={() => navigateWord('next')} variant="outline" className="flex-1">
                      <ChevronRight className="mr-2 h-4 w-4" /> Навбатӣ
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      {/* --- Fixed Navigation Bar for Mobile (only for flashcards, quiz, typing, listening) --- */}
      {(gameMode === 'flashcards' || gameMode === 'quiz' || gameMode === 'typing' || gameMode === 'listening') && !gameCompleted && (
        <div className="sticky bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t p-4 flex justify-around items-center gap-2 shadow-lg z-10">
          <Button
            onClick={() => navigateWord('prev')}
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            disabled={currentWordIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Калимаи қаблӣ</span>
          </Button>

          {gameMode === 'flashcards' && (
             <Button onClick={flipCard} className="flex-1 max-w-[150px] h-12 text-lg">
                {isFlipped ? 'Пинҳон кардан' : 'Нишон додан'}
             </Button>
          )}

          <Button
            onClick={() => navigateWord('next')}
            variant="ghost"
            size="icon"
            className="h-12 w-12"
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Калимаи навбатӣ</span>
          </Button>
        </div>
      )}
    </div>
  );
}
