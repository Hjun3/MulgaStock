import { Helmet } from 'react-helmet-async';
import { PageContainer } from '../components/layout/PageContainer';
import { MarketSummaryBar } from '../components/market/MarketSummaryBar';
import { TopMoversPanel } from '../components/market/TopMoversPanel';
import { SectorHeatmap } from '../components/market/SectorHeatmap';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>PriceMarket — 물가를 주식처럼</title>
      </Helmet>
      <PageContainer className="space-y-6">
        <div>
          <h2 className="mb-3 text-base font-bold text-text-primary">시장 현황</h2>
          <ErrorBoundary>
            <MarketSummaryBar />
          </ErrorBoundary>
        </div>

        <ErrorBoundary>
          <TopMoversPanel />
        </ErrorBoundary>

        <ErrorBoundary>
          <SectorHeatmap />
        </ErrorBoundary>
      </PageContainer>
    </>
  );
}
