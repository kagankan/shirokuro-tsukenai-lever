import { useCallback, useEffect, useRef, useState } from 'react';
import { roomSocketUrl } from '../lib/api';
import {
  CLOSE_FULL,
  CLOSE_NOT_FOUND,
  type ClientMessage,
  PING,
  type Player,
  PONG,
  type ServerMessage,
} from '../lib/protocol';

const LEVER_THROTTLE_MS = 50;
const PING_INTERVAL_MS = 30_000;
const MAX_RECONNECT_DELAY_MS = 10_000;

export type RoomState =
  | { status: 'connecting' }
  | { status: 'not_found' }
  | { status: 'full' }
  | { status: 'joined'; selfId: string; players: Player[]; topic: string };

function reduce(prev: RoomState, msg: ServerMessage): RoomState {
  switch (msg.type) {
    case 'init':
      return { status: 'joined', selfId: msg.selfId, players: msg.players, topic: msg.topic };
    case 'not_found':
    case 'full':
      return { status: msg.type };
  }
  if (prev.status !== 'joined') return prev;
  switch (msg.type) {
    case 'player_joined':
      return {
        ...prev,
        players: [...prev.players.filter((p) => p.id !== msg.player.id), msg.player],
      };
    case 'player_updated':
      // 並び順（＝結果マップ上の重なり順）を変えないよう、その場で置き換える
      return {
        ...prev,
        players: prev.players.map((p) => (p.id === msg.player.id ? msg.player : p)),
      };
    case 'player_left':
      return { ...prev, players: prev.players.filter((p) => p.id !== msg.id) };
    case 'lever':
      return {
        ...prev,
        players: prev.players.map((p) => (p.id === msg.id ? { ...p, value: msg.value } : p)),
      };
    case 'topic':
      return { ...prev, topic: msg.topic };
  }
}

/**
 * ルームの Durable Object と WebSocket で接続し、参加者・レバー値・お題を同期する hook。
 * 切断時は指数バックオフで再接続し、その際は現在のレバー値で参加し直す。
 */
export function useRoomSocket(
  roomId: string,
  self: { nickname: string; iconId: string; value: number },
): {
  state: RoomState;
  sendLever: (value: number) => void;
  sendTopic: (topic: string) => void;
  sendProfile: (profile: { nickname: string; iconId: string }) => void;
} {
  const [state, setState] = useState<RoomState>({ status: 'connecting' });
  const wsRef = useRef<WebSocket | null>(null);
  const selfRef = useRef(self);
  selfRef.current = self;
  const lastLeverSentRef = useRef(0);
  const leverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  }, []);

  useEffect(() => {
    let disposed = false;
    let retry = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;

    const connect = () => {
      const ws = new WebSocket(roomSocketUrl(roomId));
      wsRef.current = ws;

      ws.onopen = () => {
        retry = 0;
        const { nickname, iconId, value } = selfRef.current;
        ws.send(JSON.stringify({ type: 'join', nickname, iconId, value } satisfies ClientMessage));
        pingTimer = setInterval(() => ws.send(PING), PING_INTERVAL_MS);
      };

      ws.onmessage = (e: MessageEvent<string>) => {
        if (e.data === PONG) return;
        const msg = JSON.parse(e.data) as ServerMessage;
        setState((prev) => reduce(prev, msg));
      };

      ws.onclose = (e) => {
        clearInterval(pingTimer);
        if (wsRef.current === ws) wsRef.current = null;
        if (disposed || e.code === CLOSE_NOT_FOUND || e.code === CLOSE_FULL) return;
        // 再接続中も直前の表示を保つ（init 受信時に置き換わる）
        const delay = Math.min(1000 * 2 ** retry, MAX_RECONNECT_DELAY_MS);
        retry++;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      clearInterval(pingTimer);
      if (leverTimerRef.current !== null) {
        clearTimeout(leverTimerRef.current);
        leverTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const sendLever = useCallback(
    (value: number) => {
      if (leverTimerRef.current !== null) {
        clearTimeout(leverTimerRef.current);
        leverTimerRef.current = null;
      }

      const elapsed = Date.now() - lastLeverSentRef.current;
      if (elapsed >= LEVER_THROTTLE_MS) {
        lastLeverSentRef.current = Date.now();
        send({ type: 'lever', value });
      } else {
        // throttle 中でも最終値は必ず送るよう、末尾で送信を予約する
        leverTimerRef.current = setTimeout(() => {
          leverTimerRef.current = null;
          lastLeverSentRef.current = Date.now();
          send({ type: 'lever', value: selfRef.current.value });
        }, LEVER_THROTTLE_MS - elapsed);
      }
    },
    [send],
  );

  const sendTopic = useCallback(
    (topic: string) => {
      send({ type: 'topic', topic });
      // サーバーは送信者にエコーしないので、手元の state も更新しておく
      setState((prev) => reduce(prev, { type: 'topic', topic }));
    },
    [send],
  );

  const sendProfile = useCallback(
    ({ nickname, iconId }: { nickname: string; iconId: string }) => {
      send({ type: 'profile', nickname, iconId });
      // サーバーはエコーしないので、手元の state も更新しておく。
      // 切断中に変更しても、再接続時の join は selfRef（＝新しい値）で行われる
      setState((prev) => {
        if (prev.status !== 'joined') return prev;
        return {
          ...prev,
          players: prev.players.map((p) => (p.id === prev.selfId ? { ...p, nickname, iconId } : p)),
        };
      });
    },
    [send],
  );

  return { state, sendLever, sendTopic, sendProfile };
}
