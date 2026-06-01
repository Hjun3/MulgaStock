import { formatPrice } from '../../lib/format';
import { Card } from '../common/Card';
import type { StockDetail } from '../../api/types';

interface Props {
  stock: StockDetail;
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: 'up' | 'down' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className={`font-numeric text-sm font-medium ${
        highlight === 'up' ? 'text-up' : highlight === 'down' ? 'text-down' : 'text-text-primary'
      }`}>
        {value}
      </span>
    </div>
  );
}

export function StockDetailsPanel({ stock }: Props) {
  return (
    <Card>
      <h3 className="mb-2 text-sm font-bold text-text-primary">종목 정보</h3>
      <Row label="현재가" value={formatPrice(stock.currentPrice)} />
      <Row label="전일가" value={formatPrice(stock.previousPrice)} />
      <Row label="52주 최고" value={formatPrice(stock.yearHigh)} highlight="up" />
      <Row label="52주 최저" value={formatPrice(stock.yearLow)} highlight="down" />
      <Row label="카테고리 평균가" value={formatPrice(Math.round(stock.categoryAveragePrice))} />
      <Row label="카테고리 평균 등락" value={`${stock.categoryAverageChangePercent > 0 ? '+' : ''}${stock.categoryAverageChangePercent.toFixed(2)}%`} />
      <Row label="거래량(검색량)" value={stock.volume.toLocaleString('ko-KR')} />
    </Card>
  );
}
