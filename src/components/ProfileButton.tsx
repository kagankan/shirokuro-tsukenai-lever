import { useRef, useState } from 'react';
import { css } from '../../styled-system/css';
import { ICON_PRESETS } from '../lib/icons';
import type { PlayerInfo } from '../lib/types';
import { Modal } from './Modal';
import { PlayerForm } from './PlayerForm';

type Props = {
  player: PlayerInfo;
  onChange: (player: PlayerInfo) => void;
};

/**
 * 自分のニックネーム・アイコンを表示するボタン。押すと編集用のモーダルを開く。
 */
export function ProfileButton({ player, onChange }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // 開くたびにフォームを現在の値で初期化し直すための key
  const [formKey, setFormKey] = useState(0);
  const emoji = ICON_PRESETS.find((icon) => icon.id === player.iconId)?.emoji;

  const open = () => {
    setFormKey((k) => k + 1);
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  const handleSubmit = (next: PlayerInfo) => {
    onChange(next);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={`プロフィールを変更（現在: ${player.nickname}）`}
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          maxWidth: '100%',
          paddingY: '1.5',
          paddingLeft: '2',
          paddingRight: '3.5',
          border: '1.5px solid token(colors.border)',
          borderRadius: '999px',
          background: 'bg',
          color: 'text',
          fontSize: 'sm',
          fontWeight: 600,
          transition: 'border-color 0.15s ease',
          _hover: { borderColor: 'accent' },
        })}
      >
        <span aria-hidden className={css({ fontSize: '1.375rem', lineHeight: 1 })}>
          {emoji}
        </span>
        <span
          className={css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}
        >
          {player.nickname}
        </span>
        <span aria-hidden className={css({ color: 'textMuted', fontWeight: 400 })}>
          ✎
        </span>
      </button>
      <Modal ref={dialogRef} title="プロフィールを変更" onClose={close}>
        <PlayerForm
          key={formKey}
          initialValue={player}
          submitLabel="変更する"
          onSubmit={handleSubmit}
        />
      </Modal>
    </>
  );
}
