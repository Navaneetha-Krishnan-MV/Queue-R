import React, { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Timer, Zap } from 'lucide-react';

const QuestionTimer = ({
  timeLimit = 20,
  onTimeUp,
  isActive = true,
  onTimeUpdate
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 1000); // Convert to milliseconds
  const [isRunning, setIsRunning] = useState(isActive);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Separate effect for timer reset when isActive or timeLimit changes
  useEffect(() => {
    if (isActive && timeLimit > 0) {
      startTimeRef.current = Date.now();
      setTimeRemaining(timeLimit * 1000); // Convert to milliseconds
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isActive, timeLimit]);

  // Main timer effect with requestAnimationFrame for smoother updates
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    let lastUpdateTime = Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, (timeLimit * 1000) - elapsed);

      setTimeRemaining(remaining);

      if (onTimeUpdate) {
        onTimeUpdate(elapsed / 1000); // Pass in seconds for backward compatibility
      }

      if (remaining <= 0) {
        console.log('Timer reached 0, calling onTimeUp');
        setIsRunning(false);
        if (onTimeUp) {
          onTimeUp();
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };

    // Start the animation frame loop
    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, timeLimit, onTimeUp, onTimeUpdate]);

  const getProgressColor = () => {
    const percentage = (timeRemaining / (timeLimit * 1000)) * 100;
    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressValue = () => {
    return (timeRemaining / (timeLimit * 1000)) * 100;
  };

  // Format time to show one decimal place
  const formatTime = (ms) => {
    return (ms / 1000).toFixed(1);
  };

  const getTimerVariant = () => {
    const percentage = (timeRemaining / (timeLimit * 1000)) * 100;
    if (percentage <= 25) return 'destructive'; // Red for urgent
    if (percentage <= 50) return 'secondary'; // Yellow for warning
    return 'default'; // Green for normal
  };

  return (
    <>
     <div className="text-center">
            <Badge
              variant={getTimerVariant()}
              className={`text-sm sm:text--lg md:text-lg font-mono font-bold px-2 py-1 sm:px-3 sm:py-1 ${
                timeRemaining <= 5 ? 'animate-pulse scale-110' : ''
              }`}
              >
              <Clock className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
              {formatTime(timeRemaining)}s
            </Badge>
        </div>
      <Progress
                value={getProgressValue()}
                className="h-4"
              />
              <div className="space-y-2">
      {timeRemaining <= 5000 && isRunning && (
        <div className="flex items-center justify-center gap-2 text-red-600 text-base sm:text-sm font-bold animate-pulse">
          <Zap className="h-5 w-5 sm:h-4 sm:w-4" />
          <span>Hurry up! ⏰</span>
        </div>
      )}
      </div>
  </>
  );
};

export default QuestionTimer;