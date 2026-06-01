import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMarketSummary } from '../../hooks/useMarketSummary';
import { ChangeBadge } from '../common/ChangeBadge';
import { Skeleton } from '../common/Skeleton';
import { cn } from '../../lib/cn';
import type { Sector } from '../../api/types';

function SummaryCard({
  label,
  changePercent,
  sub,
}: {
  label: string;
  changePercent: number;
  sub?: string;
}) {
  const isUp = changePercent > 0;
  const isDown = changePercent < 0;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        isUp
          ? 'border-up-border bg-up-bg'
          : isDown
            ? 'border-down-border bg-down-bg'
            : 'border-border bg-bg-secondary'
      )}
    >
      <p className="mb-1 text-xs text-text-muted">{label}</p>
      <div className="flex items-center gap-2">
        {isUp ? (
          <TrendingUp className="h-4 w-4 text-up" />
        ) : isDown ? (
          <TrendingDown className="h-4 w-4 text-down" />
        ) : (
          <Minus className="h-4 w-4 text-flat" />
        )}
        <span
          className={cn(
            'font-numeric text-2xl font-bold',
            isUp ? 'text-up' : isDown ? 'text-down' : 'text-flat'
          )}
        >
          {isUp ? '+' : ''}{changePercent.toFixed(2)}%
        </span>
      </div>
      {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

function SectorCard({ sector }: { sector: Sector }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        sector.averageChangePercent > 0
          ? 'border-up-border bg-up-bg'
          : sector.averageChangePercent < 0
            ? 'border-down-border bg-down-bg'
            : 'border-border bg-bg-secondary'
      )}
    >
      <p className="mb-1 text-xs text-text-muted">{sector.displayName}</p>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'font-numeric text-xl font-bold',
            sector.averageChangePercent > 0
              ? 'text-up'
              : sector.averageChangePercent < 0
                ? 'text-down'
                : 'text-flat'
          )}
        >
          {sector.averageChangePercent > 0 ? '+' : ''}
          {sector.averageChangePercent.toFixed(2)}%
        </span>
      </div>
      <p className="mt-1 text-xs text-text-muted">
        상위: {sector.topGainer?.name}
      </p>
    </div>
  );
}

export function MarketSummaryBar() {
  const { data, isLoading } = useMarketSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <SummaryCard
        label="전체 시장"
        changePercent={data.totalChangePercent}
        sub={`상승 ${data.gainersCount} · 하락 ${data.losersCount}`}
      />
      {data.sectors.map((sector) => (
        <SectorCard key={sector.category} sector={sector} />
      ))}
    </div>
  );
}
