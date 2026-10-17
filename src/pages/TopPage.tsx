import { useState } from 'react';
import { css } from '../../styled-system/css';
import { createRoom } from '../lib/api';

type Props = {
  onCreated: (roomId: string) => void;
};

export function TopPage({ onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setLoading(true);
    setError(null);

    try {
      const id = await createRoom();
      onCreated(id);
    } catch {
      setError('ルームの作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
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
        textAlign: 'center',
      })}
    >
      <h1 className={css({ fontSize: '2rem', lineHeight: 1.2 })}>白黒つけないレバー</h1>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
          color: 'textMuted',
          maxWidth: '24em',
        })}
      >
        <p>
          YouTubeチャンネル「白黒つけない会議」のファンによる非公式アプリです。
          <br />
          オンラインでお互いの意見を見せ合えます。
        </p>
        <ul className={css({ listStyle: 'none', fontSize: 'sm' })}>
          <li>
            本家サイト:{' '}
            <a
              href="https://cybozu.co.jp/not-shirokuro/"
              target="_blank"
              rel="noopener noreferrer"
              className={css({ color: 'accent', textDecoration: 'underline' })}
            >
              白黒つけない会議
            </a>
          </li>
          <li>
            本家YouTubeチャンネル:{' '}
            <a
              href="https://youtube.com/@not_shirokuro"
              target="_blank"
              rel="noopener noreferrer"
              className={css({ color: 'accent', textDecoration: 'underline' })}
            >
              @not_shirokuro
            </a>
          </li>
        </ul>
      </div>
      <button
        type="button"
        onClick={handleCreateRoom}
        disabled={loading}
        className={css({
          paddingY: '3.5',
          paddingX: '8',
          border: 'none',
          borderRadius: '999px',
          background: 'accent',
          color: 'accentText',
          fontSize: 'md',
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'filter 0.15s ease',
          _hover: { filter: 'brightness(1.08)' },
          _active: { filter: 'brightness(0.95)' },
          _disabled: { filter: 'grayscale(0.4) opacity(0.6)', cursor: 'not-allowed' },
        })}
      >
        {loading ? '作成中…' : 'ルームを作成'}
      </button>
      {error && <p className={css({ color: '#e53935', fontSize: 'sm' })}>{error}</p>}
      <section
        aria-labelledby="spec-heading"
        className={css({
          width: '100%',
          maxWidth: '24em',
          padding: '4',
          border: '1px solid token(colors.border)',
          borderRadius: '12px',
          background: 'surface',
          textAlign: 'left',
        })}
      >
        <h2 id="spec-heading" className={css({ fontSize: 'md', marginBottom: '2' })}>
          ツールの仕様
        </h2>
        <ul
          className={css({
            color: 'textMuted',
            fontSize: 'sm',
            paddingLeft: '5',
            listStyle: 'disc',
          })}
        >
          <li>URLを共有すると同じルームに参加できます</li>
          <li>1ルーム最大8人まで参加できます</li>
          <li>お題はサーバーに保存されます。名前は保存されません</li>
        </ul>
      </section>
    </main>
  );
}
