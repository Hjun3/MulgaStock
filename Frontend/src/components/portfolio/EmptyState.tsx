import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Star className="h-12 w-12 text-text-muted" />
      <div>
        <p className="text-lg font-semibold text-text-primary">관심 종목이 없습니다</p>
        <p className="mt-1 text-sm text-text-muted">
          종목 상세 페이지에서 ⭐ 버튼을 눌러 추가해보세요
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-tertiary"
      >
        메인으로
      </button>
    </div>
  );
}
