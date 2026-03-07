'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUserWatchlistSnapshot,
  type WatchlistSnapshot,
} from '@/lib/actions/watchlist.actions';

const EMPTY_SNAPSHOT: WatchlistSnapshot = {
  watchlist: [],
  suggestions: [],
  updatedAt: '',
};

const WATCHLIST_CACHE_KEY = 'attempt-signal:watchlist-snapshot:v1';

const getCachedSnapshot = (): WatchlistSnapshot | null => {
  if (typeof window === 'undefined') return null;

  const rawValue = window.sessionStorage.getItem(WATCHLIST_CACHE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as WatchlistSnapshot;
    if (!Array.isArray(parsed.watchlist) || !Array.isArray(parsed.suggestions)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const useWatchlistSnapshot = (refreshIntervalMs = 60_000) => {
  const cachedSnapshot = useMemo(() => getCachedSnapshot(), []);
  const hadCachedSnapshotOnInit = Boolean(cachedSnapshot);

  const [snapshot, setSnapshot] = useState<WatchlistSnapshot>(cachedSnapshot ?? EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(!hadCachedSnapshotOnInit);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadSnapshot = useCallback(async (isInitialLoad = false) => {
    try {
      const showRefreshing = !isInitialLoad || hadCachedSnapshotOnInit;

      if (isInitialLoad && !hadCachedSnapshotOnInit) setLoading(true);
      if (showRefreshing) setRefreshing(true);

      const data = await getCurrentUserWatchlistSnapshot();
      setSnapshot(data);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(WATCHLIST_CACHE_KEY, JSON.stringify(data));
      }
      setError('');
    } catch (loadError) {
      console.error('watchlist snapshot hook error:', loadError);
      setError('Unable to load your watchlist right now.');
    } finally {
      const showRefreshing = !isInitialLoad || hadCachedSnapshotOnInit;

      if (isInitialLoad && !hadCachedSnapshotOnInit) setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, [hadCachedSnapshotOnInit]);

  useEffect(() => {
    void loadSnapshot(true);

    const timer = window.setInterval(() => {
      void loadSnapshot();
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadSnapshot, refreshIntervalMs]);

  const reload = useCallback(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  return {
    snapshot,
    loading,
    refreshing,
    error,
    reload,
  };
};
