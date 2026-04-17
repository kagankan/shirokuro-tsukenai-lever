import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './TopPage.css';

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
    <main className="top-page">
      <h1 className="top-page__title">白黒つけないレバー</h1>
      <p className="top-page__lead">
        お題に対して、みんながレバーで意見を表明するリアルタイム参加型ツール
      </p>
      <button
        type="button"
        className="top-page__create-button"
        onClick={handleCreateRoom}
        disabled={loading}
      >
        {loading ? '作成中…' : 'ルームを作成'}
      </button>
      {error && <p className="top-page__error">{error}</p>}
    </main>
  );
}
