import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // CSSリセットを Panda 側で当てる
  preflight: true,

  // Panda が走査する対象ファイル
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],

  // 以下は styled-system/jsx を使うなら必要らしい
  // jsxFramework: "react",

  // プロジェクト固有の condition を追加。
  // _hoverNotFocus: hover中だが focus されていない状態。:where() で specificity 寄与を 0 に
  // 抑えて _focus と同 specificity に揃え、focus との優先衝突を回避する。
  conditions: {
    extend: {
      hoverNotFocus: '&:hover:where(:not(:focus))',
    },
  },

  theme: {
    extend: {
      tokens: {
        colors: {
          // text と bg は index.css の base スタイル(`:root` の color/background や
          // h1,h2 の color)からも参照されるため、:root の `--text` `--bg` を介した
          // 間接参照を維持する。
          text: { value: 'var(--text)' },
          bg: { value: 'var(--bg)' },
          // 他は CSS ファイルから直接参照していないので Panda の token として直書き。
          // Panda が tokens layer で `--colors-X: <hex>` を生成し、css() からのみ参照される。
          textMuted: { value: '#8b8ba7' },
          surface: { value: '#17181f' },
          border: { value: '#2a2a3c' },
          accent: { value: '#c084fc' },
          accentText: { value: '#0e0f14' },
        },
      },
    },
  },

  outdir: 'styled-system',
});
