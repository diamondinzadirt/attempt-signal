'use client';

import { lazy, Suspense } from 'react';
import LazyLoadBoundary from '@/components/LazyLoadBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';

const DashboardContent = lazy(() => import('@/components/DashboardContent'));

const Home = () => {
  return (
    <LazyLoadBoundary>
      <Suspense fallback={<LoadingSpinner label="Loading dashboard..." className="min-h-[55vh]" />}>
        <DashboardContent />
      </Suspense>
    </LazyLoadBoundary>
  );
};

export default Home;
