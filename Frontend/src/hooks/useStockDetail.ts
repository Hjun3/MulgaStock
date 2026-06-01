import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '../api/stocks.api';
import { queryKeys } from '../api/queryKeys';

export const useStockDetail = (id: string) =>
  useQuery({
    queryKey: queryKeys.stocks.detail(id),
    queryFn: () => stocksApi.getDetail(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
