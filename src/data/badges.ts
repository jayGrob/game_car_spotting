import type { BadgeDefinition } from '../types';

/**
 * Item ids from src/data/inventory.ts. Ids are permanent handles (an item's id
 * is never reused or renumbered), so referencing them here is safe — but if an
 * item is ever deleted outright, the badge that depends on it becomes
 * unearnable, so check this file before removing an item.
 */
const SEMI_TRUCK = 9;
const RAINBOW = 28;

/**
 * The achievement catalog. Display order is the order below, so keep related
 * badges grouped — the profile screen renders this list top to bottom and kids
 * read it as "what can I chase next?".
 *
 * Rules are pure predicates over BadgeContext. Once a badge is earned it is
 * never taken away, so a rule only has to describe the moment of unlocking
 * rather than a permanent state.
 */
export const BADGES: BadgeDefinition[] = [
  // ---------- Score progression (within a single trip) ----------
  {
    id: 'century',
    name: 'Century',
    description: 'Score 100 points in a single trip',
    icon: 'military_tech',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    rule: (c) => c.tripScore >= 100
  },
  {
    id: 'score-star',
    name: 'Score Star',
    description: 'Score 250 points in a single trip',
    icon: 'stars',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    rule: (c) => c.tripScore >= 250
  },
  {
    id: 'road-legend',
    name: 'Road Legend',
    description: 'Score 500 points in a single trip',
    icon: 'workspace_premium',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    rule: (c) => c.tripScore >= 500
  },

  // ---------- Bonus mastery (within a single trip) ----------
  // These are a deliberate ladder to grow into: only 19 items currently carry a
  // bonus, so the top tiers aren't reachable until the inventory grows. The
  // validator in .claude/skills/manage-spotting-items reports which tiers are
  // still out of reach as items are added.
  {
    id: 'bonus-hunter',
    name: 'Bonus Hunter',
    description: 'Land 5 bonuses in a single trip',
    icon: 'bolt',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    rule: (c) => c.tripBonuses >= 5
  },
  {
    id: 'bonus-pro',
    name: 'Bonus Pro',
    description: 'Land 10 bonuses in a single trip',
    icon: 'offline_bolt',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    rule: (c) => c.tripBonuses >= 10
  },
  {
    id: 'bonus-master',
    name: 'Bonus Master',
    description: 'Land 15 bonuses in a single trip',
    icon: 'electric_bolt',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    rule: (c) => c.tripBonuses >= 15
  },
  {
    id: 'bonus-champion',
    name: 'Bonus Champion',
    description: 'Land 20 bonuses in a single trip',
    icon: 'flash_on',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    rule: (c) => c.tripBonuses >= 20
  },
  {
    id: 'bonus-legend',
    name: 'Bonus Legend',
    description: 'Land 25 bonuses in a single trip',
    icon: 'thunderstorm',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    rule: (c) => c.tripBonuses >= 25
  },

  // ---------- Trips played ----------
  {
    id: 'first-trip',
    name: 'First Adventure',
    description: 'Finish your first trip',
    icon: 'flag',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    rule: (c) => c.tripsPlayed >= 1
  },
  {
    id: 'trips-5',
    name: 'Road Tripper',
    description: 'Finish 5 trips',
    icon: 'map',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    rule: (c) => c.tripsPlayed >= 5
  },
  {
    id: 'trips-10',
    name: 'Seasoned Spotter',
    description: 'Finish 10 trips',
    icon: 'explore',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    rule: (c) => c.tripsPlayed >= 10
  },
  {
    id: 'trips-25',
    name: 'Road Warrior',
    description: 'Finish 25 trips',
    icon: 'shield',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    rule: (c) => c.tripsPlayed >= 25
  },

  // ---------- Spotting feats ----------
  {
    id: 'big-rig-hunter',
    name: 'Big Rig Hunter',
    description: 'Spot a semi truck on 5 different trips',
    icon: 'local_shipping',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    rule: (c) => c.itemTrips(SEMI_TRUCK) >= 5
  },
  {
    id: 'lucky',
    name: 'Lucky',
    description: 'Spot a rainbow',
    icon: 'looks',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    rule: (c) => c.itemTrips(RAINBOW) >= 1
  }
];

const byId = new Map(BADGES.map((b) => [b.id, b]));

export function getBadge(id: string): BadgeDefinition | undefined {
  return byId.get(id);
}
