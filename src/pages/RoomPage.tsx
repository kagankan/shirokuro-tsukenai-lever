import { useState } from 'react';
import { Lever } from '../components/Lever';
import type { PlayerSlot } from '../components/ResultMap';
import { ResultMap } from '../components/ResultMap';
import { TopicEditor } from '../components/TopicEditor';
import { usePresence } from '../hooks/usePresence';
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

  const { state: presenceState, updateValue } = usePresence(roomId, {
    nickname: player.nickname,
    iconId: player.iconId,
    value: leverValue,
  });

  const handleLeverChange = (value: number) => {
    setLeverValue(value);
    updateValue(value);
  };

  if (roomState.status === 'loading') {
    return <div className="room-page room-page--loading">読み込み中…</div>;
  }

  if (roomState.status === 'error') {
    return <div className="room-page room-page--error">{roomState.message}</div>;
  }

  if (presenceState.status === 'full') {
    return <div className="room-page room-page--error">このルームは満員です（最大8名）</div>;
  }

  const players: PlayerSlot[] =
    presenceState.status === 'joined'
      ? presenceState.players.map((p) => ({
          id: p.presenceKey,
          nickname: p.nickname,
          iconId: p.iconId,
          value: p.value,
        }))
      : [{ id: 'me', nickname: player.nickname, iconId: player.iconId, value: leverValue }];

  return (
    <div className="room-page">
      <section className="room-page__topic">
        <TopicEditor roomId={roomId} initialTopic={roomState.room.topic} />
      </section>
      <section className="room-page__map">
        <ResultMap players={players} />
      </section>
      <section className="room-page__lever">
        <Lever value={leverValue} onChange={handleLeverChange} />
      </section>
    </div>
  );
}
