import { formatPrice, formatMacroValue, isMacroCategory } from '../../lib/format';
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
  const isMacro = isMacroCategory(stock.category);
  const fmt = (price: number) =>
    isMacro ? formatMacroValue(price, stock.unit) : formatPrice(price);

  return (
    <Card>
      <h3 className="mb-2 text-sm font-bold text-text-primary">종목 정보</h3>
      <Row label="현재가" value={fmt(stock.currentPrice)} />
      <Row label="전일가" value={fmt(stock.previousPrice)} />
      <Row label="52주 최고" value={fmt(stock.yearHigh)} highlight="up" />
      <Row label="52주 최저" value={fmt(stock.yearLow)} highlight="down" />
      {!isMacro && (
        <Row label="카테고리 평균가" value={fmt(Math.round(stock.categoryAveragePrice))} />
      )}
      <Row
        label="카테고리 평균 등락"
        value={`${stock.categoryAverageChangePercent > 0 ? '+' : ''}${stock.categoryAverageChangePercent.toFixed(2)}%`}
      />
      {stock.source && (
        <Row label="데이터 출처" value={stock.source} />
      )}
    </Card>
  );
}
