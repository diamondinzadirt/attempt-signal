'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface NavbarSearchBarProps {
  className?: string;
}

const NavbarSearchBar = ({ className }: NavbarSearchBarProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>([]);

  const fetchStocks = useCallback(async () => {
    if (!open) return;

    setLoading(true);
    try {
      const results = await searchStocks(query.trim() || undefined);
      setStocks(results.slice(0, 10));
    } catch (error) {
      console.error('navbar stock search error:', error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [open, query]);

  const debouncedFetch = useDebounce(fetchStocks, 250);

  useEffect(() => {
    if (!open) return;
    debouncedFetch();
  }, [open, query, debouncedFetch]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const showDropdown = open && (loading || stocks.length > 0 || Boolean(query.trim()));

  return (
    <div ref={wrapperRef} className={cn('relative w-full max-w-md', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search stocks..."
        className="h-10 border-gray-600 bg-gray-800 pl-10 text-gray-100 placeholder:text-gray-500 focus-visible:border-violet-500 focus-visible:ring-0"
      />

      {showDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-30 max-h-80 w-full overflow-y-auto rounded-md border border-gray-600 bg-gray-800 shadow-xl">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching stocks...
            </div>
          ) : stocks.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-500">No matching stocks found.</div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {stocks.map((stock) => (
                <li key={stock.symbol} className="px-2 py-1">
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-sm px-2 py-2 hover:bg-gray-700"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-100">{stock.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {stock.symbol} | {stock.exchange} | {stock.type}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarSearchBar;

