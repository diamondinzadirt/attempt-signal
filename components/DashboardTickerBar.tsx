'use client';

import { usePathname } from 'next/navigation';
import TickerTapeWidget from '@/components/TickerTapeWidget';

const DashboardTickerBar = () => {
  const pathname = usePathname();
  const normalizedPathname = (pathname || '/').replace(/\/+$/, '') || '/';

  if (normalizedPathname !== '/') return null;

  return (
    <div className="w-full border-b border-gray-600 bg-gray-800">
      <TickerTapeWidget className="w-full" />
    </div>
  );
};

export default DashboardTickerBar;
