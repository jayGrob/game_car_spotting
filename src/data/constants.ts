import type { AvatarId, ProfileColor } from '../types';

/** Emoji shown inside avatar circles, keyed by avatar id. */
export const AVATAR_EMOJI: Record<AvatarId, string> = {
  cruelty_free: '🐰',
  pets: '🐶',
  flutter_dash: '🦋',
  smart_toy: '🤖'
};

export const AVATARS = Object.keys(AVATAR_EMOJI) as AvatarId[];

export const PROFILE_COLORS: ProfileColor[] = [
  'bg-blue-500',
  'bg-red-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500'
];

export const DEFAULT_AVATAR: AvatarId = 'cruelty_free';
export const DEFAULT_COLOR: ProfileColor = 'bg-blue-500';

/** Maximum number of trip scores kept per profile. */
export const HISTORY_LIMIT = 15;

/** Card counts selectable for "Surprise Me" trips. */
export const CARD_COUNTS = [8, 16, 24] as const;
export const DEFAULT_CARD_COUNT = 16;

/** Every N activated bonuses the player earns one badge. */
export const BONUSES_PER_BADGE = 2;

/** Delay before the grid re-renders after a spot (lets the check animation play). */
export const SPOT_ANIMATION_MS = 1200;

/** Delay before the game auto-ends once every item is found. */
export const AUTO_END_DELAY_MS = 1500;
