import { useState } from 'react';
import { css } from '../../styled-system/css';
import type { PlayerSlot } from '../components/ResultMap';
import { RoomLayout } from '../components/RoomLayout';
import { usePresence } from '../hooks/usePresence';
import { useRoom } from '../hooks/useRoom';
import { useTopicSync } from '../hooks/useTopicSync';
import type { PlayerInfo } from '../lib/types';

type Props = {
  roomId: string;
  player: PlayerInfo;
};

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

  if (roomState.status === 'loading') {
    return <div className={stateMessageClass}>読み込み中…</div>;
  }

  if (roomState.status === 'error') {
    return <div className={stateMessageClass}>{roomState.message}</div>;
  }

  return <RoomBody roomId={roomId} initialTopic={roomState.room.topic} player={player} />;
}

type RoomBodyProps = {
  roomId: string;
  initialTopic: string;
  player: PlayerInfo;
};

function RoomBody({ roomId, initialTopic, player }: RoomBodyProps) {
  const [leverValue, setLeverValue] = useState(50);
  const { state: presenceState, broadcastLever } = usePresence(roomId, {
    nickname: player.nickname,
    iconId: player.iconId,
    value: leverValue,
  });
  const { topic, setTopic, inputRef, handleBlur } = useTopicSync(roomId, initialTopic);

  if (presenceState.status === 'full') {
    return <div className={stateMessageClass}>このルームは満員です（最大8名）</div>;
  }

  const handleLeverChange = (value: number) => {
    setLeverValue(value);
    broadcastLever(value);
  };

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
    <RoomLayout
      topic={{ value: topic, onChange: setTopic, onBlur: handleBlur, inputRef }}
      players={players}
      lever={{ value: leverValue, onChange: handleLeverChange }}
    />
  );
}
