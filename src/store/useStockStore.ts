// ============================================================
// Zustand Stock Store
// ============================================================
// Central state management for the entire stock screener.
// ============================================================

import { create } from 'zustand';
import type {
  Stock,
  StockFilters,
  SortConfig,
  LoadingState,
  ChartConfig,
  Timeframe,
  TechnicalIndicatorType,
} from '../types/stock';
import { DEFAULT_FILTERS } from '../types/stock';
import { getStocks } from '../data/generateStocks';
import { filterAndSortStocks } from '../utils/filtering';
import { priceSimulator } from '../services/priceSimulator';

interface StockStore {
  // --- Data ---
  allStocks: Stock[];
  filteredStocks: Stock[];
  displayedStocks: Stock[]; // Stocks currently shown (pagination)
  visibleCount: number; // How many stocks are currently loaded

  // --- UI State ---
  loadingState: LoadingState;
  isLoadingMore: boolean; // Preloader state for incremental loading
  error: string | null;
  selectedStock: Stock | null;

  // --- Filters & Sort ---
  filters: StockFilters;
  sortConfig: SortConfig;

  // --- Live Updates ---
  isLiveEnabled: boolean;

  // --- Chart ---
  chartConfig: ChartConfig;

  // --- Filters Panel ---
  showFilters: boolean;

  // --- Actions ---
  initialize: () => void;
  setFilters: (filters: Partial<StockFilters>) => void;
  resetFilters: () => void;
  setSortConfig: (config: SortConfig) => void;
  setSelectedStock: (stock: Stock | null) => void;
  toggleLiveUpdates: () => void;
  setChartSymbol: (symbol: string | null) => void;
  setChartTimeframe: (timeframe: Timeframe) => void;
  toggleIndicator: (indicator: TechnicalIndicatorType) => void;
  toggleFilters: () => void;
  loadMoreStocks: () => void; // Load next 20 stocks

  // Internal
  updateStock: (updatedStock: Stock) => void;
  batchUpdateStocks: (updatedStocks: Stock[]) => void;
  reapplyFilters: () => void;
}

export const useStockStore = create<StockStore>((set, get) => ({
  // --- Initial State ---
  allStocks: [],
  filteredStocks: [],
  displayedStocks: [],
  visibleCount: 20, // Load 20 stocks at a time
  loadingState: 'idle',
  isLoadingMore: false,
  error: null,
  selectedStock: null,
  filters: { ...DEFAULT_FILTERS },
  sortConfig: { column: null, direction: 'desc' },
  isLiveEnabled: true,
  chartConfig: {
    symbol: null,
    timeframe: '3M',
    indicators: ['sma20'],
  },
  showFilters: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,

  // ============================================================
  // Actions
  // ============================================================

  initialize: () => {
    const state = get();
    if (state.loadingState === 'loading' || state.loadingState === 'success') return;

    set({ loadingState: 'loading', error: null, isLoadingMore: false });

    try {
      const stocks = getStocks(5000);

      // Apply initial sort by symbol
      const initialSort: SortConfig = { column: 'symbol', direction: 'asc' };
      const sorted = filterAndSortStocks(stocks, DEFAULT_FILTERS, initialSort);

      // Initialize and start the price simulator
      priceSimulator.init(stocks);
      priceSimulator.toggle(); // Start live updates by default

      // Subscribe to batch price updates only (much more efficient than individual)
      let updateTimer: ReturnType<typeof setTimeout> | null = null;
      priceSimulator.onPriceUpdate((updatedStock: Stock) => {
        const state = get();
        const allStocks = state.allStocks.map((s) =>
          s.id === updatedStock.id ? updatedStock : s
        );
        const selectedStock = state.selectedStock?.id === updatedStock.id ? updatedStock : state.selectedStock;
        
        // Batch filter calls using requestAnimationFrame pattern
        // Only reapply filters once every 200ms max
        set({ allStocks, selectedStock });
        
        if (!updateTimer) {
          updateTimer = setTimeout(() => {
            get().reapplyFilters();
            updateTimer = null;
          }, 200);
        }
      });

      // Load first 20 stocks only
      const initialDisplayed = sorted.slice(0, 20);

      set({
        allStocks: stocks,
        filteredStocks: sorted,
        displayedStocks: initialDisplayed,
        visibleCount: 20,
        loadingState: 'success',
        isLoadingMore: false,
        sortConfig: initialSort,
      });

      // Auto-select first stock
      if (initialDisplayed.length > 0) {
        set({ selectedStock: initialDisplayed[0], chartConfig: { ...get().chartConfig, symbol: initialDisplayed[0].symbol } });
      }
    } catch (err) {
      set({
        loadingState: 'error',
        error: err instanceof Error ? err.message : 'Failed to initialize stock data',
        isLoadingMore: false,
      });
    }
  },

  loadMoreStocks: () => {
    const state = get();
    if (state.isLoadingMore) return; // Prevent duplicate loads
    if (state.visibleCount >= state.filteredStocks.length) return; // All loaded

    set({ isLoadingMore: true });

    // Simulate network delay for preloader effect
    setTimeout(() => {
      const currentState = get();
      const newCount = Math.min(currentState.visibleCount + 20, currentState.filteredStocks.length);
      const newDisplayed = currentState.filteredStocks.slice(0, newCount);

      set({
        displayedStocks: newDisplayed,
        visibleCount: newCount,
        isLoadingMore: false,
      });
    }, 300); // 300ms delay to show preloader
  },

  setFilters: (partial: Partial<StockFilters>) => {
    const state = get();
    const newFilters = { ...state.filters, ...partial };
    set({ filters: newFilters, isLoadingMore: true });

    setTimeout(() => {
      get().reapplyFilters();
      set({ isLoadingMore: false });
    }, 300);
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS }, isLoadingMore: true });
    setTimeout(() => {
      get().reapplyFilters();
      set({ isLoadingMore: false });
    }, 300);
  },

  setSortConfig: (config: SortConfig) => {
    set({ sortConfig: config, isLoadingMore: true });
    setTimeout(() => {
      get().reapplyFilters();
      set({ isLoadingMore: false });
    }, 300);
  },

  setSelectedStock: (stock: Stock | null) => {
    set({ selectedStock: stock, isLoadingMore: true });
    if (stock) {
      set({ chartConfig: { ...get().chartConfig, symbol: stock.symbol } });
    }
    setTimeout(() => set({ isLoadingMore: false }), 200);
  },

  toggleLiveUpdates: () => {
    const isRunning = priceSimulator.toggle();
    set({ isLiveEnabled: isRunning, isLoadingMore: true });
    setTimeout(() => set({ isLoadingMore: false }), 200);
  },

  setChartSymbol: (symbol: string | null) => {
    set({ chartConfig: { ...get().chartConfig, symbol }, isLoadingMore: true });
    setTimeout(() => set({ isLoadingMore: false }), 200);
  },

  setChartTimeframe: (timeframe: Timeframe) => {
    set({ chartConfig: { ...get().chartConfig, timeframe }, isLoadingMore: true });
    setTimeout(() => set({ isLoadingMore: false }), 200);
  },

  toggleIndicator: (indicator: TechnicalIndicatorType) => {
    const state = get();
    const current = state.chartConfig.indicators;
    const next = current.includes(indicator)
      ? current.filter((i) => i !== indicator)
      : [...current, indicator];
    set({ chartConfig: { ...state.chartConfig, indicators: next }, isLoadingMore: true });
    setTimeout(() => set({ isLoadingMore: false }), 200);
  },

  toggleFilters: () => {
    set({ showFilters: !get().showFilters, isLoadingMore: true });
    setTimeout(() => set({ isLoadingMore: false }), 200);
  },

  // ============================================================
  // Internal Actions
  // ============================================================

  updateStock: (updatedStock: Stock) => {
    const state = get();
    const allStocks = state.allStocks.map((s) =>
      s.id === updatedStock.id ? updatedStock : s
    );
    set({ allStocks });

    // Update selected stock if it's the one being updated
    if (state.selectedStock?.id === updatedStock.id) {
      set({ selectedStock: updatedStock });
    }
  },

  batchUpdateStocks: (updatedStocks: Stock[]) => {
    const state = get();
    const updateMap = new Map(updatedStocks.map((s) => [s.id, s]));
    const allStocks = state.allStocks.map((s) => updateMap.get(s.id) || s);
    set({ allStocks });

    // Update selected stock if it's in the batch
    if (state.selectedStock && updateMap.has(state.selectedStock.id)) {
      set({ selectedStock: updateMap.get(state.selectedStock.id)! });
    }
  },

  reapplyFilters: () => {
    const state = get();
    const filtered = filterAndSortStocks(
      state.allStocks,
      state.filters,
      state.sortConfig
    );
    set({ filteredStocks: filtered });

    // Reset visible count and load first 20
    const initialDisplayed = filtered.slice(0, 20);
    set({
      displayedStocks: initialDisplayed,
      visibleCount: 20,
    });

    // Ensure selected stock is still in the filtered list
    if (state.selectedStock) {
      const stillExists = filtered.some((s) => s.id === state.selectedStock!.id);
      if (!stillExists && filtered.length > 0) {
        set({ selectedStock: filtered[0] });
      } else if (!stillExists) {
        set({ selectedStock: null });
      }
    } else if (filtered.length > 0) {
      set({ selectedStock: filtered[0] });
    }
  },
}));