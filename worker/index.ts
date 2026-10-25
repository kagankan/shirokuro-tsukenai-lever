import { DurableObject } from 'cloudflare:workers';
import {
  CLOSE_FULL,
  CLOSE_NOT_FOUND,
  type ClientMessage,
  MAX_NICKNAME_LENGTH,
  MAX_PLAYERS,
  MAX_TOPIC_LENGTH,
  PING,
  type Player,
  PONG,
  type ServerMessage,
} from '../src/lib/protocol';

type Env = {
  ROOM: DurableObjectNamespace<Room>;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function clampValue(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 50;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function normalizeNickname(nickname: unknown): string {
  return String(nickname).slice(0, MAX_NICKNAME_LENGTH);
}

function normalizeIconId(iconId: unknown): string {
  return String(iconId).slice(0, 32);
}

function normalizeTopic(topic: unknown): string {
  return typeof topic === 'string' ? topic.slice(0, MAX_TOPIC_LENGTH) : '';
}

/**
 * 各 WebSocket の attachment に保持するデータ。
 * お題はルーム共通の値だが、ストレージに書かないためにここへ置き、全員分を同じ値で揃える。
 */
type Attachment = {
  player: Player;
  topic: string;
};

/**
 * 1ルーム = 1インスタンスの Durable Object。
 * WebSocket Hibernation API を使い、メッセージが来ていない間はメモリから退避される。
 * 参加者の情報（ニックネーム・アイコン・レバー値）とお題は各 WebSocket の attachment に保持し、
 * ストレージにはルームの存在を示す created フラグだけを置く。
 * そのため全員の接続が切れるとお題は消える（再接続時に join の topic で復元される）。
 */
export class Room extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // ping には DO を起こさずランタイムが自動で pong を返す
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG));
  }

  /** ルーム作成（Worker から RPC で呼ばれる） */
  async create(): Promise<void> {
    await this.ctx.storage.put('created', true);
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    if (typeof raw !== 'string') return;
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    const attachment = ws.deserializeAttachment() as Attachment | null;

    if (msg.type === 'join') {
      if (attachment) return;
      if (!(await this.ctx.storage.get<boolean>('created'))) {
        this.send(ws, { type: 'not_found' });
        ws.close(CLOSE_NOT_FOUND, 'not_found');
        return;
      }
      const others = this.attachments(ws);
      if (others.length >= MAX_PLAYERS) {
        this.send(ws, { type: 'full' });
        ws.close(CLOSE_FULL, 'full');
        return;
      }
      const player: Player = {
        id: crypto.randomUUID(),
        nickname: normalizeNickname(msg.nickname),
        iconId: normalizeIconId(msg.iconId),
        value: clampValue(msg.value),
      };
      // 他の参加者がいればその値が正。誰もいなければ、参加者が手元に持っている値で復元する
      const topic = others[0]?.topic ?? normalizeTopic(msg.topic);
      ws.serializeAttachment({ player, topic } satisfies Attachment);
      this.send(ws, {
        type: 'init',
        selfId: player.id,
        topic,
        players: [...others.map((a) => a.player), player],
      });
      this.broadcast({ type: 'player_joined', player }, ws);
      return;
    }

    // join 前のメッセージは無視
    if (!attachment) return;
    const self = attachment.player;

    if (msg.type === 'lever') {
      self.value = clampValue(msg.value);
      ws.serializeAttachment(attachment);
      this.broadcast({ type: 'lever', id: self.id, value: self.value }, ws);
      return;
    }

    if (msg.type === 'profile') {
      self.nickname = normalizeNickname(msg.nickname);
      self.iconId = normalizeIconId(msg.iconId);
      ws.serializeAttachment(attachment);
      this.broadcast({ type: 'player_updated', player: self }, ws);
      return;
    }

    if (msg.type === 'topic') {
      const topic = normalizeTopic(msg.topic);
      for (const s of this.ctx.getWebSockets()) {
        const a = s.deserializeAttachment() as Attachment | null;
        if (a) s.serializeAttachment({ ...a, topic } satisfies Attachment);
      }
      this.broadcast({ type: 'topic', topic }, ws);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    this.handleLeave(ws);
    try {
      ws.close(code, reason);
    } catch {
      // 既に閉じている
    }
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    this.handleLeave(ws);
  }

  private handleLeave(ws: WebSocket): void {
    const attachment = ws.deserializeAttachment() as Attachment | null;
    if (!attachment) return;
    // 二重に通知しないよう attachment を消す
    ws.serializeAttachment(null);
    this.broadcast({ type: 'player_left', id: attachment.player.id }, ws);
  }

  /** 参加済み（join 済み）の接続の attachment 一覧 */
  private attachments(exclude?: WebSocket): Attachment[] {
    const result: Attachment[] = [];
    for (const s of this.ctx.getWebSockets()) {
      if (s === exclude) continue;
      const a = s.deserializeAttachment() as Attachment | null;
      if (a) result.push(a);
    }
    return result;
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      // 切断済みのソケットは close ハンドラで処理される
    }
  }

  private broadcast(msg: ServerMessage, exclude?: WebSocket): void {
    const data = JSON.stringify(msg);
    for (const s of this.ctx.getWebSockets()) {
      if (s === exclude || !s.deserializeAttachment()) continue;
      try {
        s.send(data);
      } catch {
        // 同上
      }
    }
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === '/api/health') {
      return json({ ok: true });
    }

    // POST /api/rooms → ルーム作成
    if (url.pathname === '/api/rooms' && request.method === 'POST') {
      const id = crypto.randomUUID();
      await env.ROOM.getByName(id).create();
      return json({ id }, 201);
    }

    // GET /api/rooms/:id/ws → WebSocket 接続
    const match = url.pathname.match(/^\/api\/rooms\/([^/]+)\/ws$/);
    if (match && request.method === 'GET') {
      const id = match[1];
      if (!UUID_RE.test(id)) return json({ error: 'invalid room id' }, 400);
      return env.ROOM.getByName(id).fetch(request);
    }

    return json({ error: 'not found' }, 404);
  },
} satisfies ExportedHandler<Env>;
