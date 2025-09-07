import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackToHomeProps {
  variant?: 'default' | 'floating' | 'minimal' | 'creative';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BackToHome({ 
  variant = 'creative',
  position = 'top-left',
  className,
  showText = true,
  size = 'md'
}: BackToHomeProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  const positionClasses = {
    'top-left': 'fixed top-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'inline': 'relative'
  };

  const renderButton = () => {
    switch (variant) {
      case 'floating':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(positionClasses[position], className)}
          >
            <Link href="/">
              <Button
                size="icon"
                className={cn(
                  "rounded-full shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white border-0",
                  sizeClasses[size]
                )}
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        );

      case 'minimal':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(positionClasses[position], className)}
          >
            <Link href="/">
              <Button
                variant="ghost"
                size={size}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4" />
                {showText && <span>Бозгашт</span>}
              </Button>
            </Link>
          </motion.div>
        );

      case 'creative':
        return (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={cn(positionClasses[position], className)}
          >
            <Link href="/">
              <Button
                size={size}
                className={cn(
                  "group relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20 dark:border-accent/20 text-primary dark:text-accent hover:text-primary dark:hover:text-accent transition-all duration-300",
                  "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-accent/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                )}
              >
                <div className="relative flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Home className="h-4 w-4" />
                  </motion.div>
                  {showText && (
                    <span className="font-medium">
                      Асосӣ
                    </span>
                  )}
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -5 }}
                    animate={{ x: 0 }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                </div>
              </Button>
            </Link>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(positionClasses[position], className)}
          >
            <Link href="/">
              <Button
                variant="outline"
                size={size}
                className="flex items-center gap-2 hover:bg-primary/10 hover:border-primary/30"
              >
                <Home className="h-4 w-4" />
                {showText && <span>Асосӣ</span>}
              </Button>
            </Link>
          </motion.div>
        );
    }
  };

  return renderButton();
}
