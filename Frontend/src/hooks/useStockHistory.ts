import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '../api/stocks.api';
import { queryKeys } from '../api/queryKeys';
import type { Period } from '../api/types';

export const useStockHistory = (id: string, period: Period) =>
  useQuery({
    queryKey: queryKeys.stocks.history(id, period),
    queryFn: () => stocksApi.getHistory(id, period).then((r) => r.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
