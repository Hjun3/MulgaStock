import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../lib/format';
import { ChangeBadge } from '../common/ChangeBadge';
import type { StockSummary } from '../../api/types';

interface Props {
  stock: StockSummary;
  rank: number;
}

export function TopMoverItem({ stock, rank }: Props) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/stocks/${stock.id}`)}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-bg-tertiary"
    >
      <span className="w-5 shrink-0 font-numeric text-sm font-bold text-text-muted">{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{stock.name}</p>
        <p className="text-xs text-text-muted">{stock.unit}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-numeric text-sm text-text-primary">{formatPrice(stock.currentPrice)}</p>
        <ChangeBadge value={stock.changePercent} size="sm" />
      </div>
    </button>
  );
}
