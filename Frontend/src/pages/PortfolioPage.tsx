import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getStockDetail, getStockHistory } from '../api';
import type { StockDetail, PriceHistory } from '../types';
import { formatPrice, formatPercent, changeColor, getWatchlist, removeWatchlist } from '../utils';
import { useTheme } from '../context/ThemeContext';

const PERIODS = ['1W', '1M', '3M', '1Y'];

export default function PortfolioPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<StockDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chartHistory, setChartHistory] = useState<PriceHistory[]>([]);
  const [chartPeriod, setChartPeriod] = useState('1M');
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    const ids = getWatchlist();
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => getStockDetail(id)))
      .then((data) => setStocks(data))
      .catch(() => setStocks([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setChartLoading(true);
    getStockHistory(selectedId, chartPeriod)
      .then(setChartHistory)
      .catch(() => setChartHistory([]))
      .finally(() => setChartLoading(false));
  }, [selectedId, chartPeriod]);

  function handleRemove(id: string) {
    removeWatchlist(id);
    setStocks(prev => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  if (loading) {
    return <p className="text-center text-slate-600 dark:text-slate-400 py-20">불러오는 중...</p>;
  }

  if (stocks.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-4xl">⭐</p>
        <p className="text-slate-800 dark:text-slate-200 font-semibold">관심 종목이 없습니다</p>
        <p className="text-sm text-slate-500">종목 상세 페이지에서 '관심 추가'를 눌러보세요.</p>
        <Link to="/" className="inline-block text-indigo-500 dark:text-indigo-400 text-sm">
          메인으로
        </Link>
      </div>
    );
  }

  const average = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;
  const gainers = stocks.filter(s => s.changePercent > 0).length;
  const losers = stocks.filter(s => s.changePercent < 0).length;

  const sorted = [...stocks].sort((a, b) =>
    sortDir === 'desc' ? b.changePercent - a.changePercent : a.changePercent - b.changePercent
  );

  const selectedStock = stocks.find(s => s.id === selectedId) ?? null;
  const chartData = chartHistory.map(h => ({ date: h.date, price: h.close }));

  const isDark = theme === 'dark';
  const tickFill = isDark ? '#94a3b8' : '#475569';
  const tooltipStyle = isDark
    ? { background: '#1e293b', border: 'none', borderRadius: 8, color: '#e2e8f0' }
    : { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* 타이틀 */}
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">내 포트폴리오</h1>
        <span className="text-sm text-slate-500">{stocks.length}개 종목</span>
      </div>

      {/* 요약 카드 4개 — 전체 너비 1줄 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">평균 등락률</p>
          <p className={'text-2xl font-bold ' + changeColor(average)}>{formatPercent(average)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">보유 종목</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stocks.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">상승 종목</p>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400">{gainers}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">하락 종목</p>
          <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">{losers}</p>
        </div>
      </div>

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-3 gap-6 items-start">

        {/* 왼쪽 패널 — 종목 목록 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">보유 종목</span>
            <button
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {sortDir === 'desc' ? '▼ 높은순' : '▲ 낮은순'}
            </button>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1 portfolio-scroll">
            {sorted.map((stock) => {
              const isSelected = stock.id === selectedId;
              return (
                <div
                  key={stock.id}
                  onClick={() => setSelectedId(stock.id)}
                  className={
                    'flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-colors ' +
                    (isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50')
                  }
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{stock.name}</p>
                    <p className="text-xs text-slate-500">{stock.category}</p>
                  </div>
                  <div className="text-right mx-2 flex-shrink-0">
                    <p className="text-xs text-slate-800 dark:text-slate-200">{formatPrice(stock.currentPrice)}</p>
                    <p className={'text-xs font-semibold ' + changeColor(stock.changePercent)}>{formatPercent(stock.changePercent)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(stock.id); }}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0 text-xs"
                    aria-label="관심 종목 제거"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 오른쪽 패널 — 차트 + AI 코멘트 */}
        <div className="col-span-2 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          {!selectedStock ? (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500">
              <div className="text-center space-y-2">
                <p className="text-3xl">📈</p>
                <p className="text-sm">종목을 선택하세요</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">

              {/* 종목 헤더 */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">{selectedStock.category}</p>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedStock.name}</h2>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatPrice(selectedStock.currentPrice)}</p>
                  <p className={'text-sm ' + changeColor(selectedStock.changePercent)}>
                    {formatPercent(selectedStock.changePercent)} ({formatPrice(selectedStock.changeAmount)})
                  </p>
                </div>
                <button
                  onClick={() => navigate('/stocks/' + selectedStock.id)}
                  className="flex-shrink-0 text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  상세 페이지로 이동 →
                </button>
              </div>

              {/* 기간 버튼 */}
              <div className="flex gap-2">
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={
                      'rounded-md px-3 py-1 text-sm ' +
                      (chartPeriod === p
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700')
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* 차트 */}
              {chartLoading ? (
                <div className="h-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              ) : chartData.length === 0 ? (
                <p className="text-center text-slate-500 py-20 text-sm">차트 데이터가 없습니다.</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: tickFill, fontSize: 11 }} domain={['auto', 'auto']} width={60} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="price" stroke="#818cf8" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* AI 코멘트 */}
              {/* TODO: AI 서버 연결 */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-2">✨ AI 분석</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">추후 AI 분석 기능이 추가될 예정입니다.</p>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
