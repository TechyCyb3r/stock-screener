// ============================================================
// GainerLoserList Component
// ============================================================
// Displays top 5 gainers and top 5 losers in real-time.
// Shows mini changes with color-coded indicators.
// ============================================================

import { memo, useMemo } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { BiTrendingUp, BiTrendingDown, BiEqualizer } from 'react-icons/bi';

export const GainerLoserList = memo(function GainerLoserList() {
  const allStocks = useStockStore((s) => s.allStocks);

  const { gainers, losers } = useMemo(() => {
    const sorted = [...allStocks].sort((a, b) => b.changePercent - a.changePercent);
    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    };
  }, [allStocks]);

  if (allStocks.length === 0) return null;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700/30 flex items-center gap-2">
        <BiEqualizer size={14} className="text-blue-400" />
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Market Movers
        </h3>
      </div>

      <div className="grid grid-cols-2 divide-x divide-gray-800/40">
        {/* Gainers */}
        <div className="p-2.5">
          <div className="flex items-center gap-1 mb-2">
            <BiTrendingUp size={12} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Gainers</span>
          </div>
          <div className="space-y-1.5">
            {gainers.map((stock) => (
              <div key={stock.id} className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-300 truncate max-w-[60px]">
                  {stock.symbol}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 tabular-nums">
                    ${stock.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 tabular-nums">
                    +{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="p-2.5">
          <div className="flex items-center gap-1 mb-2">
            <BiTrendingDown size={12} className="text-red-400" />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Losers</span>
          </div>
          <div className="space-y-1.5">
            {losers.map((stock) => (
              <div key={stock.id} className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-300 truncate max-w-[60px]">
                  {stock.symbol}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 tabular-nums">
                    ${stock.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-red-400 tabular-nums">
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});