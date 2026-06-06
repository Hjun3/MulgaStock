import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Bot, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PageContainer } from '../components/layout/PageContainer';
import { SearchBar } from '../components/common/SearchBar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { useMarketSummary } from '../hooks/useMarketSummary';
import { useStocks } from '../hooks/useStocks';
import { useStockHistory } from '../hooks/useStockHistory';
import { formatPercent, formatPrice, getChangeColor } from '../lib/format';
import type { StockSummary, StockCategory } from '../api/types';

type CatLabel = { FOOD: string; DAILY: string; ENERGY: string; GOODS: string; MACRO: string; };
const CAT_LABEL: CatLabel = {
  FOOD: '식품', DAILY: '생필품', ENERGY: '에너지',
  GOODS: '공산품', MACRO: '거시지표',
};

// ── 라인 차트 공용 컴포넌트 ──────────────────────────────────────
function StockLineChart({ height = 130 }: { height?: number }) {
  const { data: stocks } = useStocks({ category: 'FOOD', size: 1 });

  const stockId = stocks && stocks.content[0] ? stocks.content[0].id : '';
  const { data: history, isLoading } = useStockHistory(stockId, '3M');

  if (!stockId || isLoading) {
    return <div className="animate-pulse rounded bg-bg-tertiary" style={{ height }} />;
  }
  if (!history || !history.length) return null;

  const chartData = history.map(h => ({ d: h.date.slice(5), v: h.close }));
  const interval = Math.max(1, Math.floor(chartData.length / 6));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="d"
          tick={{ fontSize: 10, fill: '#6b7fa8' }}
          axisLine={false}
          tickLine={false}
          interval={interval}
        />
        <YAxis hide domain={['auto', 'auto']} />
        <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── 히어로 오른쪽: 차트 카드 ─────────────────────────────────────
function HeroChartCard() {
  const { data, isLoading } = useMarketSummary();
  if (isLoading) return <Skeleton className="h-56 w-full" />;
  if (!data) return null;

  const clr = data.totalChangePercent > 0 ? 'text-up'
    : data.totalChangePercent < 0 ? 'text-down' : 'text-flat';

  return (
    <Card>
      <p className="mb-1 text-xs text-text-muted">전체 물가지수 (3개월)</p>
      <p className={`font-numeric mb-1 text-2xl font-bold ${clr}`}>
        {data.totalChangePercent > 0 ? '+' : ''}{data.totalChangePercent.toFixed(2)}%
      </p>
      <p className="mb-3 text-xs text-text-muted">
        상승 {data.gainersCount} · 하락 {data.losersCount} · 기준=100
      </p>
      <ErrorBoundary>
        <StockLineChart height={120} />
      </ErrorBoundary>
    </Card>
  );
}

// ── 마켓 오버뷰: 큰 차트(좌) + 섹터 카드(우) ─────────────────────
function MarketOverview() {
  const { data } = useMarketSummary();

  const activeSectors = data ? data.sectors.filter(s => s.stockCount > 0).slice(0, 3) : [];
  const total = data ? data.totalChangePercent : 0;
  const totalClr = total > 0 ? 'text-up' : total < 0 ? 'text-down' : 'text-flat';

  return (
    <div className="flex gap-4">
      {/* 왼쪽: 메인 차트 */}
      <Card className="flex-1">
        <p className="mb-1 text-xs text-text-muted">전체 물가지수 (3개월)</p>
        <p className={`font-numeric mb-1 text-2xl font-bold ${totalClr}`}>
          {total > 0 ? '+' : ''}{total.toFixed(2)}%
        </p>
        <p className="mb-3 text-xs text-text-muted">
          상승 {data ? data.gainersCount : ''} · 하락 {data ? data.losersCount : ''} · 기준=100
        </p>
        <ErrorBoundary>
          <StockLineChart height={150} />
        </ErrorBoundary>
        <div style={{
          borderLeft: '3px solid #f59e0b',
          padding: '10px 14px',
          marginTop: '12px',
          backgroundColor: 'rgba(245, 158, 11, 0.06)',
        }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
            ✦ 오늘의 AI 시황
          </p>
          <p style={{ fontSize: '12px', color: '#6b7fa8' }}>
            토큰 제한으로 인해 추후에 적용
          </p>
        </div>
      </Card>

      {/* 오른쪽: 섹터 미니 카드 */}
      <div className="flex w-56 flex-shrink-0 flex-col gap-3">
        {activeSectors.map(s => {
          const clr = s.averageChangePercent > 0 ? 'text-up'
            : s.averageChangePercent < 0 ? 'text-down' : 'text-flat';
          return (
            <Card key={s.category} className="flex-1">
              <p className="mb-1 text-xs text-text-muted">{s.displayName}</p>
              <p className={`font-numeric text-lg font-bold ${clr}`}>
                {s.averageChangePercent > 0 ? '+' : ''}
                {s.averageChangePercent.toFixed(2)}%
              </p>
              <p className="mt-1 text-xs text-text-muted">
                상위: {s.topGainer ? s.topGainer.name : ''}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── 카테고리별 급등·급락 TOP3 ────────────────────────────────────
function MoverRow({ stock, up }: { stock: StockSummary; up: boolean }) {
  return (
    <Link to={`/stocks/${stock.id}`}
      className="flex items-center justify-between py-1.5 text-sm hover:opacity-80">
      <span className="text-text-primary">{stock.name}</span>
      <span className={`font-numeric font-semibold ${up ? 'text-up' : 'text-down'}`}>
        {formatPercent(stock.changePercent)}
      </span>
    </Link>
  );
}

function CategoryMovers({ category, label }: { category: StockCategory; label: string }) {
  const { data: topData, isLoading: tl } = useStocks({
    category, sortBy: 'changePercent', direction: 'desc', size: 3,
  });
  const { data: botData, isLoading: bl } = useStocks({
    category, sortBy: 'changePercent', direction: 'asc', size: 3,
  });
  return (
    <Card>
      <h3 className="mb-3 text-sm font-bold text-text-primary">{label}</h3>
      <p className="mb-1 text-xs font-semibold text-up">▲ 급등 TOP 3</p>
      {tl ? <Skeleton className="h-20" />
        : topData && topData.content.map(s => <MoverRow key={s.id} stock={s} up={true} />)}
      <div className="my-2 border-t border-border" />
      <p className="mb-1 text-xs font-semibold text-down">▼ 급락 TOP 3</p>
      {bl ? <Skeleton className="h-20" />
        : botData && botData.content.map(s => <MoverRow key={s.id} stock={s} up={false} />)}
    </Card>
  );
}

// ── 전체 등락률 TOP 10 ───────────────────────────────────────────
function Top10Table() {
  const { data, isLoading } = useStocks({
    sortBy: 'changePercent', direction: 'desc', size: 10,
  });
  return (
    <Card>
      <h3 className="mb-4 text-sm font-bold text-text-primary">전체 등락률 TOP 10</h3>
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}
        </div>
      ) : (
        <>
          <div className="mb-2 flex gap-2 border-b border-border pb-2 text-xs font-semibold text-text-muted">
            <span className="w-7">#</span>
            <span className="flex-1">종목</span>
            <span className="w-16">분류</span>
            <span className="w-24 text-right">현재가</span>
            <span className="w-16 text-right">등락률</span>
          </div>
          {data && data.content.map((stock, i) => (
            <Link key={stock.id} to={`/stocks/${stock.id}`}
              className="flex items-center gap-2 border-b border-border py-2 text-sm transition-colors hover:bg-bg-tertiary">
              <span className="w-7 text-text-muted">{i + 1}</span>
              <span className="flex-1 text-text-primary">{stock.name}</span>
              <span className="w-16 text-xs text-text-muted">
                {CAT_LABEL[stock.category as keyof CatLabel] || stock.category}
              </span>
              <span className="w-24 text-right font-numeric text-text-primary">
                {formatPrice(stock.currentPrice)}
              </span>
              <span className={`w-16 text-right font-numeric font-semibold ${getChangeColor(stock.changePercent)}`}>
                {formatPercent(stock.changePercent)}
              </span>
            </Link>
          ))}
        </>
      )}
    </Card>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
export function LandingPage() {
  const FEATURES = [
    { icon: <TrendingUp className="h-6 w-6 text-text-secondary" />, title: '실시간 물가 추적', desc: 'KAMIS · Opinet · ECOS API로 28종 품목 가격을 주기적으로 업데이트합니다.' },
    { icon: <Bot className="h-6 w-6 text-text-secondary" />, title: 'AI 시황 분석', desc: '오늘의 물가 흐름을 AI가 주식 시황처럼 자동으로 요약해 제공합니다.' },
    { icon: <Star className="h-6 w-6 text-text-secondary" />, title: '포트폴리오 관리', desc: '관심 품목을 즐겨찾기하고 나만의 생활물가 포트폴리오를 구성하세요.' },
  ];

  return (
    <>
      <Helmet><title>MulgaStock — 물가를 주식처럼</title></Helmet>

      {/* 히어로 */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-start gap-14 px-6 py-16 lg:px-10">
          <div className="flex-1 pt-2">
            <p className="mb-4 text-xs uppercase tracking-widest text-text-muted">
              소비자 물가 실시간 추적 서비스
            </p>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-text-primary">
              일상 속 가격 변동,<br />주식처럼 한눈에
            </h1>
            <p className="mb-7 text-sm leading-relaxed text-text-secondary">
              KAMIS · Opinet · ECOS 데이터를 기반으로<br />
              농수축산물부터 에너지까지 28종 품목 가격을<br />
              주기적으로 업데이트합니다.
            </p>
            <Link to="/market"
              className="inline-block rounded-lg bg-blue-500 px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
              시장 보러 가기
            </Link>
          </div>
          <div className="flex-1">
            <ErrorBoundary><HeroChartCard /></ErrorBoundary>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="border-b border-border py-12">
        <div className="mx-auto flex max-w-7xl gap-4 px-6 lg:px-10">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex-1 rounded-xl border border-border p-8 transition-colors hover:bg-bg-secondary"
            >
              <div className="mb-3">{f.icon}</div>
              <p className="mb-2 text-sm font-bold text-text-primary">{f.title}</p>
              <p className="text-xs leading-relaxed text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 검색 — width: 100% */}
      <div className="border-b border-border py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SearchBar className="max-w-full" />
        </div>
      </div>

      <PageContainer className="space-y-6">
        {/* 마켓 오버뷰 */}
        <ErrorBoundary><MarketOverview /></ErrorBoundary>

        {/* 카테고리별 급등·급락 */}
        <div>
          <h2 className="mb-3 text-base font-bold text-text-primary">카테고리별 급등·급락</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'FOOD' as StockCategory, label: '식품' },
              { key: 'DAILY' as StockCategory, label: '생필품' },
              { key: 'ENERGY' as StockCategory, label: '에너지' },
            ].map(c => (
              <ErrorBoundary key={c.key}>
                <CategoryMovers category={c.key} label={c.label} />
              </ErrorBoundary>
            ))}
          </div>
        </div>

        {/* TOP 10 */}
        <ErrorBoundary><Top10Table /></ErrorBoundary>
      </PageContainer>
    </>
  );
}