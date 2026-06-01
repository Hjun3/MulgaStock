import type { MoverType, Period, StockCategory } from './types';

export const queryKeys = {
  market: {
    summary: () => ['market', 'summary'] as const,
  },
  stocks: {
    all: () => ['stocks'] as const,
    list: (params?: { category?: StockCategory; sortBy?: string; direction?: string; page?: number }) =>
      ['stocks', 'list', params] as const,
    detail: (id: string) => ['stocks', 'detail', id] as const,
    history: (id: string, period: Period) => ['stocks', 'history', id, period] as const,
    topMovers: (type: MoverType, limit?: number) => ['stocks', 'top-movers', type, limit] as const,
    search: (q: string) => ['stocks', 'search', q] as const,
  },
};
