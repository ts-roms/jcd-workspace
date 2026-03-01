import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  onIdle: () => void;
  onWarning?: () => void; // Called when warning time is reached
  idleTime: number; // in milliseconds
  warningTime?: number; // in milliseconds before idle (e.g., 60000 for 1 minute)
  enabled?: boolean;
}

/**
 * Hook to track user idle time and trigger a callback when idle
 * Tracks mouse movements, clicks, keyboard events, touch events, and scroll events
 */
export function useIdleTimeout({ onIdle, onWarning, idleTime, warningTime, enabled = true }: UseIdleTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set new timeouts only if enabled
    if (enabled) {
      // Set warning timeout if warningTime is provided
      if (warningTime && onWarning && warningTime < idleTime) {
        warningTimeoutRef.current = setTimeout(() => {
          onWarning();
        }, idleTime - warningTime);
      }

      // Set idle timeout
      timeoutRef.current = setTimeout(() => {
        onIdle();
      }, idleTime);
    }
  }, [onIdle, onWarning, idleTime, warningTime, enabled]);

  useEffect(() => {
    if (!enabled) {
      // Clear timeouts if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      return;
    }

    // List of events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [resetTimer, enabled]);

  return {
    resetTimer,
    getLastActivityTime: () => lastActivityRef.current,
  };
}
