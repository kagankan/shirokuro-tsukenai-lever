import { useState } from 'react';
import { css } from '../../styled-system/css';
import { supabase } from '../lib/supabase';

type Props = {
  onCreated: (roomId: string) => void;
};

export function TopPage({ onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('rooms')
      .insert({ topic: '' })
      .select()
      .single();

    setLoading(false);

    if (err || !data) {
      setError('ルームの作成に失敗しました。もう一度お試しください。');
      return;
    }

    onCreated(data.id);
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
      <p className={css({ color: 'textMuted', maxWidth: '24em' })}>
        お題に対して、みんながレバーで意見を表明するリアルタイム参加型ツール
      </p>
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
    </main>
  );
}
