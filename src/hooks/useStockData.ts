// ============================================================
// Hook: useStockData
// ============================================================
// Provides filtered, sorted stock data from the Zustand store.
// ============================================================

import { useMemo } from 'react';
import { useStockStore } from '../store/useStockStore';
import { getFilterSummary } from '../utils/filtering';

export function useStockData() {
  const filteredStocks = useStockStore((s) => s.filteredStocks);
  const displayedStocks = useStockStore((s) => s.displayedStocks);
  const allStocks = useStockStore((s) => s.allStocks);
  const loadingState = useStockStore((s) => s.loadingState);
  const isLoadingMore = useStockStore((s) => s.isLoadingMore);
  const error = useStockStore((s) => s.error);
  const selectedStock = useStockStore((s) => s.selectedStock);
  const filters = useStockStore((s) => s.filters);
  const sortConfig = useStockStore((s) => s.sortConfig);
  const loadMoreStocks = useStockStore((s) => s.loadMoreStocks);

  const summary = useMemo(
    () => getFilterSummary(allStocks.length, filteredStocks.length),
    [allStocks.length, filteredStocks.length]
  );

  const isEmpty = useMemo(
    () => loadingState === 'success' && filteredStocks.length === 0,
    [loadingState, filteredStocks.length]
  );

  return {
    stocks: displayedStocks, // Use displayedStocks for pagination
    allStocks,
    filteredStocks,
    loadingState,
    isLoadingMore,
    error,
    selectedStock,
    filters,
    sortConfig,
    summary,
    isEmpty,
    loadMoreStocks,
  };
}