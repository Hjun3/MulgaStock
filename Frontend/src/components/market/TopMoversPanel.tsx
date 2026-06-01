import { useTopMovers } from '../../hooks/useTopMovers';
import { TopMoverItem } from './TopMoverItem';
import { Skeleton } from '../common/Skeleton';
import { Card } from '../common/Card';

function Panel({ type }: { type: 'gainers' | 'losers' }) {
  const { data, isLoading } = useTopMovers(type, 5);
  const label = type === 'gainers' ? '🔥 급등 TOP 5' : '📉 급락 TOP 5';

  return (
    <Card className="flex-1">
      <h3 className="mb-3 text-sm font-bold text-text-primary">{label}</h3>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : (
        <div>
          {data?.map((stock, i) => (
            <TopMoverItem key={stock.id} stock={stock} rank={i + 1} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function TopMoversPanel() {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Panel type="gainers" />
      <Panel type="losers" />
    </div>
  );
}
