import { useRoomId } from './hooks/useRoomId';
import { RoomPage } from './pages/RoomPage';
import { TopPage } from './pages/TopPage';

function App() {
  const { roomId } = useRoomId();
  return roomId ? <RoomPage roomId={roomId} /> : <TopPage />;
}

export default App;
