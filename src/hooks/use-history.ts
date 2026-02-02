'use client';

import { useState, useEffect, useCallback } from 'react';

export type HistoryItem = {
  id: string;
  tool: string;
  timestamp: string;
  data: {
    originalImage?: string;
    enhancedImage?: string;
    compressedImage?: string;
    convertedImage?: string;
    originalSize?: number;
    compressedSize?: number;
    inputText?: string;
    humanizedText?: string;
    qrCodeText?: string;
    qrCodeImage?: string;
    originalFormat?: string;
    targetFormat?: string;
    videoFileName?: string;
    videoFileSize?: number;
    extractedAudio?: string;
    fileType?: string;
  };
};

const HISTORY_STORAGE_KEY = 'tool-daddy-history';
// Set a reasonable size limit for what can be stored in history (e.g., 2MB)
const MAX_ITEM_SIZE_BYTES = 2 * 1024 * 1024;


export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load history from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
      const newItem: HistoryItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      
      // Sanitize the new item to prevent storing excessively large data URLs
      if (newItem.data.originalImage && newItem.data.originalImage.length > MAX_ITEM_SIZE_BYTES) delete newItem.data.originalImage;
      if (newItem.data.enhancedImage && newItem.data.enhancedImage.length > MAX_ITEM_SIZE_BYTES) delete newItem.data.enhancedImage;
      if (newItem.data.compressedImage && newItem.data.compressedImage.length > MAX_ITEM_SIZE_BYTES) delete newItem.data.compressedImage;
      if (newItem.data.convertedImage && newItem.data.convertedImage.length > MAX_ITEM_SIZE_BYTES) delete newItem.data.convertedImage;
      
      // Specifically do not store audio/video data in history
      if (newItem.tool.toLowerCase().includes('video')) {
          delete newItem.data.extractedAudio;
      }
      
      const updatedHistory = [newItem, ...history].slice(0, 20); // Keep history to a reasonable size
      setHistory(updatedHistory);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save history to localStorage', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          // If storage is full, try clearing the oldest item and retrying
          try {
            const prunedHistory = history.slice(0, history.length - 1);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(prunedHistory));
            addToHistory(item); // Retry adding
          } catch (e) {
            console.error('Failed to prune history', e);
          }
      }
    }
  }, [history]);

  const clearHistory = useCallback(() => {
    try {
      setHistory([]);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear history from localStorage', error);
    }
  }, []);

  return { history, isLoaded, addToHistory, clearHistory };
}
