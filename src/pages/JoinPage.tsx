import { css } from '../../styled-system/css';
import { CopyUrlButton } from '../components/CopyUrlButton';
import { PlayerForm } from '../components/PlayerForm';
import { DEFAULT_ICON } from '../lib/icons';
import type { PlayerInfo } from '../lib/types';

type Props = {
  onJoin: (player: PlayerInfo) => void;
};

export function JoinPage({ onJoin }: Props) {
  return (
    <main
      className={css({
        flex: 1,
        width: '100%',
        maxWidth: '480px',
        marginInline: 'auto',
        padding: '4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8',
      })}
    >
      <h1 className={css({ fontSize: '1.375rem', textAlign: 'center' })}>ルームに参加</h1>
      <div
        className={css({
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2',
        })}
      >
        <p className={css({ fontSize: 'sm', color: 'textMuted', textAlign: 'center' })}>
          URLを共有すると他のメンバーがルームに参加できます
        </p>
        <CopyUrlButton />
      </div>
      <PlayerForm
        initialValue={{ nickname: '', iconId: DEFAULT_ICON }}
        submitLabel="参加する"
        onSubmit={onJoin}
      />
    </main>
  );
}
