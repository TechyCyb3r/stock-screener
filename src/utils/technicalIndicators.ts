// ============================================================
// Technical Indicator Calculation Utilities
// ============================================================
// These functions calculate common technical indicators used
// in stock market analysis. All functions are pure and
// operate on time-series price data.
// ============================================================

import type { Candle } from '../types/stock';

/**
 * Calculates Simple Moving Average (SMA) over a given period.
 * SMA = (Sum of closing prices over N periods) / N
 */
export function calculateSMA(candles: Candle[], period: number): number[] {
  const closes = candles.map((c) => c.close);
  const result: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += closes[j];
    }
    result.push(sum / period);
  }

  return result;
}

/**
 * Calculates Exponential Moving Average (EMA) over a given period.
 * EMA = (Close - EMA_prev) * multiplier + EMA_prev
 * multiplier = 2 / (period + 1)
 */
export function calculateEMA(candles: Candle[], period: number): number[] {
  const closes = candles.map((c) => c.close);
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA value is SMA
  let prevEMA = 0;
  for (let i = 0; i < period; i++) {
    prevEMA += closes[i];
  }
  prevEMA /= period;
  result.push(0); // index 0 placeholder

  for (let i = 1; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }
    if (i === period - 1) {
      result.push(Number(prevEMA.toFixed(2)));
      continue;
    }
    const ema = (closes[i] - prevEMA) * multiplier + prevEMA;
    prevEMA = ema;
    result.push(Number(ema.toFixed(2)));
  }

  return result;
}

/**
 * Calculates Relative Strength Index (RSI) over 14 periods.
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss
 */
export function calculateRSI(candles: Candle[], period: number = 14): number[] {
  const closes = candles.map((c) => c.close);
  const result: number[] = [];

  if (closes.length < period + 1) {
    return closes.map(() => 50);
  }

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  // First RSI using simple averages
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      result.push(0);
      continue;
    }
    if (i === period) {
      const rs = avgGain / (avgLoss || 0.0001);
      result.push(Number((100 - 100 / (1 + rs)).toFixed(2)));
      continue;
    }

    // Subsequent values use smoothed averages
    const gain = gains[i - 1] || 0;
    const loss = losses[i - 1] || 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / (avgLoss || 0.0001);
    result.push(Number((100 - 100 / (1 + rs)).toFixed(2)));
  }

  return result;
}

/**
 * Calculates MACD (Moving Average Convergence Divergence).
 * MACD Line = EMA(12) - EMA(26)
 * Signal Line = EMA(9) of MACD Line
 * MACD Histogram = MACD Line - Signal Line
 */
export function calculateMACD(candles: Candle[]) {
  const ema12 = calculateEMA(candles, 12);
  const ema26 = calculateEMA(candles, 26);

  const macdLine: number[] = [];
  for (let i = 0; i < ema12.length; i++) {
    if (ema12[i] === 0 || ema26[i] === 0) {
      macdLine.push(0);
    } else {
      macdLine.push(Number((ema12[i] - ema26[i]).toFixed(4)));
    }
  }

  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMABasic(macdLine, 9);
  const histogram: number[] = [];

  for (let i = 0; i < macdLine.length; i++) {
    histogram.push(Number((macdLine[i] - signalLine[i]).toFixed(4)));
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Basic EMA calculation for arrays of numbers (not candles).
 */
function calculateEMABasic(values: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period && i < values.length; i++) {
    sum += values[i];
  }
  let prevEMA = sum / period;

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }
    if (i === period - 1) {
      result.push(Number(prevEMA.toFixed(4)));
      continue;
    }
    const ema = (values[i] - prevEMA) * multiplier + prevEMA;
    prevEMA = ema;
    result.push(Number(ema.toFixed(4)));
  }

  return result;
}

/**
 * Calculates Bollinger Bands.
 * Middle Band = 20-period SMA
 * Upper Band = Middle Band + (2 * Standard Deviation)
 * Lower Band = Middle Band - (2 * Standard Deviation)
 */
export function calculateBollingerBands(candles: Candle[], period: number = 20, stdDev: number = 2) {
  const sma20 = calculateSMA(candles, period);
  const closes = candles.map((c) => c.close);

  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(0);
      lower.push(0);
      continue;
    }

    // Calculate standard deviation
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = sma20[i];
    const squaredDiffs = slice.map((v) => (v - mean) ** 2);
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(variance);

    upper.push(Number((mean + stdDev * std).toFixed(2)));
    lower.push(Number((mean - stdDev * std).toFixed(2)));
  }

  return { upper, middle: sma20, lower };
}

/**
 * Generates all technical indicators for a set of candles.
 * Returns the latest values for each indicator.
 */
export function generateIndicatorValues(candles: Candle[]) {
  const sma20 = calculateSMA(candles, 20);
  const sma50 = calculateSMA(candles, 50);
  const ema12 = calculateEMA(candles, 12);
  const ema26 = calculateEMA(candles, 26);
  const rsi = calculateRSI(candles, 14);
  const macd = calculateMACD(candles);
  const bollinger = calculateBollingerBands(candles);

  const lastIdx = candles.length - 1;

  return {
    sma20: sma20[lastIdx] || 0,
    sma50: sma50[lastIdx] || 0,
    ema12: ema12[lastIdx] || 0,
    ema26: ema26[lastIdx] || 0,
    rsi: rsi[lastIdx] || 50,
    macd: macd.macdLine[lastIdx] || 0,
    macdSignal: macd.signalLine[lastIdx] || 0,
    macdHistogram: macd.histogram[lastIdx] || 0,
    bollingerUpper: bollinger.upper[lastIdx] || 0,
    bollingerMiddle: bollinger.middle[lastIdx] || 0,
    bollingerLower: bollinger.lower[lastIdx] || 0,
  };
}