export const formatPrice = (price: number) =>
  `₩${price.toLocaleString('ko-KR')}`;

// KAMIS/ECOS 거시지표 전용 — 스케일 변환 포함
// bp: ×100 저장 (250 → "2.50%"), 지수: ×100 저장 (11571 → "115.71"), 원: ×1 저장
export const formatMacroValue = (price: number, unit: string): string => {
  if (unit === 'bp') return `${(price / 100).toFixed(2)}%`;
  if (unit === '지수') return (price / 100).toFixed(2);
  return `₩${price.toLocaleString('ko-KR')}`;
};

export const isMacroCategory = (category: string) => category === '거시지표';

export const formatPercent = (value: number, decimals = 2) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatDate = (date: string, format: 'short' | 'long' = 'short') => {
  const d = new Date(date);
  return format === 'short'
    ? d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    : d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatRelativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

export const getChangeColor = (value: number) =>
  value > 0 ? 'text-up' : value < 0 ? 'text-down' : 'text-flat';
