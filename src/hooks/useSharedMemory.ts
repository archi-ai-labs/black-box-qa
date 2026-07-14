import { useState, useEffect } from 'react';

export function useSharedMemory() {
  const [sharedMemory, setSharedMemory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const memRes = await fetch('/api/shared-memory');
        const memJson = await memRes.json();
        setSharedMemory(memJson.content || '');
      } catch (error) {
        console.error("Error fetching shared memory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemory();
  }, []);

  return { sharedMemory, loading };
}
