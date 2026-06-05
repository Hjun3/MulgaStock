// 백엔드에서 내려주는 데이터의 타입을 정의한 파일

// 종목 한 개의 간단한 정보 (목록, 검색, 랭킹에서 사용)
export interface StockSummary {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  changePercent: number;
  unit: string;
}

// 종목 상세 페이지에서 쓰는 자세한 정보
export interface StockDetail extends StockSummary {
  previousPrice: number;
  changeAmount: number;
  yearHigh: number;
  yearLow: number;
  categoryAverageChangePercent: number;
  source?: string;
}

// 가격 추이 (차트용)
export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 카테고리(섹터) 요약
export interface Sector {
  category: string;
  displayName: string;
  averageChangePercent: number;
  stockCount: number;
  topGainer: { id: string; name: string; changePercent: number } | null;
}

// 시장 전체 요약
export interface MarketSummary {
  totalChangePercent: number;
  gainersCount: number;
  losersCount: number;
  lastUpdated: string;
  sectors: Sector[];
}

// 종목 목록 API는 페이징 형태로 내려준다. (필요한 부분만 정의)
export interface Page<T> {
  content: T[];
  totalElements: number;
}
