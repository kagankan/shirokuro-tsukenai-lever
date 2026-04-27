import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * ルームのお題を Supabase と同期する hook。
 * - 初期値からローカル state を立ち上げ、Postgres Changes で他人の更新を受信する
 * - 自分が編集中（input にフォーカス中）は受信値を反映しない
 * - blur 時に最終値を DB へ書き戻す
 */
export function useTopicSync(roomId: string, initialTopic: string) {
  const [topic, setTopic] = useState(initialTopic);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`room-topic:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          if (document.activeElement !== inputRef.current) {
            setTopic((payload.new as { topic: string }).topic);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleBlur = async () => {
    await supabase.from('rooms').update({ topic }).eq('id', roomId);
  };

  return { topic, setTopic, inputRef, handleBlur };
}
