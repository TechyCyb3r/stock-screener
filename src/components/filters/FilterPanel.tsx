// ============================================================
// FilterPanel Component
// ============================================================
// Advanced multi-criteria filter panel with professional UI.
// Uses debounced inputs for text fields to ensure <200ms
// filtering performance.
// ============================================================

import { memo, useCallback, useState, useEffect } from 'react';
import { BiSearch, BiReset, BiChevronDown, BiChevronUp, BiFilterAlt } from 'react-icons/bi';
import { useStockFilters } from '../../hooks';
import { SECTORS } from '../../types/stock';
import type { StockFilters } from '../../types/stock';

// ============================================================
// Debounce Hook
// ============================================================
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ============================================================
// Input Field Component
// ============================================================
interface FilterInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  icon?: React.ReactNode;
}

const FilterInput = memo(function FilterInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
}: FilterInputProps) {
  return (
    <div className="min-w-0 flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`min-w-0 w-full px-3 py-2 text-[12px] bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all ${icon ? 'pl-9' : ''}`}
        />
      </div>
    </div>
  );
});

// ============================================================
// Range Input Component
// ============================================================
interface RangeInputProps {
  label: string;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  step?: number;
}

const RangeInput = memo(function RangeInput({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  step = 1,
}: RangeInputProps) {
  return (
    <div className="min-w-0 flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="grid grid-cols-1 gap-2">
        <label className="min-w-0">
          <span className="sr-only">{label} minimum</span>
          <input
            type="number"
            value={minValue === 0 ? '' : minValue}
            onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : 0)}
            placeholder="Min"
            step={step}
            className="min-w-0 w-full px-3 py-2 text-[12px] bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
          />
        </label>
        <label className="min-w-0">
          <span className="sr-only">{label} maximum</span>
          <input
            type="number"
            value={maxValue === Infinity ? '' : maxValue}
            onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : Infinity)}
            placeholder="Max"
            step={step}
            className="min-w-0 w-full px-3 py-2 text-[12px] bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
          />
        </label>
      </div>
    </div>
  );
});

// ============================================================
// Main FilterPanel Component
// ============================================================
export const FilterPanel = memo(function FilterPanel() {
  const { filters, active, updateFilter, clearAll } = useStockFilters();
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(true);

  const debouncedSymbol = useDebounce(localFilters.symbol, 150);
  const debouncedCompanyName = useDebounce(localFilters.companyName, 150);

  useEffect(() => {
    updateFilter({ symbol: debouncedSymbol });
  }, [debouncedSymbol, updateFilter]);

  useEffect(() => {
    updateFilter({ companyName: debouncedCompanyName });
  }, [debouncedCompanyName, updateFilter]);

  const updateLocalAndStore = useCallback(
    (partial: Partial<StockFilters>) => {
      setLocalFilters((prev) => ({ ...prev, ...partial }));
      updateFilter(partial);
    },
    [updateFilter]
  );

  const handleClearAll = useCallback(() => {
    setLocalFilters({
      symbol: '',
      companyName: '',
      sector: '',
      priceMin: 0,
      priceMax: Infinity,
      volumeMin: 0,
      volumeMax: Infinity,
      marketCapMin: 0,
      marketCapMax: Infinity,
      rsiMin: 0,
      rsiMax: 100,
      macdMin: -Infinity,
      macdMax: Infinity,
    });
    clearAll();
  }, [clearAll]);

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 w-full px-3 py-2.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="min-w-0 flex flex-1 items-center gap-2 hover:text-gray-100 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10">
            <BiFilterAlt size={15} className="text-blue-400" />
          </div>
          <h2 className="min-w-0 truncate text-[13px] font-semibold text-gray-200">Advanced Filters</h2>
          {active && (
            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-blue-500/15 text-blue-400 rounded-full border border-blue-500/20">
              {Object.entries(localFilters).filter(([k, v]) => {
                if (k === 'symbol' || k === 'companyName') return v !== '';
                if (k === 'sector') return v !== '';
                if (k === 'priceMin' || k === 'volumeMin' || k === 'marketCapMin' || k === 'rsiMin' || k === 'macdMin') return v !== 0;
                if (k === 'priceMax' || k === 'volumeMax' || k === 'marketCapMax') return v !== Infinity;
                if (k === 'rsiMax') return v !== 100;
                if (k === 'macdMax') return v !== -Infinity;
                return false;
              }).length}
            </span>
          )}
        </button>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {active && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-red-400 bg-gray-800/50 hover:bg-red-500/10 rounded-md transition-all"
            >
              <BiReset size={12} />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-800/60 hover:text-gray-300"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            {isExpanded ? <BiChevronUp size={16} /> : <BiChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Filter Fields */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <FilterInput
              label="Symbol"
              value={localFilters.symbol}
              onChange={(v) => setLocalFilters((prev) => ({ ...prev, symbol: v }))}
              placeholder="e.g. AAPL, TSLA"
              icon={<BiSearch size={14} />}
            />
            <FilterInput
              label="Company Name"
              value={localFilters.companyName}
              onChange={(v) => setLocalFilters((prev) => ({ ...prev, companyName: v }))}
              placeholder="e.g. Apple"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
              Sector
            </label>
            <select
              value={localFilters.sector}
              onChange={(e) => updateLocalAndStore({ sector: e.target.value as StockFilters['sector'] })}
              className="min-w-0 w-full px-3 py-2 text-[12px] bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Sectors</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <RangeInput
              label="Price ($)"
              minValue={localFilters.priceMin}
              maxValue={localFilters.priceMax}
              onMinChange={(v) => updateLocalAndStore({ priceMin: v })}
              onMaxChange={(v) => updateLocalAndStore({ priceMax: v })}
              step={0.01}
            />
            <RangeInput
              label="Volume"
              minValue={localFilters.volumeMin}
              maxValue={localFilters.volumeMax}
              onMinChange={(v) => updateLocalAndStore({ volumeMin: v })}
              onMaxChange={(v) => updateLocalAndStore({ volumeMax: v })}
              step={1000}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <RangeInput
              label="Market Cap"
              minValue={localFilters.marketCapMin}
              maxValue={localFilters.marketCapMax}
              onMinChange={(v) => updateLocalAndStore({ marketCapMin: v })}
              onMaxChange={(v) => updateLocalAndStore({ marketCapMax: v })}
              step={1000000}
            />
            <RangeInput
              label="RSI (0-100)"
              minValue={localFilters.rsiMin}
              maxValue={localFilters.rsiMax}
              onMinChange={(v) => updateLocalAndStore({ rsiMin: v })}
              onMaxChange={(v) => updateLocalAndStore({ rsiMax: v })}
              step={1}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <RangeInput
              label="MACD"
              minValue={localFilters.macdMin}
              maxValue={localFilters.macdMax}
              onMinChange={(v) => updateLocalAndStore({ macdMin: v })}
              onMaxChange={(v) => updateLocalAndStore({ macdMax: v })}
              step={0.1}
            />
          </div>
        </div>
      )}
    </div>
  );
});
