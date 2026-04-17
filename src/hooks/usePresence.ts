import type { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import type { IconId } from '../lib/icons';
import { supabase } from '../lib/supabase';

const MAX_PLAYERS = 8;

export type PresencePlayer = {
  presenceKey: string;
  nickname: string;
  iconId: IconId;
  value: number;
};

type State =
  | { status: 'joining' }
  | { status: 'full' }
  | { status: 'joined'; players: PresencePlayer[] };

export function usePresence(
  roomId: string,
  self: { nickname: string; iconId: IconId; value: number },
): {
  state: State;
  updateValue: (value: number) => void;
} {
  const [state, setState] = useState<State>({ status: 'joining' });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const selfRef = useRef(self);
  selfRef.current = self;

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channelRef.current = channel;

    const syncPlayers = () => {
      const raw = channel.presenceState<{
        nickname: string;
        iconId: IconId;
        value: number;
      }>();
      const players: PresencePlayer[] = Object.entries(raw).map(([key, metas]) => ({
        presenceKey: key,
        nickname: metas[0].nickname,
        iconId: metas[0].iconId,
        value: metas[0].value,
      }));
      setState({ status: 'joined', players });
    };

    channel.on('presence', { event: 'sync' }, syncPlayers).subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;

      const presenceState = channel.presenceState();
      const currentCount = Object.keys(presenceState).length;
      if (currentCount >= MAX_PLAYERS) {
        setState({ status: 'full' });
        await supabase.removeChannel(channel);
        return;
      }

      await channel.track({
        nickname: selfRef.current.nickname,
        iconId: selfRef.current.iconId,
        value: selfRef.current.value,
      });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const updateValue = (value: number) => {
    channelRef.current?.track({
      nickname: selfRef.current.nickname,
      iconId: selfRef.current.iconId,
      value,
    });
  };

  return { state, updateValue };
}
