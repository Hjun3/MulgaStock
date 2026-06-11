import type { MarketSummary, StockSummary, StockDetail, PriceHistory, Page } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:3000';

function get<T>(path: string): Promise<T> {
  return fetch(BASE_URL + path)
    .then((res) => {
      if (!res.ok) throw new Error('서버 요청 실패 (' + res.status + ')');
      return res.json();
    })
    .then((json) => json.data as T);
}

export function getMarketSummary() {
  return get<MarketSummary>('/market/summary');
}

export function getStockDetail(id: string) {
  return get<StockDetail>('/stocks/' + id);
}

export function getStockHistory(id: string, period: string) {
  return get<PriceHistory[]>('/stocks/' + id + '/history?period=' + period);
}

export function searchStocks(keyword: string) {
  return get<StockSummary[]>('/stocks/search?q=' + encodeURIComponent(keyword) + '&limit=20');
}

export function getStocksByCategory(category: string, size = 30) {
  return get<Page<StockSummary>>(
    '/stocks?category=' + category + '&sortBy=changePercent&direction=desc&size=' + size
  );
}

export function getTopStocks(size = 10) {
  return get<Page<StockSummary>>('/stocks?sortBy=changePercent&direction=desc&size=' + size);
}

export function fetchInsight(type: 'landing' | 'market' | 'stock', data: object = {}): Promise<string> {
  return fetch(AI_URL + '/api/insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...data }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('AI 서버 요청 실패');
      return res.json();
    })
    .then((json) => json.insight as string);
}

export function login(_email: string, _password: string): Promise<void> {
  // TODO: POST /auth/login
  return Promise.resolve();
}

export function register(_email: string, _password: string): Promise<void> {
  // TODO: POST /auth/register
  return Promise.resolve();
}
