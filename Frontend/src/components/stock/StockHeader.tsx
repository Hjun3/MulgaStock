import { Star } from 'lucide-react';
import { formatPrice, formatMacroValue, isMacroCategory } from '../../lib/format';
import { ChangeBadge } from '../common/ChangeBadge';
import { usePortfolioStore } from '../../store/portfolioStore';
import { cn } from '../../lib/cn';
import type { StockDetail } from '../../api/types';

interface Props {
  stock: StockDetail;
}

export function StockHeader({ stock }: Props) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = usePortfolioStore();
  const inList = isInWatchlist(stock.id);

  const toggle = () => {
    if (inList) removeFromWatchlist(stock.id);
    else addToWatchlist(stock.id);
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-text-muted">
            {stock.category}
          </span>
          {stock.subcategory && (
            <span className="text-xs text-text-muted">{stock.subcategory}</span>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">{stock.name}</h1>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="font-numeric text-4xl font-bold text-text-primary">
            {isMacroCategory(stock.category)
              ? formatMacroValue(stock.currentPrice, stock.unit)
              : formatPrice(stock.currentPrice)}
          </span>
          <div className="flex flex-col items-start">
            <ChangeBadge value={stock.changePercent} size="lg" />
            <span className={cn(
              'font-numeric text-sm',
              stock.changeAmount > 0 ? 'text-up' : stock.changeAmount < 0 ? 'text-down' : 'text-flat'
            )}>
              {stock.changeAmount > 0 ? '+' : ''}
              {isMacroCategory(stock.category)
                ? formatMacroValue(Math.abs(stock.changeAmount), stock.unit)
                : formatPrice(Math.abs(stock.changeAmount))}
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-text-muted">단위: {stock.unit}</p>
      </div>

      <button
        onClick={toggle}
        aria-label={inList ? '관심 종목 제거' : '관심 종목 추가'}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors',
          inList
            ? 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary'
            : 'border-border text-text-muted hover:border-accent-primary/40 hover:text-accent-primary'
        )}
      >
        <Star className={cn('h-4 w-4', inList && 'fill-accent-primary')} />
        {inList ? '관심 중' : '관심 추가'}
      </button>
    </div>
  );
}
