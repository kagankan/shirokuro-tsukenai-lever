import { useState } from 'react';
import { useRoomId } from './hooks/useRoomId';
import type { PlayerInfo } from './lib/types';
import { JoinPage } from './pages/JoinPage';
import { RoomPage } from './pages/RoomPage';
import { TopPage } from './pages/TopPage';

function App() {
  const { roomId, setRoomId } = useRoomId();
  const [player, setPlayer] = useState<PlayerInfo | null>(null);

  if (!roomId) {
    return <TopPage onCreated={setRoomId} />;
  }

  if (!player) {
    return <JoinPage onJoin={setPlayer} />;
  }

  return <RoomPage roomId={roomId} player={player} />;
}

export default App;
