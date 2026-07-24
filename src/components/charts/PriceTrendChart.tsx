// ============================================================
// PriceTrendChart Component - Area Chart
// ============================================================
// Shows a compact area/line chart of price history.
// Placed at the top of the right sidebar.
// ============================================================

import { memo, useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  LineSeries,
} from 'lightweight-charts';
import type { IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts';
import { useStockStore } from '../../store/useStockStore';

export const PriceTrendChart = memo(function PriceTrendChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const selectedStock = useStockStore((s) => s.selectedStock);

  // Create area chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
        fontSize: 9,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#1f2937', style: 2 },
      },
      width: chartContainerRef.current.clientWidth,
      height: 100,
      crosshair: { mode: 0 },
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      priceScaleId: 'left',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update data when selected stock changes
  useEffect(() => {
    if (!seriesRef.current || !selectedStock) return;

    const data: LineData[] = selectedStock.priceHistory
      .slice(-60)
      .map((c) => ({
        time: (c.time / 86400) as Time,
        value: c.close,
      }));

    seriesRef.current.setData(data);
  }, [selectedStock]);

  // Update width on resize
  useEffect(() => {
    if (!chartRef.current || !chartContainerRef.current) return;
    chartRef.current.applyOptions({
      width: chartContainerRef.current.clientWidth,
    });
  }, [chartContainerRef.current?.clientWidth]);

  if (!selectedStock) {
    return (
      <div className="glass-card rounded-lg p-3 flex items-center justify-center min-h-[80px]">
        <p className="text-gray-500 text-xs">Select a stock to view trend</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 border-b border-gray-800/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Price Trend
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-100">${selectedStock.price.toFixed(2)}</span>
          <span className={`text-[10px] font-semibold ${selectedStock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
});
