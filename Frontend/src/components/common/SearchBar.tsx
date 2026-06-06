import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useStockSearch } from '../../hooks/useStockSearch';
import { formatPrice } from '../../lib/format';
import { ChangeBadge } from './ChangeBadge';
import { cn } from '../../lib/cn';

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 300);
  const { data: results } = useStockSearch(debounced);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

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
    <div ref={ref} className={cn("relative w-full max-w-sm", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="종목 검색..."
            aria-label="종목 검색"
            className="w-full rounded-lg border border-border bg-bg-tertiary py-2 pl-9 pr-8 text-sm text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setOpen(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {open && debounced && results && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-bg-elevated shadow-xl">
          {results.slice(0, 8).map((stock) => (
            <button
              key={stock.id}
              onClick={() => handleSelect(stock.id)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-bg-tertiary first:rounded-t-xl last:rounded-b-xl"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{stock.name}</p>
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

      {open && debounced && results?.length === 0 && (
        <div className={cn(
          'absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-bg-elevated p-4 text-center text-sm text-text-muted shadow-xl'
        )}>
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}
