import { useEffect, useRef, useState } from 'react';

/**
 * ルームのお題をサーバーと同期する hook。
 * - サーバーから届いた最新値をローカル state に反映する
 * - 自分が編集中（input にフォーカス中）は受信値を反映しない
 * - blur 時に最終値をサーバーへ送る（Last Write Wins）
 */
export function useTopicSync(remoteTopic: string, sendTopic: (topic: string) => void) {
  const [topic, setTopic] = useState(remoteTopic);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setTopic(remoteTopic);
    }
  }, [remoteTopic]);

  const handleBlur = () => {
    if (topic !== remoteTopic) sendTopic(topic);
  };

  return { topic, setTopic, inputRef, handleBlur };
}
