import { useCallback, useEffect, useState } from "react";

export interface AsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  startLoading: () => void;
}

export function useAsync<T>(fetcher: () => Promise<T>): AsyncResult<T> {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        const data = await fetcher();
        if (!ignore) {
          setState({ data, loading: false, error: null });
        }
      } catch (problem) {
        if (!ignore) {
          setState({
            data: null,
            loading: false,
            error:
              problem instanceof Error
                ? problem.message
                : "Request failed. Please try again.",
          });
        }
      }
    };

    void run();

    return () => {
      ignore = true;
    };
  }, [fetcher, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const startLoading = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }));
  }, []);

  return { ...state, reload, startLoading };
}