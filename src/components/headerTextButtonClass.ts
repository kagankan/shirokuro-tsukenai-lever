import { css } from '../../styled-system/css';

/** ヘッダーに置く控えめなテキストボタン */
export const headerTextButtonClass = css({
  padding: '0',
  border: 'none',
  background: 'transparent',
  color: 'textMuted',
  fontSize: 'sm',
  transition: 'color 0.15s ease',
  _hover: { color: 'accent' },
});
