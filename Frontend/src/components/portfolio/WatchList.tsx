import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { usePortfolioStore } from '../../store/portfolioStore';
import { useStockDetail } from '../../hooks/useStockDetail';
import { formatPrice } from '../../lib/format';
import { ChangeBadge } from '../common/ChangeBadge';
import { Skeleton } from '../common/Skeleton';

function WatchItem({ id }: { id: string }) {
  const navigate = useNavigate();
  const { removeFromWatchlist } = usePortfolioStore();
  const { data, isLoading } = useStockDetail(id);

  if (isLoading) return <Skeleton className="h-16" />;
  if (!data) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-secondary p-3">
      <button
        onClick={() => navigate(`/stocks/${id}`)}
        className="flex flex-1 items-center gap-3 text-left"
      >
        <div className="flex-1">
          <p className="font-semibold text-text-primary">{data.name}</p>
          <p className="text-xs text-text-muted">{data.category} · {data.unit}</p>
        </div>
        <div className="text-right">
          <p className="font-numeric text-sm text-text-primary">{formatPrice(data.currentPrice)}</p>
          <ChangeBadge value={data.changePercent} size="sm" />
        </div>
      </button>
      <button
        onClick={() => removeFromWatchlist(id)}
        aria-label={`${data.name} 관심 종목 제거`}
        className="shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-bg-tertiary hover:text-text-secondary"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function WatchList() {
  const { watchlistIds } = usePortfolioStore();
  return (
    <div className="space-y-2">
      {watchlistIds.map((id) => (
        <WatchItem key={id} id={id} />
      ))}
    </div>
  );
}
