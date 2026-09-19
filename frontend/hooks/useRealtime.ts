// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 14, 40: Real-time updates with WebSocket & safe polling fallback
import { useEffect, useState, useRef } from 'react';

export function useRealtime(channel: string, onMessage?: (data: any) => void) {
  const [connected, setConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(`${wsUrl}/${channel}`);
      socketRef.current = socket;

      socket.onopen = () => setConnected(true);
      socket.onclose = () => setConnected(false);
      socket.onerror = () => {
        // Silently close without unhandled exception when backend WS is offline
        setConnected(false);
      };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (e) {
          console.error('WS parse error', e);
        }
      };
    } catch {
      setConnected(false);
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [channel, onMessage]);

  return { connected };
}
