import { type ReactNode, type Ref, useId } from 'react';
import { css } from '../../styled-system/css';

type Props = {
  ref: Ref<HTMLDialogElement>;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * `<dialog>` を使ったモーダル。開くときは呼び出し側が ref 経由で `showModal()` を呼ぶ。
 */
export function Modal({ ref, title, onClose, children }: Props) {
  const titleId = useId();

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: 背景クリックで閉じる補助操作。キーボードでは Esc で閉じられる
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // 背景（::backdrop）のクリックは dialog 自身へのクリックとして届くので、それで閉じる
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
          <h2 id={titleId} className={css({ fontSize: 'lg' })}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
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
        {children}
      </div>
    </dialog>
  );
}
