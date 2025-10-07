import React, { useState, useEffect, useRef } from 'react';

const QuestionTimer = ({ 
  timeLimit = 20, 
  onTimeUp, 
  isActive = true,
  onTimeUpdate 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isRunning, setIsRunning] = useState(isActive);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Separate effect for timer reset when isActive or timeLimit changes
  useEffect(() => {
    if (isActive && timeLimit > 0) {
      startTimeRef.current = Date.now();
      setTimeRemaining(timeLimit);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isActive, timeLimit]);

  // Main timer effect
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      
      setTimeRemaining(remaining);
      
      if (onTimeUpdate) {
        onTimeUpdate(elapsed);
      }

      if (remaining <= 0) {
        console.log('Timer reached 0, calling onTimeUp');
        setIsRunning(false);
        clearInterval(intervalRef.current);
        if (onTimeUp) {
          onTimeUp();
        }
      }
    }, 100); // Update every 100ms for smooth countdown

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLimit, onTimeUp, onTimeUpdate]);

  const getProgressColor = () => {
    const percentage = (timeRemaining / timeLimit) * 100;
    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressPercentage = () => {
    return (timeRemaining / timeLimit) * 100;
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
          {timeRemaining}s
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      
      {timeRemaining <= 5 && isRunning && (
        <p className="text-center text-red-600 text-sm mt-2 font-semibold animate-pulse">
          Hurry up! ⏰
        </p>
      )}
    </div>
  );
};

export default QuestionTimer;