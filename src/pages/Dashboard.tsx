// ============================================================
// Dashboard Page
// ============================================================
// Desktop: 3-column (filters | stock table | chart+details)
// Tablet (768px): Stock table top, graph 50% + sidebar 50% bottom
// Mobile: Stacked tab layout
// ============================================================

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Header } from '../components/dashboard/Header';
import { FilterPanel } from '../components/filters/FilterPanel';
import { StockTable } from '../components/table/StockTable';
import { CandlestickChart } from '../components/charts/CandlestickChart';
import { PriceTrendChart } from '../components/charts/PriceTrendChart';
import { IndicatorControls } from '../components/indicators/IndicatorControls';
import { StockDetailCard } from '../components/dashboard/StockDetailCard';
import { GainerLoserList } from '../components/dashboard/GainerLoserList';
import { useStockStore } from '../store/useStockStore';
import { useStockData } from '../hooks';
import { BiCandles, BiLineChart, BiBarChartAlt2, BiStats } from 'react-icons/bi';

type TabType = 'timeframe' | 'market' | 'stats';

const TAB_ITEMS: { key: TabType; label: string; icon: ReactNode }[] = [
  { key: 'timeframe', label: 'Timeframe', icon: <BiLineChart size={16} /> },
  { key: 'market', label: 'Market', icon: <BiBarChartAlt2 size={16} /> },
  { key: 'stats', label: 'Stats', icon: <BiStats size={16} /> },
];

export function Dashboard() {
  const initialize = useStockStore((s) => s.initialize);
  const showFilters = useStockStore((s) => s.showFilters);
  const { loadingState } = useStockData();
  const [activeTab, setActiveTab] = useState<TabType>('timeframe');

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loadingState === 'loading') {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm text-center">Initializing Stock Screener...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] text-gray-100 overflow-hidden flex flex-col">
      <Header />

      {/* ================================================================
          DESKTOP: 3-column layout (>=1024px)
          ================================================================ */}
      <div className="hidden lg:flex flex-1 min-h-0 flex-row overflow-hidden">
        <aside
          className={`
            w-[300px] xl:w-[320px] flex-shrink-0 flex-col bg-[#0a0a0f]
            border-r border-gray-800/40 h-full
            ${showFilters ? 'flex' : 'hidden'}
          `}
        >
          <div className="flex-1 min-h-0 h-full overflow-y-auto sidebar-scroll p-3 space-y-3">
            <PriceTrendChart />
            <FilterPanel />
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#0a0a0f]">
          <div className="flex-1 p-4 overflow-auto">
            <StockTable />
          </div>
        </main>

        <aside className="w-[380px] xl:w-[420px] 2xl:w-[480px] flex-shrink-0 flex flex-col border-l border-gray-800/40 bg-[#0a0a0f] h-full overflow-y-auto sidebar-scroll">
          <div className="p-4 pb-0">
            <CandlestickChart />
          </div>
          <div className="px-4 py-3">
            <IndicatorControls />
          </div>
          <div className="px-4 pb-4 space-y-3">
            <GainerLoserList />
            <StockDetailCard />
          </div>
        </aside>
      </div>

      {/* ================================================================
          TABLET (768px-1023px): Stock table top, graph+sidebar bottom
          ================================================================ */}
      <div className="hidden md:flex lg:hidden flex-1 min-h-0 flex-col overflow-hidden">
        {/* Filters Panel - collapsible on tablet */}
        <aside
          className={`
            w-full flex-shrink-0 flex-col bg-[#0a0a0f] border-b border-gray-800/40
            max-h-[40vh] ${showFilters ? 'flex' : 'hidden'}
          `}
        >
          <div className="flex-1 min-h-0 h-full overflow-y-auto sidebar-scroll p-3 space-y-3">
            <PriceTrendChart />
            <FilterPanel />
          </div>
        </aside>

        {/* Top: Stock Table - full width, fixed height with internal scroll */}
        <div className="flex-shrink-0 h-[270px]">
          <StockTable />
        </div>

        {/* Bottom: Entire section scrolls together - Graph 50% + Sidebar 50% */}
        <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll p-4">
          <div className="flex flex-row gap-4">
            {/* Left: Graph (50%) */}
            <div className="w-1/2 min-w-0 rounded-2xl glass-card p-1">
              <div className="rounded-xl">
                <CandlestickChart />
              </div>
            </div>

            {/* Right: Sidebar (50%) */}
            <div className="w-1/2 min-w-0 flex flex-col">
              {/* Tab Buttons */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1 rounded-xl bg-gray-900/60 p-1">
                  {TAB_ITEMS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-[12px] font-semibold transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                        }`}
                      >
                        <span className="flex-shrink-0">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="mt-3 space-y-3">
                <div className={`${activeTab === 'timeframe' ? 'block animate-slide-up' : 'hidden'}`}>
                  <div className="glass-card rounded-xl overflow-hidden">
                    <IndicatorControls />
                  </div>
                </div>
                <div className={`${activeTab === 'market' ? 'block animate-slide-up' : 'hidden'}`}>
                  <div className="glass-card rounded-xl overflow-hidden">
                    <GainerLoserList />
                  </div>
                </div>
                <div className={`${activeTab === 'stats' ? 'block animate-slide-up' : 'hidden'}`}>
                  <div className="glass-card rounded-xl overflow-hidden">
                    <StockDetailCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          MOBILE (<768px): Single scrollable column layout
          ================================================================ */}
      <div className="flex md:hidden flex-1 min-h-0 flex-col overflow-hidden">
        {/* Filters Panel */}
        {showFilters && (
          <div className="flex-shrink-0 bg-[#0a0a0f] border-b border-gray-800/40 p-3 space-y-3 overflow-y-auto max-h-[35vh]">
            <PriceTrendChart />
            <FilterPanel />
          </div>
        )}

        {/* Stock Table */}
        <div className="flex-shrink-0 px-2 py-2">
          <div className="h-[280px]">
            <StockTable />
          </div>
        </div>

        {/* Bottom Tabs - takes remaining space with internal scroll */}
        <div className="flex-1 min-h-0 flex flex-col border-t border-gray-800/40 bg-[#0a0a0f]">
          {/* Tab Buttons */}
          <div className="flex-shrink-0 border-b border-gray-800/50 p-2">
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-gray-900/70 p-1">
              {[
                { key: 'graph', label: 'Graph', icon: <BiCandles size={15} /> },
                ...TAB_ITEMS,
              ].map((panel: { key: string; label: string; icon: ReactNode }) => {
                const isActive = activeTab === panel.key || (panel.key === 'graph' && activeTab === 'timeframe');
                return (
                  <button
                    key={panel.key}
                    type="button"
                    onClick={() => panel.key === 'graph' ? setActiveTab('timeframe') : setActiveTab(panel.key as TabType)}
                    className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-300 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-800/70 hover:text-gray-300'
                    }`}
                  >
                    <span className="flex-shrink-0">{panel.icon}</span>
                    <span className="truncate">{panel.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content - scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll-sm p-2 sm:p-3">
            {/* Graph/Timeframe Tab */}
            {activeTab === 'timeframe' && (
              <div>
                <CandlestickChart />
                <div className="mt-3">
                  <IndicatorControls />
                </div>
              </div>
            )}

            {/* Market Tab */}
            {activeTab === 'market' && (
              <div>
                <GainerLoserList />
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div>
                <StockDetailCard />
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="flex-shrink-0 border-t border-gray-800/50 bg-[#0a0a0f]/95 px-4 py-3 pb-4 text-center text-[11px] font-medium text-gray-500">
            Developed by Himanshu Agarwal
          </footer>
        </div>
      </div>

      {/* Footer for desktop/tablet - outside mobile section */}
      <footer className="hidden md:block flex-shrink-0 border-t border-gray-800/50 bg-[#0a0a0f]/95 px-4 py-2 text-center text-[11px] font-medium text-gray-500">
        Developed by Himanshu Agarwal
      </footer>
    </div>
  );
}