// ============================================================
// Hook: useStockChart
// ============================================================
// Provides the selected stock's price history data for charting,
// based on the current chart config (symbol, timeframe).
// ============================================================

import { useMemo } from 'react';
import { useStockStore } from '../store/useStockStore';
import type { Candle } from '../types/stock';

export function useStockChart() {
  const chartConfig = useStockStore((s) => s.chartConfig);
  const allStocks = useStockStore((s) => s.allStocks);

  const selectedStock = useMemo(
    () => allStocks.find((s) => s.symbol === chartConfig.symbol) || null,
    [allStocks, chartConfig.symbol]
  );

  const priceHistory = useMemo((): Candle[] => {
    if (!selectedStock) return [];

    const history = selectedStock.priceHistory;
    const lookback =
      chartConfig.timeframe === '1M'
        ? 21
        : chartConfig.timeframe === '3M'
          ? 63
          : chartConfig.timeframe === '6M'
            ? 126
            : history.length;

    return history.slice(-lookback);
  }, [selectedStock, chartConfig.timeframe]);

  return {
    stock: selectedStock,
    priceHistory,
    chartConfig,
  };
}