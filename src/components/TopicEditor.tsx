import { useEffect, useRef, useState } from 'react';
import { css } from '../../styled-system/css';
import { supabase } from '../lib/supabase';

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
    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
      <input
        ref={inputRef}
        type="text"
        placeholder="お題を入力してください"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onBlur={handleBlur}
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
