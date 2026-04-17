type Props = {
  roomId: string;
};

export function RoomPage({ roomId }: Props) {
  return (
    <main>
      <p>RoomPage（後続タスクで実装）</p>
      <p>roomId: {roomId}</p>
    </main>
  );
}
