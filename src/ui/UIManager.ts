export type ScreenId =
  | 'screen-home'
  | 'screen-profiles'
  | 'screen-profile-viewer'
  | 'screen-profile-editor'
  | 'screen-game-config'
  | 'screen-game'
  | 'screen-end-trip';

/**
 * Minimal view router: exactly one `.screen` section is visible at a time.
 * Screens register an onShow callback that re-renders them from current state,
 * so navigation is always "navigate, then render fresh".
 */
class UIManager {
  private onShowHandlers = new Map<ScreenId, () => void>();

  register(id: ScreenId, onShow: () => void): void {
    this.onShowHandlers.set(id, onShow);
  }

  navigate(id: ScreenId): void {
    document.querySelectorAll<HTMLElement>('.screen').forEach((el) => {
      el.classList.toggle('active', el.id === id);
    });
    window.scrollTo(0, 0);
    this.onShowHandlers.get(id)?.();
  }
}

export const ui = new UIManager();
