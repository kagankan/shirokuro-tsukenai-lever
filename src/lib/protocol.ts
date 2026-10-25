/**
 * フロントエンド ⇔ Worker (Durable Object) 間の WebSocket メッセージ定義。
 * クライアントとサーバーの両方から import される。
 */

export const MAX_PLAYERS = 8;
export const MAX_TOPIC_LENGTH = 100;
export const MAX_NICKNAME_LENGTH = 20;

/** WebSocket の keepalive 用。DO 側で自動応答するのでインスタンスを起こさない */
export const PING = 'ping';
export const PONG = 'pong';

export type Player = {
  id: string;
  nickname: string;
  iconId: string;
  value: number;
};

export type ClientMessage =
  /**
   * topic は手元に表示中のお題。ルームに他の参加者がいない（＝サーバーがお題を持っていない）
   * ときだけ採用され、全員の接続が切れた後の再接続でお題を復元するのに使われる
   */
  | { type: 'join'; nickname: string; iconId: string; value: number; topic: string }
  | { type: 'lever'; value: number }
  | { type: 'topic'; topic: string }
  | { type: 'profile'; nickname: string; iconId: string };

export type ServerMessage =
  | { type: 'init'; selfId: string; topic: string; players: Player[] }
  | { type: 'not_found' }
  | { type: 'full' }
  | { type: 'player_joined'; player: Player }
  | { type: 'player_left'; id: string }
  | { type: 'player_updated'; player: Player }
  | { type: 'lever'; id: string; value: number }
  | { type: 'topic'; topic: string };

/** ルーム参加を拒否したときの close code（4000〜4999 はアプリ定義用） */
export const CLOSE_NOT_FOUND = 4004;
export const CLOSE_FULL = 4009;
