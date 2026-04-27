import type { ComponentProps } from 'react';
import { css } from '../../styled-system/css';
import { Lever } from './Lever';
import { LeverIcon } from './LeverIcon';
import type { PlayerSlot } from './ResultMap';
import { ResultMap } from './ResultMap';
import { TopicInput } from './TopicInput';

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

const topicIconWrapClass = css({ flexShrink: 0, width: '12' });

const mapSectionClass = css({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const leverSectionClass = css({
  flexShrink: 0,
  borderTop: '1px solid token(colors.border)',
  background: 'surface',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

type Props = {
  topic: ComponentProps<typeof TopicInput>;
  players: PlayerSlot[];
  lever: ComponentProps<typeof Lever>;
};

/**
 * ルーム画面のレイアウト。
 * Supabase 接続でもローカル state でも、必要なデータとハンドラを
 * props として渡すだけで利用できる純粋な見た目コンポーネント。
 */
export function RoomLayout({ topic, players, lever }: Props) {
  return (
    <div className={pageClass}>
      <section className={topicSectionClass}>
        <div className={topicIconWrapClass}>
          <LeverIcon />
        </div>
        <TopicInput {...topic} />
      </section>
      <section className={mapSectionClass}>
        <ResultMap players={players} />
      </section>
      <section className={leverSectionClass}>
        <Lever {...lever} />
      </section>
    </div>
  );
}
