import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { TrendingUp, Bot, Star } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getMarketSummary, getStocksByCategory, getStockHistory, getTopStocks, fetchInsight } from '../api';
import { formatPercent, formatPrice, changeColor } from '../utils';
import { useTheme } from '../context/ThemeContext';
import type { MarketSummary, StockSummary, Page } from '../types';


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
  const tooltipStyle = theme === 'dark'
    ? { background: '#1e293b', border: 'none', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }
    : { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', fontSize: 12 };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis dataKey="d" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} interval={interval} />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: tickFill }}
          cursor={{ stroke: tickFill, strokeWidth: 1 }}
          formatter={(v) => [Number(v).toFixed(0), '가격']}
        />
        <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} />
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

  if (isLoading) return <Skeleton className="h-full w-full" />;
  if (!data) return null;

  return (
    <div className="h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col">
      <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">전체 물가지수 (3개월)</p>
      <p className={`mb-1 text-2xl font-bold ${changeColor(data.totalChangePercent)}`}>
        {data.totalChangePercent > 0 ? '+' : ''}{data.totalChangePercent.toFixed(2)}%
      </p>
      <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
        상승 {data.gainersCount} · 하락 {data.losersCount} · 기준=100
      </p>
      <div className="flex-1">
        <StockLineChart height={110} />
      </div>
    </div>
  );
}

function MarketOverview() {
  const [data, setData] = useState<MarketSummary | null>(null);
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    getMarketSummary().then(d => {
      setData(d);
      fetchInsight('landing', {
        gainersCount: d.gainersCount,
        losersCount: d.losersCount,
        totalChangePercent: d.totalChangePercent,
      }).then(setInsight).catch(() => {});
    }).catch(() => {});
  }, []);

  const activeSectors = data ? data.sectors.filter(s => s.stockCount > 0).slice(0, 3) : [];
  const total = data ? data.totalChangePercent : 0;

  return (
    <div className="flex gap-4">
      <Card className="flex-1">
        <p className="mb-1 text-base text-slate-600 dark:text-slate-400">전체 물가지수 (3개월)</p>
        <p className={`mb-1 text-4xl font-bold ${changeColor(total)}`}>
          {total > 0 ? '+' : ''}{total.toFixed(2)}%
        </p>
        <p className="mb-3 text-base text-slate-600 dark:text-slate-400">
          상승 {data ? data.gainersCount : ''} · 하락 {data ? data.losersCount : ''} · 기준=100
        </p>
        <StockLineChart height={220} />
        <div style={{ borderLeft: '3px solid #f59e0b', padding: '10px 14px', marginTop: '12px', backgroundColor: 'rgba(245,158,11,0.06)' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>✦ 오늘의 AI 시황</p>
          <p style={{ fontSize: '14px', color: '#6b7fa8' }}>
            {insight === null ? 'AI 분석 중...' : insight}
          </p>
        </div>
      </Card>
      <div className="flex w-60 flex-shrink-0 flex-col gap-3">
        {activeSectors.map(s => (
          <Card key={s.category} className="flex-1">
            <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">{s.displayName}</p>
            <p className={`text-xl font-bold ${changeColor(s.averageChangePercent)}`}>
              {s.averageChangePercent > 0 ? '+' : ''}{s.averageChangePercent.toFixed(2)}%
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">상위: {s.topGainer ? s.topGainer.name : ''}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MoverRow({ stock }: { stock: StockSummary }) {
  const changeAmt = Math.round(stock.currentPrice * stock.changePercent / (100 + stock.changePercent));
  const sign = changeAmt >= 0 ? '+' : '';
  return (
    <Link to={`/stocks/${stock.id}`} className="flex items-center justify-between py-2 text-base hover:opacity-80">
      <span className="text-slate-900 dark:text-slate-100">{stock.name}</span>
      <span className={`flex items-center font-semibold ${changeColor(stock.changePercent)}`}>
        <span className="w-16 text-right">{sign}{formatPrice(Math.abs(changeAmt))}</span>
        <span className="w-4 text-center font-normal text-slate-300 dark:text-slate-600">|</span>
        <span className="w-14 text-left">{formatPercent(stock.changePercent)}</span>
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
      <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">{label}</h3>
      <p className="mb-1 text-sm font-semibold text-red-500 dark:text-red-400">▲ 급등 TOP 3</p>
      {isLoading ? <Skeleton className="h-20" /> : topData.map(s => <MoverRow key={s.id} stock={s} />)}
      <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
      <p className="mb-1 text-sm font-semibold text-blue-500 dark:text-blue-400">▼ 급락 TOP 3</p>
      {isLoading ? <Skeleton className="h-20" /> : botData.map(s => <MoverRow key={s.id} stock={s} />)}
    </Card>
  );
}

function Top10Table() {
  const [data, setData] = useState<Page<StockSummary> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { getTopStocks(10).then(setData).finally(() => setIsLoading(false)); }, []);

  const stocks = data ? data.content : [];
  const firstHalf = stocks.slice(0, 5);
  const secondHalf = stocks.slice(5, 10);

  const colHeader = (
    <div className="mb-2 flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
      <span className="w-5">#</span>
      <span className="flex-1">종목</span>
      <span className="w-20 text-right">현재가</span>
      <span className="w-36 text-center">등락률</span>
    </div>
  );

  function StockRow({ stock, rank }: { stock: StockSummary; rank: number }) {
    const changeAmt = Math.round(stock.currentPrice * stock.changePercent / (100 + stock.changePercent));
    const sign = changeAmt >= 0 ? '+' : '';
    return (
      <Link to={`/stocks/${stock.id}`}
        className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 py-2 text-base transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
        <span className="w-5 text-slate-500">{rank}</span>
        <span className="flex-1 truncate text-slate-900 dark:text-slate-100">{stock.name}</span>
        <span className="w-20 text-right text-slate-900 dark:text-slate-100">{formatPrice(stock.currentPrice)}</span>
        <span className={`w-36 flex items-center font-semibold ${changeColor(stock.changePercent)}`}>
          <span className="w-16 text-right">{sign}{formatPrice(Math.abs(changeAmt))}</span>
          <span className="w-4 text-center font-normal text-slate-300 dark:text-slate-600">|</span>
          <span className="w-14 text-left">{formatPercent(stock.changePercent)}</span>
        </span>
      </Link>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">전체 등락률 TOP 10</h3>
      {isLoading ? (
        <div className="space-y-2">{[0, 1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8" />)}</div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6">
          <div>
            {colHeader}
            {firstHalf.map((s, i) => <StockRow key={s.id} stock={s} rank={i + 1} />)}
          </div>
          <div>
            {colHeader}
            {secondHalf.map((s, i) => <StockRow key={s.id} stock={s} rank={i + 6} />)}
          </div>
        </div>
      )}
    </Card>
  );
}

export function LandingPage() {
  const { theme } = useTheme();
  const MINI_CHART_DATA = [
    { v: 100 }, { v: 112 }, { v: 128 }, { v: 120 }, { v: 105 }, { v: 90 }, { v: 92 },
    { v: 94 }, { v: 100 }, { v: 102 }, { v: 105 }, { v: 95 }, { v: 102 }, { v: 105 },
    { v: 95 }, { v: 98 }, { v: 118 }, { v: 130 }, { v: 145 }, { v: 133 }, { v: 134 },
    { v: 135 }, { v: 122 }, { v: 103 }, { v: 122 }, { v: 145 }, { v: 142 }, { v: 130 },
    { v: 140 }, { v: 145 },
  ];
  const MINI_AI_TEXT = '배추 가격 급등세 지속, 에너지 약세 이어져. 식품 물가 전월 대비 +2.1% 상승.';
  const MINI_PORTFOLIO = [
    { name: '배추', change: 2.21 },
    { name: '휘발유', change: 1.29 },
    { name: '계란', change: -0.84 },
  ];

  return (
    <>
      <Helmet><title>MulgaStock — 물가를 주식처럼</title></Helmet>

      {/* 히어로 섹션 */}
      <section className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl items-stretch gap-10 px-6 py-8 lg:px-10">
          <div className="flex-1 flex flex-col justify-center">
            <p className="mb-2 text-sm uppercase tracking-widest text-slate-600 dark:text-slate-400">소비자 물가 실시간 추적 서비스</p>
            <h1 className="mb-3 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              일상 속 가격 변동,<br />주식처럼 한눈에
            </h1>
            <p className="mb-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
              KAMIS · Opinet · ECOS 데이터를 기반으로 28종 품목 가격을 주기적으로 업데이트합니다.
            </p>
            <Link to="/market" className="self-start rounded-lg bg-yellow-500 hover:bg-yellow-400 px-6 py-2.5 text-base font-bold text-white dark:text-slate-900 transition-colors">
              시장 보러 가기
            </Link>
          </div>
          <div className="flex-[2]"><HeroChartCard /></div>
        </div>
      </section>

      {/* 피처 카드 3개 */}
      <section className="border-b border-slate-200 dark:border-slate-800 py-12">
        <div className="mx-auto flex max-w-7xl gap-4 px-6 lg:px-10">
          {/* 실시간 물가 추적 — hover 없음, 정적 차트 */}
          <div className="fade-in-up flex-1 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="mb-4"><TrendingUp className="h-7 w-7 text-slate-600 dark:text-slate-300" /></div>
            <p className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">실시간 물가 추적</p>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">KAMIS · Opinet · ECOS API로 28종 품목 가격을 주기적으로 업데이트합니다.</p>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={MINI_CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="#3b82f6"
                    fillOpacity={0.12}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="fade-in-up flex-1 rounded-xl border border-slate-200 dark:border-slate-800 p-8 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900" style={{ animationDelay: '0.15s' }}>
            <div className="mb-4"><Bot className="h-7 w-7 text-slate-600 dark:text-slate-300" /></div>
            <p className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">AI 시황 분석</p>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">오늘의 물가 흐름을 AI가 주식 시황처럼 자동으로 요약해 제공합니다.</p>
            <div className="mt-4 rounded-lg border-l-2 border-yellow-500 bg-yellow-500/5 px-3 py-2">
              <p className="mb-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400">✦ 오늘의 시황</p>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{MINI_AI_TEXT}</p>
            </div>
          </div>
          <div className="fade-in-up flex-1 rounded-xl border border-slate-200 dark:border-slate-800 p-8 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900" style={{ animationDelay: '0.3s' }}>
            <div className="mb-4"><Star className="h-7 w-7 text-slate-600 dark:text-slate-300" /></div>
            <p className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">포트폴리오 관리</p>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">관심 품목을 즐겨찾기하고 나만의 생활물가 포트폴리오를 구성하세요.</p>
            <div className="mt-4 space-y-2">
              {MINI_PORTFOLIO.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className={item.change > 0 ? 'font-semibold text-red-500 dark:text-red-400' : 'font-semibold text-blue-500 dark:text-blue-400'}>
                    {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 시장 데이터 */}
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6 lg:px-10">
        <MarketOverview />

        {/* 카테고리별 급등·급락 — 가로 3열 */}
        <div>
          <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">카테고리별 급등·급락</h2>
          <div className="grid grid-cols-3 gap-4">
            {[{ key: 'MACRO', label: '거시지표' }, { key: 'FOOD', label: '식품' }, { key: 'ENERGY', label: '에너지' }].map(c => (
              <CategoryMovers key={c.key} category={c.key} label={c.label} />
            ))}
          </div>
        </div>

        {/* 전체 등락률 TOP 10 — 좌 1~5 / 우 6~10 */}
        <Top10Table />
      </div>
    </>
  );
}
