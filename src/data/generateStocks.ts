// ============================================================
// Fake Stock Data Generator
// ============================================================
// Generates 5000+ realistic stock records with:
// - Realistic company names and symbols
// - Candlestick price history (100 bars per stock)
// - All technical indicators pre-calculated
// - No external API dependency
// ============================================================

import { faker } from '@faker-js/faker';
import type { Stock, Candle, Sector } from '../types/stock';
import { SECTORS } from '../types/stock';
import { generateIndicatorValues } from '../utils/technicalIndicators';

// Seed for reproducible results
faker.seed(42);

// ============================================================
// Sector-based symbol prefixes for realism
// ============================================================
const SECTOR_PREFIXES: Record<Sector, string[]> = {
  Technology: ['TECH', 'CODE', 'DATA', 'BYTE', 'CLOUD', 'AI', 'CYBER', 'SOFT', 'HARD', 'NET'],
  Healthcare: ['MED', 'BIO', 'HEAL', 'PHARMA', 'GEN', 'DIAG', 'CARE', 'VITA', 'DOC', 'RX'],
  Finance: ['BANK', 'FIN', 'CAP', 'TRUST', 'EQUITY', 'FUND', 'INSUR', 'MORT', 'WEAL', 'CRED'],
  'Consumer Cyclical': ['RETA', 'AUTO', 'HOME', 'LUX', 'SPORT', 'FASH', 'TOY', 'BOOK', 'MALL', 'HOTL'],
  Energy: ['ENER', 'OIL', 'GAS', 'SOLAR', 'WIND', 'FUEL', 'DRILL', 'PIPE', 'NUKE', 'HYDRO'],
  Industrials: ['IND', 'MACH', 'AERO', 'RAIL', 'SHIP', 'CONS', 'ENGI', 'LOG', 'WARE', 'FAB'],
  Utilities: ['UTIL', 'POWER', 'WATER', 'ELEC', 'GASCO', 'WASTE', 'GRID', 'ATOM', 'SOL', 'WAVE'],
  'Real Estate': ['REAL', 'PROP', 'LAND', 'HOME', 'TOWER', 'PLAZ', 'TERR', 'EST', 'PARK', 'URBN'],
  'Consumer Defensive': ['FOOD', 'BEV', 'GROC', 'HOME', 'CLEAN', 'PERS', 'TOOK', 'SMOK', 'KIDS', 'PET'],
  'Basic Materials': ['MAT', 'CHEM', 'MINE', 'GOLD', 'SILV', 'COPP', 'STEEL', 'TIMB', 'PULP', 'GLAS'],
  'Communication Services': ['MEDIA', 'TEL', 'COMM', 'STREAM', 'NEWS', 'SOC', 'AD', 'BROAD', 'FIBER', 'WIRE'],
};

// ============================================================
// Base price ranges by sector (for realism)
// ============================================================
const SECTOR_PRICE_RANGES: Record<Sector, [number, number]> = {
  Technology: [15, 800],
  Healthcare: [10, 500],
  Finance: [8, 600],
  'Consumer Cyclical': [5, 400],
  Energy: [5, 350],
  Industrials: [10, 450],
  Utilities: [15, 300],
  'Real Estate': [5, 250],
  'Consumer Defensive': [10, 350],
  'Basic Materials': [3, 200],
  'Communication Services': [8, 550],
};

// ============================================================
// Helper: Generate realistic candlestick data (100 bars)
// ============================================================
function generatePriceHistory(
  basePrice: number,
  volatility: number,
  days: number = 100
): Candle[] {
  const candles: Candle[] = [];
  let currentPrice = basePrice;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = days; i >= 0; i--) {
    const time = Math.floor((now - i * dayMs) / 1000);

    // Random walk with mean-reversion tendency
    const drift = (basePrice - currentPrice) * 0.002;
    const shock = (Math.random() - 0.5) * volatility * currentPrice * 2;
    const change = drift + shock;

    const open = currentPrice;
    const close = Math.max(0.01, open + change);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = Math.floor(
      faker.number.int({ min: 500000, max: 50000000 }) *
        (1 + Math.random() * 0.5)
    );

    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(Math.max(low, 0.01).toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

// ============================================================
// Helper: Map price to market cap (larger companies = higher market caps)
// ============================================================
function getMarketCap(price: number, sector: Sector): number {
  const baseMultiplier = faker.number.int({ min: 1000000, max: 100000000 });
  const priceFactor = price / 100;
  const sectorMultiplier: Record<Sector, number> = {
    Technology: 3.5,
    Healthcare: 2.5,
    Finance: 3.0,
    'Consumer Cyclical': 1.8,
    Energy: 2.0,
    Industrials: 1.5,
    Utilities: 1.2,
    'Real Estate': 1.0,
    'Consumer Defensive': 2.2,
    'Basic Materials': 0.8,
    'Communication Services': 2.8,
  };

  return Math.floor(
    baseMultiplier * priceFactor * sectorMultiplier[sector]
  );
}

// ============================================================
// Main: Generate all stocks
// ============================================================
export function generateStocks(count: number = 5000): Stock[] {
  const stocks: Stock[] = [];
  const usedSymbols = new Set<string>();
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const sector = faker.helpers.arrayElement(SECTORS);

    // Generate unique symbol
    const prefix = faker.helpers.arrayElement(SECTOR_PREFIXES[sector]);
    let symbol: string;
    do {
      const suffix = faker.string.alphanumeric({ length: 3, casing: 'upper' });
      symbol = `${prefix}${suffix}`;
    } while (usedSymbols.has(symbol));
    usedSymbols.add(symbol);

    // Generate unique company name
    let companyName: string;
    do {
      const adj = faker.company.buzzAdjective();
      const noun = faker.company.buzzNoun();
      const corpType = faker.helpers.arrayElement(['Inc.', 'Corp.', 'Technologies', 'Group', 'Holdings']);
      companyName = `${adj} ${noun} ${corpType}`;
    } while (usedNames.has(companyName));
    usedNames.add(companyName);

    // Price generation
    const [minPrice, maxPrice] = SECTOR_PRICE_RANGES[sector];
    const basePrice = Number(
      faker.number
        .float({ min: minPrice, max: maxPrice, fractionDigits: 2 })
        .toFixed(2)
    );
    const volatility = faker.number.float({ min: 0.01, max: 0.05 });

    // Generate price history
    const priceHistory = generatePriceHistory(basePrice, volatility, 100);
    const latestCandle = priceHistory[priceHistory.length - 1];
    const prevCandle = priceHistory[priceHistory.length - 2] || latestCandle;
    const change = Number((latestCandle.close - prevCandle.close).toFixed(2));
    const changePercent = Number(
      ((change / prevCandle.close) * 100).toFixed(2)
    );

    // Calculate all technical indicators
    const indicators = generateIndicatorValues(priceHistory);

    // 52-week high/low from price history
    const allHighs = priceHistory.map((c) => c.high);
    const allLows = priceHistory.map((c) => c.low);

    const stock: Stock = {
      id: `${symbol}-${i}`,
      symbol,
      companyName,
      sector,
      price: latestCandle.close,
      volume: latestCandle.volume,
      marketCap: getMarketCap(latestCandle.close, sector),
      change,
      changePercent,
      high52Week: Math.max(...allHighs),
      low52Week: Math.min(...allLows),
      peRatio: Number(
        faker.number.float({ min: 5, max: 80, fractionDigits: 2 })
      ),
      dividendYield: Number(
        faker.number.float({ min: 0, max: 6, fractionDigits: 2 })
      ),

      // Technical indicators
      sma20: indicators.sma20,
      sma50: indicators.sma50,
      ema12: indicators.ema12,
      ema26: indicators.ema26,
      rsi: indicators.rsi,
      macd: indicators.macd,
      macdSignal: indicators.macdSignal,
      macdHistogram: indicators.macdHistogram,
      bollingerUpper: indicators.bollingerUpper,
      bollingerMiddle: indicators.bollingerMiddle,
      bollingerLower: indicators.bollingerLower,

      // Full price history for charting
      priceHistory,
    };

    stocks.push(stock);
  }

  return stocks;
}

/**
 * Singleton pattern: generate stocks once and cache them.
 * This ensures all components see the same data.
 */
let cachedStocks: Stock[] | null = null;

export function getStocks(count: number = 5000): Stock[] {
  if (!cachedStocks) {
    console.time('generateStocks');
    cachedStocks = generateStocks(count);
    console.timeEnd('generateStocks');
    console.log(`Generated ${cachedStocks.length} stock records`);
  }
  return cachedStocks;
}

/**
 * Updates a stock's price with a random walk for live simulation.
 */
export function simulatePriceUpdate(stock: Stock): Stock {
  const volatility = 0.02; // 2% max change
  const change = (Math.random() - 0.5) * 2 * volatility * stock.price;
  const newPrice = Number((stock.price + change).toFixed(2));

  // Update the latest candle
  const updatedHistory = [...stock.priceHistory];
  const lastCandle = { ...updatedHistory[updatedHistory.length - 1] };
  lastCandle.close = newPrice;
  lastCandle.high = Math.max(lastCandle.high, newPrice);
  lastCandle.low = Math.min(lastCandle.low, newPrice);
  updatedHistory[updatedHistory.length - 1] = lastCandle;

  // Recalculate indicators
  const indicators = generateIndicatorValues(updatedHistory);

  return {
    ...stock,
    price: newPrice,
    change: Number((newPrice - lastCandle.open).toFixed(2)),
    changePercent: Number(
      (((newPrice - lastCandle.open) / lastCandle.open) * 100).toFixed(2)
    ),
    volume: Math.floor(stock.volume * (1 + (Math.random() - 0.5) * 0.1)),
    ...indicators,
    priceHistory: updatedHistory,
  };
}
