import { useState, useEffect } from 'react';

/**
 * Detects the user's network speed using the Network Information API.
 * Returns { isSlow, isOnline }.
 * Falls back to "fast" if the API is not supported.
 */
export const useNetworkSpeed = () => {
  const [isSlow, setIsSlow] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const checkConnection = () => {
      if (!connection) {
        setIsSlow(false);
        return;
      }

      const { effectiveType, downlink, rtt, saveData } = connection;

      const slowTypes = ['slow-2g', '2g', '3g'];
      const isSlowType = slowTypes.includes(effectiveType);
      const isLowBandwidth = downlink !== undefined && downlink < 1.5;
      const isHighLatency = rtt !== undefined && rtt > 500;

      setIsSlow(isSlowType || isLowBandwidth || isHighLatency || !!saveData);
    };

    checkConnection();

    if (connection) {
      connection.addEventListener('change', checkConnection);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (connection) {
        connection.removeEventListener('change', checkConnection);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isSlow, isOnline };
};

export default useNetworkSpeed;