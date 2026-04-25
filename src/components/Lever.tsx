import { useCallback, useRef } from 'react';
import './Lever.css';

const LEVER_LENGTH = 90;
const MIN_ANGLE = -60; // degrees, value=0
const MAX_ANGLE = 60; // degrees, value=100
const PIVOT_X = 110;
const PIVOT_Y = 130;
const SVG_WIDTH = 220;
const SVG_HEIGHT = 150;
const KEY_STEP = 5;

function valueToAngle(value: number): number {
  return MIN_ANGLE + (value / 100) * (MAX_ANGLE - MIN_ANGLE);
}

function angleToValue(angle: number): number {
  const clamped = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));
  return Math.round(((clamped - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE)) * 100);
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function Lever({ value, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const angleDeg = valueToAngle(value);
  const knob = polarToCartesian(PIVOT_X, PIVOT_Y, LEVER_LENGTH, angleDeg);

  const computeAngleFromPointer = useCallback((clientX: number, clientY: number): number => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const dx = (clientX - rect.left) * scaleX - PIVOT_X;
    const dy = (clientY - rect.top) * scaleY - PIVOT_Y;
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      dragging.current = true;
      (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
      const angle = computeAngleFromPointer(e.clientX, e.clientY);
      onChange(angleToValue(angle));
    },
    [computeAngleFromPointer, onChange],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
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
      if (e.key === 'ArrowLeft') onChange(Math.max(0, value - KEY_STEP));
      else if (e.key === 'ArrowRight') onChange(Math.min(100, value + KEY_STEP));
    },
    [value, onChange],
  );

  const trackPath = arcPath(PIVOT_X, PIVOT_Y, LEVER_LENGTH, MIN_ANGLE, MAX_ANGLE);
  const fillPath = arcPath(PIVOT_X, PIVOT_Y, LEVER_LENGTH, MIN_ANGLE, angleDeg);

  return (
    <div className="lever">
      <span className="lever__value">{value}</span>
      <div
        role="slider"
        tabIndex={0}
        aria-label={`レバー: ${value}`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        onKeyDown={handleKeyDown}
      >
        <svg
          ref={svgRef}
          className="lever__svg"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-hidden="true"
        >
          <path className="lever__arc-track" d={trackPath} />
          <path className="lever__arc-fill" d={fillPath} />
          <line className="lever__stick" x1={PIVOT_X} y1={PIVOT_Y} x2={knob.x} y2={knob.y} />
          <circle className="lever__pivot" cx={PIVOT_X} cy={PIVOT_Y} r={8} />
          <circle className="lever__knob" cx={knob.x} cy={knob.y} r={12} />
        </svg>
      </div>
    </div>
  );
}
