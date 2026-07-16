/** Shared domain types for the Car Spotting app. */

export type AvatarId = 'cruelty_free' | 'pets' | 'flutter_dash' | 'smart_toy';

export type ProfileColor =
  | 'bg-blue-500'
  | 'bg-red-500'
  | 'bg-green-500'
  | 'bg-purple-500'
  | 'bg-orange-500';

/** Themes an inventory item can be tagged with. `general` items appear in every themed trip. */
export type ItemTheme = 'city' | 'highway' | 'country' | 'general';

/** Themes the player can pick on the Trip Setup screen. */
export type GameTheme = 'city' | 'highway' | 'country' | 'surprise';

export type ItemCategory = 'vehicle' | 'object' | 'creature';

export interface BonusOption {
  label: string;
  mult: number;
  isBonus?: boolean;
}

export interface BonusChallenge {
  question: string;
  options: BonusOption[];
}

export interface InventoryItem {
  id: number;
  theme: ItemTheme;
  category: ItemCategory;
  name: string;
  points: number;
  /** Material Symbols icon name. */
  icon: string;
  /** Tailwind text color class for the icon. */
  color: string;
  /** Tailwind background class for the icon circle. */
  bg: string;
  bonus: BonusChallenge | null;
}

export interface BadgeStack {
  icon: string;
  color: string;
  count: number;
}

export interface Profile {
  id: number;
  name: string;
  avatar: AvatarId;
  color: ProfileColor;
  highScore: number;
  tripsPlayed: number;
  /** Scores of the last 15 trips, oldest first. */
  history: number[];
  badges: BadgeStack[];
}

export interface SpotRecord {
  bonusActivated: boolean;
}

/** Result of a finished trip, handed from GameState to ProfileManager and the summary screen. */
export interface TripSummary {
  score: number;
  foundCount: number;
  totalCount: number;
  bonusesEarned: number;
  badgesEarned: number;
  badgeStacks: BadgeStack[];
}
