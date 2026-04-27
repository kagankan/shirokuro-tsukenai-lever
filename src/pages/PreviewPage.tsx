import { useState } from 'react';
import { css } from '../../styled-system/css';
import { Lever } from '../components/Lever';
import { LeverIcon } from '../components/LeverIcon';
import type { PlayerSlot } from '../components/ResultMap';
import { ResultMap } from '../components/ResultMap';
import { TopicInput } from '../components/TopicInput';

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
    <div className={css({ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 })}>
      <section
        className={css({
          paddingY: '3.5',
          paddingX: '5',
          flexShrink: 0,
          background: 'surface',
          borderBottom: '1px solid token(colors.border)',
          display: 'flex',
          alignItems: 'center',
          gap: '3',
        })}
      >
        <div className={css({ flexShrink: 0, width: '12' })}>
          <LeverIcon />
        </div>
        <TopicInput value={topic} onChange={setTopic} />
      </section>
      <section
        className={css({
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingY: '3',
          paddingX: '4',
        })}
      >
        <ResultMap players={players} />
      </section>
      <section
        className={css({
          flexShrink: 0,
          borderTop: '1px solid token(colors.border)',
          background: 'surface',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Lever value={myValue} onChange={setMyValue} />
      </section>
    </div>
  );
}
