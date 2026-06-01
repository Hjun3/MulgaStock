import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageContainer } from '../components/layout/PageContainer';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <>
      <Helmet><title>페이지를 찾을 수 없습니다 — PriceMarket</title></Helmet>
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="font-numeric text-6xl font-bold text-text-muted">404</p>
          <p className="mt-4 text-xl font-semibold text-text-primary">페이지를 찾을 수 없습니다</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 rounded-lg border border-border px-6 py-2 text-sm text-text-secondary hover:bg-bg-tertiary"
          >
            메인으로
          </button>
        </div>
      </PageContainer>
    </>
  );
}
