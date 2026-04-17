import type { PlayerInfo } from '../lib/types';

type Props = {
  roomId: string;
  player: PlayerInfo;
};

export function RoomPage({ roomId, player }: Props) {
  return (
    <main>
      <p>RoomPage（後続タスクで実装）</p>
      <p>
        {player.nickname}（{player.iconId}） / room: {roomId}
      </p>
    </main>
  );
}
