import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UPSTOX_API_KEY = Deno.env.get('UPSTOX_API_KEY');
const UPSTOX_API_SECRET = Deno.env.get('UPSTOX_API_SECRET');
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

interface MarketQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    open: number;
    close: number;
    volume: number;
    lastUpdated: string;
    dataSource: 'upstox' | 'yahoo' | 'google' | 'nse' | 'mock';
}

interface OptionChainData {
    symbol: string;
    expiryDate: string;
    strikePrice: number;
    optionType: 'CE' | 'PE';
    ltp: number;
    openInterest: number;
    volume: number;
    impliedVolatility: number;
    change: number;
    changePercent: number;
    bidPrice: number;
    askPrice: number;
}

interface TradingSignal {
    id: string;
    symbol: string;
    strikePrice?: number;
    optionType?: 'CE' | 'PE';
    action: 'BUY' | 'SELL';
    entryPrice: number;
    target1: number;
    target2: number;
    target3: number;
    stopLoss: number;
    strategy: string;
    timeframe: string;
    confidence: number;
    timestamp: string;
    status: 'ACTIVE' | 'HIT_T1' | 'HIT_T2' | 'HIT_T3' | 'HIT_SL' | 'EXPIRED';
    exchange: 'NSE' | 'BSE';
    segment: 'INDEX' | 'EQUITY' | 'F&O';
}

interface StrikeRecommendation {
    strike: number;
    type: 'CE' | 'PE';
    reason: string;
    score: number;
}

// Yahoo Finance symbol mapping for Indian stocks
const YAHOO_SYMBOL_MAP: Record<string, string> = {
    'NIFTY': '^NSEI',
    'NIFTY50': '^NSEI',
    'BANKNIFTY': '^NSEBANK',
    'FINNIFTY': 'NIFTY_FIN_SERVICE.NS',
    'SENSEX': '^BSESN',
    'NIFTYIT': '^CNXIT',
    'NIFTYMIDCAP': '^NSEMDCP50',
    'RELIANCE': 'RELIANCE.NS',
    'TCS': 'TCS.NS',
    'INFY': 'INFY.NS',
    'HDFCBANK': 'HDFCBANK.NS',
    'ICICIBANK': 'ICICIBANK.NS',
    'SBIN': 'SBIN.NS',
    'BHARTIARTL': 'BHARTIARTL.NS',
    'ITC': 'ITC.NS',
    'KOTAKBANK': 'KOTAKBANK.NS',
    'LT': 'LT.NS',
    'TATAMOTORS': 'TATAMOTORS.NS',
    'TATASTEEL': 'TATASTEEL.NS',
    'WIPRO': 'WIPRO.NS',
    'AXISBANK': 'AXISBANK.NS',
    'BAJFINANCE': 'BAJFINANCE.NS',
    'MARUTI': 'MARUTI.NS',
    'SUNPHARMA': 'SUNPHARMA.NS',
    'TITAN': 'TITAN.NS',
    'ULTRACEMCO': 'ULTRACEMCO.NS',
    'HINDUNILVR': 'HINDUNILVR.NS',
    'ASIANPAINT': 'ASIANPAINT.NS',
    'POWERGRID': 'POWERGRID.NS',
    'NTPC': 'NTPC.NS',
    'ONGC': 'ONGC.NS',
    'COALINDIA': 'COALINDIA.NS',
    'ADANIENT': 'ADANIENT.NS',
    'ADANIPORTS': 'ADANIPORTS.NS',
    'HCLTECH': 'HCLTECH.NS',
    'TECHM': 'TECHM.NS',
    'BAJAJ-AUTO': 'BAJAJ-AUTO.NS',
    'M&M': 'M&M.NS',
    'HINDALCO': 'HINDALCO.NS',
    'JSWSTEEL': 'JSWSTEEL.NS',
    'DRREDDY': 'DRREDDY.NS',
    'CIPLA': 'CIPLA.NS',
    'APOLLOHOSP': 'APOLLOHOSP.NS',
};

// Symbol mapping for Upstox
const SYMBOL_MAP: Record<string, string> = {
    'NIFTY': 'NSE_INDEX|Nifty 50',
    'NIFTY50': 'NSE_INDEX|Nifty 50',
    'BANKNIFTY': 'NSE_INDEX|Nifty Bank',
    'FINNIFTY': 'NSE_INDEX|Nifty Fin Service',
    'SENSEX': 'BSE_INDEX|SENSEX',
    'NIFTYIT': 'NSE_INDEX|Nifty IT',
    'NIFTYMIDCAP': 'NSE_INDEX|NIFTY MIDCAP 50',
    'RELIANCE': 'NSE_EQ|RELIANCE',
    'TCS': 'NSE_EQ|TCS',
    'INFY': 'NSE_EQ|INFY',
    'HDFCBANK': 'NSE_EQ|HDFCBANK',
    'ICICIBANK': 'NSE_EQ|ICICIBANK',
    'SBIN': 'NSE_EQ|SBIN',
    'BHARTIARTL': 'NSE_EQ|BHARTIARTL',
    'ITC': 'NSE_EQ|ITC',
    'KOTAKBANK': 'NSE_EQ|KOTAKBANK',
    'LT': 'NSE_EQ|LT',
    'TATAMOTORS': 'NSE_EQ|TATAMOTORS',
    'TATASTEEL': 'NSE_EQ|TATASTEEL',
    'WIPRO': 'NSE_EQ|WIPRO',
    'AXISBANK': 'NSE_EQ|AXISBANK',
    'BAJFINANCE': 'NSE_EQ|BAJFINANCE',
    'MARUTI': 'NSE_EQ|MARUTI',
    'SUNPHARMA': 'NSE_EQ|SUNPHARMA',
    'TITAN': 'NSE_EQ|TITAN',
    'ULTRACEMCO': 'NSE_EQ|ULTRACEMCO',
    'HINDUNILVR': 'NSE_EQ|HINDUNILVR',
    'ASIANPAINT': 'NSE_EQ|ASIANPAINT',
    'POWERGRID': 'NSE_EQ|POWERGRID',
    'NTPC': 'NSE_EQ|NTPC',
    'ONGC': 'NSE_EQ|ONGC',
    'COALINDIA': 'NSE_EQ|COALINDIA',
};

// Check if market is open
function isMarketOpen(): { isOpen: boolean; status: string; nextEvent: string } {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);

    const day = ist.getUTCDay();
    const hours = ist.getUTCHours();
    const minutes = ist.getUTCMinutes();
    const currentTime = hours * 60 + minutes;

    const marketOpen = 9 * 60 + 15;
    const marketClose = 15 * 60 + 30;
    const preMarketOpen = 9 * 60;

    if (day === 0 || day === 6) {
        return { isOpen: false, status: 'CLOSED', nextEvent: 'Market opens Monday 9:15 AM IST' };
    }

    if (currentTime >= preMarketOpen && currentTime < marketOpen) {
        return { isOpen: false, status: 'PRE_MARKET', nextEvent: 'Market opens at 9:15 AM IST' };
    }

    if (currentTime >= marketOpen && currentTime < marketClose) {
        return { isOpen: true, status: 'OPEN', nextEvent: 'Market closes at 3:30 PM IST' };
    }

    if (currentTime >= marketClose) {
        return { isOpen: false, status: 'CLOSED', nextEvent: 'Market opens tomorrow 9:15 AM IST' };
    }

    return { isOpen: false, status: 'CLOSED', nextEvent: 'Pre-market opens at 9:00 AM IST' };
}

// Fetch from NSE India directly - most reliable for Indian markets
async function fetchNSEIndia(symbols: string[]): Promise<MarketQuote[]> {
    const quotes: MarketQuote[] = [];
    const requestedSymbols = symbols.map(s => s.toUpperCase());
    const foundSymbols = new Set<string>();

    try {
        // Fetch NIFTY indices
        const indicesResponse = await fetch('https://www.nseindia.com/api/allIndices', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.nseindia.com/',
                'Origin': 'https://www.nseindia.com',
            }
        });

        if (indicesResponse.ok) {
            const indicesData = await indicesResponse.json();

            if (indicesData?.data) {
                for (const index of indicesData.data) {
                    const indexName = index.index || index.indexSymbol || '';

                    // Map NSE index names to our symbols
                    let mappedSymbol: string | null = null;
                    if (indexName === 'NIFTY 50') mappedSymbol = 'NIFTY';
                    else if (indexName === 'NIFTY BANK') mappedSymbol = 'BANKNIFTY';
                    else if (indexName === 'NIFTY FIN SERVICE' || indexName === 'NIFTY FINANCIAL SERVICES') mappedSymbol = 'FINNIFTY';
                    else if (indexName === 'INDIA VIX') continue; // Skip VIX

                    // Only add if requested and not already found
                    if (mappedSymbol && requestedSymbols.includes(mappedSymbol) && !foundSymbols.has(mappedSymbol)) {
                        foundSymbols.add(mappedSymbol);
                        const currentPrice = index.last || index.lastPrice || 0;
                        const previousClose = index.previousClose || index.previousDay || currentPrice;
                        const change = currentPrice - previousClose;
                        const changePercent = previousClose ? (change / previousClose) * 100 : 0;

                        quotes.push({
                            symbol: mappedSymbol,
                            price: currentPrice,
                            change: Math.round(change * 100) / 100,
                            changePercent: Math.round(changePercent * 100) / 100,
                            high: index.high || index.dayHigh || currentPrice,
                            low: index.low || index.dayLow || currentPrice,
                            open: index.open || previousClose,
                            close: previousClose,
                            volume: index.volume || 0,
                            lastUpdated: new Date().toISOString(),
                            dataSource: 'nse'
                        });
                    }
                }
            }
        }

        console.log(`NSE India returned ${quotes.length} index quotes for: ${Array.from(foundSymbols).join(', ')}`);
        return quotes;
    } catch (e) {
        console.error('NSE India fetch error:', e);
        return [];
    }
}

// Fetch from Yahoo Finance v8 API (public endpoint)
async function fetchYahooFinance(symbols: string[]): Promise<MarketQuote[]> {
    const quotes: MarketQuote[] = [];

    try {
        const yahooSymbols = symbols.map(s => YAHOO_SYMBOL_MAP[s.toUpperCase()] || `${s.toUpperCase()}.NS`);

        console.log('Fetching from Yahoo Finance v8:', yahooSymbols.join(','));

        // Use crumb-less endpoint
        for (const yahooSymbol of yahooSymbols) {
            try {
                const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': '*/*',
                    }
                });

                if (!response.ok) {
                    console.log(`Yahoo v8 not OK for ${yahooSymbol}:`, response.status);
                    continue;
                }

                const data = await response.json();
                const result = data?.chart?.result?.[0];

                if (result?.meta) {
                    const meta = result.meta;
                    const originalSymbol = symbols[yahooSymbols.indexOf(yahooSymbol)]?.toUpperCase();

                    let displaySymbol = originalSymbol;
                    if (yahooSymbol === '^NSEI') displaySymbol = 'NIFTY';
                    else if (yahooSymbol === '^NSEBANK') displaySymbol = 'BANKNIFTY';
                    else if (yahooSymbol === '^BSESN') displaySymbol = 'SENSEX';
                    else if (yahooSymbol.includes('NIFTY_FIN')) displaySymbol = 'FINNIFTY';
                    else displaySymbol = yahooSymbol.replace('.NS', '');

                    const currentPrice = meta.regularMarketPrice || 0;
                    const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
                    const change = currentPrice - previousClose;
                    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

                    quotes.push({
                        symbol: displaySymbol,
                        price: currentPrice,
                        change: Math.round(change * 100) / 100,
                        changePercent: Math.round(changePercent * 100) / 100,
                        high: meta.regularMarketDayHigh || currentPrice,
                        low: meta.regularMarketDayLow || currentPrice,
                        open: meta.regularMarketOpen || previousClose,
                        close: previousClose,
                        volume: meta.regularMarketVolume || 0,
                        lastUpdated: new Date().toISOString(),
                        dataSource: 'yahoo'
                    });
                }
            } catch (e) {
                console.log(`Yahoo v8 error for ${yahooSymbol}:`, e);
            }
        }

        console.log(`Yahoo Finance v8 returned ${quotes.length} quotes`);
        return quotes;
    } catch (e) {
        console.error('Yahoo Finance v8 fetch error:', e);
        return [];
    }
}

// Fetch from Google Finance as backup
async function fetchGoogleFinance(symbols: string[]): Promise<MarketQuote[]> {
    const quotes: MarketQuote[] = [];

    try {
        for (const symbol of symbols.slice(0, 5)) {
            try {
                const upperSymbol = symbol.toUpperCase();
                let googleSymbol = upperSymbol;

                if (upperSymbol === 'NIFTY' || upperSymbol === 'NIFTY50') {
                    googleSymbol = 'INDEXNSE:NIFTY_50';
                } else if (upperSymbol === 'BANKNIFTY') {
                    googleSymbol = 'INDEXNSE:NIFTY_BANK';
                } else if (upperSymbol === 'SENSEX') {
                    googleSymbol = 'INDEXBSE:SENSEX';
                } else {
                    googleSymbol = `NSE:${upperSymbol}`;
                }

                const url = `https://www.google.com/finance/quote/${googleSymbol}`;
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    }
                });

                if (response.ok) {
                    const html = await response.text();

                    const priceMatch = html.match(/data-last-price="([0-9.,]+)"/);
                    const changeMatch = html.match(/data-price-change="([+-]?[0-9.,]+)"/);
                    const changePercentMatch = html.match(/data-price-change-percent="([+-]?[0-9.,]+)"/);

                    if (priceMatch) {
                        const price = parseFloat(priceMatch[1].replace(/,/g, '')) || 0;
                        quotes.push({
                            symbol: upperSymbol,
                            price: price,
                            change: parseFloat(changeMatch?.[1]?.replace(/,/g, '') || '0'),
                            changePercent: parseFloat(changePercentMatch?.[1]?.replace(/,/g, '') || '0'),
                            high: price * 1.01,
                            low: price * 0.99,
                            open: price,
                            close: price - parseFloat(changeMatch?.[1]?.replace(/,/g, '') || '0'),
                            volume: 0,
                            lastUpdated: new Date().toISOString(),
                            dataSource: 'google'
                        });
                    }
                }
            } catch (e) {
                console.log(`Google Finance error for ${symbol}:`, e);
            }
        }

        console.log(`Google Finance returned ${quotes.length} quotes`);
        return quotes;
    } catch (e) {
        console.error('Google Finance fetch error:', e);
        return [];
    }
}

// Stable base prices - updated for realistic values
const BASE_PRICES: Record<string, number> = {
    'NIFTY': 24150,
    'NIFTY50': 24150,
    'BANKNIFTY': 51350,
    'FINNIFTY': 22500,
    'SENSEX': 79800,
    'NIFTYIT': 38500,
    'NIFTYMIDCAP': 16200,
    'RELIANCE': 2850,
    'TCS': 4125,
    'INFY': 1780,
    'HDFCBANK': 1650,
    'ICICIBANK': 1120,
    'SBIN': 780,
    'ITC': 465,
    'KOTAKBANK': 1780,
    'LT': 3450,
    'TATAMOTORS': 985,
    'WIPRO': 485,
    'AXISBANK': 1175,
    'BAJFINANCE': 6850,
    'MARUTI': 10850,
    'BHARTIARTL': 1580,
    'TATASTEEL': 148,
    'SUNPHARMA': 1825,
    'TITAN': 3450,
    'ULTRACEMCO': 11250,
    'HINDUNILVR': 2380,
    'ASIANPAINT': 2950,
    'POWERGRID': 315,
    'NTPC': 385,
    'ONGC': 275,
    'COALINDIA': 485,
    'ADANIENT': 2450,
    'ADANIPORTS': 1180,
    'HCLTECH': 1650,
    'TECHM': 1580,
    'HINDALCO': 625,
    'JSWSTEEL': 920,
    'DRREDDY': 6250,
    'CIPLA': 1480,
};

// Seeded random for stable mock data
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getDaySeed(): number {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

function getMinuteSeed(): number {
    const now = new Date();
    return getDaySeed() * 10000 + now.getHours() * 100 + Math.floor(now.getMinutes() / 5);
}

// Generate stable mock quotes (only used when APIs fail)
function generateStableMockQuotes(symbols: string[]): MarketQuote[] {
    const daySeed = getDaySeed();
    const minuteSeed = getMinuteSeed();

    return symbols.map((symbol, index) => {
        const upperSymbol = symbol.toUpperCase();
        const basePrice = BASE_PRICES[upperSymbol] || 1000;

        // Generate realistic daily change (-3% to +3%)
        const dayChangePercent = (seededRandom(daySeed + index * 7) - 0.5) * 6;

        // Add small intraday variation
        const intradayVariation = (seededRandom(minuteSeed + index) - 0.5) * 0.5;
        const changePercent = dayChangePercent + intradayVariation;

        const change = (basePrice * changePercent) / 100;
        const price = basePrice + change;

        return {
            symbol: upperSymbol,
            price: Math.round(price * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            high: Math.round(price * (1 + Math.abs(changePercent) / 100 + 0.005) * 100) / 100,
            low: Math.round(price * (1 - Math.abs(changePercent) / 100 - 0.005) * 100) / 100,
            open: Math.round(basePrice * (1 + (seededRandom(daySeed + index + 50) - 0.5) * 0.01) * 100) / 100,
            close: basePrice,
            volume: Math.floor(1000000 + seededRandom(daySeed + index + 100) * 15000000),
            lastUpdated: new Date().toISOString(),
            dataSource: 'mock' as const
        };
    });
}

// Upstox API functions
async function getUpstoxMarketQuotes(symbols: string[], accessToken: string): Promise<MarketQuote[]> {
    const instrumentKeys = symbols.map(s => {
        return SYMBOL_MAP[s.toUpperCase()] || `NSE_EQ|${s.toUpperCase()}`;
    });

    console.log('Fetching Upstox quotes for:', instrumentKeys);

    const response = await fetch(
        `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${encodeURIComponent(instrumentKeys.join(','))}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Upstox API error:', response.status, errorText);
        throw new Error(`Upstox API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Upstox response received');

    const quotes: MarketQuote[] = [];

    if (data.data) {
        for (const [key, value] of Object.entries(data.data)) {
            const quote = value as any;
            const symbolName = key.split('|')[1] || key;
            quotes.push({
                symbol: symbolName,
                price: quote.last_price || 0,
                change: quote.net_change || 0,
                changePercent: quote.percentage_change || 0,
                high: quote.ohlc?.high || 0,
                low: quote.ohlc?.low || 0,
                open: quote.ohlc?.open || 0,
                close: quote.ohlc?.close || 0,
                volume: quote.volume || 0,
                lastUpdated: new Date().toISOString(),
                dataSource: 'upstox'
            });
        }
    }

    return quotes;
}

async function getUpstoxOptionChain(symbol: string, accessToken: string): Promise<{ options: OptionChainData[], spotPrice: number, expiryDates: string[], recommendations: StrikeRecommendation[] }> {
    const instrumentKey = SYMBOL_MAP[symbol.toUpperCase()] || `NSE_EQ|${symbol.toUpperCase()}`;

    console.log('Fetching option chain for:', instrumentKey);

    const response = await fetch(
        `https://api.upstox.com/v2/option/chain?instrument_key=${encodeURIComponent(instrumentKey)}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Upstox Option Chain error:', response.status, errorText);
        throw new Error(`Upstox Option Chain error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Option chain response received');

    const options: OptionChainData[] = [];
    let spotPrice = 0;
    const expiryDates: string[] = [];

    if (data.data) {
        for (const item of data.data) {
            if (!expiryDates.includes(item.expiry)) {
                expiryDates.push(item.expiry);
            }

            if (item.underlying_spot_price) {
                spotPrice = item.underlying_spot_price;
            }

            if (item.call_options) {
                options.push({
                    symbol: symbol,
                    expiryDate: item.expiry,
                    strikePrice: item.strike_price,
                    optionType: 'CE',
                    ltp: item.call_options.market_data?.ltp || 0,
                    openInterest: item.call_options.market_data?.oi || 0,
                    volume: item.call_options.market_data?.volume || 0,
                    impliedVolatility: item.call_options.option_greeks?.iv || 0,
                    change: item.call_options.market_data?.net_change || 0,
                    changePercent: item.call_options.market_data?.percentage_change || 0,
                    bidPrice: item.call_options.market_data?.bid_price || 0,
                    askPrice: item.call_options.market_data?.ask_price || 0,
                });
            }
            if (item.put_options) {
                options.push({
                    symbol: symbol,
                    expiryDate: item.expiry,
                    strikePrice: item.strike_price,
                    optionType: 'PE',
                    ltp: item.put_options.market_data?.ltp || 0,
                    openInterest: item.put_options.market_data?.oi || 0,
                    volume: item.put_options.market_data?.volume || 0,
                    impliedVolatility: item.put_options.option_greeks?.iv || 0,
                    change: item.put_options.market_data?.net_change || 0,
                    changePercent: item.put_options.market_data?.percentage_change || 0,
                    bidPrice: item.put_options.market_data?.bid_price || 0,
                    askPrice: item.put_options.market_data?.ask_price || 0,
                });
            }
        }
    }

    const recommendations = generateStrikeRecommendations(options, spotPrice);

    return { options, spotPrice, expiryDates, recommendations };
}

// Generate strike recommendations based on OI analysis
function generateStrikeRecommendations(options: OptionChainData[], spotPrice: number): StrikeRecommendation[] {
    if (!options.length || !spotPrice) return [];

    const recommendations: StrikeRecommendation[] = [];

    const calls = options.filter(o => o.optionType === 'CE');
    const puts = options.filter(o => o.optionType === 'PE');

    const sortedCalls = [...calls].sort((a, b) => b.openInterest - a.openInterest);
    const sortedPuts = [...puts].sort((a, b) => b.openInterest - a.openInterest);

    if (sortedCalls.length > 0) {
        const highestOICall = sortedCalls[0];
        if (highestOICall.strikePrice > spotPrice) {
            recommendations.push({
                strike: highestOICall.strikePrice,
                type: 'PE',
                reason: `Resistance at ${highestOICall.strikePrice} (Highest Call OI). Consider PE below this level.`,
                score: 85
            });
        }
    }

    if (sortedPuts.length > 0) {
        const highestOIPut = sortedPuts[0];
        if (highestOIPut.strikePrice < spotPrice) {
            recommendations.push({
                strike: highestOIPut.strikePrice,
                type: 'CE',
                reason: `Support at ${highestOIPut.strikePrice} (Highest Put OI). Consider CE above this level.`,
                score: 82
            });
        }
    }

    const totalCallOI = calls.reduce((sum, c) => sum + c.openInterest, 0);
    const totalPutOI = puts.reduce((sum, p) => sum + p.openInterest, 0);
    const pcr = totalPutOI / (totalCallOI || 1);

    const uniqueStrikes = [...new Set(options.map(o => o.strikePrice))].sort((a, b) => a - b);
    const atmStrike = uniqueStrikes.reduce((prev, curr) =>
        Math.abs(curr - spotPrice) < Math.abs(prev - spotPrice) ? curr : prev
    );

    if (pcr > 1.2) {
        recommendations.push({
            strike: atmStrike,
            type: 'CE',
            reason: `PCR: ${pcr.toFixed(2)} (Bullish). Buy ATM/slightly OTM CE.`,
            score: 78
        });
    } else if (pcr < 0.8) {
        recommendations.push({
            strike: atmStrike,
            type: 'PE',
            reason: `PCR: ${pcr.toFixed(2)} (Bearish). Buy ATM/slightly OTM PE.`,
            score: 78
        });
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 4);
}

// Generate stable mock option chain
function generateStableMockOptionChain(symbol: string, spotPrice: number): { options: OptionChainData[], spotPrice: number, expiryDates: string[], recommendations: StrikeRecommendation[] } {
    const strikeDifference = symbol === 'NIFTY' ? 50 : symbol === 'BANKNIFTY' ? 100 : symbol === 'FINNIFTY' ? 50 : symbol === 'SENSEX' ? 100 : 50;
    const atmStrike = Math.round(spotPrice / strikeDifference) * strikeDifference;

    const options: OptionChainData[] = [];
    const expiryDates = [
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ];

    const daySeed = getDaySeed();

    for (let i = -8; i <= 8; i++) {
        const strike = atmStrike + (i * strikeDifference);
        const distanceFromATM = Math.abs(i);
        const strikeSeed = daySeed + strike;

        const callIntrinsic = Math.max(0, spotPrice - strike);
        const callTimeValue = Math.max(10, 150 * Math.exp(-distanceFromATM * 0.3));
        const callLTP = callIntrinsic + callTimeValue;

        const putIntrinsic = Math.max(0, strike - spotPrice);
        const putTimeValue = Math.max(10, 150 * Math.exp(-distanceFromATM * 0.3));
        const putLTP = putIntrinsic + putTimeValue;

        const oiFactor = Math.exp(-distanceFromATM * 0.15);
        const baseOI = symbol === 'NIFTY' ? 8000000 : symbol === 'BANKNIFTY' ? 3500000 : 1500000;
        const oiVariation = 0.8 + seededRandom(strikeSeed) * 0.4;

        const callChange = (seededRandom(strikeSeed + 1) - 0.5) * 10;
        const putChange = (seededRandom(strikeSeed + 2) - 0.5) * 10;

        options.push({
            symbol,
            expiryDate: expiryDates[0],
            strikePrice: strike,
            optionType: 'CE',
            ltp: Math.round(callLTP * 100) / 100,
            openInterest: Math.round(baseOI * oiFactor * oiVariation),
            volume: Math.round(baseOI * 0.1 * oiFactor * (0.7 + seededRandom(strikeSeed + 3) * 0.6)),
            impliedVolatility: Math.round((12 + seededRandom(strikeSeed + 4) * 8 + distanceFromATM * 0.5) * 10) / 10,
            change: Math.round(callChange * 100) / 100,
            changePercent: Math.round(callChange * 100) / 100,
            bidPrice: Math.round(callLTP * 0.995 * 100) / 100,
            askPrice: Math.round(callLTP * 1.005 * 100) / 100,
        });

        options.push({
            symbol,
            expiryDate: expiryDates[0],
            strikePrice: strike,
            optionType: 'PE',
            ltp: Math.round(putLTP * 100) / 100,
            openInterest: Math.round(baseOI * oiFactor * oiVariation),
            volume: Math.round(baseOI * 0.1 * oiFactor * (0.7 + seededRandom(strikeSeed + 5) * 0.6)),
            impliedVolatility: Math.round((12 + seededRandom(strikeSeed + 6) * 8 + distanceFromATM * 0.5) * 10) / 10,
            change: Math.round(putChange * 100) / 100,
            changePercent: Math.round(putChange * 100) / 100,
            bidPrice: Math.round(putLTP * 0.995 * 100) / 100,
            askPrice: Math.round(putLTP * 1.005 * 100) / 100,
        });
    }

    const recommendations = generateStrikeRecommendations(options, spotPrice);

    return { options, spotPrice, expiryDates, recommendations };
}

// Generate trading signals
function generateStableTradingSignals(): TradingSignal[] {
    const strategies = [
        'RSI Divergence', 'MACD Crossover', 'Breakout', 'Support/Resistance',
        'Moving Average', 'Volume Spike', 'Price Action', 'Fibonacci Retracement',
        'Bollinger Bands', 'Stochastic Crossover'
    ];

    const signals: TradingSignal[] = [];
    const stocks = [
        { symbol: 'NIFTY', strike: 24200, segment: 'INDEX' as const },
        { symbol: 'BANKNIFTY', strike: 51400, segment: 'INDEX' as const },
        { symbol: 'FINNIFTY', strike: 22500, segment: 'INDEX' as const },
        { symbol: 'RELIANCE', strike: 2900, segment: 'F&O' as const },
        { symbol: 'TCS', strike: 4150, segment: 'F&O' as const },
        { symbol: 'HDFCBANK', strike: 1680, segment: 'F&O' as const },
        { symbol: 'INFY', strike: 1800, segment: 'F&O' as const },
        { symbol: 'ICICIBANK', strike: 1140, segment: 'F&O' as const },
        { symbol: 'SBIN', strike: 800, segment: 'F&O' as const },
        { symbol: 'TATAMOTORS', strike: 1000, segment: 'F&O' as const },
    ];

    const daySeed = getDaySeed();
    const timeframes = ['Intraday', 'Short Term', 'Carryforward'];

    for (let i = 0; i < 10; i++) {
        const stock = stocks[i % stocks.length];
        const signalSeed = daySeed + i * 100;
        const action = seededRandom(signalSeed) > 0.5 ? 'BUY' : 'SELL';
        const optionType = seededRandom(signalSeed + 1) > 0.5 ? 'CE' : 'PE';
        const strategyIndex = Math.floor(seededRandom(signalSeed + 2) * strategies.length);
        const strategy = strategies[strategyIndex];
        const entryPrice = stock.strike * (0.02 + seededRandom(signalSeed + 3) * 0.03);
        const timeOffset = i * 15;
        const statusOptions = ['HIT_T1', 'HIT_T2', 'HIT_SL', 'EXPIRED'] as const;

        signals.push({
            id: `sig_${daySeed}_${i}`,
            symbol: stock.symbol,
            strikePrice: stock.strike,
            optionType,
            action: action as 'BUY' | 'SELL',
            entryPrice: Math.round(entryPrice * 100) / 100,
            target1: Math.round(entryPrice * (action === 'BUY' ? 1.05 : 0.95) * 100) / 100,
            target2: Math.round(entryPrice * (action === 'BUY' ? 1.10 : 0.90) * 100) / 100,
            target3: Math.round(entryPrice * (action === 'BUY' ? 1.15 : 0.85) * 100) / 100,
            stopLoss: Math.round(entryPrice * (action === 'BUY' ? 0.93 : 1.07) * 100) / 100,
            strategy,
            timeframe: timeframes[Math.floor(seededRandom(signalSeed + 7) * 3)],
            confidence: 65 + Math.floor(seededRandom(signalSeed + 5) * 30),
            timestamp: new Date(Date.now() - timeOffset * 60 * 1000).toISOString(),
            status: i < 3 ? 'ACTIVE' : statusOptions[Math.floor(seededRandom(signalSeed + 6) * 4)],
            exchange: stock.symbol === 'SENSEX' ? 'BSE' : 'NSE',
            segment: stock.segment,
        });
    }

    return signals;
}

// Send Telegram message
async function sendTelegramMessage(chatId: string, message: string, botToken: string): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
        console.log('Sending Telegram message to:', chatId);

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const data = await response.json();
        console.log('Telegram response:', JSON.stringify(data));

        if (data.ok) {
            return { success: true, messageId: data.result?.message_id };
        } else {
            return { success: false, error: data.description || 'Unknown error' };
        }
    } catch (error) {
        console.error('Telegram send error:', error);
        return { success: false, error: error.message };
    }
}

// Exchange authorization code for access token
async function exchangeUpstoxToken(code: string, redirectUri: string): Promise<{ access_token: string; expires_in: number; token_type: string }> {
    if (!UPSTOX_API_KEY || !UPSTOX_API_SECRET) {
        throw new Error('Upstox API credentials not configured');
    }

    console.log('Exchanging Upstox authorization code for token');

    const response = await fetch('https://api.upstox.com/v2/login/authorization/token', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code,
            client_id: UPSTOX_API_KEY,
            client_secret: UPSTOX_API_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        }).toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange error:', response.status, errorText);
        throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Token exchange successful');
    return data;
}

// Fetch historical OHLC data from Yahoo Finance
async function fetchHistoricalData(symbol: string, days: number = 365): Promise<{ date: string; open: number; high: number; low: number; close: number; volume: number }[]> {
    const yahooSymbol = YAHOO_SYMBOL_MAP[symbol.toUpperCase()] || `${symbol.toUpperCase()}.NS`;

    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (days * 24 * 60 * 60);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${startDate}&period2=${endDate}&interval=1d`;

    console.log('Fetching historical data for:', symbol);

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
        }
    });

    if (!response.ok) {
        console.log('Yahoo historical data failed:', response.status);
        return [];
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result?.timestamp || !result?.indicators?.quote?.[0]) {
        return [];
    }

    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];

    const history: { date: string; open: number; high: number; low: number; close: number; volume: number }[] = [];

    for (let i = 0; i < timestamps.length; i++) {
        if (quote.open[i] && quote.close[i]) {
            history.push({
                date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
                open: quote.open[i],
                high: quote.high[i],
                low: quote.low[i],
                close: quote.close[i],
                volume: quote.volume[i] || 0
            });
        }
    }

    console.log(`Fetched ${history.length} days of historical data for ${symbol}`);
    return history;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { action, symbols, symbol, accessToken, query, chatId, message, botToken, signal, code, redirectUri, days } = await req.json();

        console.log('Request:', { action, symbols, symbol, hasAccessToken: !!accessToken, query });

        let result: any;

        switch (action) {
            case 'getQuotes':
                const requestedSymbols = symbols || ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'SENSEX'];
                const allQuotes: MarketQuote[] = [];
                const foundSymbols = new Set<string>();

                console.log('Fetching quotes for:', requestedSymbols.join(', '));

                // 1. Try NSE India first
                try {
                    const nseQuotes = await fetchNSEIndia(requestedSymbols);
                    for (const q of nseQuotes) {
                        if (!foundSymbols.has(q.symbol)) {
                            foundSymbols.add(q.symbol);
                            allQuotes.push({ ...q, dataSource: 'nse' as const });
                        }
                    }
                    if (nseQuotes.length > 0) {
                        console.log(`✓ NSE India: ${nseQuotes.length} quotes (${Array.from(foundSymbols).join(', ')})`);
                    }
                } catch (nseError) {
                    console.log('✗ NSE India failed:', nseError);
                }

                // Check for missing symbols
                const missingAfterNSE = requestedSymbols.filter(s => !foundSymbols.has(s.toUpperCase()));

                // 2. Try Upstox for missing symbols (if token available)
                if (missingAfterNSE.length > 0 && accessToken && UPSTOX_API_KEY) {
                    try {
                        const upstoxQuotes = await getUpstoxMarketQuotes(missingAfterNSE, accessToken);
                        for (const q of upstoxQuotes) {
                            if (!foundSymbols.has(q.symbol)) {
                                foundSymbols.add(q.symbol);
                                allQuotes.push({ ...q, dataSource: 'upstox' as const });
                            }
                        }
                        if (upstoxQuotes.length > 0) {
                            console.log(`✓ Upstox: ${upstoxQuotes.length} quotes for missing symbols`);
                        }
                    } catch (upstoxError) {
                        console.log('✗ Upstox failed:', upstoxError);
                    }
                }

                // Check for remaining missing symbols
                const missingAfterUpstox = requestedSymbols.filter(s => !foundSymbols.has(s.toUpperCase()));

                // 3. Try Yahoo Finance for remaining missing symbols
                if (missingAfterUpstox.length > 0) {
                    try {
                        const yahooQuotes = await fetchYahooFinance(missingAfterUpstox);
                        for (const q of yahooQuotes) {
                            if (!foundSymbols.has(q.symbol)) {
                                foundSymbols.add(q.symbol);
                                allQuotes.push({ ...q, dataSource: 'yahoo' as const });
                            }
                        }
                        if (yahooQuotes.length > 0) {
                            console.log(`✓ Yahoo Finance: ${yahooQuotes.length} quotes for missing symbols`);
                        }
                    } catch (yahooError) {
                        console.log('✗ Yahoo Finance failed:', yahooError);
                    }
                }

                // Check for remaining missing symbols
                const missingAfterYahoo = requestedSymbols.filter(s => !foundSymbols.has(s.toUpperCase()));

                // 4. Try Google Finance for remaining
                if (missingAfterYahoo.length > 0) {
                    try {
                        const googleQuotes = await fetchGoogleFinance(missingAfterYahoo);
                        for (const q of googleQuotes) {
                            if (!foundSymbols.has(q.symbol)) {
                                foundSymbols.add(q.symbol);
                                allQuotes.push({ ...q, dataSource: 'google' as const });
                            }
                        }
                        if (googleQuotes.length > 0) {
                            console.log(`✓ Google Finance: ${googleQuotes.length} quotes for missing symbols`);
                        }
                    } catch (googleError) {
                        console.log('✗ Google Finance failed:', googleError);
                    }
                }

                // 5. Fill remaining missing with mock data
                const stillMissing = requestedSymbols.filter(s => !foundSymbols.has(s.toUpperCase()));
                if (stillMissing.length > 0) {
                    const mockQuotes = generateStableMockQuotes(stillMissing);
                    for (const q of mockQuotes) {
                        if (!foundSymbols.has(q.symbol)) {
                            foundSymbols.add(q.symbol);
                            allQuotes.push({ ...q, dataSource: 'mock' as const });
                        }
                    }
                    console.log(`✓ Mock data: ${stillMissing.length} quotes for: ${stillMissing.join(', ')}`);
                }

                result = allQuotes;
                console.log(`Final: ${result.length} quotes from multiple sources`);
                break;

            case 'getOptionChain':
                const targetSymbol = symbol || 'NIFTY';
                const spotPrices: Record<string, number> = {
                    'NIFTY': 24150,
                    'BANKNIFTY': 51350,
                    'FINNIFTY': 22500,
                    'SENSEX': 79800,
                    'RELIANCE': 2850,
                    'TCS': 4125,
                    'INFY': 1780,
                    'HDFCBANK': 1650,
                    'ICICIBANK': 1120,
                    'SBIN': 780,
                };

                if (accessToken && UPSTOX_API_KEY) {
                    try {
                        result = await getUpstoxOptionChain(targetSymbol, accessToken);
                        console.log('Successfully fetched option chain from Upstox');
                    } catch (upstoxError) {
                        console.log('Upstox option chain failed, using stable mock data:', upstoxError);
                        result = generateStableMockOptionChain(targetSymbol, spotPrices[targetSymbol] || spotPrices['NIFTY']);
                    }
                } else {
                    result = generateStableMockOptionChain(targetSymbol, spotPrices[targetSymbol] || spotPrices['NIFTY']);
                }
                break;

            case 'getIndexData':
                const indexSymbols = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'SENSEX'];
                if (accessToken && UPSTOX_API_KEY) {
                    try {
                        result = await getUpstoxMarketQuotes(indexSymbols, accessToken);
                    } catch (e) {
                        // Try NSE first, then Yahoo
                        result = await fetchNSEIndia(indexSymbols);
                        if (!result || result.length === 0) {
                            result = await fetchYahooFinance(indexSymbols);
                        }
                        if (!result || result.length === 0) {
                            result = generateStableMockQuotes(indexSymbols);
                        }
                    }
                } else {
                    // Try NSE first, then Yahoo
                    result = await fetchNSEIndia(indexSymbols);
                    if (!result || result.length === 0) {
                        result = await fetchYahooFinance(indexSymbols);
                    }
                    if (!result || result.length === 0) {
                        result = generateStableMockQuotes(indexSymbols);
                    }
                }
                break;

            case 'searchStocks':
                result = await searchStocks(query || '');
                break;

            case 'getGainersLosers':
                result = await getGainersLosers(accessToken);
                break;

            case 'getMarketStatus':
                result = isMarketOpen();
                break;

            case 'getTradingSignals':
                result = generateStableTradingSignals();
                break;

            case 'sendTelegramMessage':
                const token = botToken || TELEGRAM_BOT_TOKEN;
                if (!token) {
                    throw new Error('Telegram bot token not provided');
                }
                if (!chatId) {
                    throw new Error('Chat ID not provided');
                }
                result = await sendTelegramMessage(chatId, message, token);
                break;

            case 'sendTelegramSignal':
                const tgToken = botToken || TELEGRAM_BOT_TOKEN;
                if (!tgToken) {
                    throw new Error('Telegram bot token not provided');
                }
                if (!chatId || !signal) {
                    throw new Error('Chat ID and signal data required');
                }

                const signalMessage = `${signal.action === 'BUY' ? '🟢 BUY' : '🔴 SELL'} | ${signal.timeframe}

${signal.symbol} ${signal.strikePrice || ''}${signal.optionType || ''}

Entry: ₹${signal.entryPrice} SL: ₹${signal.stopLoss}

Targets: 🎯 T1: ${signal.target1} | T2: ${signal.target2} 🎯 T3: ${signal.target3}

Disclaimer: For educational purposes only.`;

                result = await sendTelegramMessage(chatId, signalMessage, tgToken);
                break;

            case 'exchangeToken':
                if (!code || !redirectUri) {
                    throw new Error('Authorization code and redirect URI required');
                }
                result = await exchangeUpstoxToken(code, redirectUri);
                break;

            case 'getHistoricalData':
                if (!symbol) {
                    throw new Error('Symbol required for historical data');
                }
                result = await fetchHistoricalData(symbol, days || 365);
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(
            JSON.stringify({ success: true, data: result }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Edge function error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
