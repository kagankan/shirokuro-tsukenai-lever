import type { ComponentProps, ReactNode } from 'react';
import { css } from '../../styled-system/css';
import { Lever } from './Lever';
import { LeverIcon } from './LeverIcon';
import { ProfileButton } from './ProfileButton';
import type { PlayerSlot } from './ResultMap';
import { ResultMap } from './ResultMap';
import { SoundToggleButton } from './SoundToggleButton';
import { TopicInput } from './TopicInput';

const pageClass = css({
  flex: 1,
  width: '100%',
  maxWidth: 'lg',
  marginInline: 'auto',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
});

const headerClass = css({
  paddingY: '2',
  paddingX: '5',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  borderBottom: '1px solid token(colors.border)',
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

const soundToggleWrapClass = css({
  position: 'absolute',
  top: '2',
  right: '3',
  zIndex: 1,
});

const leverSectionClass = css({
  position: 'relative',
  flexShrink: 0,
  borderTop: '1px solid token(colors.border)',
  background: 'surface',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3',
  paddingBottom: '4',
});

type Props = {
  /** ヘッダーの中身（左右に振り分けて配置される） */
  header: ReactNode;
  topic: ComponentProps<typeof TopicInput>;
  players: PlayerSlot[];
  lever: ComponentProps<typeof Lever>;
  /** 省略するとプロフィールボタンを表示しない（1人モード用） */
  profile?: ComponentProps<typeof ProfileButton>;
};

/**
 * レバー画面のレイアウト（1人モード・ルーム共通）。
 * サーバー接続でもローカル state でも、必要なデータとハンドラを
 * props として渡すだけで利用できる純粋な見た目コンポーネント。
 */
export function RoomLayout({ header, topic, players, lever, profile }: Props) {
  return (
    <div className={pageClass}>
      <header className={headerClass}>{header}</header>
      <section className={topicSectionClass}>
        <div className={topicIconWrapClass}>
          <LeverIcon />
        </div>
        <TopicInput {...topic} />
      </section>
      <section className={mapSectionClass} aria-label="結果マップ">
        <ResultMap players={players} />
      </section>
      <section className={leverSectionClass}>
        <div className={soundToggleWrapClass}>
          <SoundToggleButton />
        </div>
        <Lever {...lever} />
        {profile && <ProfileButton {...profile} />}
      </section>
    </div>
  );
}
