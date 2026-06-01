import { apiClient } from './client';
import type { ApiResponse, MoverType, PageResponse, Period, StockCategory, StockDetail, StockSummary, PriceHistory } from './types';

export const stocksApi = {
  getAll: (params?: {
    category?: StockCategory;
    sortBy?: string;
    direction?: 'asc' | 'desc';
    page?: number;
    size?: number;
  }) => apiClient.get<never, ApiResponse<PageResponse<StockSummary>>>('/stocks', { params }),

  getTopMovers: (type: MoverType, limit = 5) =>
    apiClient.get<never, ApiResponse<StockSummary[]>>('/stocks/top-movers', { params: { type, limit } }),

  getDetail: (id: string) =>
    apiClient.get<never, ApiResponse<StockDetail>>(`/stocks/${id}`),

  getHistory: (id: string, period: Period) =>
    apiClient.get<never, ApiResponse<PriceHistory[]>>(`/stocks/${id}/history`, { params: { period } }),

  search: (q: string, limit = 10) =>
    apiClient.get<never, ApiResponse<StockSummary[]>>('/stocks/search', { params: { q, limit } }),
};
