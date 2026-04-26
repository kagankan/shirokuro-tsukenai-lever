import { useState } from 'react';
import { css } from '../../styled-system/css';
import { Lever } from '../components/Lever';
import { LeverIcon } from '../components/LeverIcon';
import type { PlayerSlot } from '../components/ResultMap';
import { ResultMap } from '../components/ResultMap';

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
        <LeverIcon className={css({ flexShrink: 0, color: 'accent' })} size={40} />
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2', flex: 1 })}>
          <input
            type="text"
            placeholder="お題を入力してください"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={100}
            aria-label="お題"
            // TV字幕風: 大きく・太く・下線のみ
            className={css({
              flex: 1,
              font: 'inherit',
              fontSize: '1.1875rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              paddingY: '1',
              paddingX: '0.5',
              border: 'none',
              borderBottom: '0.125rem solid transparent',
              background: 'transparent',
              color: 'text',
              outline: 'none',
              transition: 'border-color 0.15s ease',
              _hoverNotFocus: { borderColor: 'border' },
              _focus: { borderColor: 'accent' },
              _placeholder: {
                color: 'textMuted',
                fontWeight: 400,
                fontSize: 'md',
              },
            })}
          />
        </div>
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
