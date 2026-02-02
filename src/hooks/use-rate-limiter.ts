'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const RATE_LIMIT_KEY = 'humanizer-rate-limit';
const RATE_LIMIT_COUNT = 7;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * @deprecated This hook is for client-side rate limiting and is no longer the primary enforcement mechanism for the Humanizer tool.
 * The rate limiting logic has been moved to the backend. This hook is kept for potential use in other, less critical tools but should not be used for resource protection.
 */
export function useRateLimiter() {
  const [requests, setRequests] = useState<number[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  const [resetTime, setResetTime] = useState(0);
  const isInitialized = useRef(false);

  const updateState = useCallback(() => {
    const now = Date.now();
    // Filter out requests that are outside the current time window
    const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
    
    if (requests.length !== recentRequests.length) {
        setRequests(recentRequests);
        try {
            localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentRequests));
        } catch (error) {
            console.error("Could not write to localStorage", error);
        }
    }

    if (recentRequests.length >= RATE_LIMIT_COUNT) {
      setIsLimited(true);
      const oldestRequest = recentRequests[0] || now;
      const timeToWait = RATE_LIMIT_WINDOW_MS - (now - oldestRequest);
      setResetTime(Math.ceil(timeToWait / 1000));
      return false; // Not allowed
    }
    
    setIsLimited(false);
    setResetTime(0);
    return true; // Allowed
  }, [requests]);
  
  // Load from localStorage on initial mount
  useEffect(() => {
    if (isInitialized.current) return;
    try {
      const storedTimestamps = localStorage.getItem(RATE_LIMIT_KEY);
      if (storedTimestamps) {
        const parsed = JSON.parse(storedTimestamps);
        // Basic validation
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
            setRequests(parsed);
        }
      }
    } catch (error) {
      console.error("Could not read rate limit data from localStorage", error);
    }
    isInitialized.current = true;
  }, []);


  // Periodically check and update the status
  useEffect(() => {
    const interval = setInterval(() => {
      updateState();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateState]);

  const recordRequest = useCallback(() => {
    const now = Date.now();
    const newRequests = [...requests, now];
    try {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newRequests));
    } catch (error) {
        console.error("Could not write to localStorage", error);
    }
    setRequests(newRequests);
  }, [requests]);
  
  const remaining = Math.max(0, RATE_LIMIT_COUNT - requests.length);

  return { isLimited, resetTime, recordRequest, remaining, limit: RATE_LIMIT_COUNT, checkLimit: updateState };
}
