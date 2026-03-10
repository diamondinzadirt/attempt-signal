'use client';

import { memo, useEffect, useMemo, useRef } from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';
import { cn } from '@/lib/utils';

interface TickerTapeWidgetProps {
  symbols?: Array<{
    proName: string;
    title: string;
  }>;
  theme?: 'dark' | 'light';
  locale?: string;
  height?: number;
  className?: string;
}

const DEFAULT_SYMBOLS = [
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500 Index' },
  { proName: 'FOREXCOM:NSXUSD', title: 'US 100 Cash CFD' },
  { proName: 'FX_IDC:EURUSD', title: 'EUR to USD' },
  { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
  { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
];

const TickerTapeWidget = ({
  symbols = DEFAULT_SYMBOLS,
  theme = 'light',
  locale = 'en',
  height = 32,
  className,
}: TickerTapeWidgetProps) => {
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);

  const tickerConfig = useMemo<Record<string, unknown>>(
    () => ({
      symbols,
      colorTheme: theme,
      locale,
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
    }),
    [symbols, theme, locale]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const track = mobileTrackRef.current;
    if (!track) return;

    const mobileMediaQuery = window.matchMedia('(max-width: 767px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!mobileMediaQuery.matches || reducedMotionQuery.matches) return;

    let rafId = 0;
    let lastFrameTime = 0;
    let direction: 1 | -1 = 1;
    let pauseUntil = 0;

    const speedPxPerSec = 28;
    const edgePauseMs = 900;
    const userPauseMs = 2500;

    const pauseForUserInteraction = () => {
      pauseUntil = performance.now() + userPauseMs;
    };

    const animate = (timestamp: number) => {
      const el = mobileTrackRef.current;
      if (!el) return;

      const maxScroll = Math.max(el.scrollWidth - el.clientWidth, 0);
      if (maxScroll <= 1) {
        rafId = window.requestAnimationFrame(animate);
        return;
      }

      if (!lastFrameTime) {
        lastFrameTime = timestamp;
      }

      const deltaMs = timestamp - lastFrameTime;
      lastFrameTime = timestamp;

      if (timestamp >= pauseUntil) {
        const nextScroll = el.scrollLeft + direction * speedPxPerSec * (deltaMs / 1000);

        if (nextScroll >= maxScroll) {
          el.scrollLeft = maxScroll;
          direction = -1;
          pauseUntil = timestamp + edgePauseMs;
        } else if (nextScroll <= 0) {
          el.scrollLeft = 0;
          direction = 1;
          pauseUntil = timestamp + edgePauseMs;
        } else {
          el.scrollLeft = nextScroll;
        }
      }

      rafId = window.requestAnimationFrame(animate);
    };

    const restartAnimation = () => {
      window.cancelAnimationFrame(rafId);
      lastFrameTime = 0;
      rafId = window.requestAnimationFrame(animate);
    };

    track.addEventListener('touchstart', pauseForUserInteraction, { passive: true });
    track.addEventListener('wheel', pauseForUserInteraction, { passive: true });
    track.addEventListener('pointerdown', pauseForUserInteraction, { passive: true });
    window.addEventListener('resize', restartAnimation);

    restartAnimation();

    return () => {
      window.cancelAnimationFrame(rafId);
      track.removeEventListener('touchstart', pauseForUserInteraction);
      track.removeEventListener('wheel', pauseForUserInteraction);
      track.removeEventListener('pointerdown', pauseForUserInteraction);
      window.removeEventListener('resize', restartAnimation);
    };
  }, []);

  return (
    <div className="ticker-tape-widget tradingview-widget-container w-full">
      <div ref={mobileTrackRef} className={cn('w-full ticker-mobile-track', className)}>
        <TradingViewWidget
          scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-tickers.js"
          config={tickerConfig}
          className="w-full"
          height={height}
        />
      </div>
      <div className="tradingview-widget-copyright mt-1 text-xs text-gray-400">
        <a
          href="https://www.tradingview.com/markets/"
          rel="noopener nofollow"
          target="_blank"
          className="text-blue-400"
        >
          Markets today
        </a>
        <span className="ml-1">by TradingView</span>
      </div>
    </div>
  );
};

export default memo(TickerTapeWidget);
