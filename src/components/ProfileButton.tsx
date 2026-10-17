import { useRef, useState } from 'react';
import { css } from '../../styled-system/css';
import { ICON_PRESETS } from '../lib/icons';
import type { PlayerInfo } from '../lib/types';
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
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 背景クリックで閉じる補助操作。キーボードでは Esc で閉じられる */}
      <dialog
        ref={dialogRef}
        aria-labelledby="profile-dialog-title"
        // 背景（::backdrop）のクリックは dialog 自身へのクリックとして届くので、それで閉じる
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className={css({
          width: 'calc(100% - 2rem)',
          maxWidth: '400px',
          margin: 'auto',
          padding: '0',
          border: '1px solid token(colors.border)',
          borderRadius: '16px',
          background: 'surface',
          color: 'text',
          _backdrop: { background: 'rgb(0 0 0 / 0.6)' },
        })}
      >
        <div className={css({ padding: '5', display: 'flex', flexDirection: 'column', gap: '5' })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <h2 id="profile-dialog-title" className={css({ fontSize: 'lg' })}>
              プロフィールを変更
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="閉じる"
              className={css({
                padding: '1',
                border: 'none',
                background: 'transparent',
                color: 'textMuted',
                fontSize: 'xl',
                lineHeight: 1,
                _hover: { color: 'text' },
              })}
            >
              ×
            </button>
          </div>
          <PlayerForm
            key={formKey}
            initialValue={player}
            submitLabel="変更する"
            onSubmit={handleSubmit}
          />
        </div>
      </dialog>
    </>
  );
}
