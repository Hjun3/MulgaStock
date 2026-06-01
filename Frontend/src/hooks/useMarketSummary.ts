import { useQuery } from '@tanstack/react-query';
import { marketApi } from '../api/market.api';
import { queryKeys } from '../api/queryKeys';

export const useMarketSummary = () =>
  useQuery({
    queryKey: queryKeys.market.summary(),
    queryFn: () => marketApi.getSummary().then((r) => r.data),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
