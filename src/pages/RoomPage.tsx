import { useState } from 'react';
import { css } from '../../styled-system/css';
import type { PlayerSlot } from '../components/ResultMap';
import { RoomLayout } from '../components/RoomLayout';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { useTopicSync } from '../hooks/useTopicSync';
import { DEFAULT_ICON, ICON_PRESETS, type IconId } from '../lib/icons';
import type { PlayerInfo } from '../lib/types';

type Props = {
  roomId: string;
  player: PlayerInfo;
  onPlayerChange: (player: PlayerInfo) => void;
};

const stateMessageClass = css({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4',
  color: 'textMuted',
});

function toIconId(id: string): IconId {
  return ICON_PRESETS.some((icon) => icon.id === id) ? (id as IconId) : DEFAULT_ICON;
}

export function RoomPage({ roomId, player, onPlayerChange }: Props) {
  const [leverValue, setLeverValue] = useState(50);
  const { state, sendLever, sendTopic, sendProfile } = useRoomSocket(roomId, {
    nickname: player.nickname,
    iconId: player.iconId,
    value: leverValue,
  });

  if (state.status === 'connecting') {
    return <div className={stateMessageClass}>読み込み中…</div>;
  }

  if (state.status === 'not_found') {
    return <div className={stateMessageClass}>ルームが見つかりません</div>;
  }

  if (state.status === 'full') {
    return <div className={stateMessageClass}>このルームは満員です（最大8名）</div>;
  }

  const handleLeverChange = (value: number) => {
    setLeverValue(value);
    sendLever(value);
  };

  const handleProfileChange = (next: PlayerInfo) => {
    // App の state も更新し、再接続時の join で新しい値が使われるようにする
    onPlayerChange(next);
    sendProfile(next);
  };

  // 自分の値はサーバーを経由せずローカルの値を使う（操作の遅延を避けるため）
  const players: PlayerSlot[] = state.players.map((p) => ({
    id: p.id,
    nickname: p.nickname,
    iconId: toIconId(p.iconId),
    value: p.id === state.selfId ? leverValue : p.value,
  }));

  return (
    <RoomBody
      remoteTopic={state.topic}
      sendTopic={sendTopic}
      players={players}
      leverValue={leverValue}
      onLeverChange={handleLeverChange}
      player={player}
      onProfileChange={handleProfileChange}
    />
  );
}

type RoomBodyProps = {
  remoteTopic: string;
  sendTopic: (topic: string) => void;
  players: PlayerSlot[];
  leverValue: number;
  onLeverChange: (value: number) => void;
  player: PlayerInfo;
  onProfileChange: (player: PlayerInfo) => void;
};

function RoomBody({
  remoteTopic,
  sendTopic,
  players,
  leverValue,
  onLeverChange,
  player,
  onProfileChange,
}: RoomBodyProps) {
  const { topic, setTopic, inputRef, handleBlur } = useTopicSync(remoteTopic, sendTopic);

  return (
    <RoomLayout
      topic={{ value: topic, onChange: setTopic, onBlur: handleBlur, inputRef }}
      players={players}
      lever={{ value: leverValue, onChange: onLeverChange }}
      profile={{ player, onChange: onProfileChange }}
    />
  );
}
