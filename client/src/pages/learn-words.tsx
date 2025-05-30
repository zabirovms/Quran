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
import { Home, ChevronLeft, ChevronRight, Check, X, Award, Settings, Info, RefreshCw, Book, Shuffle, Moon, Sun, Volume2, Play, Pause, Timer } from 'lucide-react';
import { Home, ChevronLeft, ChevronRight, Check, X, Award, Settings, Info, RefreshCw, Book, Shuffle, Moon, Sun, Volume2, Play, Pause, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import SeoHead from '@/components/shared/SeoHead';
import { useToast } from '@/hooks/use-toast';

interface QuranWord {
  rank: number;
  word: string;
  translation_tajik: string;
  transliteration_tajik: string;
  example: string;
  example_transliteration: string;
  example_translation: string;
  reference: string;
  transliteration_tajik: string;
  example: string;
  example_transliteration: string;
  example_translation: string;
  reference: string;
}

// Game modes
type GameMode = 'flashcards' | 'quiz' | 'match' | 'typing' | 'listening';
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
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [wordsLearned, setWordsLearned] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuranWord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [matchPairs, setMatchPairs] = useState<{id: number, word: QuranWord, isMatched: boolean, isSelected: boolean}[]>([]);
  const [firstSelected, setFirstSelected] = useState<number | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [wordCount, setWordCount] = useState(20);
  const [wordCount, setWordCount] = useState(20);
  const [studyWords, setStudyWords] = useState<QuranWord[]>([]);
  const [typingInput, setTypingInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [typingInput, setTypingInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load words data
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch('/data/top_100_words.json');
        const response = await fetch('/data/top_100_words.json');
        if (!response.ok) {
          throw new Error(`Failed to load Quran words: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid data format: expected non-empty array');
        }
        setWords(data);
        initializeStudyWords(data);
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
    // Load saved progress
    const savedWordsLearned = localStorage.getItem('wordsLearned');
    const savedDifficulty = localStorage.getItem('wordsDifficulty');
    const savedWordCount = localStorage.getItem('wordsCount');
    const savedTimer = localStorage.getItem('wordsTimer');
    const savedTimer = localStorage.getItem('wordsTimer');
    
    if (savedWordsLearned) setWordsLearned(JSON.parse(savedWordsLearned));
    if (savedDifficulty) setDifficulty(savedDifficulty as GameDifficulty);
    if (savedWordCount) setWordCount(parseInt(savedWordCount));
    if (savedTimer) setTimer(parseInt(savedTimer));
    if (savedTimer) setTimer(parseInt(savedTimer));
    
    // Initialize audio element
    audioRef.current = new Audio();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
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
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);
  
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
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);
  
  // Initialize study words based on difficulty and word count
  const initializeStudyWords = (allWords: QuranWord[]) => {
    let wordPool: QuranWord[] = [];
    
    switch(difficulty) {
      case 'beginner':
        wordPool = allWords.slice(0, 33);
        wordPool = allWords.slice(0, 33);
        break;
      case 'intermediate':
        wordPool = allWords.slice(0, 66);
        wordPool = allWords.slice(0, 66);
        break;
      case 'advanced':
        wordPool = allWords;
        wordPool = allWords;
        break;
    }
    
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
    setTypingInput('');
    setIsListening(false);
    setShowExample(false);
    
    // Initialize game mode specific states
    // Initialize game mode specific states
    if (gameMode === 'quiz') {
      generateQuizOptions(0, shuffled.slice(0, wordCount));
    } else if (gameMode === 'match') {
      generateMatchPairs(shuffled.slice(0, wordCount));
    }
  };
  
  // Save progress to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('wordsLearned', JSON.stringify(wordsLearned));
      localStorage.setItem('wordsDifficulty', difficulty);
      localStorage.setItem('wordsCount', wordCount.toString());
    }
  }, [wordsLearned, difficulty, wordCount, isLoading]);
  
  // Generate random options for quiz mode
  const generateQuizOptions = (index: number, wordsList: QuranWord[] = studyWords) => {
    if (wordsList.length === 0) return;
    
    const correctWord = wordsList[index];
    let options = [correctWord];
    
    const otherWords = wordsList.filter(w => w.rank !== correctWord.rank);
    const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
    options = [...options, ...shuffled.slice(0, 3)];
    
    setQuizOptions(options.sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
    setRevealAnswers(false);
  };
  
  // Generate pairs for matching game
  const generateMatchPairs = (wordsList: QuranWord[] = studyWords) => {
    if (wordsList.length === 0) return;
    
    const gameWords = wordsList.slice(0, 8);
    const pairs: {id: number, word: QuranWord, isMatched: boolean, isSelected: boolean}[] = [];
    
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
      newIndex = (currentWordIndex + 1) % studyWords.length;
      
      if (newIndex === 0 && gameMode !== 'match') {
        setGameCompleted(true);
        setScore(prev => prev + 10);
        toast({
          title: "Офарин!",
          description: "Шумо ҳама калимаҳоро омӯхтед!",
        });
      }
    } else {
      newIndex = (currentWordIndex - 1 + studyWords.length) % studyWords.length;
    }
    
    setCurrentWordIndex(newIndex);
    setIsFlipped(false);
    setTypingInput('');
    setShowExample(false);
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
      setWordsLearned(prev => [...prev, rank]);
      setScore(prev => prev + 5);
      setStreak(prev => prev + 1);
      
      toast({
        title: "Хуб!",
        description: "Шумо ин калимаро омӯхтед!",
        title: "Хуб!",
        description: "Шумо ин калимаро омӯхтед!",
      });
    }
  };
  
  // Check answer in quiz mode
    }
  };
  
  // Check answer in quiz mode
  const checkAnswer = (index: number) => {
    if (selectedAnswer !== null || revealAnswers) return;
    
    if (selectedAnswer !== null || revealAnswers) return;
    
    setSelectedAnswer(index);
    setRevealAnswers(true);
    setRevealAnswers(true);
    
    const isCorrect = quizOptions[index].rank === studyWords[currentWordIndex].rank;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      markAsLearned(studyWords[currentWordIndex].rank);
      
      toast({
        title: "Дуруст!",
        description: "Ҷавоби шумо дуруст аст!",
      });
      toast({
        title: "Дуруст!",
        description: "Ҷавоби шумо дуруст аст!",
      });
    } else {
      setStreak(0);
      toast({
        title: "Нодуруст!",
        description: "Ҷавоби дуруст: " + studyWords[currentWordIndex].translation_tajik,
      });
    }
      toast({
        title: "Нодуруст!",
        description: "Ҷавоби дуруст: " + studyWords[currentWordIndex].translation_tajik,
      });
    }
  };
  
  // Handle match selection
  // Handle match selection
  const handleMatchSelection = (id: number) => {
    if (firstSelected === null) {
      setFirstSelected(id);
      setMatchPairs(prev => prev.map(pair => 
        pair.id === id ? { ...pair, isSelected: true } : pair
      ));
    } else {
      const firstWord = matchPairs.find(pair => pair.id === firstSelected)?.word;
      const secondWord = matchPairs.find(pair => pair.id === id)?.word;
      
      if (firstWord && secondWord && firstWord.rank === secondWord.rank) {
        setMatchPairs(prev => prev.map(pair => 
          pair.id === id || pair.id === firstSelected
            ? { ...pair, isMatched: true, isSelected: false }
            : pair
        ));
        
        setScore(prev => prev + 5);
        setStreak(prev => prev + 1);
        markAsLearned(firstWord.rank);
        
        toast({
          title: "Дуруст!",
          description: "Шумо ҷуфтро дуруст пайдо кардед!",
        });
      setMatchPairs(prev => prev.map(pair => 
        pair.id === id ? { ...pair, isSelected: true } : pair
      ));
    } else {
      const firstWord = matchPairs.find(pair => pair.id === firstSelected)?.word;
      const secondWord = matchPairs.find(pair => pair.id === id)?.word;
      
      if (firstWord && secondWord && firstWord.rank === secondWord.rank) {
        setMatchPairs(prev => prev.map(pair => 
          pair.id === id || pair.id === firstSelected
            ? { ...pair, isMatched: true, isSelected: false }
            : pair
        ));
        
        setScore(prev => prev + 5);
        setStreak(prev => prev + 1);
        markAsLearned(firstWord.rank);
        
        toast({
          title: "Дуруст!",
          description: "Шумо ҷуфтро дуруст пайдо кардед!",
        });
      } else {
        setMatchPairs(prev => prev.map(pair => 
          pair.id === id || pair.id === firstSelected
            ? { ...pair, isSelected: false }
            : pair
        ));
        
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
    
    if (input.toLowerCase() === studyWords[currentWordIndex].translation_tajik.toLowerCase()) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
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
    if (!isListening) {
      setIsListening(true);
      // Here you would implement text-to-speech for the word
      // For now, we'll just simulate it with a timeout
      setTimeout(() => {
        setIsListening(false);
      }, 2000);
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
    
    if (input.toLowerCase() === studyWords[currentWordIndex].translation_tajik.toLowerCase()) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
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
    if (!isListening) {
      setIsListening(true);
      // Here you would implement text-to-speech for the word
      // For now, we'll just simulate it with a timeout
      setTimeout(() => {
        setIsListening(false);
      }, 2000);
    }
  };
  
  // Reset game
  // Reset game
  const resetGame = () => {
    initializeStudyWords(words);
    setTimer(0);
    setIsTimerRunning(false);
    setTimer(0);
    setIsTimerRunning(false);
  };
  
  // Change game mode
  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode);
    initializeStudyWords(words);
    initializeStudyWords(words);
  };
  
  // Change difficulty
  const changeDifficulty = (newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    initializeStudyWords(words);
    initializeStudyWords(words);
  };
  
  // Calculate progress
  // Calculate progress
  const calculateProgress = () => {
    if (words.length === 0) return 0;
    return (wordsLearned.length / words.length) * 100;
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    if (words.length === 0) return 0;
    return (wordsLearned.length / words.length) * 100;
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
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Омӯзиши калимаҳои Қуръонӣ"
        description="Омӯзиши калимаҳои Қуръонӣ бо роҳи бозиҳои гуногун"
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Омӯзиши калимаҳои Қуръонӣ"
        description="Омӯзиши калимаҳои Қуръонӣ бо роҳи бозиҳои гуногун"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex gap-2 items-center">
                  <Home className="h-4 w-4" />
                  <span>Асосӣ</span>
                </Button>
              </Link>
              <Link href="/learn-words">
                <Button variant="ghost" size="sm" className="flex gap-2 items-center">
                  <Book className="h-4 w-4" />
                  <span>Омӯзиши калимаҳо</span>
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span className="text-sm">{formatTime(timer)}</span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex gap-2 items-center">
                  <Home className="h-4 w-4" />
                  <span>Асосӣ</span>
                </Button>
              </Link>
              <Link href="/learn-words">
                <Button variant="ghost" size="sm" className="flex gap-2 items-center">
                  <Book className="h-4 w-4" />
                  <span>Омӯзиши калимаҳо</span>
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span className="text-sm">{formatTime(timer)}</span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Танзимот</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-translation">Нишон додани тарҷума</Label>
                      <Switch
                        id="show-translation"
                        checked={showTranslation}
                        onCheckedChange={setShowTranslation}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audio-enabled">Садо</Label>
                      <Switch
                        id="audio-enabled"
                        checked={audioEnabled}
                        onCheckedChange={setAudioEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="difficulty">Дараҷаи мушкилӣ</Label>
                      <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => changeDifficulty(e.target.value as GameDifficulty)}
                        className="px-2 py-1 rounded-md border"
                      >
                        <option value="beginner">Омӯзгор</option>
                        <option value="intermediate">Миёна</option>
                        <option value="advanced">Пешрафта</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="word-count">Теъдоди калимаҳо</Label>
                      <select
                        id="word-count"
                        value={wordCount}
                        onChange={(e) => setWordCount(parseInt(e.target.value))}
                        className="px-2 py-1 rounded-md border"
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setWordsLearned([]);
                        setScore(0);
                        setStreak(0);
                        setTimer(0);
                        localStorage.removeItem('wordsLearned');
                        toast({
                          title: "Боркушоӣ",
                          description: "Пешрафти шумо бозсозӣ шуд!",
                        });
                      }}
                    >
                      Бозсозӣ кардани пешрафт
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Маълумот</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Калимаҳои омӯхташуда:</span>
                      <span className="font-bold">{wordsLearned.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ҳамагӣ калимаҳо:</span>
                      <span className="font-bold">{words.length}</span>
                    </div>
                    <Progress value={calculateProgress()} className="w-full" />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container max-w-3xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Омӯзиши калимаҳои Қуръонӣ</h1>
          <p className="text-muted-foreground text-sm md:text-base mb-4">
            Омӯзиши калимаҳои Қуръонӣ бо роҳи бозиҳои гуногун
          </p>
          
          <Tabs defaultValue="flashcards" value={gameMode} onValueChange={(value) => changeGameMode(value as GameMode)}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="flashcards">Флеш-картҳо</TabsTrigger>
              <TabsTrigger value="quiz">Саволҳо</TabsTrigger>
              <TabsTrigger value="match">Ҷуфткунӣ</TabsTrigger>
              <TabsTrigger value="typing">Навиштан</TabsTrigger>
              <TabsTrigger value="listening">Гушидан</TabsTrigger>
            </TabsList>
            
            <TabsContent value="flashcards" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Танзимот</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-translation">Нишон додани тарҷума</Label>
                      <Switch
                        id="show-translation"
                        checked={showTranslation}
                        onCheckedChange={setShowTranslation}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audio-enabled">Садо</Label>
                      <Switch
                        id="audio-enabled"
                        checked={audioEnabled}
                        onCheckedChange={setAudioEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="difficulty">Дараҷаи мушкилӣ</Label>
                      <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => changeDifficulty(e.target.value as GameDifficulty)}
                        className="px-2 py-1 rounded-md border"
                      >
                        <option value="beginner">Омӯзгор</option>
                        <option value="intermediate">Миёна</option>
                        <option value="advanced">Пешрафта</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="word-count">Теъдоди калимаҳо</Label>
                      <select
                        id="word-count"
                        value={wordCount}
                        onChange={(e) => setWordCount(parseInt(e.target.value))}
                        className="px-2 py-1 rounded-md border"
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setWordsLearned([]);
                        setScore(0);
                        setStreak(0);
                        setTimer(0);
                        localStorage.removeItem('wordsLearned');
                        toast({
                          title: "Боркушоӣ",
                          description: "Пешрафти шумо бозсозӣ шуд!",
                        });
                      }}
                    >
                      Бозсозӣ кардани пешрафт
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Маълумот</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Калимаҳои омӯхташуда:</span>
                      <span className="font-bold">{wordsLearned.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ҳамагӣ калимаҳо:</span>
                      <span className="font-bold">{words.length}</span>
                    </div>
                    <Progress value={calculateProgress()} className="w-full" />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container max-w-3xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Омӯзиши калимаҳои Қуръонӣ</h1>
          <p className="text-muted-foreground text-sm md:text-base mb-4">
            Омӯзиши калимаҳои Қуръонӣ бо роҳи бозиҳои гуногун
          </p>
          
          <Tabs defaultValue="flashcards" value={gameMode} onValueChange={(value) => changeGameMode(value as GameMode)}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="flashcards">Флеш-картҳо</TabsTrigger>
              <TabsTrigger value="quiz">Саволҳо</TabsTrigger>
              <TabsTrigger value="match">Ҷуфткунӣ</TabsTrigger>
              <TabsTrigger value="typing">Навиштан</TabsTrigger>
              <TabsTrigger value="listening">Гушидан</TabsTrigger>
            </TabsList>
            
            <TabsContent value="flashcards" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{score}</span>
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Зарб:</span>
                    <span className="font-bold">{streak}</span>
                    <span className="text-sm">Зарб:</span>
                    <span className="font-bold">{streak}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExample(!showExample)}
                >
                  {showExample ? "Пинҳон кардани мисол" : "Нишон додани мисол"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExample(!showExample)}
                >
                  {showExample ? "Пинҳон кардани мисол" : "Нишон додани мисол"}
                </Button>
              </div>
              
              <motion.div
                className="relative"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ perspective: "1000px" }}
              >
                <Card
                  className={cn(
                    "w-full cursor-pointer transition-all duration-300",
                    isFlipped ? "rotate-y-180" : ""
                  )}
                  onClick={flipCard}
                >
                  <CardContent className="p-6">
                    <div className={cn(
                      "absolute inset-0 backface-hidden p-6",
                      isFlipped ? "hidden" : "block"
                    )}>
                      <div className="text-center space-y-4">
                        <div className="text-3xl md:text-4xl font-arabic">
                          {studyWords[currentWordIndex]?.word}
                        </div>
                        {showTranslation && (
                          <div className="text-lg text-muted-foreground">
                            {studyWords[currentWordIndex]?.transliteration_tajik}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={cn(
                      "absolute inset-0 backface-hidden p-6 rotate-y-180",
                      isFlipped ? "block" : "hidden"
                    )}>
                      <div className="text-center space-y-4">
                        <div className="text-xl font-bold">
                          {studyWords[currentWordIndex]?.translation_tajik}
                        </div>
                        {showExample && (
                          <div className="space-y-2 text-sm">
                            <div className="text-right font-arabic">
                              {studyWords[currentWordIndex]?.example}
                            </div>
                            <div className="text-muted-foreground">
                              {studyWords[currentWordIndex]?.example_transliteration}
                            </div>
                            <div>
                              {studyWords[currentWordIndex]?.example_translation}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {studyWords[currentWordIndex]?.reference}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  {currentWordIndex + 1} аз {studyWords.length}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant={wordsLearned.includes(studyWords[currentWordIndex]?.rank) ? "secondary" : "default"}
                  onClick={() => markAsLearned(studyWords[currentWordIndex]?.rank)}
                >
                  {wordsLearned.includes(studyWords[currentWordIndex]?.rank) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Омӯхта шудааст
                    </>
                  ) : (
                    "Омӯхта шуд"
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="quiz" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{score}</span>
              <motion.div
                className="relative"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ perspective: "1000px" }}
              >
                <Card
                  className={cn(
                    "w-full cursor-pointer transition-all duration-300",
                    isFlipped ? "rotate-y-180" : ""
                  )}
                  onClick={flipCard}
                >
                  <CardContent className="p-6">
                    <div className={cn(
                      "absolute inset-0 backface-hidden p-6",
                      isFlipped ? "hidden" : "block"
                    )}>
                      <div className="text-center space-y-4">
                        <div className="text-3xl md:text-4xl font-arabic">
                          {studyWords[currentWordIndex]?.word}
                        </div>
                        {showTranslation && (
                          <div className="text-lg text-muted-foreground">
                            {studyWords[currentWordIndex]?.transliteration_tajik}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={cn(
                      "absolute inset-0 backface-hidden p-6 rotate-y-180",
                      isFlipped ? "block" : "hidden"
                    )}>
                      <div className="text-center space-y-4">
                        <div className="text-xl font-bold">
                          {studyWords[currentWordIndex]?.translation_tajik}
                        </div>
                        {showExample && (
                          <div className="space-y-2 text-sm">
                            <div className="text-right font-arabic">
                              {studyWords[currentWordIndex]?.example}
                            </div>
                            <div className="text-muted-foreground">
                              {studyWords[currentWordIndex]?.example_transliteration}
                            </div>
                            <div>
                              {studyWords[currentWordIndex]?.example_translation}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {studyWords[currentWordIndex]?.reference}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  {currentWordIndex + 1} аз {studyWords.length}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant={wordsLearned.includes(studyWords[currentWordIndex]?.rank) ? "secondary" : "default"}
                  onClick={() => markAsLearned(studyWords[currentWordIndex]?.rank)}
                >
                  {wordsLearned.includes(studyWords[currentWordIndex]?.rank) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Омӯхта шудааст
                    </>
                  ) : (
                    "Омӯхта шуд"
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="quiz" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Зарб:</span>
                    <span className="font-bold">{streak}</span>
                  </div>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-3xl md:text-4xl font-arabic">
                      {studyWords[currentWordIndex]?.word}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {studyWords[currentWordIndex]?.transliteration_tajik}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {quizOptions.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          selectedAnswer === index
                            ? option.rank === studyWords[currentWordIndex].rank
                              ? "default"
                              : "destructive"
                            : "outline"
                        }
                        className="h-auto py-4"
                        onClick={() => checkAnswer(index)}
                        disabled={selectedAnswer !== null}
                      >
                        {option.translation_tajik}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  {currentWordIndex + 1} аз {studyWords.length}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="match" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Зарб:</span>
                    <span className="font-bold">{streak}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {matchPairs.map((pair) => (
                  <Button
                    key={pair.id}
                    variant={
                      pair.isMatched
                        ? "default"
                        : pair.isSelected
                        ? "secondary"
                        : "outline"
                    }
                    className="h-auto py-4"
                    onClick={() => handleMatchSelection(pair.id)}
                    disabled={pair.isMatched}
                  >
                    {pair.id % 2 === 0 ? (
                      <div className="text-xl font-arabic">
                        {pair.word.word}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Зарб:</span>
                    <span className="font-bold">{streak}</span>
                  </div>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-3xl md:text-4xl font-arabic">
                      {studyWords[currentWordIndex]?.word}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {studyWords[currentWordIndex]?.transliteration_tajik}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {quizOptions.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          selectedAnswer === index
                            ? option.rank === studyWords[currentWordIndex].rank
                              ? "default"
                              : "destructive"
                            : "outline"
                        }
                        className="h-auto py-4"
                        onClick={() => checkAnswer(index)}
                        disabled={selectedAnswer !== null}
                      >
                        {option.translation_tajik}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  {currentWordIndex + 1} аз {studyWords.length}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="match" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Зарб:</span>
                    <span className="font-bold">{streak}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {matchPairs.map((pair) => (
                  <Button
                    key={pair.id}
                    variant={
                      pair.isMatched
                        ? "default"
                        : pair.isSelected
                        ? "secondary"
                        : "outline"
                    }
                    className="h-auto py-4"
                    onClick={() => handleMatchSelection(pair.id)}
                    disabled={pair.isMatched}
                  >
                    {pair.id % 2 === 0 ? (
                      <div className="text-xl font-arabic">
                        {pair.word.word}
                      </div>
                    ) : (
                      <div>
                        {pair.word.translation_tajik}
                      </div>
                    )}
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => generateMatchPairs()}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Аз нав
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="typing" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{score}</span>
                    ) : (
                      <div>
                        {pair.word.translation_tajik}
                      </div>
                    )}
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => generateMatchPairs()}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Аз нав
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="typing" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Зарб:</span>
                    <span className="font-bold">{streak}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Зарб:</span>
                    <span className="font-bold">{streak}</span>
                  </div>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-3xl md:text-4xl font-arabic">
                      {studyWords[currentWordIndex]?.word}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {studyWords[currentWordIndex]?.transliteration_tajik}
                    </div>
                    
                    <div className="mt-6">
                      <input
                        type="text"
                        value={typingInput}
                        onChange={handleTyping}
                        placeholder="Тарҷумаи калимаро нависед..."
                        className="w-full px-4 py-2 rounded-md border"
                        autoFocus
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  {currentWordIndex + 1} аз {studyWords.length}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="listening" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Зарб:</span>
                    <span className="font-bold">{streak}</span>
                  </div>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-16 w-16"
                      onClick={handleListening}
                      disabled={isListening}
                    >
                      <Volume2 className="h-8 w-8" />
                    </Button>
                    
                    <div className="mt-6">
                      <input
                        type="text"
                        value={typingInput}
                        onChange={handleTyping}
                        placeholder="Калимаи гӯшидашударо нависед..."
                        className="w-full px-4 py-2 rounded-md border"
                        autoFocus
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  {currentWordIndex + 1} аз {studyWords.length}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWord('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
