import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { TrendingUp, Bot, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { SearchBar } from '../components/common/SearchBar';
import { getMarketSummary, getStocksByCategory, getStockHistory, getTopStocks } from '../api';
import { formatPercent, formatPrice, changeColor } from '../utils';
import { useTheme } from '../context/ThemeContext';
import type { MarketSummary, StockSummary, Page } from '../types';

type CatLabel = { FOOD: string; DAILY: string; ENERGY: string; GOODS: string; MACRO: string };
const CAT_LABEL: CatLabel = {
  FOOD: '식품', DAILY: '생필품', ENERGY: '에너지',
  GOODS: '공산품', MACRO: '거시지표',
};

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 ${className}`}>
      {children}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

function StockLineChart({ height = 130 }: { height?: number }) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<{ d: string; v: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStocksByCategory('FOOD', 1).then(page => {
      const id = page.content[0] ? page.content[0].id : '';
      if (!id) { setIsLoading(false); return; }
      getStockHistory(id, '3M').then(history => {
        setChartData(history.map(h => ({ d: h.date.slice(5), v: h.close })));
        setIsLoading(false);
      });
    });
  }, []);

  if (isLoading) return <div className="animate-pulse rounded bg-slate-200 dark:bg-slate-800" style={{ height }} />;
  if (!chartData.length) return null;

  const interval = Math.max(1, Math.floor(chartData.length / 6));
  const tickFill = theme === 'dark' ? '#6b7fa8' : '#64748b';
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis dataKey="d" tick={{ fontSize: 10, fill: tickFill }} axisLine={false} tickLine={false} interval={interval} />
        <YAxis hide domain={['auto', 'auto']} />
        <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function HeroChartCard() {
  const [data, setData] = useState<MarketSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMarketSummary().then(d => { setData(d); setIsLoading(false); }).catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Skeleton className="h-56 w-full" />;
  if (!data) return null;

  return (
    <Card>
      <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">전체 물가지수 (3개월)</p>
      <p className={`mb-1 text-2xl font-bold ${changeColor(data.totalChangePercent)}`}>
        {data.totalChangePercent > 0 ? '+' : ''}{data.totalChangePercent.toFixed(2)}%
      </p>
      <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
        상승 {data.gainersCount} · 하락 {data.losersCount} · 기준=100
      </p>
      <StockLineChart height={120} />
    </Card>
  );
}

function MarketOverview() {
  const [data, setData] = useState<MarketSummary | null>(null);

  useEffect(() => { getMarketSummary().then(setData).catch(() => {}); }, []);

  const activeSectors = data ? data.sectors.filter(s => s.stockCount > 0).slice(0, 3) : [];
  const total = data ? data.totalChangePercent : 0;

  return (
    <div className="flex gap-4">
      <Card className="flex-1">
        <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">전체 물가지수 (3개월)</p>
        <p className={`mb-1 text-2xl font-bold ${changeColor(total)}`}>
          {total > 0 ? '+' : ''}{total.toFixed(2)}%
        </p>
        <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
          상승 {data ? data.gainersCount : ''} · 하락 {data ? data.losersCount : ''} · 기준=100
        </p>
        <StockLineChart height={150} />
        <div style={{ borderLeft: '3px solid #f59e0b', padding: '10px 14px', marginTop: '12px', backgroundColor: 'rgba(245,158,11,0.06)' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>✦ 오늘의 AI 시황</p>
          <p style={{ fontSize: '12px', color: '#6b7fa8' }}>토큰 제한으로 인해 추후에 적용</p>
        </div>
      </Card>
      <div className="flex w-56 flex-shrink-0 flex-col gap-3">
        {activeSectors.map(s => (
          <Card key={s.category} className="flex-1">
            <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">{s.displayName}</p>
            <p className={`text-lg font-bold ${changeColor(s.averageChangePercent)}`}>
              {s.averageChangePercent > 0 ? '+' : ''}{s.averageChangePercent.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">상위: {s.topGainer ? s.topGainer.name : ''}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MoverRow({ stock }: { stock: StockSummary }) {
  return (
    <Link to={`/stocks/${stock.id}`} className="flex items-center justify-between py-1.5 text-sm hover:opacity-80">
      <span className="text-slate-900 dark:text-slate-100">{stock.name}</span>
      <span className={`font-semibold ${changeColor(stock.changePercent)}`}>
        {formatPercent(stock.changePercent)}
      </span>
    </Link>
  );
}

function CategoryMovers({ category, label }: { category: string; label: string }) {
  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStocksByCategory(category, 30).then(page => setStocks(page.content)).finally(() => setIsLoading(false));
  }, [category]);

  const topData = stocks.slice(0, 3);
  const botData = stocks.slice(-3).reverse();

  return (
    <Card>
      <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">{label}</h3>
      <p className="mb-1 text-xs font-semibold text-red-500 dark:text-red-400">▲ 급등 TOP 3</p>
      {isLoading ? <Skeleton className="h-20" /> : topData.map(s => <MoverRow key={s.id} stock={s} />)}
      <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
      <p className="mb-1 text-xs font-semibold text-blue-500 dark:text-blue-400">▼ 급락 TOP 3</p>
      {isLoading ? <Skeleton className="h-20" /> : botData.map(s => <MoverRow key={s.id} stock={s} />)}
    </Card>
  );
}

function Top10Table() {
  const [data, setData] = useState<Page<StockSummary> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { getTopStocks(10).then(setData).finally(() => setIsLoading(false)); }, []);

  return (
    <Card>
      <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100">전체 등락률 TOP 10</h3>
      {isLoading ? (
        <div className="space-y-2">{[0,1,2,3,4].map(i => <Skeleton key={i} className="h-10" />)}</div>
      ) : (
        <>
          <div className="mb-2 flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-7">#</span>
            <span className="flex-1">종목</span>
            <span className="w-16">분류</span>
            <span className="w-24 text-right">현재가</span>
            <span className="w-16 text-right">등락률</span>
          </div>
          {data && data.content.map((stock, i) => (
            <Link key={stock.id} to={`/stocks/${stock.id}`}
              className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="w-7 text-slate-500">{i + 1}</span>
              <span className="flex-1 text-slate-900 dark:text-slate-100">{stock.name}</span>
              <span className="w-16 text-xs text-slate-600 dark:text-slate-400">{CAT_LABEL[stock.category as keyof CatLabel] || stock.category}</span>
              <span className="w-24 text-right text-slate-900 dark:text-slate-100">{formatPrice(stock.currentPrice)}</span>
              <span className={`w-16 text-right font-semibold ${changeColor(stock.changePercent)}`}>{formatPercent(stock.changePercent)}</span>
            </Link>
          ))}
        </>
      )}
    </Card>
  );
}

export function LandingPage() {
  const FEATURES = [
    { icon: <TrendingUp className="h-6 w-6 text-slate-600 dark:text-slate-300" />, title: '실시간 물가 추적', desc: 'KAMIS · Opinet · ECOS API로 28종 품목 가격을 주기적으로 업데이트합니다.' },
    { icon: <Bot className="h-6 w-6 text-slate-600 dark:text-slate-300" />, title: 'AI 시황 분석', desc: '오늘의 물가 흐름을 AI가 주식 시황처럼 자동으로 요약해 제공합니다.' },
    { icon: <Star className="h-6 w-6 text-slate-600 dark:text-slate-300" />, title: '포트폴리오 관리', desc: '관심 품목을 즐겨찾기하고 나만의 생활물가 포트폴리오를 구성하세요.' },
  ];

  return (
    <>
      <Helmet><title>MulgaStock — 물가를 주식처럼</title></Helmet>

      <section className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl items-start gap-14 px-6 py-16 lg:px-10">
          <div className="flex-1 pt-2">
            <p className="mb-4 text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400">소비자 물가 실시간 추적 서비스</p>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              일상 속 가격 변동,<br />주식처럼 한눈에
            </h1>
            <p className="mb-7 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              KAMIS · Opinet · ECOS 데이터를 기반으로<br />
              농수축산물부터 에너지까지 28종 품목 가격을<br />
              주기적으로 업데이트합니다.
            </p>
            <Link to="/market" className="inline-block rounded-lg bg-blue-500 px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
              시장 보러 가기
            </Link>
          </div>
          <div className="flex-1"><HeroChartCard /></div>
        </div>
      </section>

      <section className="border-b border-slate-200 dark:border-slate-800 py-12">
        <div className="mx-auto flex max-w-7xl gap-4 px-6 lg:px-10">
          {FEATURES.map(f => (
            <div key={f.title} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 p-8 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
              <div className="mb-3">{f.icon}</div>
              <p className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">{f.title}</p>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-b border-slate-200 dark:border-slate-800 py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SearchBar className="max-w-full" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6 lg:px-10">
        <MarketOverview />
        <div>
          <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-slate-100">카테고리별 급등·급락</h2>
          <div className="grid grid-cols-3 gap-4">
            {[{ key: 'FOOD', label: '식품' }, { key: 'DAILY', label: '생필품' }, { key: 'ENERGY', label: '에너지' }].map(c => (
              <CategoryMovers key={c.key} category={c.key} label={c.label} />
            ))}
          </div>
        </div>
        <Top10Table />
      </div>
    </>
  );
}
