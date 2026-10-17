import { useId, useState } from 'react';
import { css } from '../../styled-system/css';
import { ICON_PRESETS } from '../lib/icons';
import type { PlayerInfo } from '../lib/types';

type Props = {
  initialValue: PlayerInfo;
  submitLabel: string;
  onSubmit: (player: PlayerInfo) => void;
};

/**
 * ニックネームとアイコンを入力するフォーム。参加画面とプロフィール編集モーダルで共用する。
 */
export function PlayerForm({ initialValue, submitLabel, onSubmit }: Props) {
  const nicknameId = useId();
  const [nickname, setNickname] = useState(initialValue.nickname);
  const [iconId, setIconId] = useState<PlayerInfo['iconId']>(initialValue.iconId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onSubmit({ nickname: nickname.trim(), iconId });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={css({ width: '100%', display: 'flex', flexDirection: 'column', gap: '6' })}
    >
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
        <label
          htmlFor={nicknameId}
          className={css({ fontSize: 'sm', fontWeight: 600, color: 'textMuted' })}
        >
          ニックネーム
        </label>
        <input
          id={nicknameId}
          type="text"
          placeholder="例: たろう"
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          // biome-ignore lint/a11y/noAutofocus: 参加フォームの入力開始UX改善
          autoFocus
          className={css({
            font: 'inherit',
            fontSize: 'md',
            paddingY: '3',
            paddingX: '3.5',
            border: '1.5px solid token(colors.border)',
            borderRadius: '10px',
            background: 'bg',
            color: 'text',
            outline: 'none',
            transition: 'border-color 0.15s ease',
            _focus: { borderColor: 'accent' },
          })}
        />
      </div>
      <fieldset
        className={css({
          border: 'none',
          padding: 0,
          margin: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '2',
        })}
      >
        <legend className={css({ fontSize: 'sm', fontWeight: 600, color: 'textMuted' })}>
          アイコン
        </legend>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2.5',
          })}
        >
          {ICON_PRESETS.map((icon) => (
            <button
              key={icon.id}
              type="button"
              aria-pressed={iconId === icon.id}
              aria-label={icon.id}
              onClick={() => setIconId(icon.id)}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                padding: '2.5',
                border: '2px solid token(colors.border)',
                borderRadius: '12px',
                background: 'surface',
                transition: 'border-color 0.15s ease, background 0.15s ease',
                _pressed: { borderColor: 'accent', background: 'bg' },
              })}
            >
              {icon.emoji}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={!nickname.trim()}
        className={css({
          padding: '3.5',
          border: 'none',
          borderRadius: '999px',
          background: 'accent',
          color: 'accentText',
          fontSize: 'md',
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'filter 0.15s ease',
          _hover: { _enabled: { filter: 'brightness(1.08)' } },
          _active: { _enabled: { filter: 'brightness(0.95)' } },
          _disabled: { filter: 'grayscale(0.4) opacity(0.6)', cursor: 'not-allowed' },
        })}
      >
        {submitLabel}
      </button>
    </form>
  );
}
