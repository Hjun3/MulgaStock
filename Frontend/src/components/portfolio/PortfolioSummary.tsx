import { Card } from '../common/Card';
import { ChangeBadge } from '../common/ChangeBadge';
import type { StockDetail } from '../../api/types';

interface Props {
  stocks: StockDetail[];
}

export function PortfolioSummary({ stocks }: Props) {
  if (stocks.length === 0) return null;

  const avg = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;
  const top = stocks.reduce((a, b) => (a.changePercent > b.changePercent ? a : b));
  const bottom = stocks.reduce((a, b) => (a.changePercent < b.changePercent ? a : b));

  return (
    <Card>
      <h3 className="mb-3 text-sm font-bold text-text-primary">포트폴리오 요약</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-text-muted">평균 등락률</p>
          <ChangeBadge value={avg} size="md" />
        </div>
        <div>
          <p className="text-xs text-text-muted">최고 상승</p>
          <p className="text-sm font-semibold text-up">{top.name}</p>
          <p className="font-numeric text-xs text-up">+{top.changePercent.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">최고 하락</p>
          <p className="text-sm font-semibold text-down">{bottom.name}</p>
          <p className="font-numeric text-xs text-down">{bottom.changePercent.toFixed(2)}%</p>
        </div>
      </div>
    </Card>
  );
}
