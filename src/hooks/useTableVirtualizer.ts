// ============================================================
// Hook: useTableVirtualizer
// ============================================================
// Wraps TanStack Virtual's useVirtualizer for the stock table.
// Provides scrollable virtual rows, smooth scrolling even
// with 5000+ records.
// ============================================================

import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface UseTableVirtualizerOptions {
  rowCount: number;
  estimatedRowHeight?: number;
  overscan?: number;
}

export function useTableVirtualizer({
  rowCount,
  estimatedRowHeight = 52,
  overscan = 10,
}: UseTableVirtualizerOptions) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: useCallback(() => tableContainerRef.current, []),
    estimateSize: useCallback(() => estimatedRowHeight, [estimatedRowHeight]),
    overscan,
  });

  return {
    tableContainerRef,
    virtualRows: rowVirtualizer.getVirtualItems(),
    totalSize: rowVirtualizer.getTotalSize(),
    scrollToIndex: rowVirtualizer.scrollToIndex,
    rowVirtualizer,
  };
}