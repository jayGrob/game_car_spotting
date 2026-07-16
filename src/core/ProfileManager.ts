import type { AvatarId, Profile, ProfileColor, TripSummary } from '../types';
import { storage } from '../storage/storage';
import { DEFAULT_AVATAR, DEFAULT_COLOR, HISTORY_LIMIT } from '../data/constants';

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
    this.profiles = Array.isArray(stored) && stored.length > 0 ? stored : [this.createDefaultProfile()];

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
      badges: []
    };
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
      badges: []
    };
    this.profiles.push(profile);
    this.persist();
    return profile;
  }

  /**
   * Applies a finished trip to the active profile: increments trips played,
   * updates the high score, appends to score history (capped) and merges any
   * badges earned during the trip. Returns whether a new high score was set.
   */
  recordTrip(summary: TripSummary): { isNewHighScore: boolean } {
    const profile = this.active;

    profile.tripsPlayed += 1;

    const isNewHighScore = summary.score > profile.highScore;
    if (isNewHighScore) profile.highScore = summary.score;

    profile.history.push(summary.score);
    while (profile.history.length > HISTORY_LIMIT) profile.history.shift();

    for (const stack of summary.badgeStacks) {
      const existing = profile.badges.find((b) => b.icon === stack.icon);
      if (existing) {
        existing.count += stack.count;
      } else {
        profile.badges.push({ ...stack });
      }
    }

    this.persist();
    return { isNewHighScore };
  }

  private persist(): void {
    storage.set(PROFILES_KEY, this.profiles);
    storage.set(ACTIVE_KEY, this.activeId);
  }
}

export const profileManager = new ProfileManager();
