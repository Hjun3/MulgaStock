import { Helmet } from 'react-helmet-async';
import { usePortfolioStore } from '../store/portfolioStore';
import { useStockDetail } from '../hooks/useStockDetail';
import { PageContainer } from '../components/layout/PageContainer';
import { WatchList } from '../components/portfolio/WatchList';
import { PortfolioSummary } from '../components/portfolio/PortfolioSummary';
import { CategoryDonutChart } from '../components/portfolio/CategoryDonutChart';
import { EmptyState } from '../components/portfolio/EmptyState';
import type { StockDetail } from '../api/types';

function useWatchlistStocks(ids: string[]) {
  const results = ids.map((id) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useStockDetail(id);
    return data;
  });
  return results.filter((d): d is StockDetail => !!d);
}

export function PortfolioPage() {
  const { watchlistIds } = usePortfolioStore();
  const stocks = useWatchlistStocks(watchlistIds);

  return (
    <>
      <Helmet>
        <title>포트폴리오 — PriceMarket</title>
      </Helmet>
      <PageContainer className="space-y-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-bold text-text-primary">내 포트폴리오</h1>
          <span className="text-sm text-text-muted">{watchlistIds.length}개 종목</span>
        </div>

        {watchlistIds.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <PortfolioSummary stocks={stocks} />
            <div className="grid gap-6 md:grid-cols-2">
              <CategoryDonutChart stocks={stocks} />
              <div />
            </div>
            <WatchList />
          </>
        )}
      </PageContainer>
    </>
  );
}
