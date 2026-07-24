// ============================================================
// CandlestickChart Component - Live Real-Time Chart
// ============================================================
// Interactive candlestick chart using lightweight-charts v5.
// Features live price updates, technical indicators overlay,
// and fully responsive design down to 320px screens.
// ============================================================

import { memo, useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  LineStyle,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData, Time } from 'lightweight-charts';
import { useStockChart } from '../../hooks';
import { useStockStore } from '../../store/useStockStore';
import type { Candle } from '../../types/stock';
import { BiLineChart } from 'react-icons/bi';
import {
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
} from '../../utils/technicalIndicators';

// ============================================================
// Chart Theme Colors
// ============================================================
const CHART_COLORS = {
  background: '#0a0a0f',
  textColor: '#9ca3af',
  gridColor: '#1a1a2e',
  upColor: '#22c55e',
  downColor: '#ef4444',
  sma20Color: '#3b82f6',
  sma50Color: '#8b5cf6',
  ema12Color: '#f59e0b',
  ema26Color: '#ec4899',
  bollingerColor: '#6b7280',
  volumeColor: '#374151',
  volumeUpColor: 'rgba(34,197,94,0.3)',
  volumeDownColor: 'rgba(239,68,68,0.3)',
};

// ============================================================
// Helper: Convert Candle data to chart format
// ============================================================
function toCandlestickData(candles: Candle[]): CandlestickData[] {
  return candles.map((c) => ({
    time: (c.time / 86400) as Time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
}

function toLineData(values: number[], candles: Candle[]): LineData[] {
  return candles
    .map((c, i) => ({
      time: (c.time / 86400) as Time,
      value: values[i],
    }))
    .filter((d) => d.value !== 0);
}

function toVolumeData(candles: Candle[]): HistogramData[] {
  return candles.map((c) => ({
    time: (c.time / 86400) as Time,
    value: c.volume,
    color: c.close >= c.open ? CHART_COLORS.volumeUpColor : CHART_COLORS.volumeDownColor,
  }));
}

// ============================================================
// Helper: Format number compactly
// ============================================================
function formatCompact(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
}

// ============================================================
// CandlestickChart Component
// ============================================================
export const CandlestickChart = memo(function CandlestickChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRef = useRef<ISeriesApi<'Line'>[]>([]);
  const [chartHeight, setChartHeight] = useState(350);

  const { stock, priceHistory, chartConfig } = useStockChart();
  const chartConfigRef = useRef(chartConfig);
  chartConfigRef.current = chartConfig;
  const isLiveEnabled = useStockStore((s) => s.isLiveEnabled);

  // Responsive height
  useEffect(() => {
    const updateHeight = () => {
      const w = window.innerWidth;
      if (w < 380) setChartHeight(200);
      else if (w < 640) setChartHeight(260);
      else if (w < 1024) setChartHeight(300);
      else setChartHeight(350);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Create/destroy chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: CHART_COLORS.background },
        textColor: CHART_COLORS.textColor,
        fontSize: 10,
      },
      grid: {
        vertLines: { color: CHART_COLORS.gridColor },
        horzLines: { color: CHART_COLORS.gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: CHART_COLORS.gridColor,
        timeVisible: true,
        secondsVisible: false,
        fixRightEdge: true,
        fixLeftEdge: true,
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.gridColor,
        scaleMargins: { top: 0.05, bottom: 0.25 },
      },
    });

    // Candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: CHART_COLORS.upColor,
      downColor: CHART_COLORS.downColor,
      borderDownColor: CHART_COLORS.downColor,
      borderUpColor: CHART_COLORS.upColor,
      wickDownColor: CHART_COLORS.downColor,
      wickUpColor: CHART_COLORS.upColor,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    // Volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartHeight });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      indicatorSeriesRef.current = [];
    };
  }, [chartHeight]);

  // Update candlestick & volume data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || priceHistory.length === 0) return;
    candlestickSeriesRef.current.setData(toCandlestickData(priceHistory));
    volumeSeriesRef.current.setData(toVolumeData(priceHistory));
  }, [priceHistory]);

  // Update indicators
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || priceHistory.length === 0) return;

    indicatorSeriesRef.current.forEach((s) => chart.removeSeries(s));
    indicatorSeriesRef.current = [];

    const indicators = chartConfigRef.current.indicators;

    if (indicators.includes('sma20')) {
      const data = calculateSMA(priceHistory, 20);
      const series = chart.addSeries(LineSeries, {
        color: CHART_COLORS.sma20Color,
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        title: 'SMA 20',
        lastValueVisible: true,
        priceLineVisible: false,
      });
      series.setData(toLineData(data, priceHistory));
      indicatorSeriesRef.current.push(series);
    }

    if (indicators.includes('sma50')) {
      const data = calculateSMA(priceHistory, 50);
      const series = chart.addSeries(LineSeries, {
        color: CHART_COLORS.sma50Color,
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        title: 'SMA 50',
        lastValueVisible: true,
        priceLineVisible: false,
      });
      series.setData(toLineData(data, priceHistory));
      indicatorSeriesRef.current.push(series);
    }

    if (indicators.includes('ema12')) {
      const data = calculateEMA(priceHistory, 12);
      const series = chart.addSeries(LineSeries, {
        color: CHART_COLORS.ema12Color,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'EMA 12',
        lastValueVisible: true,
        priceLineVisible: false,
      });
      series.setData(toLineData(data, priceHistory));
      indicatorSeriesRef.current.push(series);
    }

    if (indicators.includes('ema26')) {
      const data = calculateEMA(priceHistory, 26);
      const series = chart.addSeries(LineSeries, {
        color: CHART_COLORS.ema26Color,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'EMA 26',
        lastValueVisible: true,
        priceLineVisible: false,
      });
      series.setData(toLineData(data, priceHistory));
      indicatorSeriesRef.current.push(series);
    }

    if (indicators.includes('bollinger')) {
      const bb = calculateBollingerBands(priceHistory, 20, 2);
      const upperSeries = chart.addSeries(LineSeries, {
        color: CHART_COLORS.bollingerColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: 'BB Upper',
        lastValueVisible: false,
        priceLineVisible: false,
      });
      upperSeries.setData(toLineData(bb.upper, priceHistory));
      indicatorSeriesRef.current.push(upperSeries);

      const lowerSeries = chart.addSeries(LineSeries, {
        color: CHART_COLORS.bollingerColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: 'BB Lower',
        lastValueVisible: false,
        priceLineVisible: false,
      });
      lowerSeries.setData(toLineData(bb.lower, priceHistory));
      indicatorSeriesRef.current.push(lowerSeries);
    }
  }, [chartConfig.indicators, priceHistory]);

  if (!stock) {
    return (
      <div className="glass-card rounded-xl p-6 sm:p-8 flex items-center justify-center min-h-[200px] sm:min-h-[250px]">
        <div className="text-center">
          <BiLineChart size={40} className="mx-auto mb-2 text-gray-700" />
          <p className="text-gray-500 text-sm font-medium">Select a stock to view chart</p>
          <p className="text-gray-600 text-xs mt-1 hidden sm:block">Click any row in the table</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Chart Header - Live */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-700/30">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-white text-[9px] sm:text-[10px] font-bold">{stock.symbol.slice(0, 2)}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-gray-100 truncate max-w-[70px] sm:max-w-[120px]">
                {stock.symbol}
              </h3>
              {isLiveEnabled && (
                <span className="flex-shrink-0 flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-dot" />
                  <span className="hidden sm:inline">LIVE</span>
                </span>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-500 truncate max-w-[90px] sm:max-w-[180px] hidden sm:block">
              {stock.companyName}
            </p>
          </div>
        </div>

        {/* Price + Stats */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Volume (visible on tablet+) */}
          <div className="hidden sm:block text-right">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Vol</p>
            <p className="text-[11px] font-semibold text-gray-400 tabular-nums">
              {formatCompact(stock.volume)}
            </p>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-base sm:text-lg font-bold text-gray-100 tabular-nums leading-tight">
              ${stock.price.toFixed(2)}
            </p>
            <p className={`text-[10px] sm:text-[11px] font-semibold tabular-nums ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              <span className="hidden xs:inline">
                {' '}({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </p>
          </div>

          {/* RSI Chip */}
          <div className={`hidden xs:flex flex-col items-center px-2 py-1 rounded-md ${
            stock.rsi >= 70 ? 'bg-red-500/10' : stock.rsi <= 30 ? 'bg-emerald-500/10' : 'bg-gray-800/50'
          }`}>
            <span className="text-[8px] text-gray-500 uppercase tracking-wider font-semibold">RSI</span>
            <span className={`text-[11px] font-bold tabular-nums ${
              stock.rsi >= 70 ? 'text-red-400' : stock.rsi <= 30 ? 'text-emerald-400' : 'text-gray-300'
            }`}>
              {stock.rsi.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} />
    </div>
  );
});
