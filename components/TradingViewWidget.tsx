'use client';

import React, { memo, useMemo, useState } from 'react';
import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import {cn} from "@/lib/utils";
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';

interface TradingViewWidgetProps {
    title?: string;
    scriptUrl?: string;
    config?: Record<string, unknown>;
    symbol?: string;
    interval?: string;
    theme?: 'light' | 'dark';
    locale?: string;
    height?: number;
    className?: string;
}

const ADVANCED_CHART_SCRIPT_URL = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';

const TradingViewWidget = ({
    title,
    scriptUrl,
    config,
    symbol = 'NASDAQ:AAPL',
    interval = 'D',
    theme = 'dark',
    locale = 'en',
    height = 600,
    className
}: TradingViewWidgetProps) => {
    const [reloadToken, setReloadToken] = useState(0);
    const resolvedScriptUrl = scriptUrl || ADVANCED_CHART_SCRIPT_URL;

    const resolvedConfig = useMemo<Record<string, unknown>>(() => {
        if (config) return config;

        return {
            allow_symbol_change: true,
            calendar: false,
            details: true,
            hide_side_toolbar: true,
            hide_top_toolbar: false,
            hide_legend: false,
            hide_volume: false,
            hotlist: false,
            interval,
            locale,
            save_image: false,
            style: 1,
            symbol: symbol.toUpperCase(),
            theme,
            timezone: 'Etc/UTC',
            backgroundColor: '#141414',
            gridColor: '#141414',
            watchlist: [],
            withdateranges: false,
            compareSymbols: [],
            studies: [],
            width: '100%',
            height,
        };
    }, [config, height, interval, locale, symbol, theme]);

    const { containerRef, loading, error } = useTradingViewWidget(resolvedScriptUrl, resolvedConfig, height, reloadToken);

    return (
        <div className="w-full">
            {title && <h3 className="font-semibold text-2xl text-gray-100 mb-5">{title}</h3>}
            <div className={cn('relative', className)} style={{ minHeight: height }}>
                <div
                    ref={containerRef}
                    className="tradingview-widget-container h-full w-full"
                    style={{ height }}
                />
                {loading && (
                    <div className="absolute inset-0 z-20">
                        <LoadingSpinner label="Loading market data..." className="h-full py-0" />
                    </div>
                )}
                {error && !loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/80 px-4">
                        <div className="rounded-md border border-red-500/40 bg-gray-800 p-4 text-center">
                            <p className="text-sm text-red-300">{error}</p>
                            <Button
                                type="button"
                                onClick={() => setReloadToken((current) => current + 1)}
                                className="mt-3 h-8 bg-violet-500 px-3 text-xs text-violet-950 hover:bg-violet-400"
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(TradingViewWidget);
