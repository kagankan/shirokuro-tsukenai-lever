# アーキテクチャ

## システム構成

```
+-------------------+          +-------------------------------+
|   GitHub Pages    |          |      Cloudflare Workers       |
|                   |   HTTP   |                               |
|  React SPA        | -------> |  Worker (ルーティング)         |
|  (静的ホスティング) |          |     |                         |
|                   | WebSocket|     v                         |
|                   | <------> |  Durable Object "Room"        |
|                   |          |  (1ルーム = 1インスタンス)      |
|                   |          |  - WebSocket 中継             |
|                   |          |  - SQLite ストレージ (お題)    |
+-------------------+          +-------------------------------+
```

参加者のブラウザは、ルームごとの Durable Object と WebSocket で接続する。
Durable Object はルーム内の全接続を1か所で保持し、メッセージを他の参加者へ中継する。
お題は Durable Object の SQLite ストレージに永続化する。

## API（Worker）

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/rooms` | ルームを作成し `{ id }` を返す |
| GET (WebSocket) | `/api/rooms/{id}/ws` | ルームに WebSocket で接続する |
| GET | `/api/health` | ヘルスチェック（E2E テストの起動待ちに使用） |

ルームIDは UUID v4。`env.ROOM.getByName(id)` で ID ごとに一意な Durable Object インスタンスを得る。
作成されていない ID への接続は `not_found` を返して切断する。

## WebSocket プロトコル

定義は `src/lib/protocol.ts`（フロントエンドと Worker で共有）。

### クライアント → サーバー

| type | ペイロード | 説明 |
|------|-----------|------|
| `join` | `nickname, iconId, value` | 接続直後に送る。参加者として登録される |
| `lever` | `value` | レバー値の変更（50ms で throttle） |
| `topic` | `topic` | お題の変更（入力欄の blur 時。Last Write Wins） |

### サーバー → クライアント

| type | ペイロード | 説明 |
|------|-----------|------|
| `init` | `selfId, topic, players` | 参加成功。現在のお題と全参加者（レバー値含む） |
| `not_found` / `full` | - | ルームが存在しない / 満員（8人）。直後に close |
| `player_joined` | `player` | 他の参加者が入室 |
| `player_left` | `id` | 他の参加者が退室 |
| `lever` | `id, value` | 他の参加者のレバー値変更 |
| `topic` | `topic` | 他の参加者によるお題変更 |

サーバーは送信者自身にはエコーしない。

### keepalive・再接続

- クライアントは 30 秒ごとに `ping` を送り、Durable Object はランタイムの自動応答（`setWebSocketAutoResponse`）で `pong` を返す。自動応答は Durable Object を起こさない
- 切断時は指数バックオフ（最大10秒）で再接続し、現在のレバー値で `join` し直す

## Durable Object "Room" の設計

- **WebSocket Hibernation API** を使う（`ctx.acceptWebSocket`）。メッセージが無い間はインスタンスがメモリから退避され、課金対象の実行時間が発生しない
- **参加者情報**（ニックネーム・アイコン・レバー値）は各 WebSocket の attachment（`serializeAttachment`）に保持する。ハイバネーションから復帰しても失われず、後から入室した参加者にも `init` で最新のレバー値を渡せる
- **お題**は SQLite ストレージ（`ctx.storage`）に保存する
- **ルームの削除は行わない**: 1ルームあたりの保存データは `created` フラグとお題（最大100文字）だけで、数百バイト程度。無料枠のストレージ上限に対して十分小さいため、削除処理は設けていない

### 使わないルームを削除したくなった場合

Durable Object の **Alarm**（インスタンスごとに1つ設定できるタイマー。指定時刻になると `alarm()` メソッドが呼ばれる）を使う。
`worker/index.ts` の `Room` クラスに以下を追加する。

```ts
/** 最後の参加者が抜けてからこの期間だれも来なければルームを削除する */
const ROOM_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// create() の最後: 一度も使われないルームも消えるようにする
await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL_MS);

// webSocketMessage() の join 成功時: 使われているので削除予約を取り消す
await this.ctx.storage.deleteAlarm();

// handleLeave() の最後（async にする）: 最後の1人が抜けたら削除を予約する
const remaining = this.ctx.getWebSockets().filter((s) => s !== ws);
if (remaining.length === 0 && (await this.ctx.storage.get<boolean>('created'))) {
  await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL_MS);
}

// 指定時刻に呼ばれる。だれも接続していなければストレージを全削除する
async alarm(): Promise<void> {
  if (this.ctx.getWebSockets().length > 0) return;
  await this.ctx.storage.deleteAll();
}
```

`created` フラグも消えるため、削除後にそのルームURLへアクセスすると「ルームが見つかりません」になる。

## 画面構成

### トップページ (`/`)

- アプリ名の表示
- 「ルームを作成」ボタン → ルーム作成後、ルーム画面に遷移

### 参加画面 (`/?room={id}` 初回アクセス時)

- ニックネーム入力
- アイコン選択（プリセットから）
- 「参加する」ボタン → ルーム画面に遷移

### ルーム画面 (`/?room={id}`)

スマホ縦長レイアウトを基本とする。

```
+----------------------------------+
|  お題: ○○○は○○○である   [編集] |
+----------------------------------+
|                                  |
|          結果マップ               |
|        ╭───────────╮             |
|      ╱       50      ╲          |
|    ╱    B         ╲    ╲        |
|   A                     C       |
|  0                        100   |
|                                  |
+----------------------------------+
|                                  |
|         自分のレバー              |
|            50                    |
|             |                    |
|             ○                    |
|        ┗━━━━━━━┛                |
|                                  |
+----------------------------------+
```

- **上部**: お題の表示・編集エリア
- **中央（結果マップ）**: アーチ状のスケール上に全員のアイコン・ニックネーム・数値を配置。値(0〜100)に応じてアーチ上の位置が決まる
- **下部（自分のレバー）**: 自分が操作するレバーUI。円弧軌道でドラッグ/タッチ操作

ルーティングライブラリは使用しない。画面はトップとルームの2つだけであり、query paramの有無で分岐すれば十分なため。GitHub Pagesでもルートパスへのリクエストとなるため問題なく動作する。

## レバーUIの実装方針

物理レバーを横から見たイメージを再現する。

- 支点を下部中央に固定
- レバーは支点を中心に円弧を描いて左右に倒れる
- 左端（0）〜垂直（50）〜右端（100）
- ドラッグ/タッチ操作で角度を変更する
