import { useTopicSync } from '../hooks/useTopicSync';
import { TopicInput } from './TopicInput';

type Props = {
  roomId: string;
  initialTopic: string;
};

/**
 * Supabase と接続したお題編集 UI。
 * 同期ロジックは useTopicSync、見た目は TopicInput が担う。
 */
export function TopicEditor({ roomId, initialTopic }: Props) {
  const { topic, setTopic, inputRef, handleBlur } = useTopicSync(roomId, initialTopic);

  return <TopicInput value={topic} onChange={setTopic} onBlur={handleBlur} inputRef={inputRef} />;
}
