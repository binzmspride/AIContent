import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ReactNode, useEffect, useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Define different transition variants based on theme
const transitions = {
  light: {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.98,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 1.02,
      filter: 'blur(2px)',
      transition: {
        duration: 0.3,
        ease: [0.55, 0.055, 0.675, 0.19]
      }
    }
  },
  dark: {
    initial: { 
      opacity: 0, 
      x: -30,
      scale: 0.95,
      filter: 'brightness(0.7) blur(6px)'
    },
    animate: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      filter: 'brightness(1) blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.175, 0.885, 0.32, 1.275],
        staggerChildren: 0.15
      }
    },
    exit: { 
      opacity: 0, 
      x: 30,
      scale: 0.95,
      filter: 'brightness(0.4) blur(4px)',
      transition: {
        duration: 0.35,
        ease: [0.6, 0.04, 0.98, 0.335]
      }
    }
  }
};

const childVariants = {
  light: {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },
  dark: {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.175, 0.885, 0.32, 1.275]
      }
    }
  }
};

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [location] = useLocation();
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  
  const currentTransition = transitions[resolvedTheme as keyof typeof transitions] || transitions.light;

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, [location]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={currentTransition}
        className={`w-full ${className}`}
        onAnimationComplete={() => setIsVisible(true)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function AnimatedSection({ children, className = '', delay = 0 }: { 
  children: ReactNode; 
  className?: string; 
  delay?: number;
}) {
  const { resolvedTheme } = useTheme();
  const currentChildVariants = childVariants[resolvedTheme as keyof typeof childVariants] || childVariants.light;

  return (
    <motion.div
      variants={currentChildVariants}
      initial="initial"
      animate="animate"
      className={className}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </motion.div>
  );
}

export function FadeInUp({ children, className = '', delay = 0 }: { 
  children: ReactNode; 
  className?: string; 
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideInFromLeft({ children, className = '', delay = 0 }: { 
  children: ReactNode; 
  className?: string; 
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay / 1000,
        ease: [0.175, 0.885, 0.32, 1.275]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className = '', delay = 0 }: { 
  children: ReactNode; 
  className?: string; 
  delay?: number;
}) {
  const { resolvedTheme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: resolvedTheme === 'dark' ? 0.6 : 0.4, 
        delay: delay / 1000,
        ease: resolvedTheme === 'dark' ? [0.175, 0.885, 0.32, 1.275] : [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className = '' }: { 
  children: ReactNode; 
  className?: string;
}) {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: theme === 'dark' ? 0.15 : 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}