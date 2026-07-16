import { $ } from '../dom';
import { ui } from '../UIManager';
import { gameState } from '../../core/GameState';
import { profileManager } from '../../core/ProfileManager';
import { soundManager } from '../../audio/SoundManager';
import { playCelebration } from '../effects';
import { AVATAR_EMOJI, AUTO_END_DELAY_MS, BADGE_TOAST_MS, SPOT_ANIMATION_MS } from '../../data/constants';
import type { BadgeDefinition, InventoryItem } from '../../types';
import { showEndTrip } from './endTrip';

type Filter = 'all' | 'vehicle' | 'object';

// Transient (per-visit) UI state; the durable game state lives in GameState.
let currentFilter: Filter = 'all';
let hideCompleted = false;
let popoverOpen = false;
let activeItem: InventoryItem | null = null;
let endScheduled = false;
let toastTimer: number | undefined;

export function initGameScreen(): void {
  $('btn-end-game').addEventListener('click', endGame);

  $('btn-toggle-sound').addEventListener('click', () => {
    soundManager.toggleMuted();
    syncSoundIcon();
  });

  $('game-avatar-bg').addEventListener('click', togglePopover);

  document.querySelectorAll<HTMLElement>('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter as Filter));
  });

  $('hide-toggle').addEventListener('click', () => {
    hideCompleted = !hideCompleted;
    syncHideButton();
    renderGrid();
  });

  $('items-grid').addEventListener('click', (event) => {
    if (popoverOpen) togglePopover();
    const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-item-id]');
    if (!btn) return;
    const item = gameState.items.find((i) => i.id === Number(btn.dataset.itemId));
    if (item && !gameState.getSpot(item.id)) openSheet(item);
  });

  $('sheet-bonus-container').addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-mult]');
    if (!btn) return;
    confirmSpot(Number(btn.dataset.mult), btn.dataset.bonus === 'true');
  });

  $('btn-sheet-cancel').addEventListener('click', closeSheet);
  $('overlay').addEventListener('click', closeSheet);

  ui.register('screen-game', onShow);
}

/** Re-renders the whole game screen from GameState (fresh launch or resume). */
function onShow(): void {
  currentFilter = 'all';
  hideCompleted = false;
  popoverOpen = false;
  activeItem = null;
  endScheduled = false;

  closeSheet();
  hideBadgeToast();
  syncFilterButtons();
  syncHideButton();
  syncPopoverVisibility();
  syncSoundIcon();

  const p = profileManager.active;
  $('game-avatar-bg').className = `w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white ${p.color} active:scale-95 transition-transform`;
  $('game-avatar-icon').innerText = AVATAR_EMOJI[p.avatar];

  $('progress-total').innerText = String(gameState.totalCount);
  updateCounters();
  renderGrid();
  updateProgress();
}

function updateCounters(): void {
  $('score-display').innerText = String(gameState.score);
  $('bonus-counter').innerText = String(gameState.bonusesEarned);
  $('badge-counter').innerText = String(gameState.badgesEarned);
}

function updateProgress(): void {
  const total = gameState.totalCount;
  const found = gameState.foundCount;
  $('progress-text').innerText = String(found);
  $('progress-fill').style.width = total === 0 ? '0%' : `${(found / total) * 100}%`;

  // Auto-end the trip shortly after the last item is found.
  if (gameState.isComplete && !endScheduled) {
    endScheduled = true;
    setTimeout(endGame, AUTO_END_DELAY_MS);
  }
}

function renderGrid(): void {
  if (!gameState.isActive) return;

  let displayItems = gameState.items;
  if (currentFilter !== 'all') displayItems = displayItems.filter((i) => i.category === currentFilter);
  if (hideCompleted) displayItems = displayItems.filter((i) => !gameState.getSpot(i.id));

  $('items-grid').innerHTML = displayItems
    .map((item) => {
      const spotData = gameState.getSpot(item.id);
      const isFound = !!spotData;
      const hasBonusDef = !!item.bonus;

      const iconBgClass = isFound ? 'bg-slate-100' : item.bg;
      const iconColorClass = isFound ? 'text-slate-300' : item.color;

      let boltHtml = '';
      if (hasBonusDef) {
        if (!isFound) {
          boltHtml = `<div class="absolute top-2 left-2 w-7 h-7 rounded-full bg-yellow-50 border-[3px] border-yellow-400 flex items-center justify-center shadow-sm">
                          <span class="material-symbols-rounded text-yellow-500 symbol-outline text-sm">bolt</span>
                      </div>`;
        } else if (spotData.bonusActivated) {
          boltHtml = `<div class="absolute top-2 left-2 w-7 h-7 rounded-full bg-yellow-400 border-[2px] border-yellow-300 flex items-center justify-center bonus-glow z-10">
                          <span class="material-symbols-rounded text-white text-sm">bolt</span>
                      </div>`;
        } else {
          boltHtml = `<div class="absolute top-2 left-2 w-7 h-7 rounded-full bg-slate-100 border-[2px] border-slate-300 flex items-center justify-center">
                          <span class="material-symbols-rounded text-slate-400 symbol-outline text-sm">bolt</span>
                      </div>`;
        }
      }

      return `
        <button data-item-id="${item.id}" class="flex flex-col items-center justify-center p-5 bg-white rounded-3xl shadow-sm border ${isFound ? 'border-green-400 opacity-90' : 'border-slate-100 active:scale-95'} transition-all relative overflow-hidden h-36">
            ${boltHtml}
            <div class="w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center mb-3 transition-colors">
                <span class="material-symbols-rounded text-3xl ${iconColorClass} transition-colors">${item.icon}</span>
            </div>
            <span class="font-bold ${isFound ? 'text-slate-400' : 'text-slate-700'} text-sm text-center leading-tight px-1 transition-colors">${item.name}</span>
            ${isFound ? `<div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm"><span class="material-symbols-rounded text-white text-sm">check</span></div>` : ''}
            <div id="check-${item.id}" class="absolute inset-0 bg-white/90 backdrop-blur-sm hidden flex-col items-center justify-center z-10">
                <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg mb-2"><span class="material-symbols-rounded text-white text-xl">check</span></div>
                ${hasBonusDef ? `<span class="text-xs font-bold text-green-600" id="bonus-msg-${item.id}"></span>` : ''}
            </div>
        </button>`;
    })
    .join('');
}

// ---------- Filters / toggles ----------

function setFilter(filter: Filter): void {
  currentFilter = filter;
  syncFilterButtons();
  renderGrid();
}

function syncFilterButtons(): void {
  document.querySelectorAll<HTMLElement>('.filter-btn').forEach((btn) => {
    const isActive = btn.dataset.filter === currentFilter;
    btn.classList.toggle('active', isActive);
    btn.classList.toggle('border-slate-600', !isActive);
    btn.classList.toggle('text-slate-300', !isActive);
  });
}

function syncHideButton(): void {
  $('hide-toggle').classList.toggle('active', hideCompleted);
  $('hide-icon').innerText = hideCompleted ? 'visibility_off' : 'visibility';
  $('hide-text').innerText = hideCompleted ? 'Show Found' : 'Hide Found';
}

function syncSoundIcon(): void {
  const icon = $('sound-icon');
  icon.innerText = soundManager.muted ? 'volume_off' : 'volume_up';
  icon.classList.toggle('text-slate-300', soundManager.muted);
}

// ---------- Profile popover ----------

function togglePopover(): void {
  popoverOpen = !popoverOpen;
  if (popoverOpen) {
    const p = profileManager.active;
    $('popover-name').innerText = p.name;
    $('popover-highscore').innerText = String(p.highScore);
    $('popover-trips').innerText = String(p.tripsPlayed);
  }
  syncPopoverVisibility();
}

function syncPopoverVisibility(): void {
  const pop = $('profile-popover');
  if (popoverOpen) {
    pop.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-2');
    pop.classList.add('opacity-100', 'translate-y-0');
  } else {
    pop.classList.add('opacity-0', 'pointer-events-none', '-translate-y-2');
    pop.classList.remove('opacity-100', 'translate-y-0');
  }
}

// ---------- Bottom sheet / spotting ----------

function openSheet(item: InventoryItem): void {
  activeItem = item;
  if (popoverOpen) togglePopover();

  $('sheet-title').innerText = item.name;
  $('sheet-points').innerText = String(item.points);
  const iconEl = $('sheet-icon');
  iconEl.innerText = item.icon;
  iconEl.className = `material-symbols-rounded text-5xl mb-2 ${item.color}`;

  const container = $('sheet-bonus-container');
  if (item.bonus) {
    const b = item.bonus;
    const gridCols = b.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3';
    const buttonsHtml = b.options
      .map((opt) => {
        const bgClass = opt.isBonus
          ? 'bg-amber-100 text-amber-700 border-2 border-amber-200 active:bg-amber-200'
          : 'bg-slate-100 text-slate-700 active:bg-slate-200';
        return `<button data-mult="${opt.mult}" data-bonus="${!!opt.isBonus}" class="py-4 rounded-2xl font-bold text-sm leading-tight flex flex-col items-center justify-center px-2 ${bgClass}">
                    <span>${opt.label}</span>
                    ${opt.isBonus ? `<span class="text-xs font-black mt-1">x${opt.mult} Points</span>` : ''}
                </button>`;
      })
      .join('');
    container.innerHTML = `
        <div class="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-2">
            <div class="flex items-center justify-center gap-2 mb-4">
                <span class="material-symbols-rounded text-amber-500">bolt</span>
                <h3 class="text-sm font-bold text-amber-800 uppercase tracking-wider">${b.question}</h3>
            </div>
            <div class="grid ${gridCols} gap-3">${buttonsHtml}</div>
        </div>`;
  } else {
    container.innerHTML = `
        <button data-mult="1" data-bonus="false" class="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-200 active:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-rounded">search_check</span> Spot It!
        </button>`;
  }

  const overlay = $('overlay');
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('opacity-100'), 10);
  $('bottom-sheet').classList.add('sheet-open');
}

function closeSheet(): void {
  $('bottom-sheet').classList.remove('sheet-open');
  const overlay = $('overlay');
  overlay.classList.remove('opacity-100');
  setTimeout(() => overlay.classList.add('hidden'), 300);
  activeItem = null;
}

function confirmSpot(multiplier: number, bonusActivated: boolean): void {
  if (!activeItem || !gameState.isActive) return;
  const item = activeItem;

  gameState.spot(item, multiplier, bonusActivated);

  // The spot may have pushed the trip past a badge threshold (score, or an item
  // milestone like the 5th trip with a semi truck) — check before repainting so
  // the badge counter and the toast land in the same frame as the new score.
  const fresh = profileManager.awardForTrip({
    score: gameState.score,
    bonuses: gameState.bonusesEarned,
    spottedItemIds: gameState.spottedItemIds,
    counted: false
  });
  gameState.recordBadges(fresh.map((b) => b.id));
  updateCounters();

  if (bonusActivated) playCelebration();
  if (fresh.length > 0) showBadgeToast(fresh, !bonusActivated);

  const checkOverlay = document.getElementById(`check-${item.id}`);
  if (checkOverlay) {
    const msgEl = document.getElementById(`bonus-msg-${item.id}`);
    if (msgEl) {
      msgEl.innerText = bonusActivated ? 'BONUS!' : 'Spotted';
      msgEl.className = bonusActivated
        ? 'text-xs font-black text-amber-500 uppercase tracking-widest'
        : 'text-xs font-bold text-green-600 uppercase';
    }
    checkOverlay.classList.remove('hidden');
    checkOverlay.classList.add('flex');
  }

  closeSheet();
  updateProgress();
  setTimeout(renderGrid, SPOT_ANIMATION_MS);
}

// ---------- Badge unlock toast ----------

/**
 * Slides in a card naming the badge just unlocked. `withSound` is false when a
 * bonus celebration is already playing its own fanfare — two clips at once just
 * sounds like noise.
 */
function showBadgeToast(badges: BadgeDefinition[], withSound: boolean): void {
  const toast = $('badge-toast');
  toast.innerHTML = badges
    .map(
      (b) => `
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl ${b.bg} flex items-center justify-center shrink-0">
                <span class="material-symbols-rounded text-3xl ${b.color}">${b.icon}</span>
            </div>
            <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-widest text-amber-500">Badge Unlocked</p>
                <p class="font-extrabold text-slate-800 leading-tight">${b.name}</p>
                <p class="text-xs text-slate-400 leading-tight">${b.description}</p>
            </div>
        </div>`
    )
    .join('');

  toast.classList.remove('toast-hidden');
  if (withSound) soundManager.play('rainbows');

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(hideBadgeToast, BADGE_TOAST_MS);
}

function hideBadgeToast(): void {
  window.clearTimeout(toastTimer);
  $('badge-toast').classList.add('toast-hidden');
}

// ---------- End of trip ----------

function endGame(): void {
  if (!gameState.isActive) return;
  if (popoverOpen) togglePopover();
  closeSheet();
  hideBadgeToast();

  const summary = gameState.finish();
  // Recording the trip is what makes the trips-played milestones true, so any
  // badges it returns are ones only the finished trip could unlock.
  const { isNewHighScore, newBadges } = profileManager.recordTrip(summary);
  showEndTrip(
    { ...summary, badgeIds: [...summary.badgeIds, ...newBadges.map((b) => b.id)] },
    isNewHighScore
  );
}
