import { useState } from 'react';
import { useRoomId } from './hooks/useRoomId';
import type { PlayerInfo } from './lib/types';
import { JoinPage } from './pages/JoinPage';
import { PreviewPage } from './pages/PreviewPage';
import { RoomPage } from './pages/RoomPage';
import { TopPage } from './pages/TopPage';

const isPreviewMode = new URLSearchParams(window.location.search).has('preview');

function App() {
  const { roomId, setRoomId } = useRoomId();
  const [player, setPlayer] = useState<PlayerInfo | null>(null);

  // ?preview を付けると Supabase 抜きで UI だけ表示する
  if (isPreviewMode) {
    return <PreviewPage />;
  }

  if (!roomId) {
    return <TopPage onCreated={setRoomId} />;
  }

  if (!player) {
    return <JoinPage onJoin={setPlayer} />;
  }

  return <RoomPage roomId={roomId} player={player} />;
}

export default App;
