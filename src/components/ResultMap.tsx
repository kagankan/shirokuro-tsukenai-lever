import type { CSSProperties } from "react";
import type { IconId } from "../lib/icons";
import { ICON_PRESETS } from "../lib/icons";
import "./ResultMap.css";

export type PlayerSlot = {
  id: string;
  nickname: string;
  iconId: IconId;
  value: number;
};

type Props = {
  players: PlayerSlot[];
};

// CSS カスタムプロパティ --value を style 経由で渡すための型
type StyleWithValue = CSSProperties & { "--value": number };

export function ResultMap({ players }: Props) {
  return (
    <div className="result-map">
      <div className="result-map__arch">
        <div className="result-map__arc" />

        {players.map((p) => {
          const emoji =
            ICON_PRESETS.find((i) => i.id === p.iconId)?.emoji ?? "❓";
          return (
            <div
              key={p.id}
              className="result-map__player"
              style={{ "--value": p.value } as StyleWithValue}
            >
              <div className="result-map__player-value">{p.value}</div>
              <div className="result-map__player-icon">{emoji}</div>
              <div className="result-map__player-nickname">{p.nickname}</div>
            </div>
          );
        })}
        <div
          className="result-map__edge"
          style={{ "--value": 0 } as StyleWithValue}
        >
          0
        </div>
        <div
          className="result-map__edge"
          style={{ "--value": 100 } as StyleWithValue}
        >
          100
        </div>
      </div>
    </div>
  );
}
