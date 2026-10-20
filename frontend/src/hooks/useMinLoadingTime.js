import { useState } from 'react';

/**
 * useMinLoadingTime — Ensures loading state lasts at least `minMs` milliseconds.
 * Default is now 1000ms (1 second).
 *
 * Usage:
 *   const { loading, runWithMinTime } = useMinLoadingTime();      // uses 1000ms default
 *   const { loading, runWithMinTime } = useMinLoadingTime(1500);  // custom
 */
export const useMinLoadingTime = (minMs = 1000) => {
  const [loading, setLoading] = useState(false);

  const runWithMinTime = async (asyncFn) => {
    setLoading(true);
    const start = Date.now();

    try {
      return await asyncFn();
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minMs - elapsed);
      setTimeout(() => setLoading(false), remaining);
    }
  };

  return { loading, runWithMinTime, setLoading };
};

export default useMinLoadingTime;