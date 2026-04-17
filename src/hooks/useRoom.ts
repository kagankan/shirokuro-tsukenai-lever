import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Room = {
  id: string;
  topic: string;
};

type State =
  | { status: 'loading' }
  | { status: 'ok'; room: Room }
  | { status: 'error'; message: string };

export function useRoom(roomId: string): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('rooms')
      .select('id, topic')
      .eq('id', roomId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setState({ status: 'error', message: 'ルームが見つかりません' });
        } else {
          setState({ status: 'ok', room: data });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  return state;
}
