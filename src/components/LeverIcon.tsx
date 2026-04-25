type Props = {
  size?: number;
  className?: string;
};

export function LeverIcon({ size = 36, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 36"
      fill="none"
      aria-hidden="true"
    >
      <title>レバー</title>
      {/* 取手（上の丸） */}
      <circle cx="16" cy="5" r="3.2" fill="currentColor" />
      {/* 棒 */}
      <rect x="14.4" y="7" width="3.2" height="9" fill="currentColor" />
      {/* U字の本体（円弧） */}
      <path
        d="M 6 30 V 24 a 10 10 0 0 1 20 0 V 30"
        stroke="currentColor"
        strokeWidth="3.2"
        fill="none"
      />
      {/* 台座 */}
      <rect x="3" y="29" width="26" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}
