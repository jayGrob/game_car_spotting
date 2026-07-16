import type { GameTheme, InventoryItem, SpotRecord, TripSummary } from '../types';
import { masterInventory, getItemById } from '../data/inventory';
import { storage } from '../storage/storage';

const GAME_KEY = 'activeGame';

interface ActiveGame {
  theme: GameTheme;
  itemIds: number[];
  /** Keyed by item id (stringified by JSON round-trip). */
  spotted: Record<string, SpotRecord>;
  score: number;
  bonusesEarned: number;
  /** Badges unlocked so far this trip. Awarding itself is ProfileManager's job. */
  badgeIds: string[];
}

function shuffle<T>(source: T[]): T[] {
  const arr = [...source];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * The active trip. Persisted to localStorage on every mutation so a game in
 * progress survives a page reload or the browser being killed mid-drive.
 */
class GameState {
  private game: ActiveGame | null;

  constructor() {
    this.game = storage.get<ActiveGame | null>(GAME_KEY, null);
    if (this.game && !Array.isArray(this.game.itemIds)) this.game = null;
    // A trip saved before achievement badges existed has no badgeIds array.
    if (this.game && !Array.isArray(this.game.badgeIds)) this.game.badgeIds = [];
  }

  get isActive(): boolean {
    return this.game !== null;
  }

  start(theme: GameTheme, cardCount: number): void {
    let items: InventoryItem[];
    if (theme === 'surprise') {
      items = shuffle(masterInventory).slice(0, cardCount);
    } else {
      items = masterInventory.filter((i) => i.theme === theme || i.theme === 'general');
      if (items.length === 0) items = [...masterInventory];
    }

    this.game = {
      theme,
      itemIds: items.map((i) => i.id),
      spotted: {},
      score: 0,
      bonusesEarned: 0,
      badgeIds: []
    };
    this.persist();
  }

  get items(): InventoryItem[] {
    if (!this.game) return [];
    return this.game.itemIds
      .map((id) => getItemById(id))
      .filter((i): i is InventoryItem => i !== undefined);
  }

  getSpot(itemId: number): SpotRecord | undefined {
    return this.game?.spotted[itemId];
  }

  get score(): number {
    return this.game?.score ?? 0;
  }

  get bonusesEarned(): number {
    return this.game?.bonusesEarned ?? 0;
  }

  get badgesEarned(): number {
    return this.game?.badgeIds.length ?? 0;
  }

  get badgeIds(): string[] {
    return this.game ? [...this.game.badgeIds] : [];
  }

  /** Notes badges ProfileManager just awarded, so the trip can report them. */
  recordBadges(ids: string[]): void {
    if (!this.game || ids.length === 0) return;
    this.game.badgeIds.push(...ids);
    this.persist();
  }

  get foundCount(): number {
    return this.game ? Object.keys(this.game.spotted).length : 0;
  }

  get spottedItemIds(): number[] {
    return this.game ? Object.keys(this.game.spotted).map(Number) : [];
  }

  get totalCount(): number {
    return this.game?.itemIds.length ?? 0;
  }

  get isComplete(): boolean {
    return this.totalCount > 0 && this.foundCount === this.totalCount;
  }

  /**
   * Records a spot. Score = base points x chosen multiplier. Badges are not
   * decided here — they depend on lifetime profile stats, so the caller runs
   * the badge check against ProfileManager once the spot has landed.
   */
  spot(item: InventoryItem, multiplier: number, bonusActivated: boolean): void {
    if (!this.game || this.game.spotted[item.id]) return;

    this.game.score += item.points * multiplier;
    if (bonusActivated) this.game.bonusesEarned += 1;

    this.game.spotted[item.id] = { bonusActivated };
    this.persist();
  }

  /** Ends the trip, clears the persisted game and returns the summary. */
  finish(): TripSummary {
    const summary: TripSummary = {
      score: this.score,
      foundCount: this.foundCount,
      totalCount: this.totalCount,
      bonusesEarned: this.bonusesEarned,
      spottedItemIds: this.spottedItemIds,
      badgeIds: this.badgeIds
    };
    this.game = null;
    this.persist();
    return summary;
  }

  private persist(): void {
    if (this.game) {
      storage.set(GAME_KEY, this.game);
    } else {
      storage.remove(GAME_KEY);
    }
  }
}

export const gameState = new GameState();
