// ============================================================
// IndicatorControls Component
// ============================================================
// Allows users to toggle technical indicators on the chart
// and change the chart timeframe with professional UI.
// ============================================================

import { memo } from 'react';
import { useStockStore } from '../../store/useStockStore';
import { BiTime, BiLayer } from 'react-icons/bi';
import type { TechnicalIndicatorType, Timeframe } from '../../types/stock';

const INDICATORS: { key: TechnicalIndicatorType; label: string; color: string }[] = [
  { key: 'sma20', label: 'SMA 20', color: 'border-blue-500/40 text-blue-400 bg-blue-500/8' },
  { key: 'sma50', label: 'SMA 50', color: 'border-purple-500/40 text-purple-400 bg-purple-500/8' },
  { key: 'ema12', label: 'EMA 12', color: 'border-amber-500/40 text-amber-400 bg-amber-500/8' },
  { key: 'ema26', label: 'EMA 26', color: 'border-pink-500/40 text-pink-400 bg-pink-500/8' },
  { key: 'bollinger', label: 'Bollinger', color: 'border-gray-500/40 text-gray-400 bg-gray-500/8' },
];

const TIMEFRAMES: Timeframe[] = ['1M', '3M', '6M', '1Y'];

export const IndicatorControls = memo(function IndicatorControls() {
  const chartConfig = useStockStore((s) => s.chartConfig);
  const toggleIndicator = useStockStore((s) => s.toggleIndicator);
  const setChartTimeframe = useStockStore((s) => s.setChartTimeframe);
  const selectedStock = useStockStore((s) => s.selectedStock);

  if (!selectedStock) return null;

  return (
    <div className="glass-card rounded-xl">
      {/* Timeframe */}
      <div className="px-4 py-3 border-b border-gray-700/30">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/10">
            <BiTime size={13} className="text-blue-400" />
          </div>
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
            Timeframe
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setChartTimeframe(tf)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                chartConfig.timeframe === tf
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-700/30'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-500/10">
            <BiLayer size={13} className="text-purple-400" />
          </div>
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
            Indicators
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {INDICATORS.map((indicator) => {
            const isActive = chartConfig.indicators.includes(indicator.key);
            return (
              <button
                key={indicator.key}
                onClick={() => toggleIndicator(indicator.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border ${
                  isActive
                    ? `${indicator.color} border shadow-sm`
                    : 'bg-gray-800/40 border-gray-700/20 text-gray-500 hover:text-gray-300 hover:bg-gray-800/70'
                }`}
              >
                {indicator.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
