import { useEffect, useRef, useState, useCallback } from 'react';

export interface CPUMetrics {
  device_id: number;
  cpu_usage: number;
  memory_usage: number;
  load_average_1m: number;
  load_average_5m: number;
  load_average_15m: number;
  network_in: number;
  network_out: number;
  disk_usage: number;
  timestamp: string;
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<CPUMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      console.log('Attempting to connect to WebSocket:', url);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('WebSocket connected successfully');
        // Don't send initial message - let backend send confirmation first
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          if (data.device_id) {
            setMetrics(data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        console.error('WebSocket URL:', url);
        console.error('WebSocket readyState:', ws.readyState);
        setError('WebSocket connection error - ensure backend is running on port 8000');
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        console.log('WebSocket disconnected:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };
    } catch (err) {
      setError('Failed to create WebSocket connection - ensure backend is running');
      console.error('WebSocket connection error:', err);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { isConnected, metrics, error };
}
