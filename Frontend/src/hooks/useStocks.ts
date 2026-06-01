import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '../api/stocks.api';
import { queryKeys } from '../api/queryKeys';
import type { StockCategory } from '../api/types';

export const useStocks = (params?: {
  category?: StockCategory;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  size?: number;
}) =>
  useQuery({
    queryKey: queryKeys.stocks.list(params),
    queryFn: () => stocksApi.getAll(params).then((r) => r.data),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
