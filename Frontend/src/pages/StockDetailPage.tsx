import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getStockDetail, getStockHistory, fetchInsight } from '../api';
import type { StockDetail, PriceHistory } from '../types';
import {
  formatPrice,
  formatPercent,
  changeColor,
  isInWatchlist,
  addWatchlist,
  removeWatchlist,
} from '../utils';
import { useTheme } from '../context/ThemeContext';

const PERIODS = ['1W', '1M', '3M', '1Y'];

export default function StockDetailPage() {
  const { id } = useParams();
  const stockId = id ?? '';
  const { theme } = useTheme();

  const [stock, setStock] = useState<StockDetail | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [period, setPeriod] = useState('1M');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setInsight(null);
    getStockDetail(stockId)
      .then((data) => {
        setStock(data);
        setLoading(false);
        fetchInsight('stock', {
          name: data.name,
          currentPrice: data.currentPrice,
          changePercent: data.changePercent,
          yearHigh: data.yearHigh,
          yearLow: data.yearLow,
        }).then(setInsight).catch(() => {});
      })
      .catch(() => { setError(true); setLoading(false); });
    setSaved(isInWatchlist(stockId));
  }, [stockId]);

  useEffect(() => {
    getStockHistory(stockId, period)
      .then((data) => setHistory(data))
      .catch(() => setHistory([]));
  }, [stockId, period]);

  function toggleWatchlist() {
    if (saved) {
      removeWatchlist(stockId);
      setSaved(false);
    } else {
      addWatchlist(stockId);
      setSaved(true);
    }
  }

  const isDark = theme === 'dark';
  const tickFill = isDark ? '#94a3b8' : '#475569';
  const tooltipStyle = isDark
    ? { background: '#1e293b', border: 'none', borderRadius: 8, color: '#e2e8f0' }
    : { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' };

  if (loading) {
    return <p className="text-center text-slate-600 dark:text-slate-400 py-20">불러오는 중...</p>;
  }
  if (error || !stock) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 dark:text-slate-400">종목을 찾을 수 없습니다.</p>
        <Link to="/" className="text-indigo-500 dark:text-indigo-400 text-sm">
          메인으로
        </Link>
      </div>
    );
  }

  const chartData = history.map((h) => ({ date: h.date, price: h.close }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
        ← 뒤로
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">{stock.category}</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stock.name}</h1>
          <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-slate-100">{formatPrice(stock.currentPrice)}</p>
          <p className={'text-sm ' + changeColor(stock.changePercent)}>
            {formatPercent(stock.changePercent)} ({formatPrice(stock.changeAmount)})
          </p>
        </div>
        <button
          onClick={toggleWatchlist}
          className={
            'rounded-lg border px-3 py-2 text-sm ' +
            (saved
              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
              : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800')
          }
        >
          {saved ? '★ 관심 중' : '☆ 관심 추가'}
        </button>
      </div>

      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={
              'rounded-md px-3 py-1 text-sm ' +
              (period === p
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700')
            }
          >
            {p}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        {chartData.length === 0 ? (
          <p className="text-center text-slate-600 dark:text-slate-400 py-20">차트 데이터가 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickFill, fontSize: 11 }} domain={['auto', 'auto']} width={60} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="price" stroke="#818cf8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">종목 정보</h3>
        <InfoRow label="현재가" value={formatPrice(stock.currentPrice)} />
        <InfoRow label="전일가" value={formatPrice(stock.previousPrice)} />
        <InfoRow label="52주 최고" value={formatPrice(stock.yearHigh)} />
        <InfoRow label="52주 최저" value={formatPrice(stock.yearLow)} />
        <InfoRow
          label="카테고리 평균 등락"
          value={formatPercent(stock.categoryAverageChangePercent)}
        />
        {stock.source && <InfoRow label="데이터 출처" value={stock.source} />}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <h3 className="font-bold text-indigo-600 dark:text-indigo-300 mb-1">✨ AI 인사이트</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {insight === null ? 'AI 분석 중...' : insight}
        </p>
      </div>
    </div>
  );
}

function InfoRow(props: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800 last:border-0 text-sm">
      <span className="text-slate-600 dark:text-slate-400">{props.label}</span>
      <span className="text-slate-900 dark:text-slate-100">{props.value}</span>
    </div>
  );
}
