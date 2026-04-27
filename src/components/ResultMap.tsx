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
type StyleWithValue = CSSProperties & { '--value': number; '--player-ratio'?: number };

// --value (0..100) を inline style で受け取り、arc 上に
// transform: translate で配置するための共有計算 (player / edge 共通)。
// top/left を動かさないので value 変化時も layout/paint を回避し composite だけで済む
const onArcClass = css({
  position: 'absolute',
  top: 0,
  left: 0,

  // ユーザー人数に応じて半径を変える。人数が多いときは小さくして詰める。
  // --player-ratio は 0(外周)〜1(内側) の比率で、JS 側で計算する(N=1 で 0/0 を避けるため)
  '--radius': 'calc(50cqw - var(--player-ratio, 1) * 12cqw)',

  '--angle': 'calc(var(--min-angle) + var(--value) * (var(--max-angle) - var(--min-angle)) / 100)',
  '--x': 'calc(50cqw + var(--radius) * sin(var(--angle)))',
  '--y': 'calc(50cqh - var(--radius) * cos(var(--angle)))',
});

const edgeClass = css({
  fontSize: 'xs',
  fontWeight: 600,
  color: 'textMuted',
  // 中央x揃え + 点から 18px 下へ
  transform: 'translate(calc(var(--x) - 50%), calc(var(--y) + 18px))',
  pointerEvents: 'none',
});

export function ResultMap({ players }: Props) {
  return (
    <div
      className={css({
        width: '100%',
        padding: '6',
      })}
    >
      <div
        // 外側コンテナ。aspect-ratio で arc が乗る舞台のサイズを確定させる
        className={css({
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '3 / 1',
        })}
      >
        <div
          // arc を描画する正方形の枠。
          //   - container-type: size で内側に cqw/cqh の query container を立てる
          //   - 親より広めの正方形にして上端を揃え、頂点が見える形にする
          //   - --min-angle / --max-angle は子(arc, player, edge)が共有する角度定数
          className={css({
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
          })}
        >
          <div
            // アーチ本体。conic-gradient + radial-gradient mask で
            // 角度方向と半径方向のリング状切り抜きを実現する
            className={css({
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'conic-gradient(from 180deg, transparent 0 calc(180deg + var(--min-angle)), rgb(113 204 226) calc(180deg + var(--min-angle)), rgb(110 64 170) calc(180deg + var(--max-angle)), transparent calc(180deg + var(--max-angle)))',
              maskImage:
                'radial-gradient(closest-side, transparent 75%, black 0% 100%, transparent 50%)',
            })}
          />

          {players.map((p, index, array) => {
            const emoji = ICON_PRESETS.find((i) => i.id === p.iconId)?.emoji ?? '❓';
            return (
              <div
                key={p.id}
                style={
                  {
                    '--value': p.value,
                    '--player-ratio': array.length > 1 ? index / (array.length - 1) : 0,
                  } as StyleWithValue
                }
                className={cx(
                  onArcClass,
                  css({
                    // 中央x/y揃え
                    transform: 'translate(calc(var(--x) - 50%), calc(var(--y) - 50%))',
                    pointerEvents: 'none',
                  }),
                )}
              >
                <div
                  className={css({
                    fontSize: 'xs',
                    color: '#fff',
                    marginTop: '-1',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    lineHeight: 1,
                    marginBottom: '1',
                  })}
                >
                  {p.nickname}
                </div>
                <div
                  className={css({
                    display: 'grid',
                    width: '14',
                    height: '14',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    borderRadius: '50%',
                    aspectRatio: '1',
                    background: 'rgba(255 255 255)',
                    border: '4px solid #000',
                    overflow: 'hidden',
                  })}
                >
                  <div>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'xl',
                        lineHeight: 1,
                      })}
                    >
                      {emoji}
                    </div>
                  </div>
                  <div
                    className={css({
                      width: '100%',
                      background: '#000',
                      color: '#fff',
                      fontSize: 'md',
                      fontWeight: 700,
                      lineHeight: 1,
                    })}
                  >
                    {p.value}
                  </div>
                </div>
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
    </div>
  );
}
