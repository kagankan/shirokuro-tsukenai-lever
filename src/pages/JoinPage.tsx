import { useState } from 'react';
import { DEFAULT_ICON, ICON_PRESETS } from '../lib/icons';
import type { PlayerInfo } from '../lib/types';
import './JoinPage.css';

type Props = {
  onJoin: (player: PlayerInfo) => void;
};

export function JoinPage({ onJoin }: Props) {
  const [nickname, setNickname] = useState('');
  const [iconId, setIconId] = useState<PlayerInfo['iconId']>(DEFAULT_ICON);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onJoin({ nickname: nickname.trim(), iconId });
  };

  return (
    <main className="join-page">
      <h1 className="join-page__title">ルームに参加</h1>
      <form className="join-page__form" onSubmit={handleSubmit}>
        <div className="join-page__field">
          <label className="join-page__label" htmlFor="nickname">
            ニックネーム
          </label>
          <input
            id="nickname"
            type="text"
            className="join-page__input"
            placeholder="例: たろう"
            maxLength={20}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            // biome-ignore lint/a11y/noAutofocus: 参加フォームの入力開始UX改善
            autoFocus
          />
        </div>
        <fieldset className="join-page__field join-page__field--icon">
          <legend className="join-page__label">アイコン</legend>
          <div className="join-page__icon-grid">
            {ICON_PRESETS.map((icon) => (
              <button
                key={icon.id}
                type="button"
                className="join-page__icon-button"
                aria-pressed={iconId === icon.id}
                aria-label={icon.id}
                onClick={() => setIconId(icon.id)}
              >
                {icon.emoji}
              </button>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="join-page__submit-button" disabled={!nickname.trim()}>
          参加する
        </button>
      </form>
    </main>
  );
}
