import { Link } from 'react-router-dom';
import { Clock, BarChart2 } from 'lucide-react';
import { SearchBar } from '../common/SearchBar';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-accent-primary">
          <BarChart2 className="h-5 w-5" />
          <span className="font-bold tracking-tight">MulgaStock</span>
        </Link>

        <div className="flex-1">
          <SearchBar />
        </div>

        <nav className="flex shrink-0 items-center gap-4">
          <Link to="/market" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
            시장
          </Link>
          <Link
            to="/portfolio"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            포트폴리오
          </Link>
          <div className="flex items-center gap-1.5 text-text-muted">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-numeric text-xs">장 마감 18:00</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
