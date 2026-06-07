import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchStocks } from '../../api';
import { formatPrice, formatPercent, changeColor } from '../../utils';
import type { StockSummary } from '../../types';

export function SearchBar({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<StockSummary[]>([]);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debounced) { setResults([]); return; }
    searchStocks(debounced).then(setResults).catch(() => setResults([]));
  }, [debounced]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string) => {
    navigate(`/stocks/${id}`);
    setQuery('');
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={`relative w-full max-w-sm ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="종목 검색..."
            aria-label="종목 검색"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-8 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setOpen(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {open && debounced && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
          {results.slice(0, 8).map((stock) => (
            <button
              key={stock.id}
              onClick={() => handleSelect(stock.id)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl"
            >
              <div>
                <p className="text-sm font-medium text-slate-100">{stock.name}</p>
                <p className="text-xs text-slate-500">{stock.category} · {stock.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-100">{formatPrice(stock.currentPrice)}</p>
                <span className={`text-xs font-semibold ${changeColor(stock.changePercent)}`}>
                  {formatPercent(stock.changePercent)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && debounced && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-700 bg-slate-800 p-4 text-center text-sm text-slate-500 shadow-xl">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}