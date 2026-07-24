// ============================================================
// StockTable Component
// ============================================================
// Professional virtualized stock table with incremental loading.
// Loads 20 stocks at a time with preloader on scroll/button click.
// ============================================================

import { memo, useCallback, useEffect } from 'react';
import { useStockData, useTableVirtualizer } from '../../hooks';
import { useStockStore } from '../../store/useStockStore';
import { LoadingSpinner, ErrorState, EmptyState, PriceChange } from '../common';
import { BiSortAlt2, BiSortUp, BiSortDown } from 'react-icons/bi';
import type { Stock } from '../../types/stock';

// ============================================================
// Sort Header Component
// ============================================================
const SortHeader = memo(function SortHeader({
  column,
  label,
  sortConfig,
  onSort,
  className = '',
}: {
  column: string;
  label: string;
  sortConfig: { column: string | null; direction: 'asc' | 'desc' };
  onSort: (column: string) => void;
  className?: string;
}) {
  const isSorted = sortConfig.column === column;
  return (
    <button
      onClick={() => onSort(column)}
      className={`flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors ${className}`}
    >
      {label}
      {isSorted ? (
        sortConfig.direction === 'asc' ? (
          <BiSortUp size={13} />
        ) : (
          <BiSortDown size={13} />
        )
      ) : (
        <BiSortAlt2 size={13} className="opacity-30 group-hover:opacity-60" />
      )}
    </button>
  );
});

// ============================================================
// Table Row Component
// ============================================================
const TableRow = memo(function TableRow({
  stock,
  isSelected,
  onSelect,
}: {
  stock: Stock;
  isSelected: boolean;
  onSelect: (stock: Stock) => void;
}) {
  return (
    <div
      onClick={() => onSelect(stock)}
      className={`grid grid-cols-[80px_minmax(100px,1fr)_85px_135px_95px_minmax(90px,1fr)_100px_65px_75px] gap-2 px-4 py-3 border-b border-gray-800/60 cursor-pointer transition-all duration-150 text-sm ${
        isSelected
          ? 'bg-blue-500/8 border-l-[3px] border-l-blue-500 shadow-inner'
          : 'hover:bg-white/[0.02] border-l-[3px] border-l-transparent'
      }`}
    >
      <span className="font-semibold text-gray-100 truncate text-[13px]">{stock.symbol}</span>
      <span className="text-gray-400 truncate text-[12.5px]" title={stock.companyName}>
        {stock.companyName}
      </span>
      <span className="font-semibold text-gray-100 text-right tabular-nums">
        ${stock.price.toFixed(2)}
      </span>
      <div className="text-right">
        <PriceChange change={stock.change} changePercent={stock.changePercent} />
      </div>
      <span className="text-gray-400 text-right tabular-nums text-[12.5px]">{stock.volume.toLocaleString()}</span>
      <span className="text-gray-500 truncate text-[12.5px]">{stock.sector}</span>
      <span className="text-gray-400 text-right tabular-nums text-[12.5px]">
        ${(stock.marketCap / 1_000_000_000).toFixed(1)}B
      </span>
      <StockIndicator value={stock.rsi} />
      <span className={`text-[12.5px] font-semibold text-right tabular-nums ${
        stock.macd >= 0 ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {stock.macd.toFixed(2)}
      </span>
    </div>
  );
});

// ============================================================
// RSI Indicator with color coding
// ============================================================
const StockIndicator = memo(function StockIndicator({ value }: { value: number }) {
  const color = value >= 70 ? 'text-red-400' : value <= 30 ? 'text-emerald-400' : 'text-gray-400';
  const bg = value >= 70 ? 'bg-red-500/10' : value <= 30 ? 'bg-emerald-500/10' : 'bg-gray-800';
  return (
    <span className={`${color} ${bg} text-[12px] font-semibold text-right tabular-nums px-1.5 py-0.5 rounded`}>
      {value.toFixed(1)}
    </span>
  );
});

// ============================================================
// Table Header
// ============================================================
const TableHeader = memo(function TableHeader({
  sortConfig,
  onSort,
}: {
  sortConfig: { column: string | null; direction: 'asc' | 'desc' };
  onSort: (column: string) => void;
}) {
  return (
    <div className="grid grid-cols-[80px_minmax(100px,1fr)_85px_135px_95px_minmax(90px,1fr)_100px_65px_75px] gap-2 px-4 py-2.5 border-b border-gray-700/60 bg-gray-900/80 group">
      <SortHeader column="symbol" label="Symbol" sortConfig={sortConfig} onSort={onSort} />
      <SortHeader column="companyName" label="Company" sortConfig={sortConfig} onSort={onSort} />
      <SortHeader column="price" label="Price" sortConfig={sortConfig} onSort={onSort} />
      <SortHeader column="change" label="Change" sortConfig={sortConfig} onSort={onSort} />
      <SortHeader column="volume" label="Volume" sortConfig={sortConfig} onSort={onSort} />
      <SortHeader column="sector" label="Sector" sortConfig={sortConfig} onSort={onSort} />
      <SortHeader column="marketCap" label="Mkt Cap" sortConfig={sortConfig} onSort={onSort} className="justify-end" />
      <SortHeader column="rsi" label="RSI" sortConfig={sortConfig} onSort={onSort} className="justify-end" />
      <SortHeader column="macd" label="MACD" sortConfig={sortConfig} onSort={onSort} className="justify-end" />
    </div>
  );
});

// ============================================================
// Main StockTable Component
// ============================================================
export function StockTable() {
  const { stocks, loadingState, error, isEmpty, sortConfig, selectedStock, isLoadingMore, loadMoreStocks } = useStockData();
  const setSortConfig = useStockStore((s) => s.setSortConfig);
  const setSelectedStock = useStockStore((s) => s.setSelectedStock);
  const { tableContainerRef, virtualRows, totalSize } = useTableVirtualizer({
    rowCount: stocks.length,
    estimatedRowHeight: 48,
  });

  const handleSort = useCallback(
    (column: string) => {
      setSortConfig({
        column: column as keyof Stock,
        direction:
          sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    },
    [sortConfig, setSortConfig]
  );

  const handleSelect = useCallback((stock: Stock) => setSelectedStock(stock), [setSelectedStock]);

  // Infinite scroll: load more when near bottom
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more when within 150px of bottom (lower threshold for mobile)
      if (scrollHeight - scrollTop - clientHeight < 150) {
        // Debounce to avoid rapid-fire calls
        if (!scrollTimer) {
          scrollTimer = setTimeout(() => {
            loadMoreStocks();
            scrollTimer = null;
          }, 100);
        }
      } else {
        if (scrollTimer) {
          clearTimeout(scrollTimer);
          scrollTimer = null;
        }
      }
    };

    // Use passive listener for better scroll performance on mobile
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [loadMoreStocks]);

  if (loadingState === 'loading') {
    return (
      <div className="glass-card rounded-xl overflow-hidden">
        <LoadingSpinner text="Loading 5000+ stock records..." />
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="glass-card rounded-xl overflow-hidden">
        <ErrorState message={error || 'Failed to load stocks'} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="glass-card rounded-xl overflow-hidden">
        <TableHeader sortConfig={sortConfig} onSort={handleSort} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden neon-glow-blue h-full flex flex-col">
      {/* Scrollable table body with sticky header */}
      <div
        ref={tableContainerRef}
        className="overflow-auto relative flex-1"
        style={{ minHeight: 200, minWidth: 0 }}
      >
        {/* Inner wrapper - ensures header + rows scroll together horizontally */}
        <div className="inline-block min-w-full">
          {/* Sticky header */}
          <div className="sticky top-0 z-20 bg-[#0f172a]">
            <TableHeader sortConfig={sortConfig} onSort={handleSort} />
          </div>
          {/* Virtualized rows */}
          <div style={{ height: totalSize, position: 'relative' }}>
            <div style={{ height: virtualRows[0]?.start || 0 }} />
            {virtualRows.map((virtualRow) => {
              const stock = stocks[virtualRow.index];
              if (!stock) return null;
              return (
                <TableRow
                  key={stock.id}
                  stock={stock}
                  isSelected={selectedStock?.id === stock.id}
                  onSelect={handleSelect}
                />
              );
            })}
            <div style={{ height: Math.max(0, totalSize - (virtualRows[virtualRows.length - 1]?.start || 0) - (virtualRows[virtualRows.length - 1]?.size || 0)) }} />
          </div>
          {/* Preloader at bottom */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-3 border-t border-gray-800/40">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-xs text-gray-500">Loading more stocks...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}