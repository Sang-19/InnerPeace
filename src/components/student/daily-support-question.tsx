'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { generatePersonalizedQuestion, PersonalizedQuestionOutput } from '@/ai/flows/personalized-support-questions';
import { submitMood } from '@/lib/actions';
import { Mood } from '@/lib/types';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type QuizData = PersonalizedQuestionOutput;

export function DailySupportQuestion() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Mood[]>([]);
  const { appUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // A simple way to check if the quiz has been taken in the current session.
    // For persistence across sessions, localStorage or Firestore would be better.
    const hasTakenQuiz = sessionStorage.getItem('dailyQuizCompleted');

    async function fetchQuiz() {
      if (appUser && !hasTakenQuiz) {
        setLoading(true);
        try {
          const result = await generatePersonalizedQuestion({ studentName: appUser.name });
          if (result && result.questions && result.questions.length > 0) {
            setQuizData(result);
            setIsOpen(true);
            setCurrentQuestionIndex(0);
            setAnswers([]);
          } else {
            // Handle cases where the AI might return no questions
            setIsOpen(false);
          }
        } catch (error) {
          console.error("Failed to generate quiz:", error);
          // Don't show a toast, fail silently to not interrupt user.
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [appUser]);

  const handleAnswer = (mood: Mood) => {
    const newAnswers = [...answers, mood];
    setAnswers(newAnswers);

    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };
  
  const calculateFinalMood = (allAnswers: Mood[]): Mood => {
    if (allAnswers.length === 0) return 'Neutral';

    const moodCounts = allAnswers.reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
    }, {} as Record<Mood, number>);

    return Object.keys(moodCounts).reduce((a, b) => moodCounts[a as Mood] > moodCounts[b as Mood] ? a : b) as Mood;
  }

  const finishQuiz = async (finalAnswers: Mood[]) => {
    const finalMood = calculateFinalMood(finalAnswers);
    setIsOpen(false);
    sessionStorage.setItem('dailyQuizCompleted', 'true');
    
    if (appUser) {
        const formData = new FormData();
        formData.append('userId', appUser.uid);
        formData.append('mood', finalMood);
        
        const result = await submitMood(formData);
        if (result.success) {
            toast({
                title: "Check-in Complete!",
                description: `We've logged your mood as: ${finalMood}. Thanks for sharing.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: "Submission failed",
                description: result.error,
            });
        }
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    // Allow the user to skip and not be shown the quiz again this session.
    sessionStorage.setItem('dailyQuizCompleted', 'true');
  }

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  
  // Don't render anything if loading, completed, or no quiz data
  if (!isOpen || loading || !quizData) {
    return null;
  }

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Daily Check-in</DialogTitle>
            {quizData && <DialogDescription>
               Question {currentQuestionIndex + 1} of {quizData.questions.length}
            </DialogDescription>}
          </DialogHeader>
          <div className="py-4">
            {currentQuestion ? (
              <div className="space-y-4">
                <p className="text-lg font-semibold text-center">{currentQuestion.question}</p>
                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-3 whitespace-normal justify-start text-left"
                      onClick={() => handleAnswer(option.mood)}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground h-40">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p>Generating your questions...</p>
                </div>
            )}
          </div>
           <DialogFooter>
             <Button variant="ghost" onClick={handleClose}>Skip for now</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
