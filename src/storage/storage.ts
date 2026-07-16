/**
 * Thin, versioned localStorage wrapper.
 *
 * All keys are namespaced and every read is guarded: a missing key, corrupt
 * JSON, or a disabled localStorage (private browsing quota, etc.) always
 * resolves to the caller-provided fallback instead of throwing mid-game.
 */

const NAMESPACE = 'car-spotting';
const SCHEMA_VERSION = 1;
const PREFIX = `${NAMESPACE}.v${SCHEMA_VERSION}.`;

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      // Quota exceeded / storage disabled: the game keeps running in memory.
      console.warn(`[storage] Failed to persist "${key}"`, err);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  }
};
