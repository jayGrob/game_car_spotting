import type { BadgeContext, BadgeDefinition, Profile } from '../types';
import { BADGES } from '../data/badges';

/**
 * The trip a badge check is being run against.
 *
 * `counted` is the important bit: during play the trip hasn't been folded into
 * the profile's lifetime stats yet, so the context has to add it provisionally
 * (that's what makes a badge pop the instant you spot the thing, rather than
 * only at the summary). Once ProfileManager.recordTrip has run, the stats
 * already include it and adding it again would double count.
 */
export interface TripSnapshot {
  score: number;
  bonuses: number;
  spottedItemIds: number[];
  counted: boolean;
}

export function buildContext(profile: Profile, trip: TripSnapshot | null): BadgeContext {
  // An item can only be spotted once per trip, so an uncounted trip contributes
  // at most 1 to both an item's trip count and its total.
  const provisional = (itemId: number): number =>
    trip && !trip.counted && trip.spottedItemIds.includes(itemId) ? 1 : 0;

  return {
    tripsPlayed: profile.tripsPlayed,
    // With no trip in play (a retroactive check when a profile loads), the best
    // trip the profile has ever had is the fairest thing to judge score badges
    // against — it's the only per-trip score still on record.
    tripScore: trip ? trip.score : profile.highScore,
    // Unlike score, no per-trip bonus tally was ever kept on the profile, so a
    // retroactive check has nothing to judge — bonus badges start from the next
    // trip rather than being back-dated from history that doesn't exist.
    tripBonuses: trip ? trip.bonuses : 0,
    itemTrips: (id) => (profile.itemStats[String(id)]?.trips ?? 0) + provisional(id),
    itemTotal: (id) => (profile.itemStats[String(id)]?.total ?? 0) + provisional(id)
  };
}

/** Badges the context now qualifies for that haven't been earned yet. */
export function newlyEarned(ctx: BadgeContext, earned: Set<string>): BadgeDefinition[] {
  return BADGES.filter((b) => !earned.has(b.id) && b.rule(ctx));
}
