import { useState } from 'react';
import { css } from '../../styled-system/css';
import {
  isLeverSoundEnabled,
  playLeverSound,
  prepareLeverSound,
  setLeverSoundEnabled,
} from '../lib/leverSound';

/**
 * レバー操作音のオン/オフを切り替えるボタン。設定は端末ごとに保存される。
 */
export function SoundToggleButton() {
  const [enabled, setEnabled] = useState(isLeverSoundEnabled);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setLeverSoundEnabled(next);
    if (next) {
      // オンにしたことが分かるよう、その場で1回鳴らす
      prepareLeverSound();
      void playLeverSound();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label="操作音"
      title={enabled ? '操作音: オン' : '操作音: オフ'}
      className={css({
        display: 'flex',
        padding: '2',
        border: 'none',
        borderRadius: '999px',
        background: 'transparent',
        color: 'textMuted',
        transition: 'color 0.15s ease',
        _hover: { color: 'accent' },
      })}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
        {enabled ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <path d="m16 9 6 6m0-6-6 6" />
        )}
      </svg>
    </button>
  );
}
