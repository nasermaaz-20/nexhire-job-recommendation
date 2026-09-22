import axios from 'axios';

export const getMetrics = async () => {
  return axios.get('/api/analytics/metrics');
};

export const getChartData = async (chartType) => {
  return axios.get(`/api/analytics/charts/${chartType}`);
};
