import './TopPage.css';

export function TopPage() {
  const handleCreateRoom = () => {
    // TODO: Task 4-3 でルーム作成処理を実装
    alert('Task 4-3 で実装予定');
  };

  return (
    <main className="top-page">
      <h1 className="top-page__title">白黒つけないレバー</h1>
      <p className="top-page__lead">
        お題に対して、みんながレバーで意見を表明するリアルタイム参加型ツール
      </p>
      <button type="button" className="top-page__create-button" onClick={handleCreateRoom}>
        ルームを作成
      </button>
    </main>
  );
}
