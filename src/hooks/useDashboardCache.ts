import { useState, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export const useDashboardCache = () => {
  const cache = useRef<Map<string, CacheItem<any>>>(new Map());
  
  const CACHE_DURATIONS = {
    referrals: 30000, // 30 seconds
    stats: 60000, // 1 minute
    leaderboard: 300000, // 5 minutes
    milestones: 600000, // 10 minutes
  };

  const get = useCallback(<T>(key: string): T | null => {
    const item = cache.current.get(key);
    if (!item) return null;
    
    if (Date.now() > item.timestamp + item.expiry) {
      cache.current.delete(key);
      return null;
    }
    
    return item.data;
  }, []);

  const set = useCallback(<T>(key: string, data: T, type: keyof typeof CACHE_DURATIONS = 'referrals') => {
    const expiry = CACHE_DURATIONS[type];
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }, []);

  const clear = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  const invalidatePattern = useCallback((pattern: string) => {
    for (const key of cache.current.keys()) {
      if (key.includes(pattern)) {
        cache.current.delete(key);
      }
    }
  }, []);

  return { get, set, clear, invalidatePattern };
};