import { useCallback, useRef } from "react";
import "./Lever.css";

const MIN_ANGLE = -60; // value=0
const MAX_ANGLE = 60; // value=100
const KEY_STEP = 5;

// 論理座標系（CSSの px と一致）
const STAGE_W = 280;
const STAGE_H = 200;
const PIVOT_X = 140;
const PIVOT_Y = 145;

function valueToAngle(value: number): number {
  return MIN_ANGLE + (value / 100) * (MAX_ANGLE - MIN_ANGLE);
}

function angleToValue(angle: number): number {
  const clamped = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));
  return Math.round(((clamped - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE)) * 100);
}

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function Lever({ value, onChange }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const angleDeg = valueToAngle(value);

  const computeAngleFromPointer = useCallback(
    (clientX: number, clientY: number): number => {
      const stage = stageRef.current;
      if (!stage) return 0;
      const rect = stage.getBoundingClientRect();
      // 実描画サイズと論理サイズが違ってもよいよう、スケールを掛ける
      const scaleX = STAGE_W / rect.width;
      const scaleY = STAGE_H / rect.height;
      const dx = (clientX - rect.left) * scaleX - PIVOT_X;
      const dy = (clientY - rect.top) * scaleY - PIVOT_Y;
      return (Math.atan2(dx, -dy) * 180) / Math.PI;
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      const angle = computeAngleFromPointer(e.clientX, e.clientY);
      onChange(angleToValue(angle));
    },
    [computeAngleFromPointer, onChange],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const angle = computeAngleFromPointer(e.clientX, e.clientY);
      onChange(angleToValue(angle));
    },
    [computeAngleFromPointer, onChange],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") onChange(Math.max(0, value - KEY_STEP));
      else if (e.key === "ArrowRight")
        onChange(Math.min(100, value + KEY_STEP));
    },
    [value, onChange],
  );

  return (
    <div className="lever">
      <span className="lever__value">{value}</span>
      <div
        ref={stageRef}
        className="lever__stage"
        role="slider"
        tabIndex={0}
        aria-label={`レバー: ${value}`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="lever__case">
          <div className="lever__ring--outer">
            <div className="lever__ring lever__ring--inner" />
          </div>
        </div>
        <div
          className="lever__arm"
          style={{ transform: `rotate(${angleDeg}deg)` }}
        >
          <div className="lever__handle" />
          <div className="lever__stick" />
        </div>
      </div>
    </div>
  );
}
