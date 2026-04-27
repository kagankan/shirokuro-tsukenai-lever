import { useState } from 'react';
import type { PlayerSlot } from '../components/ResultMap';
import { RoomLayout } from '../components/RoomLayout';

// 自分以外のダミー参加者（さまざまな値で配置例を確認するため）
const OTHER_PLAYERS: Omit<PlayerSlot, 'value'>[] = [
  { id: 'p1', nickname: 'ボブ', iconId: 'dog' },
  { id: 'p2', nickname: 'キャロル', iconId: 'rabbit' },
  { id: 'p3', nickname: 'デイヴ', iconId: 'fox' },
];
const OTHER_VALUES = [15, 70, 90];

/**
 * Supabase 抜きで UI だけ確認するためのプレビュー画面。
 * URL に `?preview` を付けるとここが表示される。
 */
export function PreviewPage() {
  const [topic, setTopic] = useState('酔っ払いの失言は許すべき？');
  const [myValue, setMyValue] = useState(50);

  const players: PlayerSlot[] = [
    { id: 'me', nickname: 'アリス', iconId: 'cat', value: myValue },
    ...OTHER_PLAYERS.map((p, i) => ({ ...p, value: OTHER_VALUES[i] })),
  ];

  return (
    <RoomLayout
      topic={{ value: topic, onChange: setTopic }}
      players={players}
      lever={{ value: myValue, onChange: setMyValue }}
    />
  );
}
