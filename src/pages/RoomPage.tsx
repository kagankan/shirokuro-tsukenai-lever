import type { PlayerInfo } from '../lib/types';
import './RoomPage.css';

type Props = {
  roomId: string;
  player: PlayerInfo;
};

export function RoomPage({ roomId, player }: Props) {
  return (
    <div className="room-page">
      <section className="room-page__topic">
        <p>お題エリア（Task 7 で実装）</p>
      </section>
      <section className="room-page__map">
        <p>結果マップ（Task 9 で実装）</p>
      </section>
      <section className="room-page__lever">
        <p>
          レバー（Task 8 で実装）／ {player.nickname} / room: {roomId}
        </p>
      </section>
    </div>
  );
}
