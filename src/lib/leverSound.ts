/**
 * レバー操作音（「ガチャッ」）。
 *
 * snd（https://snd.dev）の SND03 "industrial"（作者: INDUSTRIAL JP）キットの
 * transition_down を、ビルド時に snd-lib のスプライトから切り出して使う
 * （vite/sndSprite.ts）。再生は Web Audio API で行う。
 *
 * ブラウザは「ユーザー操作の中で」作成・再開された AudioContext でしか音を鳴らせないため、
 * pointerdown / keydown の中で呼ばれる prepareLeverSound() で生成・resume する。
 */
import leverSoundUrl from 'snd-sprite:03/transition_down';

let ctx: AudioContext | null = null;
let bufferPromise: Promise<AudioBuffer | null> | null = null;
let current: AudioBufferSourceNode | null = null;

function loadBuffer(audio: AudioContext): Promise<AudioBuffer | null> {
  bufferPromise ??= fetch(leverSoundUrl)
    .then((res) => res.arrayBuffer())
    .then((data) => audio.decodeAudioData(data))
    .catch(() => {
      // 読み込みに失敗しても操作は続けられるよう、音なしにする。次の操作で再試行する
      bufferPromise = null;
      return null;
    });
  return bufferPromise;
}

/** ユーザー操作の開始時に呼び、AudioContext の準備と音源の読み込みを始める */
export function prepareLeverSound(): void {
  if (!ctx) {
    if (typeof AudioContext === 'undefined') return;
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  void loadBuffer(ctx);
}

export async function playLeverSound(): Promise<void> {
  if (!ctx) return;
  const buffer = await loadBuffer(ctx);
  if (!buffer) return;

  // 連続で操作したときに音が重ならないよう、前の音は止める
  current?.stop();
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);
  src.start();
  current = src;
}
