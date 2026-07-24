// ============================================================
// Stock Filtering & Sorting Utilities
// ============================================================
// Pure functions for filtering and sorting stock data.
// These are separate from UI so they can be tested independently
// and reused across components.
// ============================================================

import type { Stock, StockFilters, SortConfig } from '../types/stock';

/**
 * Applies all active filters to the stock array.
 * Uses early-exit pattern: each filter returns immediately if the
 * stock doesn't match, avoiding unnecessary checks.
 */
export function applyFilters(stocks: Stock[], filters: StockFilters): Stock[] {
  return stocks.filter((stock) => {
    // Symbol search (case-insensitive partial match)
    if (
      filters.symbol &&
      !stock.symbol.toLowerCase().includes(filters.symbol.toLowerCase())
    ) {
      return false;
    }

    // Company name search (case-insensitive partial match)
    if (
      filters.companyName &&
      !stock.companyName.toLowerCase().includes(filters.companyName.toLowerCase())
    ) {
      return false;
    }

    // Sector exact match
    if (filters.sector && stock.sector !== filters.sector) {
      return false;
    }

    // Price range
    if (stock.price < filters.priceMin || stock.price > filters.priceMax) {
      return false;
    }

    // Volume range
    if (stock.volume < filters.volumeMin || stock.volume > filters.volumeMax) {
      return false;
    }

    // Market cap range
    if (stock.marketCap < filters.marketCapMin || stock.marketCap > filters.marketCapMax) {
      return false;
    }

    // RSI range (0-100)
    if (stock.rsi < filters.rsiMin || stock.rsi > filters.rsiMax) {
      return false;
    }

    // MACD range
    if (stock.macd < filters.macdMin || stock.macd > filters.macdMax) {
      return false;
    }

    return true;
  });
}

/**
 * Sorts stocks by a given column and direction.
 * Handles string, number sorting correctly.
 */
export function applySorting(
  stocks: Stock[],
  sortConfig: SortConfig
): Stock[] {
  if (!sortConfig.column) return stocks;

  const sorted = [...stocks];
  const { column, direction } = sortConfig;
  const multiplier = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * multiplier;
    }

    return 0;
  });

  return sorted;
}

/**
 * Combines filtering and sorting into a single pipeline.
 * Filters first to reduce the dataset, then sorts.
 */
export function filterAndSortStocks(
  stocks: Stock[],
  filters: StockFilters,
  sortConfig: SortConfig
): Stock[] {
  const filtered = applyFilters(stocks, filters);
  return applySorting(filtered, sortConfig);
}

/**
 * Checks if any filters are active (non-default values).
 * Used to show/hide "Clear Filters" button.
 */
export function hasActiveFilters(filters: StockFilters): boolean {
  return (
    filters.symbol !== '' ||
    filters.companyName !== '' ||
    filters.sector !== '' ||
    filters.priceMin !== 0 ||
    filters.priceMax !== Infinity ||
    filters.volumeMin !== 0 ||
    filters.volumeMax !== Infinity ||
    filters.marketCapMin !== 0 ||
    filters.marketCapMax !== Infinity ||
    filters.rsiMin !== 0 ||
    filters.rsiMax !== 100 ||
    filters.macdMin !== -Infinity ||
    filters.macdMax !== Infinity
  );
}

/**
 * Returns the filtered count vs total count as a string.
 */
export function getFilterSummary(total: number, filtered: number): string {
  if (total === filtered) return `${total.toLocaleString()} stocks`;
  return `${filtered.toLocaleString()} / ${total.toLocaleString()} stocks`;
}