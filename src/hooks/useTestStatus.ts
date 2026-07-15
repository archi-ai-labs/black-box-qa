import { useState, useEffect } from 'react';
import { StatusData } from '../lib/types';
import { REFRESH_INTERVAL } from '../lib/constants';

export function useTestStatus(selectedProjectId: string) {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedProjectId) {
      setData(null);
      return;
    }

    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const statusRes = await fetch(`/api/status?projectId=${selectedProjectId}`);
        if (!statusRes.ok) throw new Error('Failed to fetch status');
        const statusJson = await statusRes.json();
        if (isMounted) setData(statusJson);
      } catch (error) {
        // Use console.warn instead of console.error to prevent Next.js dev overlay 
        // from popping up repeatedly if the server is restarting or unreachable.
        console.warn("Dashboard polling paused (server unreachable)");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedProjectId]);

  return { data, loading };
}
