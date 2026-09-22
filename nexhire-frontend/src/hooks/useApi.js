import { useState, useCallback } from 'react';

export const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      // Placeholder implementation
      const response = await apiFunction(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    data, 
    loading, 
    error, 
    request 
  };
};
