import { css } from '../../styled-system/css';
import { CopyUrlButton } from './CopyUrlButton';

/**
 * ルーム画面のヘッダーの中身。1人モード（トップ）へ戻るリンクと URL コピーボタン。
 */
export function RoomHeader() {
  return (
    <>
      {/* App が持つ参加情報の state もリセットされるよう、SPA 内の遷移ではなく通常のリンクにする */}
      <a
        href={import.meta.env.BASE_URL}
        className={css({
          color: 'textMuted',
          fontSize: 'sm',
          textDecoration: 'none',
          transition: 'color 0.15s ease',
          _hover: { color: 'accent' },
        })}
      >
        ← 1人モードへ
      </a>
      <CopyUrlButton />
    </>
  );
}
