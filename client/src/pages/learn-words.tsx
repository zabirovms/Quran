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
  const [showTransliteration, setShowTransliteration] = useState(true); // New state for transliteration
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [wordsLearned, setWordsLearned] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0); // New state for best streak
  const [showSettings, setShowSettings] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuranWord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [matchPairs, setMatchPairs] = useState<{ id: number, word: QuranWord, isMatched: boolean, isSelected: boolean }[]>([]);
  const [firstSelected, setFirstSelected] = useState<number | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [wordCount, setWordCount] = useState(20); // Default to intermediate word count
  const [studyWords, setStudyWords] = useState<QuranWord[]>([]);
  const [typingInput, setTypingInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedWord, setSelectedWord] = useState<QuranWord | null>(null); // For flashcard detail dialog

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentWord = studyWords[currentWordIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <SeoHead
        title="Омӯзиши калимаҳои Қуръон"
        description="Калимаҳои аз ҳама бештар истифодашавандаро дар Қуръон тавассути шеваҳои интерактивӣ омӯзед."
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Омӯзиши калимаҳои Қуръон
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Калимаҳои аз ҳама бештар истифодашавандаро дар Қуръон тавассути шеваҳои интерактивӣ омӯзед.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Калимаҳои омӯхташуда</p>
                <p className="text-2xl font-bold">{wordsLearned.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Вақти омӯзиш</p>
                <p className="text-2xl font-bold">{formatTime(timer)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Занҷири ҷорӣ</p>
                <p className="text-2xl font-bold">{streak}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Беҳтарин занҷир</p>
                <p className="text-2xl font-bold">{bestStreak}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Танзимот</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="flex items-center space-x-2">
              <Switch
                id="show-translation"
                checked={showTranslation}
                onCheckedChange={(checked) => setShowTranslation(checked)}
              />
              <Label htmlFor="show-translation">Тарҷумаро нишон диҳед</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-transliteration"
                checked={showTransliteration}
                onCheckedChange={(checked) => setShowTransliteration(checked)}
              />
              <Label htmlFor="show-transliteration">Транслитератсияро нишон диҳед</Label>
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
          </div>
        </div>

        {/* Game Section */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-red-500" />
                    <span className="font-bold">{streak}</span>
                  </div>
                </div>
                {gameMode !== 'flashcards' && gameMode !== 'match' && ( // Progress bar for sequential modes
                  <Progress value={calculateProgress()} className="w-1/2" />
                )}
              </div>

              {gameCompleted && (
                <div className="text-center text-lg font-semibold text-primary mb-4">
                  Бозӣ ба охир расид!
                  <Button onClick={resetGame} className="ml-4">Бозӣ оғоз кардан</Button>
                </div>
              )}

              {!gameCompleted && studyWords.length > 0 && (
                <>
                  {gameMode === 'flashcards' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studyWords.map((word, index) => (
                        <Card
                          key={index}
                          className="bg-background rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedWord(word)}
                        >
                          <CardContent className="p-0">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-2xl font-bold mb-2 text-right">{word.word}</h3>
                                {showTransliteration && (
                                  <p className="text-muted-foreground text-right">{word.transliteration_tajik}</p>
                                )}
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                Зинаи #{word.rank}
                              </Badge>
                            </div>
                            {showTranslation && (
                              <p className="text-lg text-right">{word.translation_tajik}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {gameMode === 'quiz' && currentWord && (
                    <div className="flex flex-col items-center space-y-4">
                      <Card className="w-full max-w-md p-6 text-center">
                        <CardContent>
                          <p className="text-4xl font-bold mb-4">{currentWord.word}</p>
                          {showTransliteration && (
                            <p className="text-lg text-muted-foreground mb-4">{currentWord.transliteration_tajik}</p>
                          )}
                        </CardContent>
                      </Card>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
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
                            className={cn("text-lg py-6", {
                              "border-2 border-green-500": revealAnswers && option.rank === currentWord.rank,
                              "border-2 border-red-500": revealAnswers && selectedAnswer === index && option.rank !== currentWord.rank,
                            })}
                          >
                            {option.translation_tajik}
                          </Button>
                        ))}
                      </div>
                      {revealAnswers && (
                        <Button onClick={() => navigateWord('next')} className="mt-4">
                          Калимаи навбатӣ <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {gameMode === 'match' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                      {matchPairs.map((pair) => (
                        <Card
                          key={pair.id}
                          className={cn(
                            "p-4 text-center cursor-pointer transition-all duration-200",
                            pair.isMatched && "bg-green-100 dark:bg-green-900 opacity-50 pointer-events-none",
                            pair.isSelected && "border-2 border-primary ring-2 ring-primary",
                            !pair.isMatched && !pair.isSelected && "hover:shadow-md"
                          )}
                          onClick={() => handleMatchSelection(pair.id)}
                        >
                          <CardContent className="p-0 flex flex-col items-center justify-center h-20">
                            {pair.id % 2 === 0 ? ( // Even IDs for Arabic word, odd for Tajik translation
                              <p className="text-2xl font-bold">{pair.word.word}</p>
                            ) : (
                              <p className="text-lg">{pair.word.translation_tajik}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {gameMode === 'typing' && currentWord && (
                    <div className="flex flex-col items-center space-y-4">
                      <Card className="w-full max-w-md p-6 text-center">
                        <CardContent>
                          <p className="text-4xl font-bold mb-4">{currentWord.word}</p>
                          {showTransliteration && (
                            <p className="text-lg text-muted-foreground mb-4">{currentWord.transliteration_tajik}</p>
                          )}
                        </CardContent>
                      </Card>
                      <input
                        type="text"
                        value={typingInput}
                        onChange={handleTyping}
                        placeholder="Тарҷумаро ин ҷо нависед..."
                        className="w-full max-w-md p-3 border rounded-md text-center text-lg bg-input"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => navigateWord('prev')} variant="outline">
                          <ChevronLeft className="mr-2 h-4 w-4" /> Пеш
                        </Button>
                        <Button onClick={() => navigateWord('next')} variant="outline">
                          Баъд <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {gameMode === 'listening' && currentWord && (
                    <div className="flex flex-col items-center space-y-4">
                      <Card className="w-full max-w-md p-6 text-center">
                        <CardContent>
                          <p className="text-4xl font-bold mb-4">Калимаро гӯш кунед</p>
                          <Button onClick={handleListening} disabled={isListening} className="text-xl p-4">
                            {isListening ? <Pause className="mr-2 h-6 w-6" /> : <Volume2 className="mr-2 h-6 w-6" />}
                            Гӯш кардан
                          </Button>
                          {showTranslation && (
                            <p className="text-lg text-muted-foreground mt-4">
                              {currentWord.translation_tajik}
                            </p>
                          )}
                          {showTransliteration && (
                            <p className="text-base text-muted-foreground mt-2">
                              ({currentWord.transliteration_tajik})
                            </p>
                          )}
                        </CardContent>
                      </Card>
                      <div className="flex gap-2">
                        <Button onClick={() => navigateWord('prev')} variant="outline">
                          <ChevronLeft className="mr-2 h-4 w-4" /> Пеш
                        </Button>
                        <Button onClick={() => navigateWord('next')} variant="outline">
                          Баъд <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Navigation for Flashcards (if not using click to reveal) */}
                  {gameMode === 'flashcards' && !selectedWord && studyWords.length > 0 && (
                    <div className="flex justify-center mt-4 gap-4">
                      <Button onClick={() => navigateWord('prev')} variant="outline">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Пеш
                      </Button>
                      <Button onClick={flipCard} variant="default">
                        {isFlipped ? "Пинҳон кардан" : "Тарҷумаро нишон додан"}
                      </Button>
                      <Button onClick={() => markAsLearned(currentWord.rank)} variant="success">
                        <Check className="mr-2 h-4 w-4" /> Омӯхтам
                      </Button>
                      <Button onClick={() => navigateWord('next')} variant="outline">
                        Баъд <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
              {studyWords.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground">
                  Калимаҳо барои омӯзиш вуҷуд надоранд. Лутфан танзимотро танзим кунед.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Word Detail Dialog */}
      <Dialog open={!!selectedWord} onOpenChange={setSelectedWord}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-right">{selectedWord?.word}</DialogTitle>
            {showTransliteration && selectedWord?.transliteration_tajik && (
              <p className="text-muted-foreground text-right">{selectedWord.transliteration_tajik}</p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {showTranslation && (
              <div>
                <h4 className="font-semibold mb-2">Тарҷума</h4>
                <p className="text-lg text-right">{selectedWord?.translation_tajik}</p>
              </div>
            )}
            {selectedWord?.example && (
              <div>
                <h4 className="font-semibold mb-2">Намуна аз Қуръон</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xl mb-2 text-right">{selectedWord.example}</p>
                  {selectedWord.example_transliteration && showTransliteration && (
                    <p className="text-muted-foreground text-right">{selectedWord.example_transliteration}</p>
                  )}
                  <p className="text-right mt-2">{selectedWord.example_translation}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedWord.reference}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (selectedWord) markAsLearned(selectedWord.rank);
              setSelectedWord(null);
            }} variant="success">
              <Check className="mr-2 h-4 w-4" /> Ин калимаро омӯхтам
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Пӯшидан</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
