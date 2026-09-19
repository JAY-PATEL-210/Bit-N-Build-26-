// Owner: Member B (Frontend Systems / Interaction & Demo)
import { useEffect, useState } from 'react';

export function useRealtime(channel: string, onMessage?: (data: any) => void) {
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    const socket = new WebSocket(`${wsUrl}/${channel}`);

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    return () => {
      socket.close();
    };
  }, [channel, onMessage]);

  return { connected };
}
