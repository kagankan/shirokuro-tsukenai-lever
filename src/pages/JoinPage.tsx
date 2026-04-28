import { useState } from 'react';
import { css } from '../../styled-system/css';
import { DEFAULT_ICON, ICON_PRESETS } from '../lib/icons';
import type { PlayerInfo } from '../lib/types';

type Props = {
  onJoin: (player: PlayerInfo) => void;
};

export function JoinPage({ onJoin }: Props) {
  const [nickname, setNickname] = useState('');
  const [iconId, setIconId] = useState<PlayerInfo['iconId']>(DEFAULT_ICON);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onJoin({ nickname: nickname.trim(), iconId });
  };

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
        <button
          type="button"
          onClick={handleCopyUrl}
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '1.5',
            paddingY: '2',
            paddingX: '3.5',
            border: '1.5px solid token(colors.border)',
            borderRadius: '999px',
            background: 'surface',
            color: copied ? 'accent' : 'textMuted',
            fontSize: 'sm',
            fontWeight: 600,
            transition: 'color 0.15s ease, border-color 0.15s ease',
            borderColor: copied ? 'accent' : 'border',
            _hover: { borderColor: 'accent', color: 'accent' },
          })}
        >
          {copied ? '✓ コピーしました' : 'URLをコピー'}
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className={css({ width: '100%', display: 'flex', flexDirection: 'column', gap: '6' })}
      >
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
          <label
            htmlFor="nickname"
            className={css({ fontSize: 'sm', fontWeight: 600, color: 'textMuted' })}
          >
            ニックネーム
          </label>
          <input
            id="nickname"
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
          参加する
        </button>
      </form>
    </main>
  );
}
