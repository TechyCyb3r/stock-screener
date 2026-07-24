// ============================================================
// StockDetailCard Component
// ============================================================
// Professional stock detail card with key metrics grid.
// Live-updating values when market simulator is active.
// ============================================================

import { memo } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { PriceChange } from '../common';
import {
  BiTrendingUp,
  BiDollarCircle,
  BiLineChart,
  BiData,
  BiCategory,
  BiStats,
  BiPulse,
} from 'react-icons/bi';

interface MetricItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
}

const MetricItem = memo(function MetricItem({ label, value, icon, color }: MetricItemProps) {
  return (
    <div className="min-w-0 flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/20 hover:bg-gray-800/50 transition-all">
      {icon && (
        <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${color || 'bg-gray-700/50'}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-[13px] font-semibold leading-snug text-gray-100 tabular-nums break-words [overflow-wrap:anywhere]">
          {value}
        </p>
      </div>
    </div>
  );
});

export const StockDetailCard = memo(function StockDetailCard() {
  const selectedStock = useStockStore((s) => s.selectedStock);
  const isLiveEnabled = useStockStore((s) => s.isLiveEnabled);

  if (!selectedStock) {
    return (
      <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px]">
        <BiLineChart size={40} className="text-gray-700 mb-3" />
        <p className="text-gray-500 text-sm font-medium">Select a stock row to view details</p>
        <p className="text-gray-600 text-xs mt-1">Click any row in the table</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/30 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <BiTrendingUp size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-gray-100">
              {selectedStock.symbol}
            </h3>
            <p className="truncate text-[11px] text-gray-500 max-w-[190px] sm:max-w-[230px]">
              {selectedStock.companyName}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          {isLiveEnabled && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-dot" />
              LIVE
            </span>
          )}
          <div className="text-right">
            <p className="text-xl font-bold text-gray-100 tabular-nums">
              ${selectedStock.price.toFixed(2)}
            </p>
            <PriceChange
              change={selectedStock.change}
              changePercent={selectedStock.changePercent}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 xl:grid-cols-3 gap-2">
          <MetricItem
            label="Volume"
            value={selectedStock.volume.toLocaleString()}
            icon={<BiData size={13} className="text-blue-400" />}
            color="bg-blue-500/10"
          />
          <MetricItem
            label="Market Cap"
            value={`$${(selectedStock.marketCap / 1_000_000_000).toFixed(2)}B`}
            icon={<BiDollarCircle size={13} className="text-emerald-400" />}
            color="bg-emerald-500/10"
          />
          <MetricItem
            label="Sector"
            value={selectedStock.sector}
            icon={<BiCategory size={13} className="text-purple-400" />}
            color="bg-purple-500/10"
          />
          <MetricItem
            label="P/E Ratio"
            value={selectedStock.peRatio.toFixed(2)}
            icon={<BiStats size={13} className="text-amber-400" />}
            color="bg-amber-500/10"
          />
          <MetricItem
            label="Div. Yield"
            value={`${selectedStock.dividendYield.toFixed(2)}%`}
            icon={<BiPulse size={13} className="text-cyan-400" />}
            color="bg-cyan-500/10"
          />
          <MetricItem
            label="52W Range"
            value={
              <span className="inline-flex flex-wrap items-center gap-x-1">
                <span className="text-emerald-400">${selectedStock.low52Week.toFixed(2)}</span>
                <span className="text-gray-600">-</span>
                <span className="text-red-400">${selectedStock.high52Week.toFixed(2)}</span>
              </span>
            }
            color="bg-gray-700/30"
          />
          <MetricItem
            label="RSI"
            value={
              <span className={selectedStock.rsi >= 70 ? 'text-red-400' : selectedStock.rsi <= 30 ? 'text-emerald-400' : ''}>
                {selectedStock.rsi.toFixed(1)}
              </span>
            }
            color="bg-rose-500/10"
          />
          <MetricItem
            label="MACD"
            value={
              <span className={selectedStock.macd >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {selectedStock.macd.toFixed(4)}
              </span>
            }
            color="bg-violet-500/10"
          />
          <MetricItem
            label="SMA 20"
            value={`$${selectedStock.sma20.toFixed(2)}`}
            color="bg-blue-500/10"
          />
          <MetricItem
            label="SMA 50"
            value={`$${selectedStock.sma50.toFixed(2)}`}
            color="bg-indigo-500/10"
          />
          <MetricItem
            label="Bollinger Upper"
            value={`$${selectedStock.bollingerUpper.toFixed(2)}`}
            color="bg-gray-700/30"
          />
          <MetricItem
            label="Bollinger Lower"
            value={`$${selectedStock.bollingerLower.toFixed(2)}`}
            color="bg-gray-700/30"
          />
        </div>
      </div>
    </div>
  );
});
