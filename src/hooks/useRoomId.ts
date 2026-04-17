import { useCallback, useEffect, useState } from 'react';

function readRoomIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('room');
}

export function useRoomId(): {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
} {
  const [roomId, setRoomIdState] = useState<string | null>(readRoomIdFromUrl);

  useEffect(() => {
    const sync = () => setRoomIdState(readRoomIdFromUrl());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const setRoomId = useCallback((id: string | null) => {
    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set('room', id);
    } else {
      url.searchParams.delete('room');
    }
    window.history.pushState({}, '', url);
    setRoomIdState(id);
  }, []);

  return { roomId, setRoomId };
}
