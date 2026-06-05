import { Link } from 'react-router-dom';

// 화면 맨 위에 항상 보이는 메뉴 바
export default function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 (누르면 홈으로) */}
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <span className="text-indigo-400">📈</span>
          PriceMarket
        </Link>

        {/* 오른쪽 메뉴 */}
        <nav className="flex items-center gap-5 text-sm text-slate-400">
          <Link to="/" className="hover:text-slate-100">
            시장
          </Link>
          <Link to="/portfolio" className="hover:text-slate-100">
            포트폴리오
          </Link>
          <button
            onClick={() => alert('로그인 기능은 준비 중입니다.')}
            className="border border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-800"
          >
            로그인
          </button>
        </nav>
      </div>
    </header>
  );
}
