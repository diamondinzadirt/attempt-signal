'use client';

import { memo, useMemo } from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';

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

  return (
    <div className="tradingview-widget-container w-full">
      <TradingViewWidget
        scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-tickers.js"
        config={tickerConfig}
        className={className}
        height={height}
      />
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
