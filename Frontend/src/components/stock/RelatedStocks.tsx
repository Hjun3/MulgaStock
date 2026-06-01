import { useNavigate } from 'react-router-dom';
import { useStocks } from '../../hooks/useStocks';
import { formatPrice } from '../../lib/format';
import { ChangeBadge } from '../common/ChangeBadge';
import { Skeleton } from '../common/Skeleton';
import type { StockCategory, StockDetail } from '../../api/types';

interface Props {
  stock: StockDetail;
}

export function RelatedStocks({ stock }: Props) {
  const navigate = useNavigate();
  const category = stock.category.toUpperCase() as StockCategory;
  const { data, isLoading } = useStocks({ category, size: 10 });

  const related = data?.content.filter((s) => s.id !== stock.id).slice(0, 6) ?? [];

  if (!isLoading && related.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-text-primary">같은 카테고리 종목</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-32 shrink-0" />
            ))
          : related.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/stocks/${s.id}`)}
                className="flex w-32 shrink-0 flex-col gap-1 rounded-xl border border-border bg-bg-secondary p-3 text-left transition-colors hover:bg-bg-tertiary"
              >
                <p className="truncate text-sm font-semibold text-text-primary">{s.name}</p>
                <p className="font-numeric text-sm text-text-primary">{formatPrice(s.currentPrice)}</p>
                <ChangeBadge value={s.changePercent} size="sm" />
              </button>
            ))}
      </div>
    </div>
  );
}
