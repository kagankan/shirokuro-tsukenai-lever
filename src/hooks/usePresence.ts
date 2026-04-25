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
  // StrictMode: pending channel removal timer
  const channelCleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Trailing throttle: pending broadcast timer
  const broadcastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // React StrictMode causes cleanup+remount immediately.
    // If a cleanup timer is pending, this is a StrictMode remount — cancel the
    // removal and keep the existing channel alive rather than creating a new one,
    // which would trigger a slow TIMED_OUT→TIMED_OUT→SUBSCRIBED cycle.
    console.log('[Presence] effect start, timer pending:', channelCleanupTimerRef.current !== null, 'roomId:', roomId);
    if (channelCleanupTimerRef.current !== null) {
      console.log('[Presence] StrictMode remount detected - reusing channel');
      clearTimeout(channelCleanupTimerRef.current);
      channelCleanupTimerRef.current = null;
      return () => {
        const ch = channelRef.current;
        console.log('[Presence] real unmount cleanup, channel state:', ch?.state);
        if (ch) supabase.removeChannel(ch);
      };
    }

    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: myKey } },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const players = buildPlayers();
        console.log('[Presence] sync, players:', players.map(p => p.nickname));
        setState((prev) =>
          prev.status === 'full' ? prev : { status: 'joined', players },
        );
      })
      .on('broadcast', { event: 'lever_update' }, ({ payload }: { payload: LeverPayload }) => {
        leverValuesRef.current.set(payload.presenceKey, payload.value);
        setState((prev) =>
          prev.status === 'joined' ? { status: 'joined', players: buildPlayers() } : prev,
        );
      })
      .subscribe(async (status) => {
        console.log('[Presence] subscribe status:', status);
        if (status !== 'SUBSCRIBED') return;

        const currentCount = Object.keys(channel.presenceState()).length;
        if (currentCount >= MAX_PLAYERS) {
          setState({ status: 'full' });
          await supabase.removeChannel(channel);
          return;
        }

        const trackResult = await channel.track({
          nickname: selfRef.current.nickname,
          iconId: selfRef.current.iconId,
        });
        console.log('[Presence] track result:', trackResult, 'nickname:', selfRef.current.nickname);
      });

    return () => {
      if (broadcastTimerRef.current !== null) {
        clearTimeout(broadcastTimerRef.current);
        broadcastTimerRef.current = null;
      }
      // Delay removal by one tick so StrictMode's immediate remount can cancel it.
      console.log('[Presence] cleanup: scheduling channel removal with 100ms delay');
      const ch = channel;
      channelCleanupTimerRef.current = setTimeout(() => {
        console.log('[Presence] timer fired: removing channel');
        channelCleanupTimerRef.current = null;
        supabase.removeChannel(ch);
      }, 100);
    };
  }, [roomId]);

  const broadcastLever = (value: number) => {
    leverValuesRef.current.set(myKeyRef.current, value);
    setState((prev) =>
      prev.status === 'joined' ? { status: 'joined', players: buildPlayers() } : prev,
    );

    // Cancel any pending trailing broadcast
    if (broadcastTimerRef.current !== null) {
      clearTimeout(broadcastTimerRef.current);
      broadcastTimerRef.current = null;
    }

    const now = Date.now();
    const elapsed = now - lastBroadcastRef.current;

    if (elapsed >= BROADCAST_THROTTLE_MS) {
      // Enough time since last broadcast: send immediately
      lastBroadcastRef.current = now;
      channelRef.current?.send({
        type: 'broadcast',
        event: 'lever_update',
        payload: { presenceKey: myKeyRef.current, value } satisfies LeverPayload,
      });
    } else {
      // Within throttle window: schedule a trailing broadcast to ensure
      // the final value is always sent even during rapid key presses.
      broadcastTimerRef.current = setTimeout(() => {
        broadcastTimerRef.current = null;
        lastBroadcastRef.current = Date.now();
        const latestValue = leverValuesRef.current.get(myKeyRef.current) ?? 50;
        channelRef.current?.send({
          type: 'broadcast',
          event: 'lever_update',
          payload: { presenceKey: myKeyRef.current, value: latestValue } satisfies LeverPayload,
        });
      }, BROADCAST_THROTTLE_MS - elapsed);
    }
  };

  return { state, broadcastLever };
}
