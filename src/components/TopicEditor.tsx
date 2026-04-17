import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import './TopicEditor.css';

type Props = {
  roomId: string;
  initialTopic: string;
};

export function TopicEditor({ roomId, initialTopic }: Props) {
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

  return (
    <div className="topic-editor">
      <input
        ref={inputRef}
        type="text"
        className="topic-editor__input"
        placeholder="お題を入力してください"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onBlur={handleBlur}
        maxLength={100}
        aria-label="お題"
      />
    </div>
  );
}
