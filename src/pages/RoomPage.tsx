import { useState } from 'react';
import { css } from '../../styled-system/css';
import { Lever } from '../components/Lever';
import { LeverIcon } from '../components/LeverIcon';
import type { PlayerSlot } from '../components/ResultMap';
import { ResultMap } from '../components/ResultMap';
import { TopicEditor } from '../components/TopicEditor';
import { usePresence } from '../hooks/usePresence';
import { useRoom } from '../hooks/useRoom';
import type { PlayerInfo } from '../lib/types';

type Props = {
  roomId: string;
  player: PlayerInfo;
};

const pageClass = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
});

const topicSectionClass = css({
  paddingY: '3.5',
  paddingX: '5',
  flexShrink: 0,
  background: 'surface',
  borderBottom: '1px solid token(colors.border)',
  display: 'flex',
  alignItems: 'center',
  gap: '3',
});

const topicIconClass = css({
  flexShrink: 0,
  color: 'accent',
});

const mapSectionClass = css({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingY: '3',
  paddingX: '4',
});

const leverSectionClass = css({
  flexShrink: 0,
  borderTop: '1px solid token(colors.border)',
  background: 'surface',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const stateMessageClass = css({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4',
  color: 'textMuted',
});

export function RoomPage({ roomId, player }: Props) {
  const roomState = useRoom(roomId);
  const [leverValue, setLeverValue] = useState(50);

  const { state: presenceState, broadcastLever } = usePresence(roomId, {
    nickname: player.nickname,
    iconId: player.iconId,
    value: leverValue,
  });

  const handleLeverChange = (value: number) => {
    setLeverValue(value);
    broadcastLever(value);
  };

  if (roomState.status === 'loading') {
    return <div className={stateMessageClass}>読み込み中…</div>;
  }

  if (roomState.status === 'error') {
    return <div className={stateMessageClass}>{roomState.message}</div>;
  }

  if (presenceState.status === 'full') {
    return <div className={stateMessageClass}>このルームは満員です（最大8名）</div>;
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
    <div className={pageClass}>
      <section className={topicSectionClass}>
        <LeverIcon className={topicIconClass} size={40} />
        <TopicEditor roomId={roomId} initialTopic={roomState.room.topic} />
      </section>
      <section className={mapSectionClass}>
        <ResultMap players={players} />
      </section>
      <section className={leverSectionClass}>
        <Lever value={leverValue} onChange={handleLeverChange} />
      </section>
    </div>
  );
}
