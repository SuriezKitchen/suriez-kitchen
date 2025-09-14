import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

interface UseInactivityOptions {
  timeout: number; // in milliseconds
  onInactive: () => void;
  onWarning?: (timeLeft: number) => void;
  warningTime?: number; // in milliseconds, default 2 minutes
}

export function useInactivity({
  timeout,
  onInactive,
  onWarning,
  warningTime = 2 * 60 * 1000, // 2 minutes default
}: UseInactivityOptions) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isWarning, setIsWarning] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const [, setLocation] = useLocation();

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    setTimeLeft(null);
    setIsWarning(false);

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timeout
    if (onWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        const remainingTime = timeout - (Date.now() - lastActivityRef.current);
        setTimeLeft(remainingTime);
        setIsWarning(true);
        onWarning(remainingTime);
      }, timeout - warningTime);
    }

    // Set main timeout
    timeoutRef.current = setTimeout(() => {
      onInactive();
    }, timeout);
  };

  const handleActivity = () => {
    resetTimer();
  };

  useEffect(() => {
    // List of events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [timeout, warningTime]);

  // Update countdown every second when warning is active
  useEffect(() => {
    if (!isWarning || !timeLeft) return;

    const interval = setInterval(() => {
      const remainingTime = timeout - (Date.now() - lastActivityRef.current);
      if (remainingTime <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remainingTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWarning, timeLeft, timeout]);

  return {
    timeLeft,
    isWarning,
    resetTimer,
  };
}
