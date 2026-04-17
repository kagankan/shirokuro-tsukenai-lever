export type IconId = (typeof ICON_PRESETS)[number]['id'];

export const ICON_PRESETS = [
  { id: 'cat', emoji: '🐱' },
  { id: 'dog', emoji: '🐶' },
  { id: 'rabbit', emoji: '🐰' },
  { id: 'bear', emoji: '🐻' },
  { id: 'fox', emoji: '🦊' },
  { id: 'penguin', emoji: '🐧' },
  { id: 'koala', emoji: '🐨' },
  { id: 'panda', emoji: '🐼' },
] as const;

export const DEFAULT_ICON: IconId = 'cat';
