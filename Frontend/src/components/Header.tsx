import { Link } from 'react-router-dom';
import { BarChart3, Sun, Moon } from 'lucide-react';
import { SearchBar } from './common/SearchBar';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-yellow-500 dark:text-yellow-400 whitespace-nowrap">
            <BarChart3 className="h-5 w-5" />
            MulgaStock
          </Link>
          <div className="w-72">
            <SearchBar />
          </div>
        </div>

        <nav className="flex items-center gap-5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
          <Link to="/market" className="hover:text-slate-900 dark:hover:text-slate-100">
            시장
          </Link>
          <Link to="/portfolio" className="hover:text-slate-900 dark:hover:text-slate-100">
            포트폴리오
          </Link>
          <button
            onClick={() => alert('로그인 기능은 준비 중입니다.')}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            로그인
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
