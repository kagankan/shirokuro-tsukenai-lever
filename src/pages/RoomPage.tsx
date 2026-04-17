import { useState } from 'react';
import { Lever } from '../components/Lever';
import type { PlayerSlot } from '../components/ResultMap';
import { ResultMap } from '../components/ResultMap';
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
  const [leverValue, setLeverValue] = useState(50);

  if (roomState.status === 'loading') {
    return <div className="room-page room-page--loading">読み込み中…</div>;
  }

  if (roomState.status === 'error') {
    return <div className="room-page room-page--error">{roomState.message}</div>;
  }

  const mySlot: PlayerSlot = {
    id: 'me',
    nickname: player.nickname,
    iconId: player.iconId,
    value: leverValue,
  };

  return (
    <div className="room-page">
      <section className="room-page__topic">
        <TopicEditor roomId={roomId} initialTopic={roomState.room.topic} />
      </section>
      <section className="room-page__map">
        <ResultMap players={[mySlot]} />
      </section>
      <section className="room-page__lever">
        <Lever value={leverValue} onChange={setLeverValue} />
      </section>
    </div>
  );
}
