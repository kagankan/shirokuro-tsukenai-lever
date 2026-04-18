import type { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import type { IconId } from '../lib/icons';
import { supabase } from '../lib/supabase';

const MAX_PLAYERS = 8;
const BROADCAST_THROTTLE_MS = 50;

export type PresencePlayer = {
  presenceKey: string;
  nickname: string;
  iconId: IconId;
  value: number;
};

type LeverPayload = { presenceKey: string; value: number };

type State =
  | { status: 'joining' }
  | { status: 'full' }
  | { status: 'joined'; players: PresencePlayer[] };

export function usePresence(
  roomId: string,
  self: { nickname: string; iconId: IconId; value: number },
): {
  state: State;
  broadcastLever: (value: number) => void;
} {
  const [state, setState] = useState<State>({ status: 'joining' });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const selfRef = useRef(self);
  selfRef.current = self;
  const myKeyRef = useRef<string>(crypto.randomUUID());
  const leverValuesRef = useRef<Map<string, number>>(new Map());
  const lastBroadcastRef = useRef<number>(0);

  const buildPlayers = (): PresencePlayer[] => {
    const channel = channelRef.current;
    if (!channel) return [];
    const raw = channel.presenceState<{ nickname: string; iconId: IconId }>();
    return Object.entries(raw).map(([key, metas]) => ({
      presenceKey: key,
      nickname: metas[0].nickname,
      iconId: metas[0].iconId,
      value: leverValuesRef.current.get(key) ?? 50,
    }));
  };

  useEffect(() => {
    const myKey = myKeyRef.current;
    leverValuesRef.current.set(myKey, selfRef.current.value);

    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: myKey } },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        setState((prev) =>
          prev.status === 'full' ? prev : { status: 'joined', players: buildPlayers() },
        );
      })
      .on('broadcast', { event: 'lever_update' }, ({ payload }: { payload: LeverPayload }) => {
        leverValuesRef.current.set(payload.presenceKey, payload.value);
        setState((prev) =>
          prev.status === 'joined' ? { status: 'joined', players: buildPlayers() } : prev,
        );
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        const currentCount = Object.keys(channel.presenceState()).length;
        if (currentCount >= MAX_PLAYERS) {
          setState({ status: 'full' });
          await supabase.removeChannel(channel);
          return;
        }

        await channel.track({
          nickname: selfRef.current.nickname,
          iconId: selfRef.current.iconId,
        });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const broadcastLever = (value: number) => {
    leverValuesRef.current.set(myKeyRef.current, value);
    setState((prev) =>
      prev.status === 'joined' ? { status: 'joined', players: buildPlayers() } : prev,
    );

    const now = Date.now();
    if (now - lastBroadcastRef.current < BROADCAST_THROTTLE_MS) return;
    lastBroadcastRef.current = now;
    channelRef.current?.send({
      type: 'broadcast',
      event: 'lever_update',
      payload: { presenceKey: myKeyRef.current, value } satisfies LeverPayload,
    });
  };

  return { state, broadcastLever };
}
