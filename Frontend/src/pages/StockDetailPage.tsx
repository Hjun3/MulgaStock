import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft } from 'lucide-react';
import { useStockDetail } from '../hooks/useStockDetail';
import { useStockHistory } from '../hooks/useStockHistory';
import { StockHeader } from '../components/stock/StockHeader';
import { PeriodSelector } from '../components/stock/PeriodSelector';
import { CandleChart } from '../components/stock/CandleChart';
import { StockDetailsPanel } from '../components/stock/StockDetailsPanel';
import { AIInsightCard } from '../components/stock/AIInsightCard';
import { RelatedStocks } from '../components/stock/RelatedStocks';
import { PageContainer } from '../components/layout/PageContainer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Skeleton } from '../components/common/Skeleton';
import type { Period } from '../api/types';

export function StockDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('1M');

  const { data: stock, isLoading, isError } = useStockDetail(id);
  const { data: history, isLoading: historyLoading } = useStockHistory(id, period);

  if (isLoading) return <PageContainer><LoadingSpinner className="py-20" /></PageContainer>;
  if (isError || !stock) {
    return (
      <PageContainer>
        <div className="py-20 text-center">
          <p className="text-lg font-semibold text-text-primary">종목을 찾을 수 없습니다</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary"
          >
            메인으로
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{stock.name} — PriceMarket</title>
      </Helmet>
      <PageContainer className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="h-4 w-4" />
          뒤로
        </button>

        <StockHeader stock={stock} />

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="rounded-xl border border-border bg-bg-secondary p-3">
              {historyLoading ? (
                <Skeleton className="h-[420px]" />
              ) : (
                <CandleChart data={history ?? []} />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:w-72">
            <StockDetailsPanel stock={stock} />
            <AIInsightCard stock={stock} />
          </div>
        </div>

        <RelatedStocks stock={stock} />
      </PageContainer>
    </>
  );
}
