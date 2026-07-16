import type { BadgeStack, GameTheme, InventoryItem, SpotRecord, TripSummary } from '../types';
import { masterInventory, getItemById } from '../data/inventory';
import { storage } from '../storage/storage';
import { BONUSES_PER_BADGE } from '../data/constants';

const GAME_KEY = 'activeGame';

interface ActiveGame {
  theme: GameTheme;
  itemIds: number[];
  /** Keyed by item id (stringified by JSON round-trip). */
  spotted: Record<string, SpotRecord>;
  score: number;
  bonusesEarned: number;
  badgesEarned: number;
  /** Badges earned during this trip, merged into the profile at trip end. */
  badgeStacks: BadgeStack[];
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
      badgesEarned: 0,
      badgeStacks: []
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
    return this.game?.badgesEarned ?? 0;
  }

  get foundCount(): number {
    return this.game ? Object.keys(this.game.spotted).length : 0;
  }

  get totalCount(): number {
    return this.game?.itemIds.length ?? 0;
  }

  get isComplete(): boolean {
    return this.totalCount > 0 && this.foundCount === this.totalCount;
  }

  /**
   * Records a spot. Score = base points x chosen multiplier. Every
   * BONUSES_PER_BADGE activated bonuses awards a badge styled after the item
   * that triggered it.
   */
  spot(item: InventoryItem, multiplier: number, bonusActivated: boolean): void {
    if (!this.game || this.game.spotted[item.id]) return;

    this.game.score += item.points * multiplier;

    if (bonusActivated) {
      this.game.bonusesEarned += 1;
      if (this.game.bonusesEarned % BONUSES_PER_BADGE === 0) {
        this.game.badgesEarned += 1;
        const existing = this.game.badgeStacks.find((b) => b.icon === item.icon);
        if (existing) {
          existing.count += 1;
        } else {
          this.game.badgeStacks.push({ icon: item.icon, color: item.color, count: 1 });
        }
      }
    }

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
      badgesEarned: this.badgesEarned,
      badgeStacks: this.game ? [...this.game.badgeStacks] : []
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
