import { apiClient } from './client';
import type { ApiResponse, MarketSummary } from './types';

export const marketApi = {
  getSummary: () => apiClient.get<never, ApiResponse<MarketSummary>>('/market/summary'),
};
