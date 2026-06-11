import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStockDetail } from '../api';
import type { StockDetail } from '../types';
import { formatPrice, formatPercent, changeColor, getWatchlist, removeWatchlist } from '../utils';

export default function PortfolioPage() {
  const [stocks, setStocks] = useState<StockDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getWatchlist();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(ids.map((id) => getStockDetail(id)))
      .then((data) => setStocks(data))
      .catch(() => setStocks([]))
      .finally(() => setLoading(false));
  }, []);

  function handleRemove(id: string) {
    removeWatchlist(id);
    setStocks(stocks.filter((s) => s.id !== id));
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">내 포트폴리오</h1>
        <span className="text-sm text-slate-500">{stocks.length}개 종목</span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">평균 등락률</p>
        <p className={'text-2xl font-bold ' + changeColor(average)}>{formatPercent(average)}</p>
      </div>

      <div className="space-y-2">
        {stocks.map((stock) => (
          <div
            key={stock.id}
            className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
          >
            <Link to={'/stocks/' + stock.id} className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{stock.name}</p>
              <p className="text-xs text-slate-500">
                {stock.category} · {stock.unit}
              </p>
            </Link>
            <div className="text-right mr-4">
              <p className="text-sm text-slate-800 dark:text-slate-200">{formatPrice(stock.currentPrice)}</p>
              <p className={'text-sm ' + changeColor(stock.changePercent)}>
                {formatPercent(stock.changePercent)}
              </p>
            </div>
            <button
              onClick={() => handleRemove(stock.id)}
              className="text-slate-500 hover:text-red-500 dark:hover:text-red-400"
              aria-label="관심 종목 제거"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
