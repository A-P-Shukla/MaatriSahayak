import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: 'emergency_update' | 'ambulance_location' | 'pregnancy_update' | 'stats_update' | 'new_registration';
  data: any;
}

interface UseWebSocketOptions {
  enabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    enabled = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // WebSocket URL from environment or default
      const wsUrl = import.meta.env.VITE_WS_URL || 'wss://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev';

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Send authentication token
        const token = localStorage.getItem('access_token');
        if (token) {
          ws.send(JSON.stringify({ action: 'authenticate', token }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Invalidate relevant queries based on message type
          switch (message.type) {
            case 'emergency_update':
              queryClient.invalidateQueries({ queryKey: ['emergencies'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
              break;
            case 'ambulance_location':
              queryClient.invalidateQueries({ queryKey: ['ambulances'] });
              break;
            case 'pregnancy_update':
              queryClient.invalidateQueries({ queryKey: ['pregnancies'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
              break;
            case 'stats_update':
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
              break;
            case 'new_registration':
              // Invalidate queries to refresh pending counts
              queryClient.invalidateQueries({ queryKey: ['drivers'] });
              queryClient.invalidateQueries({ queryKey: ['asha-workers'] });
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [enabled, reconnectInterval, maxReconnectAttempts, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
};
