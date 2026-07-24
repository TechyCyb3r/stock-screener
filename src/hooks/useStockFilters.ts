// ============================================================
// Hook: useStockFilters
// ============================================================
// Encapsulates filter-related logic: setting, resetting,
// and checking if filters are active.
// ============================================================

import { useCallback } from 'react';
import { useStockStore } from '../store/useStockStore';
import { hasActiveFilters } from '../utils/filtering';
import type { StockFilters } from '../types/stock';

export function useStockFilters() {
  const filters = useStockStore((s) => s.filters);
  const setFilters = useStockStore((s) => s.setFilters);
  const resetFilters = useStockStore((s) => s.resetFilters);

  const active = hasActiveFilters(filters);

  const updateFilter = useCallback(
    (partial: Partial<StockFilters>) => {
      setFilters(partial);
    },
    [setFilters]
  );

  const clearAll = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return {
    filters,
    active,
    updateFilter,
    clearAll,
  };
}