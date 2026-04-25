import type { IconId } from '../lib/icons';
import { ICON_PRESETS } from '../lib/icons';
import './ResultMap.css';

const MIN_ANGLE = -90;
const MAX_ANGLE = 90;
const RANGE = MAX_ANGLE - MIN_ANGLE;

// 支点(50%, 100%)から半径 50%(横)/ 100%(縦) で配置すると
// viewBox 200x100 (アスペクト比 2:1) の半円アーチと座標が一致する
const PIVOT_X_PCT = 50;
const PIVOT_Y_PCT = 100;
const RX_PCT = 50;
const RY_PCT = 100;

function valueToPercent(value: number): { left: number; top: number } {
  const angleDeg = MIN_ANGLE + (value / 100) * RANGE;
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: PIVOT_X_PCT + RX_PCT * Math.sin(rad),
    top: PIVOT_Y_PCT - RY_PCT * Math.cos(rad),
  };
}

export type PlayerSlot = {
  id: string;
  nickname: string;
  iconId: IconId;
  value: number;
};

type Props = {
  players: PlayerSlot[];
};

export function ResultMap({ players }: Props) {
  const zero = valueToPercent(0);
  const hundred = valueToPercent(100);

  return (
    <div className="result-map">
      <div className="result-map__stage">
        <svg
          className="result-map__arch"
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="result-map-arc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5fd6e0" />
              <stop offset="50%" stopColor="#e8e8f5" />
              <stop offset="100%" stopColor="#a87cfb" />
            </linearGradient>
          </defs>
          <path className="result-map__arch-track" d="M 0 100 A 100 100 0 0 1 200 100" />
        </svg>

        <div className="result-map__edge" style={{ left: `${zero.left}%`, top: `${zero.top}%` }}>
          0
        </div>
        <div
          className="result-map__edge"
          style={{ left: `${hundred.left}%`, top: `${hundred.top}%` }}
        >
          100
        </div>

        {players.map((p) => {
          const { left, top } = valueToPercent(p.value);
          const emoji = ICON_PRESETS.find((i) => i.id === p.iconId)?.emoji ?? '❓';
          return (
            <div
              key={p.id}
              className="result-map__player"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div className="result-map__player-value">{p.value}</div>
              <div className="result-map__player-icon">{emoji}</div>
              <div className="result-map__player-nickname">{p.nickname}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
