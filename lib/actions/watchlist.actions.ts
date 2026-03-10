'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { fetchJSON } from '@/lib/actions/finnhub.actions';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? '';

type FinnhubQuoteResponse = {
  c?: number;
  dp?: number;
  v?: number;
};

type FinnhubProfileResponse = {
  name?: string;
  finnhubIndustry?: string;
};

type WatchlistRecord = {
  symbol: string;
  company: string;
};

export type WatchlistSnapshotStock = {
  symbol: string;
  company: string;
  currentPrice?: number;
  changePercent?: number;
  volume?: number;
  industry?: string;
};

export type WatchlistSuggestionStock = {
  symbol: string;
  company: string;
  currentPrice?: number;
  changePercent?: number;
  volume?: number;
  industry?: string;
  reason: string;
};

export type WatchlistSnapshot = {
  watchlist: WatchlistSnapshotStock[];
  suggestions: WatchlistSuggestionStock[];
  updatedAt: string;
};

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase();

async function getDatabase() {
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection not found');
  return db;
}

async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

async function fetchQuoteAndProfile(symbol: string, fallbackCompany?: string): Promise<WatchlistSnapshotStock> {
  if (!FINNHUB_API_KEY) {
    return { symbol, company: fallbackCompany || symbol };
  }

  const [quote, profile] = await Promise.all([
    fetchJSON<FinnhubQuoteResponse>(
      `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`,
      60
    ).catch(() => null),
    fetchJSON<FinnhubProfileResponse>(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`,
      3600
    ).catch(() => null),
  ]);

  return {
    symbol,
    company: profile?.name || fallbackCompany || symbol,
    currentPrice: typeof quote?.c === 'number' ? quote.c : undefined,
    changePercent: typeof quote?.dp === 'number' ? quote.dp : undefined,
    volume: typeof quote?.v === 'number' ? quote.v : undefined,
    industry: profile?.finnhubIndustry || undefined,
  };
}

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const db = await getDatabase();

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function isStockInCurrentUserWatchlist(symbol: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return false;

    const normalizedSymbol = normalizeSymbol(symbol);
    if (!normalizedSymbol) return false;

    await getDatabase();
    const found = await Watchlist.exists({ userId: user.id, symbol: normalizedSymbol });
    return Boolean(found);
  } catch (error) {
    console.error('isStockInCurrentUserWatchlist error:', error);
    return false;
  }
}

export async function addToWatchlist(symbol: string, company: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false, message: 'Not authenticated' };

    const normalizedSymbol = normalizeSymbol(symbol);
    const normalizedCompany = company?.trim() || normalizedSymbol;
    if (!normalizedSymbol) return { success: false, message: 'Invalid stock symbol' };

    await getDatabase();

    await Watchlist.findOneAndUpdate(
      { userId: user.id, symbol: normalizedSymbol },
      {
        $setOnInsert: {
          userId: user.id,
          symbol: normalizedSymbol,
          addedAt: new Date(),
        },
        $set: {
          company: normalizedCompany,
        },
      },
      { upsert: true, new: true }
    );

    return { success: true };
  } catch (error) {
    console.error('addToWatchlist error:', error);
    return { success: false, message: 'Unable to add stock to watchlist' };
  }
}

export async function removeFromWatchlist(symbol: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false, message: 'Not authenticated' };

    const normalizedSymbol = normalizeSymbol(symbol);
    if (!normalizedSymbol) return { success: false, message: 'Invalid stock symbol' };

    await getDatabase();
    await Watchlist.deleteOne({ userId: user.id, symbol: normalizedSymbol });

    return { success: true };
  } catch (error) {
    console.error('removeFromWatchlist error:', error);
    return { success: false, message: 'Unable to remove stock from watchlist' };
  }
}

export async function getCurrentUserWatchlistSnapshot(): Promise<WatchlistSnapshot> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { watchlist: [], suggestions: [], updatedAt: new Date().toISOString() };
    }

    await getDatabase();

    const items = (await Watchlist.find(
      { userId: user.id },
      { _id: 0, symbol: 1, company: 1 }
    )
      .sort({ addedAt: -1 })
      .lean()) as WatchlistRecord[];

    const uniqueWatchlist = items.reduce<WatchlistRecord[]>((acc, item) => {
      const symbol = normalizeSymbol(item.symbol || '');
      if (!symbol || acc.some((existing) => existing.symbol === symbol)) return acc;

      acc.push({
        symbol,
        company: item.company?.trim() || symbol,
      });
      return acc;
    }, []);

    const watchlist = await Promise.all(
      uniqueWatchlist.map((item) => fetchQuoteAndProfile(item.symbol, item.company))
    );

    const watchlistSymbolSet = new Set(watchlist.map((item) => item.symbol));
    const watchlistIndustrySet = new Set(
      watchlist.map((item) => item.industry?.trim()).filter((industry): industry is string => Boolean(industry))
    );

    const peerSymbols = new Set<string>();

    if (FINNHUB_API_KEY && watchlist.length > 0) {
      await Promise.all(
        watchlist.slice(0, 5).map(async (item) => {
          const url = `${FINNHUB_BASE_URL}/stock/peers?symbol=${encodeURIComponent(item.symbol)}&token=${FINNHUB_API_KEY}`;
          const peers = await fetchJSON<string[]>(url, 300).catch(() => []);
          for (const peerSymbol of peers) {
            const normalizedPeer = normalizeSymbol(peerSymbol || '');
            if (normalizedPeer && !watchlistSymbolSet.has(normalizedPeer)) {
              peerSymbols.add(normalizedPeer);
            }
          }
        })
      );
    }

    let candidateSymbols = Array.from(peerSymbols);
    if (!candidateSymbols.length) {
      candidateSymbols = POPULAR_STOCK_SYMBOLS.filter((symbol) => !watchlistSymbolSet.has(symbol)).slice(0, 20);
    } else {
      candidateSymbols = candidateSymbols.slice(0, 20);
    }

    const candidateData = await Promise.all(candidateSymbols.map((symbol) => fetchQuoteAndProfile(symbol)));

    const suggestions = candidateData
      .sort((a, b) => (b.changePercent ?? Number.NEGATIVE_INFINITY) - (a.changePercent ?? Number.NEGATIVE_INFINITY))
      .slice(0, 6)
      .map<WatchlistSuggestionStock>((item) => {
        const isPeerSuggestion = peerSymbols.has(item.symbol);
        const sameIndustry = Boolean(item.industry && watchlistIndustrySet.has(item.industry));

        let reason = 'Top-performing stock by daily market momentum';
        if (isPeerSuggestion) reason = 'Related ticker based on your current watchlist holdings';
        if (sameIndustry) reason = `Active in the ${item.industry || 'related'} sector`;

        return {
          symbol: item.symbol,
          company: item.company,
          currentPrice: item.currentPrice,
          changePercent: item.changePercent,
          volume: item.volume,
          industry: item.industry,
          reason,
        };
      });

    return {
      watchlist,
      suggestions,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('getCurrentUserWatchlistSnapshot error:', error);
    return { watchlist: [], suggestions: [], updatedAt: new Date().toISOString() };
  }
}
