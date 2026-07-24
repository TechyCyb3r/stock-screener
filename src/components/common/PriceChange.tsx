import { BiTrendingUp, BiTrendingDown } from 'react-icons/bi';

interface PriceChangeProps {
  change: number;
  changePercent: number;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function PriceChange({ change, changePercent, showIcon = true, size = 'sm' }: PriceChangeProps) {
  const isPositive = change >= 0;
  const textSize = size === 'sm' ? 'text-[12px]' : 'text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold tabular-nums ${textSize} ${
        isPositive ? 'text-emerald-400' : 'text-red-400'
      }`}
    >
      {showIcon && (
        isPositive ? <BiTrendingUp size={size === 'sm' ? 13 : 16} /> : <BiTrendingDown size={size === 'sm' ? 13 : 16} />
      )}
      <span>
        {isPositive ? '+' : ''}{change.toFixed(2)}
        <span className="opacity-70 mx-0.5">(</span>
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        <span className="opacity-70">)</span>
      </span>
    </span>
  );
}