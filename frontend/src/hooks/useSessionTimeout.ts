import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
// TODO: Import firebase auth when firebase is configured
// import { auth } from "../firebase/firebase";
// import { signOut } from "firebase/auth";

interface UseSessionTimeoutOptions {
  timeoutMinutes: number;
  warningMinutes?: number;
  onWarning?: () => void;
  onTimeout?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes,
  warningMinutes = 2,
  onWarning,
  onTimeout,
}: UseSessionTimeoutOptions) => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);
  const warningRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Convert minutes to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setShowWarning(false);
  }, []);

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    try {
      // TODO: Implement firebase signOut
      // await signOut(auth);
      console.log("Logging out user - session timeout");
      navigate("/login");
      if (onTimeout) onTimeout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [clearAllTimers, navigate, onTimeout]);

  const resetTimer = useCallback(() => {
    clearAllTimers();

    // Set warning timer
    if (warningMs < timeoutMs) {
      warningRef.current = window.setTimeout(() => {
        setShowWarning(true);
        if (onWarning) onWarning();
        
        // Start countdown interval
        const endTime = Date.now() + warningMs;
        intervalRef.current = window.setInterval(() => {
          const remaining = Math.max(0, endTime - Date.now());
          setRemainingTime(Math.ceil(remaining / 1000));
          
          if (remaining === 0 && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }, 1000);
      }, timeoutMs - warningMs);
    }

    // Set logout timer
    timeoutRef.current = window.setTimeout(() => {
      handleLogout();
    }, timeoutMs);
  }, [timeoutMs, warningMs, clearAllTimers, handleLogout, onWarning]);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    resetTimer();
  }, [resetTimer]);

  // Set up activity listeners
  useEffect(() => {
    // TODO: Check if user is authenticated when firebase is configured
    // if (!auth.currentUser) return;

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    // Add event listeners with debouncing
    let activityTimeout: number | null = null;
    const debouncedActivity = () => {
      if (activityTimeout) clearTimeout(activityTimeout);
      activityTimeout = window.setTimeout(handleActivity, 1000);
    };

    events.forEach((event) => {
      document.addEventListener(event, debouncedActivity);
    });

    // Initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, debouncedActivity);
      });
      if (activityTimeout) clearTimeout(activityTimeout);
      clearAllTimers();
    };
  }, [resetTimer, showWarning, clearAllTimers]);

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout: handleLogout,
  };
}; 