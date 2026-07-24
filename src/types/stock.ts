// ============================================================
// Core Stock Data Types
// ============================================================

export interface Stock {
  id: string;
  symbol: string;
  companyName: string;
  sector: Sector;
  price: number;
  volume: number;
  marketCap: number;
  change: number;
  changePercent: number;
  high52Week: number;
  low52Week: number;
  peRatio: number;
  dividendYield: number;
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  priceHistory: Candle[];
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Sector =
  | 'Technology'
  | 'Healthcare'
  | 'Finance'
  | 'Consumer Cyclical'
  | 'Energy'
  | 'Industrials'
  | 'Utilities'
  | 'Real Estate'
  | 'Consumer Defensive'
  | 'Basic Materials'
  | 'Communication Services';

export const SECTORS: Sector[] = [
  'Technology',
  'Healthcare',
  'Finance',
  'Consumer Cyclical',
  'Energy',
  'Industrials',
  'Utilities',
  'Real Estate',
  'Consumer Defensive',
  'Basic Materials',
  'Communication Services',
];

export interface StockFilters {
  symbol: string;
  companyName: string;
  sector: Sector | '';
  priceMin: number;
  priceMax: number;
  volumeMin: number;
  volumeMax: number;
  marketCapMin: number;
  marketCapMax: number;
  rsiMin: number;
  rsiMax: number;
  macdMin: number;
  macdMax: number;
}

export const DEFAULT_FILTERS: StockFilters = {
  symbol: '',
  companyName: '',
  sector: '',
  priceMin: 0,
  priceMax: Infinity,
  volumeMin: 0,
  volumeMax: Infinity,
  marketCapMin: 0,
  marketCapMax: Infinity,
  rsiMin: 0,
  rsiMax: 100,
  macdMin: -Infinity,
  macdMax: Infinity,
};

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  column: keyof Stock | null;
  direction: SortDirection;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export type Timeframe = '1M' | '3M' | '6M' | '1Y';

export interface ChartConfig {
  symbol: string | null;
  timeframe: Timeframe;
  indicators: TechnicalIndicatorType[];
}

export type TechnicalIndicatorType =
  | 'sma20'
  | 'sma50'
  | 'ema12'
  | 'ema26'
  | 'rsi'
  | 'macd'
  | 'bollinger';