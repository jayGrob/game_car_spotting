import type { AvatarId, BadgeDefinition, EarnedBadge, Profile, ProfileColor, TripSummary } from '../types';
import { storage } from '../storage/storage';
import { DEFAULT_AVATAR, DEFAULT_COLOR, HISTORY_LIMIT } from '../data/constants';
import { buildContext, newlyEarned, type TripSnapshot } from './badges';

const PROFILES_KEY = 'profiles';
const ACTIVE_KEY = 'activeProfileId';

export interface ProfileDraft {
  id: number | null;
  name: string;
  avatar: AvatarId;
  color: ProfileColor;
}

/**
 * Owns the list of player profiles and the active selection.
 * Every mutation is written straight through to localStorage.
 */
class ProfileManager {
  private profiles: Profile[];
  private activeId: number;

  constructor() {
    const stored = storage.get<Profile[]>(PROFILES_KEY, []);
    const loaded = Array.isArray(stored) && stored.length > 0 ? stored : [this.createDefaultProfile()];
    this.profiles = loaded.map((p) => this.normalize(p));
    this.profiles.forEach((p) => this.awardRetroactive(p));

    const storedActive = storage.get<number>(ACTIVE_KEY, this.profiles[0].id);
    this.activeId = this.profiles.some((p) => p.id === storedActive) ? storedActive : this.profiles[0].id;

    this.persist();
  }

  private createDefaultProfile(): Profile {
    return {
      id: 1,
      name: 'Explorer',
      avatar: DEFAULT_AVATAR,
      color: DEFAULT_COLOR,
      highScore: 0,
      tripsPlayed: 0,
      history: [],
      badges: [],
      itemStats: {}
    };
  }

  /**
   * Brings a stored profile up to the current shape. Saves written before
   * achievement badges existed hold `{icon, color, count}` stacks that can't be
   * mapped onto a catalog entry, so they're dropped here — awardRetroactive
   * then re-derives everything the profile's stats can still prove.
   */
  private normalize(p: Profile): Profile {
    const badges = Array.isArray(p.badges)
      ? p.badges.filter((b): b is EarnedBadge => typeof (b as EarnedBadge)?.id === 'string')
      : [];

    return {
      ...p,
      history: Array.isArray(p.history) ? p.history : [],
      badges,
      itemStats: p.itemStats && typeof p.itemStats === 'object' ? p.itemStats : {}
    };
  }

  /**
   * Awards any badge the profile's existing stats already justify. Runs on load
   * so upgrading players keep credit for trips and scores they earned before
   * this feature shipped. Item-based badges can't be recovered this way (no
   * per-item history was kept) and simply start counting from the next trip.
   */
  private awardRetroactive(p: Profile): void {
    this.grant(p, newlyEarned(buildContext(p, null), this.earnedIds(p)));
  }

  private earnedIds(p: Profile): Set<string> {
    return new Set(p.badges.map((b) => b.id));
  }

  private grant(p: Profile, badges: BadgeDefinition[]): void {
    const now = Date.now();
    for (const b of badges) p.badges.push({ id: b.id, earnedAt: now });
  }

  list(): Profile[] {
    return this.profiles;
  }

  get(id: number): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  get active(): Profile {
    return this.get(this.activeId) ?? this.profiles[0];
  }

  select(id: number): void {
    if (this.get(id)) {
      this.activeId = id;
      this.persist();
    }
  }

  /** Creates a new profile or updates an existing one; returns the saved profile. */
  upsert(draft: ProfileDraft): Profile {
    const name = draft.name.trim() || 'New Explorer';

    if (draft.id !== null) {
      const existing = this.get(draft.id);
      if (existing) {
        existing.name = name;
        existing.avatar = draft.avatar;
        existing.color = draft.color;
        this.persist();
        return existing;
      }
    }

    const nextId = this.profiles.length > 0 ? Math.max(...this.profiles.map((p) => p.id)) + 1 : 1;
    const profile: Profile = {
      id: nextId,
      name,
      avatar: draft.avatar,
      color: draft.color,
      highScore: 0,
      tripsPlayed: 0,
      history: [],
      badges: [],
      itemStats: {}
    };
    this.profiles.push(profile);
    this.persist();
    return profile;
  }

  /**
   * Checks the in-progress trip against the badge catalog and awards anything
   * it now qualifies for. Called after every spot, which is what lets a badge
   * pop the moment the player crosses a threshold.
   */
  awardForTrip(trip: TripSnapshot): BadgeDefinition[] {
    const profile = this.active;
    const fresh = newlyEarned(buildContext(profile, trip), this.earnedIds(profile));
    if (fresh.length > 0) {
      this.grant(profile, fresh);
      this.persist();
    }
    return fresh;
  }

  /**
   * Applies a finished trip to the active profile: increments trips played,
   * updates the high score and score history, folds the trip's spots into
   * lifetime item stats, then awards any badge that only becomes true once the
   * trip counts (the trips-played milestones).
   */
  recordTrip(summary: TripSummary): { isNewHighScore: boolean; newBadges: BadgeDefinition[] } {
    const profile = this.active;

    profile.tripsPlayed += 1;

    const isNewHighScore = summary.score > profile.highScore;
    if (isNewHighScore) profile.highScore = summary.score;

    profile.history.push(summary.score);
    while (profile.history.length > HISTORY_LIMIT) profile.history.shift();

    // An item can only be spotted once per trip, so each id bumps both counters by one.
    for (const id of summary.spottedItemIds) {
      const key = String(id);
      const stat = profile.itemStats[key] ?? { total: 0, trips: 0 };
      stat.total += 1;
      stat.trips += 1;
      profile.itemStats[key] = stat;
    }

    const newBadges = this.awardForTrip({
      score: summary.score,
      bonuses: summary.bonusesEarned,
      spottedItemIds: summary.spottedItemIds,
      counted: true
    });

    this.persist();
    return { isNewHighScore, newBadges };
  }

  private persist(): void {
    storage.set(PROFILES_KEY, this.profiles);
    storage.set(ACTIVE_KEY, this.activeId);
  }
}

export const profileManager = new ProfileManager();
