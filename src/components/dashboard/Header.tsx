// ============================================================
// Header Component
// ============================================================
// Professional top navigation with gradient title, live status,
// and market overview stats.
// ============================================================

import { memo, useMemo } from 'react';
import { BiBarChartAlt2, BiPlay, BiFilter, BiTrendingUp, BiTrendingDown } from 'react-icons/bi';
import { useStockStore } from '../../store/useStockStore';

export const Header = memo(function Header() {
  const isLiveEnabled = useStockStore((s) => s.isLiveEnabled);
  const toggleLiveUpdates = useStockStore((s) => s.toggleLiveUpdates);
  const toggleFilters = useStockStore((s) => s.toggleFilters);
  const showFilters = useStockStore((s) => s.showFilters);
  const filteredStocks = useStockStore((s) => s.filteredStocks);
  const allStocks = useStockStore((s) => s.allStocks);

  // Market summary stats
  const marketStats = useMemo(() => {
    if (allStocks.length === 0) return null;
    const gainers = allStocks.filter((s) => s.change > 0).length;
    const losers = allStocks.filter((s) => s.change < 0).length;
    const avgChange = allStocks.reduce((acc, s) => acc + s.changePercent, 0) / allStocks.length;
    return { gainers, losers, avgChange };
  }, [allStocks]);

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-gray-800/50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
            <BiBarChartAlt2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">
              <span className="gradient-text">Stock</span>
              <span className="text-gray-200">Screener</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                {allStocks.length > 0
                  ? `${filteredStocks.length.toLocaleString()} / ${allStocks.length.toLocaleString()} stocks`
                  : 'Loading...'}
              </span>
              {isLiveEnabled && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-dot" />
                  LIVE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Market Stats */}
        {marketStats && (
          <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800/40">
            <div className="flex items-center gap-1.5">
              <BiTrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">
                {marketStats.gainers.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-500">UP</span>
            </div>
            <div className="w-px h-4 bg-gray-800" />
            <div className="flex items-center gap-1.5">
              <BiTrendingDown size={14} className="text-red-400" />
              <span className="text-xs font-semibold text-red-400">
                {marketStats.losers.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-500">DOWN</span>
            </div>
            <div className="w-px h-4 bg-gray-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500">AVG</span>
              <span className={`text-xs font-semibold ${marketStats.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Live Toggle */}
          <button
            onClick={toggleLiveUpdates}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
              isLiveEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-700/50'
            }`}
          >
            {isLiveEnabled ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="hidden sm:inline">Live</span>
              </>
            ) : (
              <>
                <BiPlay size={14} />
                <span className="hidden sm:inline">Live</span>
              </>
            )}
          </button>

          {/* Filter Toggle */}
          <button
            onClick={toggleFilters}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 border ${
              showFilters
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10'
                : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border-gray-700/50'
            }`}
          >
            <BiFilter size={14} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>
    </header>
  );
});
