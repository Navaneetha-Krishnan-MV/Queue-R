import React, { useState, useEffect, useRef } from 'react';

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

  const getProgressPercentage = () => {
    return (timeRemaining / (timeLimit * 1000)) * 100;
  };
  
  // Format time to show one decimal place
  const formatTime = (ms) => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Time Remaining
        </span>
        <span className={`text-2xl font-bold ${
          timeRemaining <= 5 ? 'text-red-600 animate-pulse' : 'text-gray-900'
        }`}>
          {formatTime(timeRemaining)}s
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      
      {timeRemaining <= 5000 && isRunning && (
        <p className="text-center text-red-600 text-sm mt-2 font-semibold animate-pulse">
          Hurry up! ⏰
        </p>
      )}
    </div>
  );
};

export default QuestionTimer;