export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export type StockCategory = 'FOOD' | 'DAILY' | 'ENERGY' | 'GOODS';

export interface StockSummary {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  currentPrice: number;
  previousPrice?: number;
  changePercent: number;
  changeAmount: number;
  unit: string;
  yearHigh?: number;
  yearLow?: number;
  volume?: number;
}

export interface StockDetail extends StockSummary {
  subcategory: string;
  previousPrice: number;
  yearHigh: number;
  yearLow: number;
  volume: number;
  categoryAveragePrice: number;
  categoryAverageChangePercent: number;
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TopGainer {
  id: string;
  name: string;
  changePercent: number;
}

export interface Sector {
  category: StockCategory;
  displayName: string;
  averageChangePercent: number;
  stockCount: number;
  topGainer: TopGainer;
}

export interface MarketSummary {
  totalChangePercent: number;
  totalStocks: number;
  gainersCount: number;
  losersCount: number;
  flatCount: number;
  lastUpdated: string;
  sectors: Sector[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type Period = '1W' | '1M' | '3M' | '1Y' | '5Y' | 'ALL';
export type MoverType = 'gainers' | 'losers';
