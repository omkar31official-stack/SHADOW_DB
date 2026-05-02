import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const endpointRef = useRef(endpoint);
  endpointRef.current = endpoint;

  const { immediate = true } = options;

  const fetchData = useCallback(async () => {
    const currentEndpoint = endpointRef.current;
    if (!currentEndpoint) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.get(currentEndpoint);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // No deps — uses ref for endpoint

  // Re-fetch when endpoint changes
  useEffect(() => {
    if (immediate && endpoint) {
      fetchData();
    } else if (!endpoint) {
      setLoading(false);
    }
  }, [endpoint, immediate, fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}

export function useMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (method, endpoint, body) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api[method](endpoint, body);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
