import type { CSSProperties } from 'react';
import { css, cx } from '../../styled-system/css';
import type { IconId } from '../lib/icons';
import { ICON_PRESETS } from '../lib/icons';

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
type StyleWithValue = CSSProperties & { '--value': number };

// 外側コンテナ。aspect-ratio で arc が乗る舞台のサイズを確定させる
const wrapperClass = css({
  position: 'relative',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingY: '4',
  paddingX: '6',
  aspectRatio: '2 / 1',
  border: '1px solid token(colors.border)',
});

// arc を描画する正方形の枠。
//   - container-type: size で内側に cqw/cqh の query container を立てる
//   - 親(2:1)より広めの正方形にして上端を揃え、頂点が見える形にする
//   - --min-angle / --max-angle は子(arc, player, edge)が共有する角度定数
const archClass = css({
  containerType: 'size',
  position: 'absolute',
  top: 0,
  left: '-9999%',
  right: '-9999%',
  marginInline: 'auto',
  aspectRatio: '1 / 1',
  width: '130%',
  overflow: 'visible',
  // arc 上に配置する要素(player / edge)が共有する角度定数
  '--min-angle': '-50deg',
  '--max-angle': '50deg',
});

// アーチ本体。conic-gradient + radial-gradient mask で
// 角度方向と半径方向のリング状切り抜きを実現する
const arcClass = css({
  position: 'absolute',
  inset: 0,
  backgroundImage:
    'conic-gradient(from 180deg, transparent 0 calc(180deg + var(--min-angle)), rgb(113 204 226) calc(180deg + var(--min-angle)), rgb(110 64 170) calc(180deg + var(--max-angle)), transparent calc(180deg + var(--max-angle)))',
  maskImage: 'radial-gradient(closest-side, transparent 75%, black 0% 100%, transparent 50%)',
});

// --value (0..100) を inline style で受け取り、arc 上に
// transform: translate で配置するための共有計算 (player / edge 共通)。
// top/left を動かさないので value 変化時も layout/paint を回避し composite だけで済む
const onArcClass = css({
  position: 'absolute',
  top: 0,
  left: 0,
  '--angle': 'calc(var(--min-angle) + var(--value) * (var(--max-angle) - var(--min-angle)) / 100)',
  '--x': 'calc(50cqw + 50cqw * sin(var(--angle)))',
  '--y': 'calc(50cqh - 50cqh * cos(var(--angle)))',
});

const edgeClass = css({
  fontSize: 'xs',
  fontWeight: 600,
  color: 'textMuted',
  // 中央x揃え + 点から 18px 下へ
  transform: 'translate(calc(var(--x) - 50%), calc(var(--y) + 18px))',
  pointerEvents: 'none',
});

const playerClass = css({
  // 中央x/y揃え
  transform: 'translate(calc(var(--x) - 50%), calc(var(--y) - 50%))',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
});

const playerValueClass = css({
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'text',
  lineHeight: 1,
  marginBottom: '1',
});

const playerIconClass = css({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: '#0e0f14',
  border: '1.5px solid rgba(255, 255, 255, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'xl',
  lineHeight: 1,
});

const playerNicknameClass = css({
  fontSize: '0.6875rem',
  color: 'text',
  marginTop: '1',
  lineHeight: 1,
});

export function ResultMap({ players }: Props) {
  return (
    <div className={wrapperClass}>
      <div className={archClass}>
        <div className={arcClass} />

        {players.map((p) => {
          const emoji = ICON_PRESETS.find((i) => i.id === p.iconId)?.emoji ?? '❓';
          return (
            <div
              key={p.id}
              style={{ '--value': p.value } as StyleWithValue}
              className={cx(onArcClass, playerClass)}
            >
              <div className={playerValueClass}>{p.value}</div>
              <div className={playerIconClass}>{emoji}</div>
              <div className={playerNicknameClass}>{p.nickname}</div>
            </div>
          );
        })}
        <div style={{ '--value': 0 } as StyleWithValue} className={cx(onArcClass, edgeClass)}>
          0
        </div>
        <div style={{ '--value': 100 } as StyleWithValue} className={cx(onArcClass, edgeClass)}>
          100
        </div>
      </div>
    </div>
  );
}
