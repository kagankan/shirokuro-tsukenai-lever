import type { IconId } from '../lib/icons';
import { ICON_PRESETS } from '../lib/icons';
import './ResultMap.css';

const CX = 160;
const CY = 160;
const RADIUS = 130;
const MIN_ANGLE = -150; // degrees from top (value=0 → left)
const MAX_ANGLE = -30; // degrees from top (value=100 → right)

function valueToPoint(value: number): { x: number; y: number } {
  const angleDeg = MIN_ANGLE + (value / 100) * (MAX_ANGLE - MIN_ANGLE);
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + RADIUS * Math.sin(rad),
    y: CY + RADIUS * -Math.cos(rad),
  };
}

function arcPath(): string {
  const start = valueToPoint(0);
  const end = valueToPoint(100);
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y}`;
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
  const track = arcPath();

  return (
    <div className="result-map">
      <svg className="result-map__svg" viewBox="0 0 320 200" aria-label="結果マップ" role="img">
        <path className="result-map__arc-track" d={track} />

        {/* 0 / 50 / 100 ラベル */}
        <text
          className="result-map__label-edge"
          x={valueToPoint(0).x - 8}
          y={valueToPoint(0).y}
          textAnchor="end"
        >
          0
        </text>
        <text
          className="result-map__label-value"
          x={valueToPoint(50).x}
          y={valueToPoint(50).y - 16}
        >
          50
        </text>
        <text
          className="result-map__label-edge"
          x={valueToPoint(100).x + 8}
          y={valueToPoint(100).y}
        >
          100
        </text>

        {players.map((p) => {
          const pos = valueToPoint(p.value);
          const emoji = ICON_PRESETS.find((i) => i.id === p.iconId)?.emoji ?? '❓';
          return (
            <g key={p.id} transform={`translate(${pos.x}, ${pos.y})`}>
              <text className="result-map__player-emoji" y={-28}>
                {emoji}
              </text>
              <text className="result-map__player-nickname" y={-8}>
                {p.nickname}
              </text>
              <text className="result-map__player-value" y={8}>
                {p.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
