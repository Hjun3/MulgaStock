import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStockSearch } from '../hooks/useStockSearch';
import { PageContainer } from '../components/layout/PageContainer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../lib/format';
import { ChangeBadge } from '../components/common/ChangeBadge';

export function SearchResultPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const navigate = useNavigate();
  const { data, isLoading } = useStockSearch(q);

  return (
    <>
      <Helmet>
        <title>"{q}" 검색 결과 — PriceMarket</title>
      </Helmet>
      <PageContainer>
        <h1 className="mb-4 text-lg font-bold text-text-primary">
          <span className="text-text-muted">검색: </span>"{q}"
        </h1>

        {isLoading ? (
          <LoadingSpinner className="py-20" />
        ) : !data || data.length === 0 ? (
          <div className="py-20 text-center text-text-muted">검색 결과가 없습니다</div>
        ) : (
          <div className="space-y-2">
            {data.map((stock) => (
              <button
                key={stock.id}
                onClick={() => navigate(`/stocks/${stock.id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-bg-secondary px-4 py-3 text-left transition-colors hover:bg-bg-tertiary"
              >
                <div>
                  <p className="font-semibold text-text-primary">{stock.name}</p>
                  <p className="text-xs text-text-muted">{stock.category} · {stock.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-numeric text-sm text-text-primary">{formatPrice(stock.currentPrice)}</p>
                  <ChangeBadge value={stock.changePercent} size="sm" />
                </div>
              </button>
            ))}
          </div>
        )}
      </PageContainer>
    </>
  );
}
