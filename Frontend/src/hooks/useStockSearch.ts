import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '../api/stocks.api';
import { queryKeys } from '../api/queryKeys';

export const useStockSearch = (q: string) =>
  useQuery({
    queryKey: queryKeys.stocks.search(q),
    queryFn: () => stocksApi.search(q).then((r) => r.data),
    enabled: q.trim().length > 0,
    staleTime: 30 * 1000,
  });
