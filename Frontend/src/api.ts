// 백엔드 API를 호출하는 함수들을 모아둔 파일
// fetch로 직접 요청하고, 공통 응답에서 data 부분만 꺼내서 돌려준다.

import type { MarketSummary, StockSummary, StockDetail, PriceHistory, Page } from './types';

// .env 의 VITE_API_BASE_URL 값을 사용한다. (예: http://localhost:8080/api/v1)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// 공통 GET 함수
// 백엔드 응답이 { success, data, message } 형태라서 data만 꺼낸다.
async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE_URL + path);
  if (!res.ok) {
    throw new Error('서버 요청 실패 (' + res.status + ')');
  }
  const json = await res.json();
  return json.data as T;
}

// 시장 전체 요약
export function getMarketSummary() {
  return get<MarketSummary>('/market/summary');
}

// 급등/급락 랭킹
export function getTopMovers(type: 'gainers' | 'losers', limit = 3) {
  return get<StockSummary[]>('/stocks/top-movers?type=' + type + '&limit=' + limit);
}

// 종목 상세
export function getStockDetail(id: string) {
  return get<StockDetail>('/stocks/' + id);
}

// 종목 가격 추이
export function getStockHistory(id: string, period: string) {
  return get<PriceHistory[]>('/stocks/' + id + '/history?period=' + period);
}

// 종목 검색
export function searchStocks(keyword: string) {
  return get<StockSummary[]>('/stocks/search?q=' + encodeURIComponent(keyword) + '&limit=20');
}

// 특정 카테고리(FOOD/DAILY/ENERGY ...)의 종목들을 등락률 높은 순으로
export function getStocksByCategory(category: string, size = 30) {
  return get<Page<StockSummary>>(
    '/stocks?category=' + category + '&sortBy=changePercent&direction=desc&size=' + size
  );
}

// 전체 종목 중 등락률 상위 N개
export function getTopStocks(size = 10) {
  return get<Page<StockSummary>>('/stocks?sortBy=changePercent&direction=desc&size=' + size);
}
