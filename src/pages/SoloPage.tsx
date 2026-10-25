import { useState } from 'react';
import { AboutButton } from '../components/AboutButton';
import { CreateRoomButton } from '../components/CreateRoomButton';
import { RoomLayout } from '../components/RoomLayout';
import { DEFAULT_ICON } from '../lib/icons';

type Props = {
  onRoomCreated: (roomId: string) => void;
};

/**
 * 最初に表示される1人用（オフライン）のレバー画面。サーバーには接続しない。
 */
export function SoloPage({ onRoomCreated }: Props) {
  const [topic, setTopic] = useState('');
  const [value, setValue] = useState(50);

  return (
    <RoomLayout
      header={
        <>
          <AboutButton />
          <CreateRoomButton onCreated={onRoomCreated} />
        </>
      }
      topic={{ value: topic, onChange: setTopic }}
      players={[{ id: 'me', nickname: 'あなた', iconId: DEFAULT_ICON, value }]}
      lever={{ value, onChange: setValue }}
    />
  );
}
