import { useState } from 'react';
import { css } from '../../styled-system/css';

/**
 * 現在のページURL（ルームURL）をクリップボードにコピーするボタン。
 */
export function CopyUrlButton() {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
  );
}
