'use client';

import { lazy, Suspense } from 'react';
import LazyLoadBoundary from '@/components/LazyLoadBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';

const WatchlistPageClient = lazy(() => import('@/components/WatchlistPageClient'));

const WatchlistPage = () => {
  return (
    <LazyLoadBoundary>
      <Suspense fallback={<LoadingSpinner label="Loading watchlist..." className="min-h-[55vh]" />}>
        <WatchlistPageClient />
      </Suspense>
    </LazyLoadBoundary>
  );
};

export default WatchlistPage;
