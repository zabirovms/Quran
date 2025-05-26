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
import { Home, ChevronLeft, ChevronRight, Check, X, Award, Settings, Info, RefreshCw, Book, Shuffle, Moon, Sun, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import SeoHead from '@/components/shared/SeoHead';
import { useToast } from '@/hooks/use-toast';

interface QuranWord {
  rank: number;
  word: string;
  frequency: number;
  translation_tajik: string;
}

// Game modes
type GameMode = 'flashcards' | 'quiz' | 'match';

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
  const [wordCount, setWordCount] = useState(20); // Default number of words to learn
  const [studyWords, setStudyWords] = useState<QuranWord[]>([]);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Load words data
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch('/top_100_words.json');
        if (!response.ok) {
          throw new Error('Failed to load Quran words');
        }
        const data = await response.json();
        setWords(data);
        
        // Initialize study words based on difficulty
        initializeStudyWords(data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Quran words:', error);
        setIsLoading(false);
      }
    };

    fetchWords();
    
    // Load saved progress from localStorage
    const savedWordsLearned = localStorage.getItem('wordsLearned');
    const savedDifficulty = localStorage.getItem('wordsDifficulty');
    const savedWordCount = localStorage.getItem('wordsCount');
    
    if (savedWordsLearned) setWordsLearned(JSON.parse(savedWordsLearned));
    if (savedDifficulty) setDifficulty(savedDifficulty as GameDifficulty);
    if (savedWordCount) setWordCount(parseInt(savedWordCount));
    
    // Initialize audio element
    audioRef.current = new Audio();
  }, []);
  
  // Initialize study words based on difficulty and word count
  const initializeStudyWords = (allWords: QuranWord[]) => {
    let wordPool: QuranWord[] = [];
    
    switch(difficulty) {
      case 'beginner':
        wordPool = allWords.slice(0, 33); // Top 33 words
        break;
      case 'intermediate':
        wordPool = allWords.slice(0, 66); // Top 66 words
        break;
      case 'advanced':
        wordPool = allWords; // All 100 words
        break;
    }
    
    // Shuffle and take the requested number of words
    const shuffled = [...wordPool].sort(() => Math.random() - 0.5);
    setStudyWords(shuffled.slice(0, wordCount));
    
    // Reset game state
    setCurrentWordIndex(0);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
    setGameCompleted(false);
    
    // Initialize quiz or match game if needed
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
    
    // Get 3 random incorrect options
    const otherWords = wordsList.filter(w => w.rank !== correctWord.rank);
    const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
    options = [...options, ...shuffled.slice(0, 3)];
    
    // Shuffle options
    setQuizOptions(options.sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
    setRevealAnswers(false);
  };
  
  // Generate pairs for matching game
  const generateMatchPairs = (wordsList: QuranWord[] = studyWords) => {
    if (wordsList.length === 0) return;
    
    // Take first 8 words for the match game
    const gameWords = wordsList.slice(0, 8);
    
    // Create pairs (word and translation)
    const pairs: {id: number, word: QuranWord, isMatched: boolean, isSelected: boolean}[] = [];
    
    gameWords.forEach((word, index) => {
      // Add the Arabic word
      pairs.push({
        id: index * 2,
        word,
        isMatched: false,
        isSelected: false
      });
      
      // Add the translation
      pairs.push({
        id: index * 2 + 1,
        word,
        isMatched: false,
        isSelected: false
      });
    });
    
    // Shuffle the pairs
    setMatchPairs(pairs.sort(() => Math.random() - 0.5));
    setFirstSelected(null);
  };
  
  // Handle card flip in flashcard mode
  const flipCard = () => {
    setIsFlipped(!isFlipped);
    
    // Play sound effect if enabled
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
      
      // Check if we've completed the full set
      if (newIndex === 0 && gameMode !== 'match') {
        setGameCompleted(true);
        // Add bonus for completing a full round
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
    
    // Generate new quiz options if in quiz mode
    if (gameMode === 'quiz') {
      generateQuizOptions(newIndex);
    }
    
    // Play sound effect if enabled
    if (audioEnabled && audioRef.current) {
      audioRef.current.src = '/sounds/card-slide.mp3';
      audioRef.current.play().catch(e => console.error('Error playing audio:', e));
    }
  };
  
  // Mark word as learned
  const markAsLearned = (rank: number) => {
    if (!wordsLearned.includes(rank)) {
      const newLearned = [...wordsLearned, rank];
      setWordsLearned(newLearned);
      setScore(prev => prev + 5);
      setStreak(prev => prev + 1);
      
      toast({
        title: "Калима омӯхта шуд!",
        description: `Шумо ${streak + 1} калимаро паиҳам омӯхтед.`,
      });
      
      // Play sound effect if enabled
      if (audioEnabled && audioRef.current) {
        audioRef.current.src = '/sounds/success.mp3';
        audioRef.current.play().catch(e => console.error('Error playing audio:', e));
      }
    }
  };
  
  // Check quiz answer
  const checkAnswer = (index: number) => {
    setSelectedAnswer(index);
    
    const isCorrect = quizOptions[index].rank === studyWords[currentWordIndex].rank;
    setRevealAnswers(true);
    
    if (isCorrect) {
      // Correct answer - increase score and streak
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      markAsLearned(studyWords[currentWordIndex].rank);
      
      // Play sound effect if enabled
      if (audioEnabled && audioRef.current) {
        audioRef.current.src = '/sounds/correct.mp3';
        audioRef.current.play().catch(e => console.error('Error playing audio:', e));
      }
    } else {
      // Wrong answer - reset streak
      setStreak(0);
      
      // Play sound effect if enabled
      if (audioEnabled && audioRef.current) {
        audioRef.current.src = '/sounds/wrong.mp3';
        audioRef.current.play().catch(e => console.error('Error playing audio:', e));
      }
    }
    
    // Auto-advance to next word after delay
    setTimeout(() => {
      navigateWord('next');
    }, 1500);
  };
  
  // Handle match game selection
  const handleMatchSelection = (id: number) => {
    // If already matched, do nothing
    if (matchPairs.find(p => p.id === id)?.isMatched) return;
    
    // Clone the current state
    const newPairs = [...matchPairs];
    const selectedPairIndex = newPairs.findIndex(p => p.id === id);
    
    // Toggle selection for this card
    newPairs[selectedPairIndex].isSelected = true;
    
    // If this is the first card selected
    if (firstSelected === null) {
      setFirstSelected(id);
    } 
    // This is the second card
    else {
      const firstPairIndex = newPairs.findIndex(p => p.id === firstSelected);
      
      // Check if it's a match (same word)
      if (newPairs[firstPairIndex].word.rank === newPairs[selectedPairIndex].word.rank) {
        // It's a match!
        newPairs[firstPairIndex].isMatched = true;
        newPairs[selectedPairIndex].isMatched = true;
        
        // Increase score and mark word as learned
        setScore(prev => prev + 15);
        markAsLearned(newPairs[firstPairIndex].word.rank);
        
        // Play sound effect if enabled
        if (audioEnabled && audioRef.current) {
          audioRef.current.src = '/sounds/match.mp3';
          audioRef.current.play().catch(e => console.error('Error playing audio:', e));
        }
        
        // Check if all pairs are matched
        const allMatched = newPairs.every(p => p.isMatched);
        if (allMatched) {
          setTimeout(() => {
            setGameCompleted(true);
            // Add completion bonus
            setScore(prev => prev + 20);
            toast({
              title: "Офарин!",
              description: "Шумо ҳама ҷуфтҳоро пайдо кардед!",
            });
          }, 500);
        }
      } else {
        // Not a match - reset streak
        setStreak(0);
        
        // Play sound effect if enabled
        if (audioEnabled && audioRef.current) {
          audioRef.current.src = '/sounds/wrong.mp3';
          audioRef.current.play().catch(e => console.error('Error playing audio:', e));
        }
        
        // Flip cards back after a delay
        setTimeout(() => {
          newPairs[firstPairIndex].isSelected = false;
          newPairs[selectedPairIndex].isSelected = false;
          setMatchPairs([...newPairs]);
        }, 1000);
      }
      
      // Reset first selection
      setFirstSelected(null);
    }
    
    setMatchPairs(newPairs);
  };
  
  // Reset game with current settings
  const resetGame = () => {
    initializeStudyWords(words);
    toast({
      title: "Бозӣ аз нав оғоз шуд",
      description: "Калимаҳо аз нав омехта шуданд.",
    });
  };
  
  // Change game mode
  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  };
  
  // Change difficulty
  const changeDifficulty = (newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (studyWords.length === 0) return 0;
    
    // Count how many words in the current study set are marked as learned
    const learnedCount = studyWords.filter(word => wordsLearned.includes(word.rank)).length;
    return Math.round((learnedCount / studyWords.length) * 100);
  };
  
  // Get current word
  const currentWord = studyWords[currentWordIndex];
  
  return (
    <>
      <SeoHead 
        title="Омӯзиши луғат | Қуръони Карим"
        description="Барномаи омӯзиши луғати арабӣ барои Қуръон бо усули бозӣ ва кортҳои омӯзишӣ"
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
                Омӯзиши луғат
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
                showTranslation={showTranslation}
                setShowTranslation={setShowTranslation}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                difficulty={difficulty}
                setDifficulty={changeDifficulty}
                wordCount={wordCount}
                setWordCount={(count) => {
                  setWordCount(count);
                  resetGame();
                }}
                resetProgress={() => {
                  setWordsLearned([]);
                  resetGame();
                }}
              />
            </div>
          </div>
        </header>
        
        <main className="flex-1 flex flex-col px-4 py-6 overflow-hidden max-w-lg mx-auto w-full">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Game Modes Tabs */}
              <Tabs value={gameMode} onValueChange={(value) => changeGameMode(value as GameMode)} className="w-full mb-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="flashcards" className="text-sm">Кортҳо</TabsTrigger>
                  <TabsTrigger value="quiz" className="text-sm">Санҷиш</TabsTrigger>
                  <TabsTrigger value="match" className="text-sm">Ҷуфткунӣ</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Score and Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{score} хол</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{calculateProgress()}%</span>
                  </div>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
              
              {/* Game Content based on mode */}
              <div className="flex-1 flex flex-col">
                {gameMode === 'flashcards' && studyWords.length > 0 && (
                  <div className="flex-1 flex flex-col">
                    {/* Word Counter */}
                    <div className="text-center mb-3">
                      <span className="text-sm text-muted-foreground">
                        {currentWordIndex + 1} аз {studyWords.length}
                      </span>
                    </div>
                    
                    {/* Flashcard */}
                    <div 
                      className="relative flex-1 flex mb-4 min-h-[250px] w-full perspective-1000"
                      onClick={flipCard}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`card-${currentWordIndex}-${isFlipped ? 'back' : 'front'}`}
                          initial={{ rotateY: isFlipped ? -90 : 90 }}
                          animate={{ rotateY: 0 }}
                          exit={{ rotateY: isFlipped ? 90 : -90 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center backface-hidden",
                            "rounded-xl p-6 border",
                            isFlipped 
                              ? "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20" 
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          )}
                        >
                          {!isFlipped ? (
                            // Front of card (Arabic)
                            <div className="text-center">
                              <p className="text-4xl font-arabic mb-4">
                                {currentWord.word}
                              </p>
                              {showTranslation && (
                                <p className="text-sm text-muted-foreground">
                                  (зер кунед барои тарҷума)
                                </p>
                              )}
                            </div>
                          ) : (
                            // Back of card (Translation)
                            <div className="text-center">
                              <p className="text-xl mb-2 font-medium">
                                {currentWord.translation_tajik}
                              </p>
                              <p className="text-sm text-muted-foreground mb-2">
                                Истифодабарӣ: {currentWord.frequency} маротиба
                              </p>
                              <p className="text-xs text-primary">
                                Калимаи №{currentWord.rank}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    
                    {/* Card Navigation */}
                    <div className="flex justify-between items-center mb-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateWord('prev')}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Пешина
                      </Button>
                      
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          markAsLearned(currentWord.rank);
                          navigateWord('next');
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Омӯхтам
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateWord('next')}
                      >
                        Оянда
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {gameMode === 'quiz' && studyWords.length > 0 && (
                  <div className="flex-1 flex flex-col">
                    {/* Question Counter */}
                    <div className="text-center mb-3">
                      <span className="text-sm text-muted-foreground">
                        Савол {currentWordIndex + 1} аз {studyWords.length}
                      </span>
                    </div>
                    
                    {/* Question */}
                    <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                      <CardContent className="p-6 text-center">
                        <h3 className="text-lg mb-1">Тарҷумаи ин калима чист?</h3>
                        <p className="text-3xl font-arabic mb-3">
                          {currentWord.word}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Answer Options */}
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      {quizOptions.map((option, index) => (
                        <Button
                          key={index}
                          variant={
                            revealAnswers
                              ? option.rank === currentWord.rank
                                ? "default"
                                : selectedAnswer === index
                                  ? "destructive"
                                  : "outline"
                              : "outline"
                          }
                          className={cn(
                            "h-auto py-3 justify-start text-left",
                            revealAnswers && option.rank === currentWord.rank && "bg-green-600 hover:bg-green-700 text-white"
                          )}
                          disabled={revealAnswers}
                          onClick={() => checkAnswer(index)}
                        >
                          <div className="flex items-center w-full">
                            <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                            <span>{option.translation_tajik}</span>
                            {revealAnswers && option.rank === currentWord.rank && (
                              <Check className="h-4 w-4 ml-auto" />
                            )}
                            {revealAnswers && selectedAnswer === index && option.rank !== currentWord.rank && (
                              <X className="h-4 w-4 ml-auto" />
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {gameMode === 'match' && (
                  <div className="flex-1 flex flex-col">
                    {/* Match Game Instructions */}
                    <div className="text-center mb-3">
                      <span className="text-sm text-muted-foreground">
                        Калимаҳои арабӣ ва тарҷумаҳои онҳоро ҷуфт кунед
                      </span>
                    </div>
                    
                    {/* Match Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {matchPairs.map((pair, index) => (
                        <div key={index} className="relative perspective-500">
                          <motion.div
                            animate={{ 
                              rotateY: pair.isSelected || pair.isMatched ? 0 : 180,
                              scale: pair.isMatched ? 0.95 : 1
                            }}
                            transition={{ duration: 0.3 }}
                            className="w-full aspect-[3/4] cursor-pointer preserve-3d"
                            onClick={() => !pair.isMatched && !pair.isSelected && handleMatchSelection(pair.id)}
                          >
                            {/* Card Front (Content) */}
                            <div className={cn(
                              "absolute inset-0 backface-hidden rounded-lg border flex items-center justify-center p-2 text-center",
                              pair.isMatched 
                                ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            )}>
                              {/* Display Arabic or Translation based on even/odd index */}
                              {pair.id % 2 === 0 ? (
                                <span className="font-arabic text-xl">{pair.word.word}</span>
                              ) : (
                                <span className="text-sm">{pair.word.translation_tajik}</span>
                              )}
                            </div>
                            
                            {/* Card Back (Hidden) */}
                            <div className="absolute inset-0 backface-hidden rotateY-180 rounded-lg border border-primary/30 bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                              <span className="text-2xl text-primary/70 dark:text-primary/50">؟</span>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Reset Match Game */}
                    {matchPairs.length > 0 && (
                      <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateMatchPairs()}
                          className="mb-4"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Аз нав омехтан
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Game Controls */}
                <div className="flex justify-center gap-3 mt-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetGame}
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    Омехтан
                  </Button>
                  
                  <InfoDialog wordsLearned={wordsLearned.length} totalWords={words.length} />
                </div>
              </div>
              
              {/* Game Completion Dialog */}
              <Dialog open={gameCompleted} onOpenChange={setGameCompleted}>
                <DialogContent className="max-w-xs sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      <span className="block text-xl mb-2">✨ Офарин! ✨</span>
                    </DialogTitle>
                    <DialogDescription className="text-center">
                      Шумо ин даврро ба итмом расондед!
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="my-4 text-center">
                    <p className="text-2xl font-bold text-primary">{score} хол</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Шумо {wordsLearned.length} калимаи Қуръонро омӯхтед
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => {
                      setGameCompleted(false);
                      resetGame();
                    }}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Аз нав
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline">
                        Идома додан
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </main>
      </div>
    </>
  );
}

// Settings dialog component
function SettingsDialog({
  showTranslation,
  setShowTranslation,
  audioEnabled,
  setAudioEnabled,
  difficulty,
  setDifficulty,
  wordCount,
  setWordCount,
  resetProgress
}: {
  showTranslation: boolean;
  setShowTranslation: (value: boolean) => void;
  audioEnabled: boolean;
  setAudioEnabled: (value: boolean) => void;
  difficulty: GameDifficulty;
  setDifficulty: (value: GameDifficulty) => void;
  wordCount: number;
  setWordCount: (value: number) => void;
  resetProgress: () => void;
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
          <DialogDescription>
            Танзимоти омӯзиши луғатро мувофиқи худ созед
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Translation toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="translation">Нишон додани тарҷума</Label>
              <p className="text-xs text-muted-foreground">
                Нишон додани ишора барои тарҷума
              </p>
            </div>
            <Switch 
              id="translation" 
              checked={showTranslation}
              onCheckedChange={setShowTranslation}
            />
          </div>
          
          {/* Audio toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="audio" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span>Садо</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Иҷозат додани садо ҳангоми бозӣ
              </p>
            </div>
            <Switch 
              id="audio" 
              checked={audioEnabled}
              onCheckedChange={setAudioEnabled}
            />
          </div>
          
          {/* Difficulty setting */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Дараҷаи душворӣ</Label>
            <div className="flex gap-2">
              <Button
                variant={difficulty === 'beginner' ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setDifficulty('beginner')}
              >
                Осон
              </Button>
              <Button
                variant={difficulty === 'intermediate' ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setDifficulty('intermediate')}
              >
                Миёна
              </Button>
              <Button
                variant={difficulty === 'advanced' ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setDifficulty('advanced')}
              >
                Душвор
              </Button>
            </div>
          </div>
          
          {/* Word count */}
          <div className="space-y-2">
            <Label htmlFor="word-count">Шумораи калимаҳо</Label>
            <div className="flex gap-2">
              {[10, 20, 30, 50].map(count => (
                <Button
                  key={count}
                  variant={wordCount === count ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setWordCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Reset progress */}
          <div className="pt-2">
            <Button 
              variant="destructive" 
              className="w-full" 
              size="sm"
              onClick={resetProgress}
            >
              Тоза кардани пешрафт
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Info dialog component
function InfoDialog({
  wordsLearned,
  totalWords
}: {
  wordsLearned: number;
  totalWords: number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-1" />
          Маълумот
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Дар бораи омӯзиши луғат</DialogTitle>
          <DialogDescription>
            Маълумот дар бораи омӯзиши луғати Қуръон
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <h4 className="text-sm font-medium mb-1">Дар бораи ин бозӣ</h4>
            <p className="text-sm text-muted-foreground">
              Ин бозӣ ба шумо имкон медиҳад, ки 100 калимаи серистеъмолтарини Қуръонро омӯзед. Ин калимаҳо 70% матни Қуръонро ташкил медиҳанд.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Пешрафти шумо</h4>
            <div className="flex items-center gap-3 mb-2">
              <Progress value={(wordsLearned / totalWords) * 100} className="h-2 flex-1" />
              <span className="text-sm">{Math.round((wordsLearned / totalWords) * 100)}%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Шумо {wordsLearned} калима аз {totalWords} калимаро омӯхтед.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Намудҳои бозӣ</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span> 
                <span><strong>Кортҳо</strong> - калимаҳоро бо кортҳои омӯзишӣ аз бар кунед</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span> 
                <span><strong>Санҷиш</strong> - дониши худро бо ҷавоб додан ба саволҳо санҷед</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span> 
                <span><strong>Ҷуфткунӣ</strong> - калимаҳоро бо тарҷумаи онҳо ҷуфт кунед</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}