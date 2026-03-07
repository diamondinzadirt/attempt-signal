'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import WatchlistButton from '@/components/WatchlistButton';
import { cn, formatPrice } from '@/lib/utils';
import { useWatchlistSnapshot } from '@/hooks/useWatchlistSnapshot';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  type WatchlistSuggestionStock,
} from '@/lib/actions/watchlist.actions';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import { addToWatchlist, removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

const formatPercent = (value?: number) => {
  if (typeof value !== 'number') return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const formatVolume = (value?: number) => {
  if (typeof value !== 'number') return 'N/A';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
};

const getChangeColor = (value?: number) => {
  if (typeof value !== 'number') return 'text-gray-500';
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-violet-500';
};

const WatchlistPageClient = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StockWithWatchlistStatus[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [favoriteSymbols, setFavoriteSymbols] = useState<Set<string>>(new Set());
  const [pendingFavorites, setPendingFavorites] = useState<Set<string>>(new Set());
  const { snapshot, loading, refreshing, error, reload } = useWatchlistSnapshot();

  const filteredWatchlist = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return snapshot.watchlist.filter((item) => {
      const queryMatch =
        !normalizedQuery ||
        item.symbol.toLowerCase().includes(normalizedQuery) ||
        item.company.toLowerCase().includes(normalizedQuery);
      return queryMatch;
    });
  }, [snapshot.watchlist, query]);

  const updatedAtLabel = snapshot.updatedAt
    ? new Date(snapshot.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const handleWatchlistChanged = useCallback(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    setFavoriteSymbols(new Set(snapshot.watchlist.map((item) => item.symbol.toUpperCase())));
  }, [snapshot.watchlist]);

  const fetchSuggestions = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    setSuggestionLoading(true);
    try {
      const results = await searchStocks(trimmed);
      setSuggestions(results.slice(0, 8));
    } catch (suggestionError) {
      console.error('watchlist search suggestions error:', suggestionError);
      setSuggestions([]);
    } finally {
      setSuggestionLoading(false);
    }
  }, [query]);

  const debouncedFetchSuggestions = useDebounce(fetchSuggestions, 250);

  useEffect(() => {
    debouncedFetchSuggestions();
  }, [query, debouncedFetchSuggestions]);

  const handleToggleFavorite = useCallback(
    async (stock: StockWithWatchlistStatus) => {
      const symbol = stock.symbol.toUpperCase();
      if (pendingFavorites.has(symbol)) return;

      const isFavorited = favoriteSymbols.has(symbol);

      setPendingFavorites((prev) => new Set(prev).add(symbol));
      setFavoriteSymbols((prev) => {
        const next = new Set(prev);
        if (isFavorited) {
          next.delete(symbol);
        } else {
          next.add(symbol);
        }
        return next;
      });

      const response = isFavorited
        ? await removeFromWatchlist(symbol)
        : await addToWatchlist(symbol, stock.name || symbol);

      if (!response.success) {
        setFavoriteSymbols((prev) => {
          const next = new Set(prev);
          if (isFavorited) {
            next.add(symbol);
          } else {
            next.delete(symbol);
          }
          return next;
        });
        toast.error(response.message || 'Unable to update favorites');
      } else {
        reload();
      }

      setPendingFavorites((prev) => {
        const next = new Set(prev);
        next.delete(symbol);
        return next;
      });
    },
    [favoriteSymbols, pendingFavorites, reload]
  );

  const showSuggestions = Boolean(query.trim());
  const isInitialWatchlistLoad = loading && snapshot.watchlist.length === 0 && !error;

  if (isInitialWatchlistLoad) {
    return (
      <div className="watchlist-container">
        <section className="watchlist min-h-[55vh]">
          <LoadingSpinner label="Loading watchlist..." className="min-h-[50vh] py-0" />
        </section>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <section className="watchlist">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="watchlist-title">My Watchlist</h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {refreshing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Updated {updatedAtLabel}</span>
          </div>
        </div>

        <div className="w-full">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stocks..."
              className="h-11 border-gray-600 bg-gray-800 pl-10 text-gray-100 placeholder:text-gray-500 focus-visible:border-violet-500 focus-visible:ring-0"
            />

            {showSuggestions && (
              <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-md border border-gray-600 bg-gray-800 shadow-xl">
                {suggestionLoading ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching stocks...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-gray-500">No matching stocks found.</div>
                ) : (
                  <ul className="divide-y divide-gray-700">
                    {suggestions.map((stock) => {
                      const symbol = stock.symbol.toUpperCase();
                      const isFavorited = favoriteSymbols.has(symbol);
                      const isPendingFavorite = pendingFavorites.has(symbol);

                      return (
                        <li key={symbol} className="flex items-center justify-between gap-3 px-3 py-2">
                          <Link
                            href={`/stocks/${symbol}`}
                            className="min-w-0 flex-1 rounded-sm px-1 py-1 hover:bg-gray-700"
                          >
                            <p className="truncate text-sm font-semibold text-gray-100">{symbol}</p>
                            <p className="truncate text-xs text-gray-500">{stock.name}</p>
                          </Link>

                          <button
                            type="button"
                            disabled={isPendingFavorite}
                            onClick={() => {
                              void handleToggleFavorite(stock);
                            }}
                            className={cn(
                              'rounded-full p-1.5 transition-colors',
                              isFavorited ? 'text-violet-500 hover:text-violet-400' : 'text-gray-500 hover:text-violet-500',
                              isPendingFavorite && 'opacity-60'
                            )}
                            aria-label={isFavorited ? `Remove ${symbol} from favorites` : `Add ${symbol} to favorites`}
                            title={isFavorited ? 'Unfavorite' : 'Favorite'}
                          >
                            <Star className="h-4 w-4" fill={isFavorited ? 'currentColor' : 'none'} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="watchlist-table">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full">
              <thead>
                <tr className="table-header-row">
                  <th className="table-header px-4 py-3 text-left text-sm font-semibold">Stock</th>
                  <th className="table-header px-4 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="table-header px-4 py-3 text-left text-sm font-semibold">Change</th>
                  <th className="table-header px-4 py-3 text-left text-sm font-semibold">Volume</th>
                  <th className="table-header px-4 py-3 text-right text-sm font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="table-row">
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading watchlist...
                      </span>
                    </td>
                  </tr>
                ) : filteredWatchlist.length > 0 ? (
                  filteredWatchlist.map((stock) => (
                    <tr key={stock.symbol} className="table-row">
                      <td className="table-cell px-4 py-4">
                        <Link href={`/stocks/${stock.symbol}`} className="flex flex-col gap-1 hover:text-violet-500">
                          <span className="font-semibold text-gray-100">{stock.symbol}</span>
                          <span className="text-sm text-gray-500">{stock.company}</span>
                        </Link>
                      </td>
                      <td className="table-cell px-4 py-4 text-gray-100">
                        {typeof stock.currentPrice === 'number' ? formatPrice(stock.currentPrice) : 'N/A'}
                      </td>
                      <td className={cn('table-cell px-4 py-4 font-semibold', getChangeColor(stock.changePercent))}>
                        {formatPercent(stock.changePercent)}
                      </td>
                      <td className="table-cell px-4 py-4 text-gray-200">{formatVolume(stock.volume)}</td>
                      <td className="table-cell px-4 py-4 text-right">
                        <WatchlistButton
                          type="icon"
                          symbol={stock.symbol}
                          company={stock.company}
                          isInWatchlist
                          onWatchlistChange={handleWatchlistChanged}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="table-row">
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                      {snapshot.watchlist.length === 0
                        ? 'No stocks in your watchlist yet. Add stocks from Search or stock detail pages.'
                        : 'No stocks match your current search/filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
            <Button
              type="button"
              onClick={reload}
              className="mt-3 h-8 bg-violet-500 px-3 text-xs text-violet-950 hover:bg-violet-400"
            >
              Retry
            </Button>
          </div>
        )}
      </section>

      <aside className="watchlist-alerts">
        <div className="w-full rounded-lg border border-gray-600 bg-gray-800 p-5">
          <h2 className="text-lg font-semibold text-gray-100">Stock Suggestions</h2>
          <p className="mt-2 text-sm text-gray-500">
            Suggestions from related holdings, sectors, and daily top performers.
          </p>

          <div className="mt-4 space-y-3">
            {snapshot.suggestions.length > 0 ? (
              snapshot.suggestions.map((suggestion: WatchlistSuggestionStock) => (
                <div key={suggestion.symbol} className="rounded-lg border border-gray-600/80 bg-gray-700/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/stocks/${suggestion.symbol}`} className="font-semibold text-gray-100 hover:text-violet-500">
                        {suggestion.symbol}
                      </Link>
                      <p className="text-sm text-gray-400">{suggestion.company}</p>
                    </div>
                    <WatchlistButton
                      type="icon"
                      symbol={suggestion.symbol}
                      company={suggestion.company}
                      isInWatchlist={false}
                      onWatchlistChange={handleWatchlistChanged}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{suggestion.reason}</p>
                  <p className={cn('mt-2 text-sm font-medium', getChangeColor(suggestion.changePercent))}>
                    {formatPercent(suggestion.changePercent)} today
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-gray-600/80 bg-gray-700/30 p-3 text-sm text-gray-500">
                Add stocks to your watchlist to unlock personalized suggestions.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default WatchlistPageClient;
