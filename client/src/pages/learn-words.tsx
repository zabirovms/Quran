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
  const [studyWords, setStudyWords] = useState<QuranWord[]>([]);
  const [typingInput, setTypingInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedWord, setSelectedWord] = useState<QuranWord | null>(null);
  
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
    const savedWordsLearned = localStorage.getItem('wordsLearned');
    const savedDifficulty = localStorage.getItem('wordsDifficulty');
    const savedWordCount = localStorage.getItem('wordsCount');
    const savedTimer = localStorage.getItem('wordsTimer');
    
    if (savedWordsLearned) setWordsLearned(JSON.parse(savedWordsLearned));
    if (savedDifficulty) setDifficulty(savedDifficulty as GameDifficulty);
    if (savedWordCount) setWordCount(parseInt(savedWordCount));
    if (savedTimer) setTimer(parseInt(savedTimer));
    
    // Initialize audio element
    audioRef.current = new Audio();
    
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
  }, [isTimerRunning]);
  
  // Initialize study words based on difficulty and word count
  const initializeStudyWords = (allWords: QuranWord[]) => {
    let wordPool: QuranWord[] = [];
    
    switch(difficulty) {
      case 'beginner':
        wordPool = allWords.slice(0, 33);
        break;
      case 'intermediate':
        wordPool = allWords.slice(0, 66);
        break;
      case 'advanced':
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
    
    const isCorrect = quizOptions[index].rank === studyWords[currentWordIndex].rank;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      markAsLearned(studyWords[currentWordIndex].rank);
      
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
  };
  
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
  const resetGame = () => {
    initializeStudyWords(words);
    setTimer(0);
    setIsTimerRunning(false);
  };
  
  // Change game mode
  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode);
    initializeStudyWords(words);
  };
  
  // Change difficulty
  const changeDifficulty = (newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    initializeStudyWords(words);
  };
  
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
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Learn Quranic Words
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master the most frequently used words in the Quran through interactive learning modes
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Words Learned</p>
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
                <p className="text-sm text-muted-foreground">Study Time</p>
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
                <p className="text-sm text-muted-foreground">Current Streak</p>
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
                <p className="text-sm text-muted-foreground">Best Streak</p>
                <p className="text-2xl font-bold">{streak}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(value) => changeDifficulty(value as GameDifficulty)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Easy (10 words)</SelectItem>
                  <SelectItem value="intermediate">Medium (20 words)</SelectItem>
                  <SelectItem value="advanced">Hard (30 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Game Mode</Label>
              <Select
                value={gameMode}
                onValueChange={(value) => changeGameMode(value as GameMode)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flashcards">Flashcards</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="typing">Typing</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Show Translation</Label>
              <Switch
                checked={showTranslation}
                onCheckedChange={(checked) => setShowTranslation(checked)}
              />
            </div>
            <div className="space-y-2">
              <Label>Show Transliteration</Label>
              <Switch
                checked={showTranslation}
                onCheckedChange={(checked) => setShowTranslation(checked)}
              />
            </div>
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
              {gameMode === 'flashcards' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyWords.map((word, index) => (
                    <div
                      key={index}
                      className="bg-background rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedWord(word)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-2 text-right">{word.word}</h3>
                          {showTranslation && (
                            <p className="text-muted-foreground text-right">{word.transliteration_tajik}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          Rank #{word.rank}
                        </Badge>
                      </div>
                      {showTranslation && (
                        <p className="text-lg text-right">{word.translation_tajik}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {gameMode === 'quiz' && (
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
              )}
              {gameMode === 'match' && (
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
              )}
              {gameMode === 'typing' && (
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
              )}
              {gameMode === 'listening' && (
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Word Detail Dialog */}
      <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-right">{selectedWord?.word}</DialogTitle>
            {selectedWord?.transliteration_tajik && (
              <p className="text-muted-foreground text-right">{selectedWord.transliteration_tajik}</p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Translation</h4>
              <p className="text-lg text-right">{selectedWord?.translation_tajik}</p>
            </div>
            {selectedWord?.example && (
              <div>
                <h4 className="font-semibold mb-2">Example from Quran</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xl mb-2 text-right">{selectedWord.example}</p>
                  {selectedWord.example_transliteration && (
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
