// 화면에서 자주 쓰는 작은 함수들을 모아둔 파일

// 가격을 "₩1,196" 형태로 바꿔준다.
export function formatPrice(price: number) {
  return '₩' + price.toLocaleString('ko-KR');
}

// 등락률을 "+3.10%" / "-2.97%" 형태로 바꿔준다.
export function formatPercent(value: number) {
  const sign = value > 0 ? '+' : '';
  return sign + value.toFixed(2) + '%';
}

// 한국 주식 관습: 오르면 빨강, 내리면 파랑 (다크 배경에서 잘 보이는 밝은 톤)
export function changeColor(value: number) {
  if (value > 0) return 'text-red-600 dark:text-red-400';
  if (value < 0) return 'text-blue-600 dark:text-blue-400';
  return 'text-slate-500 dark:text-slate-400';
}

// 그래프 막대 색상 (위와 동일한 규칙의 실제 색상값)
export function barColor(value: number) {
  if (value > 0) return '#f87171'; // red-400
  if (value < 0) return '#60a5fa'; // blue-400
  return '#94a3b8'; // slate-400
}

// 등락 화살표
export function changeArrow(value: number) {
  if (value > 0) return '▲';
  if (value < 0) return '▼';
  return '–';
}

// 날짜 문자열을 "2026.06.02 18:00" 형태로 바꿔준다.
export function formatDateTime(dateString: string) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '.' + pad(d.getMonth() + 1) +
    '.' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) +
    ':' + pad(d.getMinutes())
  );
}

// ----- 관심 목록(포트폴리오)을 브라우저 localStorage 에 저장 -----

const WATCHLIST_KEY = 'watchlist';

// 저장된 관심 종목 id 목록 읽기
export function getWatchlist(): string[] {
  const saved = localStorage.getItem(WATCHLIST_KEY);
  return saved ? JSON.parse(saved) : [];
}

// 이미 관심 목록에 있는지 확인
export function isInWatchlist(id: string) {
  return getWatchlist().includes(id);
}

// 관심 목록에 추가
export function addWatchlist(id: string) {
  const list = getWatchlist();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  }
}

// 관심 목록에서 제거
export function removeWatchlist(id: string) {
  const list = getWatchlist().filter((x) => x !== id);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}
