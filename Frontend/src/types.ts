// 백엔드에서 내려주는 데이터의 타입을 정의한 파일

// 종목 목록/검색 API (StockSummaryDto)
export interface StockSummary {
  id: string;
  name: string;
  category: string;         // displayName (예: "식품", "에너지")
  subcategory: string | null;
  unit: string | null;
  currentPrice: number;
  previousPrice: number;
  changeAmount: number;
  changePercent: number;
  yearHigh: number;
  yearLow: number;
  volume: number;
}

// 종목 상세 페이지 (StockDetailDto)
export interface StockDetail extends StockSummary {
  categoryAveragePrice: number;
  categoryAverageChangePercent: number;
  source: string | null;
  externalCode: string | null;
}

// 급등/급락 API (TopMoverDto) — StockSummaryDto보다 필드가 적음
export interface TopMover {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  changePercent: number;
  changeAmount: number;
  unit: string;
}

// 가격 추이 차트 (PriceHistoryDto)
export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 카테고리(섹터) 요약 (SectorDto)
export interface Sector {
  category: string;         // enum key (예: "FOOD", "ENERGY")
  displayName: string;      // 표시명 (예: "식품", "에너지")
  averageChangePercent: number;
  stockCount: number;
  topGainer: { id: string; name: string; changePercent: number } | null;
}

// 시장 전체 요약 (MarketSummaryDto)
export interface MarketSummary {
  totalChangePercent: number;
  totalStocks: number;
  gainersCount: number;
  losersCount: number;
  flatCount: number;
  lastUpdated: string;
  sectors: Sector[];
}

// 페이징 응답 (Spring Page)
export interface Page<T> {
  content: T[];
  totalElements: number;
}
