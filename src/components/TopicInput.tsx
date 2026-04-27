import type { Ref } from 'react';
import { css } from '../../styled-system/css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * お題を編集するための見た目コンポーネント（純粋な input）。
 * 永続化やリアルタイム同期のロジックは持たず、呼び出し側が制御する。
 */
export function TopicInput({ value, onChange, onBlur, inputRef }: Props) {
  return (
    <div className={css({ display: 'flex', alignItems: 'center', gap: '2', flex: 1 })}>
      <input
        ref={inputRef}
        type="text"
        placeholder="お題を入力してください"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={100}
        aria-label="お題"
        // TV字幕風: 大きく・太く・下線のみ
        className={css({
          flex: 1,
          font: 'inherit',
          fontSize: '1.1875rem', // 19px 相当(既定 fontSizes.lg=18px だと印象が変わるため)
          fontWeight: 700,
          letterSpacing: '-0.01em',
          paddingY: '1', // spacing.1 = 0.25rem
          paddingX: '0.5', // spacing.0.5 = 0.125rem
          border: 'none',
          borderBottom: '0.125rem solid transparent',
          background: 'transparent',
          color: 'text',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          _hoverNotFocus: { borderColor: 'border' },
          _focus: { borderColor: 'accent' },
          _placeholder: {
            color: 'textMuted',
            fontWeight: 400,
            fontSize: 'md', // 1rem
          },
        })}
      />
    </div>
  );
}
