import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-md transition-colors hover:bg-muted"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'light' ? 1 : 0,
          rotate: theme === 'light' ? 0 : 180,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-4 w-4" />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : -180,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="h-4 w-4" />
      </motion.div>
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}