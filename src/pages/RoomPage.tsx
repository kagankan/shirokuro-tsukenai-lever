import { TopicEditor } from '../components/TopicEditor';
import { useRoom } from '../hooks/useRoom';
import type { PlayerInfo } from '../lib/types';
import './RoomPage.css';

type Props = {
  roomId: string;
  player: PlayerInfo;
};

export function RoomPage({ roomId, player }: Props) {
  const roomState = useRoom(roomId);

  if (roomState.status === 'loading') {
    return <div className="room-page room-page--loading">読み込み中…</div>;
  }

  if (roomState.status === 'error') {
    return <div className="room-page room-page--error">{roomState.message}</div>;
  }

  return (
    <div className="room-page">
      <section className="room-page__topic">
        <TopicEditor roomId={roomId} initialTopic={roomState.room.topic} />
      </section>
      <section className="room-page__map">
        <p>結果マップ（Task 9 で実装）</p>
      </section>
      <section className="room-page__lever">
        <p>レバー（Task 8 で実装）／ {player.nickname}</p>
      </section>
    </div>
  );
}
