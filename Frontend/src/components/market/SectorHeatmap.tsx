import { useNavigate } from 'react-router-dom';
import { useMarketSummary } from '../../hooks/useMarketSummary';
import { useStocks } from '../../hooks/useStocks';
import { Skeleton } from '../common/Skeleton';
import { cn } from '../../lib/cn';
import type { StockCategory, StockSummary } from '../../api/types';

const CATEGORIES: { key: StockCategory; label: string }[] = [
  { key: 'FOOD', label: '식품' },
  { key: 'DAILY', label: '생필품' },
  { key: 'ENERGY', label: '에너지' },
  { key: 'GOODS', label: '공산품' },
];

function HeatmapCell({ stock }: { stock: StockSummary }) {
  const navigate = useNavigate();
  const isUp = stock.changePercent > 0;
  const isDown = stock.changePercent < 0;

  return (
    <button
      onClick={() => navigate(`/stocks/${stock.id}`)}
      title={`${stock.name} ${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`}
      aria-label={`${stock.name} ${stock.changePercent.toFixed(2)}%`}
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all hover:scale-105 hover:z-10',
        isUp
          ? 'border-up-border bg-up-bg text-up hover:bg-up/20'
          : isDown
            ? 'border-down-border bg-down-bg text-down hover:bg-down/20'
            : 'border-border bg-bg-tertiary text-flat'
      )}
    >
      <span className="truncate text-xs font-semibold">{stock.name}</span>
      <span className="font-numeric text-xs">
        {isUp ? '+' : ''}{stock.changePercent.toFixed(1)}%
      </span>
    </button>
  );
}

function SectorBlock({ category, label }: { category: StockCategory; label: string }) {
  const { data, isLoading } = useStocks({ category, size: 30 });

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-4">
      <h3 className="mb-3 text-sm font-bold text-text-secondary">{label}</h3>
      {isLoading ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {data?.content.map((stock) => (
            <HeatmapCell key={stock.id} stock={stock} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SectorHeatmap() {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-text-primary">섹터 히트맵</h2>
      {CATEGORIES.map(({ key, label }) => (
        <SectorBlock key={key} category={key} label={label} />
      ))}
    </div>
  );
}
