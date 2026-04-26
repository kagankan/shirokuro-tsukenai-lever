import { useCallback, useRef } from "react";
import { css } from "../../styled-system/css";

const MIN_ANGLE = -60; // value=0
const MAX_ANGLE = 60; // value=100
const KEY_STEP = 5;

// 論理座標系（CSSの px と一致）
const STAGE_W = 280;
const STAGE_H = 200;
const PIVOT_X = 140;
const PIVOT_Y = 145;

// レバー固有の色 (rgb literal を Panda の color として直接渡す)
const LEVER_BLUE = "rgb(43 158 218)";
const LEVER_PURPLE = "rgb(87 62 157)";
const LEVER_BLACK = "rgb(5 6 8)";

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
    <div
      className={css({
        width: "100%",
        aspectRatio: "1.4",
        // 子要素の z-index を親要素内で完結させる
        isolation: "isolate",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        touchAction: "none",
      })}
    >
      <span
        className={css({
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "text",
          lineHeight: 1,
          marginBottom: "2",
          fontVariantNumeric: "tabular-nums",
        })}
      >
        {value}
      </span>
      <div
        ref={stageRef}
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
        // レバー全体の舞台
        className={css({
          position: "relative",
          width: "100%",
          height: "350px",
          cursor: "grab",
          _active: { cursor: "grabbing" },
        })}
      >
        {/* 黒の筐体（外箱） */}
        <div
          className={css({
            position: "absolute",
            inset: 0,
            marginTop: "auto",
            marginInline: "auto",
            width: "50%",
            aspectRatio: "1.2",
            borderRadius: "9999px 9999px 0 0",
            // paddingX: '8',
            // paddingTop: '8',
            // paddingBottom: '4',
            padding: "token(spacing.8) token(spacing.8) token(spacing.4)", // 上記3行をまとめるとこう書ける
            background: LEVER_BLACK,
          })}
        >
          {/* 青のU字（外） */}
          <div
            className={css({
              width: "100%",
              height: "100%",
              paddingX: "12",
              paddingTop: "12",
              paddingBottom: 0,
              borderRadius: "9999px 9999px 0 0",
              background: LEVER_BLUE,
            })}
          >
            {/* 紫のU字（内） */}
            <div
              className={css({
                width: "100%",
                height: "100%",
                borderRadius: "9999px 9999px 0 0",
                background: LEVER_PURPLE,
              })}
            />
          </div>
        </div>
        {/* レバーアーム: pivot を原点とする 0サイズのアンカー */}
        <div
          style={{ transform: `rotate(${angleDeg}deg)` }}
          className={css({
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            transformOrigin: "50% 100%",
            width: "fit-content",
            margin: "auto",
            marginTop: "4",
            zIndex: -1,
          })}
        >
          {/* ハンドル。棒の先端に乗る形 (黒い丸の中心に小さい黒丸を ::before で重ねる) */}
          <div
            className={css({
              position: "absolute",
              left: "-9999%",
              right: "-9999%",
              top: 0,
              margin: "auto",
              padding: "2",
              width: "4rem",
              height: "4rem",
              borderRadius: "9999px",
              background: LEVER_BLUE,
              _before: {
                content: '""',
                display: "block",
                borderRadius: "9999px",
                width: "100%",
                height: "100%",
                background: "#050608",
              },
            })}
          />
          {/* 青の棒 */}
          <div
            className={css({
              margin: "auto",
              paddingTop: "4",
              width: "1.5rem",
              height: "280px",
              background: LEVER_BLUE,
              borderRadius: "9999px",
            })}
          />
        </div>
      </div>
    </div>
  );
}
