/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** vite/sndSprite.ts が snd-lib のスプライトから切り出した効果音の URL */
declare module 'snd-sprite:*' {
  const url: string;
  export default url;
}
