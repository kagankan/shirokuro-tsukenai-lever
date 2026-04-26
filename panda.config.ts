import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // CSSリセットを Panda 側で当てる
  preflight: true,

  // Panda が走査する対象ファイル
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  // styled-system/jsx を使うなら必要らしい
  jsxFramework: "react",

  // プロジェクト固有の condition を追加。
  // _hoverNotFocus: hover中だが focus されていない状態。:where() で specificity 寄与を 0 に
  // 抑えて _focus と同 specificity に揃え、focus との優先衝突を回避する。
  conditions: {
    extend: {
      hoverNotFocus: "&:hover:where(:not(:focus))",
    },
  },

  theme: {
    extend: {
      tokens: {
        colors: {
          // 値として既存の var(--text) 等を指す。
          // Panda は --colors-text = var(--text) のように間接参照を生成する。
          // → 既存の :root 定義 (index.css) はそのまま、Panda 側からは
          //   `css({ color: 'text' })` で型付き補完できる。
          text: { value: "var(--text)" },
          textMuted: { value: "var(--text-muted)" },
          bg: { value: "var(--bg)" },
          surface: { value: "var(--surface)" },
          border: { value: "var(--border)" },
          accent: { value: "var(--accent)" },
          accentText: { value: "var(--accent-text)" },
        },
      },
    },
  },

  outdir: "styled-system",
});
