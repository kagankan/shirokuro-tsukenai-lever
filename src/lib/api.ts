const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error('環境変数 VITE_API_URL が未設定です。.env に Worker の URL を設定してください。');
}

/** ルームを作成して ID を返す */
export async function createRoom(): Promise<string> {
  const res = await fetch(`${apiUrl}/api/rooms`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to create room: ${res.status}`);
  const { id } = (await res.json()) as { id: string };
  return id;
}

export function roomSocketUrl(roomId: string): string {
  const url = new URL(`/api/rooms/${encodeURIComponent(roomId)}/ws`, apiUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}
