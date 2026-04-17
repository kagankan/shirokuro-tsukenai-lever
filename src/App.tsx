import { useRoomId } from './hooks/useRoomId';
import { RoomPage } from './pages/RoomPage';
import { TopPage } from './pages/TopPage';

function App() {
  const { roomId, setRoomId } = useRoomId();
  return roomId ? <RoomPage roomId={roomId} /> : <TopPage onCreated={setRoomId} />;
}

export default App;
