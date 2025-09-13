'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

const breathingCycle = [
  { text: 'Inhale', duration: 4 },
  { text: 'Hold', duration: 4 },
  { text: 'Exhale', duration: 6 },
  { text: 'Hold', duration: 2 },
];

export function MindfulBreathing() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimating) {
      timer = setTimeout(() => {
        setPhaseIndex((prevIndex) => (prevIndex + 1) % breathingCycle.length);
      }, breathingCycle[phaseIndex].duration * 1000);
    }
    return () => clearTimeout(timer);
  }, [isAnimating, phaseIndex]);

  const currentPhase = breathingCycle[phaseIndex];

  const handleToggle = () => {
    if (!isAnimating) {
      setPhaseIndex(0);
    }
    setIsAnimating(!isAnimating);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 rounded-lg bg-card h-64">
      <div className="relative flex items-center justify-center w-32 h-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="absolute text-xl font-semibold"
          >
            {isAnimating ? currentPhase.text : 'Start'}
          </motion.div>
        </AnimatePresence>
        <motion.div
          className="absolute w-full h-full rounded-full border-4 border-primary/50"
          animate={{
            scale: isAnimating && (currentPhase.text === 'Inhale' || currentPhase.text === 'Hold') ? 1.2 : 1,
          }}
          transition={{ duration: currentPhase.duration, ease: 'easeInOut' }}
        />
      </div>
      <Button onClick={handleToggle} variant="outline" size="icon" className="rounded-full">
        {isAnimating ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        <span className="sr-only">{isAnimating ? 'Pause' : 'Play'}</span>
      </Button>
    </div>
  );
}
