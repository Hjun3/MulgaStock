import { Bot } from 'lucide-react';
import { Card } from '../common/Card';
import type { StockDetail } from '../../api/types';

const MOCK_INSIGHTS: Record<string, string> = {
  egg: '최근 조류독감 확산으로 공급 감소. 단기 상승 압력 지속 예상.',
  pork: '삼겹살 소비 성수기 진입. 수요 증가에 따른 완만한 상승 흐름.',
  beef: '수입 소고기 증가로 한우 가격 안정화 추세.',
  gasoline: '국제 유가 변동성 확대. 단기 가격 불확실성 높음.',
  watermelon: '여름 성수기 시작. 계절적 수요 증가로 강세 예상.',
  napa: '김장철 수요 감소 구간. 가격 하락 추세 지속 예상.',
};

interface Props {
  stock: StockDetail;
}

export function AIInsightCard({ stock }: Props) {
  const insight = MOCK_INSIGHTS[stock.id] ??
    `${stock.name} 가격은 ${stock.changePercent > 0 ? '상승' : '하락'} 추세를 보이고 있습니다. 카테고리 평균 대비 ${
      stock.changePercent > stock.categoryAverageChangePercent ? '높은' : '낮은'
    } 변동률을 기록 중입니다.`;

  return (
    <Card className="border-border-strong">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="h-4 w-4 text-accent-primary" />
        <h3 className="text-sm font-bold text-text-primary">AI 인사이트</h3>
        <span className="ml-auto rounded-md border border-border px-1.5 py-0.5 text-xs text-text-muted">
          Mock
        </span>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{insight}</p>
    </Card>
  );
}
