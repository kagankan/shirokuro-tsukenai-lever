import type { IconId } from "../lib/icons";
import { ICON_PRESETS } from "../lib/icons";
import "./ResultMap.css";

// バームクーヘンの 90° スライス相当の見た目で ±45° 表示。
// アーチが container を端から端まで埋めるよう、
// 90°円弧の自然bbox(chord:sagitta = 2sin45° : 1-cos45° ≈ 4.83:1) を viewBox に採用し、
// preserveAspectRatio="none" でコンテナへ引き伸ばす。
const MIN_ANGLE = -50;
const MAX_ANGLE = 50;
const RANGE = MAX_ANGLE - MIN_ANGLE;
const HALF_RANGE_RAD = (MAX_ANGLE * Math.PI) / 180;

// 引き伸ばし後の座標で各端点が container の角に来るよう、半径(%)を調整する。
// value=50 → top:0%、value=0/100 → top:100% を満たすには
// RY_PCT = 100 / (1 - cos45°) ≈ 341.42。
// 同じ理由で水平方向は RX_PCT = 50 / sin45° ≈ 70.71。
const PIVOT_X_PCT = 50;
const RX_PCT = 50 / Math.sin(HALF_RANGE_RAD);
const PIVOT_Y_PCT = 100 / (1 - Math.cos(HALF_RANGE_RAD));
const RY_PCT = PIVOT_Y_PCT;

function valueToPercent(value: number): { left: number; top: number } {
  const angleDeg = MIN_ANGLE + (value / 100) * RANGE;
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: PIVOT_X_PCT + Math.sin(rad),
    top: PIVOT_Y_PCT - Math.cos(rad),
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
        <div className="result-map__arch">
          <div className="result-map__arc" />
        </div>

        <div
          className="result-map__edge"
          style={{ left: `${zero.left}%`, top: `${zero.top}%` }}
        >
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
          const emoji =
            ICON_PRESETS.find((i) => i.id === p.iconId)?.emoji ?? "❓";
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
