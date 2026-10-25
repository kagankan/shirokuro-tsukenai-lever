import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

/**
 * snd-lib（https://snd.dev）のスプライト音源から、1つの効果音だけを切り出して読み込む Vite プラグイン。
 *
 *   import url from 'snd-sprite:03/transition_up';
 *
 * snd-lib はキットごとに全効果音を1本の mp3 にまとめて配布しているため、そのまま使うと
 * 約1MB になる。mp3 は約26ms ごとの「フレーム」の連続なので、必要な区間のフレームだけを
 * 取り出してつなげれば、再エンコードせずに単体の mp3 にできる。
 */

const PREFIX = 'snd-sprite:';
const RESOLVED_PREFIX = `\0${PREFIX}`;

const require = createRequire(import.meta.url);

type SpriteMap = Record<string, { start: number; end: number }>;

// MPEG-1 Layer III のビットレート（kbps）とサンプリング周波数（Hz）の表
const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const SAMPLE_RATES = [44100, 48000, 32000];
const SAMPLES_PER_FRAME = 1152;

type Frame = { offset: number; size: number; sampleRate: number };

function parseFrames(mp3: Buffer): Frame[] {
  let offset = 0;
  // 先頭の ID3v2 タグを読み飛ばす
  if (mp3.toString('latin1', 0, 3) === 'ID3') {
    offset = 10 + ((mp3[6] << 21) | (mp3[7] << 14) | (mp3[8] << 7) | mp3[9]);
  }
  const frames: Frame[] = [];
  while (offset + 4 <= mp3.length) {
    const isMpeg1Layer3 = mp3[offset] === 0xff && (mp3[offset + 1] & 0xfe) === 0xfa;
    if (!isMpeg1Layer3) break; // 末尾の ID3v1 タグなど
    const bitrate = BITRATES[mp3[offset + 2] >> 4];
    const sampleRate = SAMPLE_RATES[(mp3[offset + 2] >> 2) & 0b11];
    const padding = (mp3[offset + 2] >> 1) & 1;
    if (!bitrate || !sampleRate)
      throw new Error(`snd-sprite: 未対応の mp3 フレーム (offset ${offset})`);
    const size = Math.floor((144 * bitrate * 1000) / sampleRate) + padding;
    frames.push({ offset, size, sampleRate });
    offset += size;
  }
  return frames;
}

function sliceSprite(kit: string, key: string): Buffer {
  const pkgDir = require.resolve('snd-lib/package.json').replace(/package\.json$/, '');
  const sprites: SpriteMap = JSON.parse(
    readFileSync(`${pkgDir}dist/json/${kit}.json`, 'utf8'),
  ).spritemap;
  const sprite = sprites[key];
  if (!sprite) throw new Error(`snd-sprite: キット ${kit} に ${key} がありません`);

  const mp3 = readFileSync(`${pkgDir}assets/sounds/sprite/${kit}/audioSprite.mp3`);
  // 先頭は Xing/Info ヘッダー用のフレームで、音声は2フレーム目から始まる
  const frames = parseFrames(mp3).slice(1);
  const frameSec = SAMPLES_PER_FRAME / frames[0].sampleRate;
  // mp3 のフレームは直前のフレームのデータを参照することがある（ビットリザーバ）ため、
  // 1フレーム前から含める。スプライト内の効果音の間は無音なので、余分に含めても影響はない
  const first = Math.max(0, Math.floor(sprite.start / frameSec) - 1);
  const last = Math.ceil(sprite.end / frameSec);
  return Buffer.concat(
    frames.slice(first, last).map((f) => mp3.subarray(f.offset, f.offset + f.size)),
  );
}

export function sndSprite(): Plugin {
  let isBuild = false;
  return {
    name: 'snd-sprite',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    resolveId(id) {
      if (id.startsWith(PREFIX)) return `\0${id}`;
    },
    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return;
      const [kit, key] = id.slice(RESOLVED_PREFIX.length).split('/');
      const source = sliceSprite(kit, key);
      if (!isBuild) {
        // 開発サーバーでは data URL で渡す（ファイルとして配信する仕組みを省くため）
        return `export default ${JSON.stringify(`data:audio/mpeg;base64,${source.toString('base64')}`)};`;
      }
      const ref = this.emitFile({ type: 'asset', name: `${key}.mp3`, source });
      return `export default import.meta.ROLLUP_FILE_URL_${ref};`;
    },
  };
}
