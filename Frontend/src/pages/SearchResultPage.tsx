import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchStocks } from '../api';
import type { StockSummary } from '../types';
import { formatPrice, formatPercent, changeColor } from '../utils';

export default function SearchResultPage() {
  const [params] = useSearchParams();
  const keyword = params.get('q') ?? '';

  const [results, setResults] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (keyword === '') {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchStocks(keyword)
      .then((data) => { setResults(data); setLoading(false); })
      .catch(() => { setResults([]); setLoading(false); });
  }, [keyword]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
        <span className="text-slate-500">검색: </span>"{keyword}"
      </h1>

      {loading ? (
        <p className="text-center text-slate-600 dark:text-slate-400 py-20">불러오는 중...</p>
      ) : results.length === 0 ? (
        <p className="text-center text-slate-600 dark:text-slate-400 py-20">검색 결과가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {results.map((stock) => (
            <Link
              key={stock.id}
              to={'/stocks/' + stock.id}
              className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{stock.name}</p>
                <p className="text-xs text-slate-500">
                  {stock.category} · {stock.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-800 dark:text-slate-200">{formatPrice(stock.currentPrice)}</p>
                <p className={'text-sm ' + changeColor(stock.changePercent)}>
                  {formatPercent(stock.changePercent)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
