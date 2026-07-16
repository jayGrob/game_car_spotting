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

/** A badge the player has unlocked, referencing a definition in data/badges.ts. */
export interface EarnedBadge {
  id: string;
  /** Epoch ms, so the UI can show the most recent first if it ever wants to. */
  earnedAt: number;
}

/** Lifetime spotting record for one inventory item. */
export interface ItemStat {
  /** Times spotted across all trips. */
  total: number;
  /** Number of distinct trips it was spotted in at least once. */
  trips: number;
}

/**
 * Everything a badge rule is allowed to look at. Assembled by core/badges.ts
 * so rules stay one-liners that read like their own description.
 */
export interface BadgeContext {
  /** Trips finished. Only includes the current trip once it has been recorded. */
  tripsPlayed: number;
  /** Score of the trip being judged (the best-ever trip when none is in play). */
  tripScore: number;
  /** Distinct trips an item has been spotted in, counting the trip in progress. */
  itemTrips: (itemId: number) => number;
  /** Times an item has been spotted overall, counting the trip in progress. */
  itemTotal: (itemId: number) => number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  /** Shown under the name — doubles as the "how do I get this?" hint while locked. */
  description: string;
  icon: string;
  color: string;
  bg: string;
  rule: (ctx: BadgeContext) => boolean;
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
  badges: EarnedBadge[];
  /** Lifetime per-item spotting stats, keyed by item id (string via JSON). */
  itemStats: Record<string, ItemStat>;
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
  /** Ids of every item spotted, so lifetime stats and badge rules can use them. */
  spottedItemIds: number[];
  /** Badges unlocked over the course of this trip (live ones, plus any at trip end). */
  badgeIds: string[];
}
