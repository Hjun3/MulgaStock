import { Link } from 'react-router-dom';

// 없는 주소로 들어왔을 때 보여주는 페이지
export default function NotFoundPage() {
  return (
    <div className="text-center py-32">
      <p className="text-6xl font-bold text-slate-300 dark:text-slate-700">404</p>
      <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">페이지를 찾을 수 없습니다</p>
      <Link to="/" className="inline-block mt-6 text-indigo-400 text-sm">
        메인으로
      </Link>
    </div>
  );
}
