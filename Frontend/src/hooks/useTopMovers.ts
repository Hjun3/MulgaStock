import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '../api/stocks.api';
import { queryKeys } from '../api/queryKeys';
import type { MoverType } from '../api/types';

export const useTopMovers = (type: MoverType, limit = 5) =>
  useQuery({
    queryKey: queryKeys.stocks.topMovers(type, limit),
    queryFn: () => stocksApi.getTopMovers(type, limit).then((r) => r.data),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
