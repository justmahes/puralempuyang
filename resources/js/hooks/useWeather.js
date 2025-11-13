import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '../services/api';

export const useWeather = (date, enabled = true) => {
  return useQuery({
    queryKey: ['weather', date],
    queryFn: async () => {
      const { data } = await api.get(endpoints.weather, { params: { date } });
      return data.data;
    },
    enabled: Boolean(date) && enabled,
    staleTime: 1000 * 60 * 10,
  });
};