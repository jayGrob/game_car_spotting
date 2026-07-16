import { $ } from '../dom';
import { ui } from '../UIManager';
import { soundManager } from '../../audio/SoundManager';
import { getBadge } from '../../data/badges';
import type { TripSummary } from '../../types';

export function initEndTripScreen(): void {
  $('btn-end-new-trip').addEventListener('click', () => ui.navigate('screen-game-config'));
  $('btn-end-home').addEventListener('click', () => ui.navigate('screen-home'));
}

export function showEndTrip(summary: TripSummary, isNewHighScore: boolean): void {
  $('end-score').innerText = String(summary.score);
  $('end-items').innerText = `${summary.foundCount}/${summary.totalCount}`;
  $('end-bonuses').innerText = String(summary.bonusesEarned);
  $('end-badges').innerText = String(summary.badgeIds.length);

  $('new-highscore-badge').classList.toggle('hidden', !(isNewHighScore && summary.score > 0));

  renderBadges(summary.badgeIds);

  ui.navigate('screen-end-trip');

  if (summary.score > 0) soundManager.play('balloons');
}

/** Names the badges unlocked this trip. Hidden entirely when there were none. */
function renderBadges(badgeIds: string[]): void {
  const section = $('end-badges-list');
  const badges = badgeIds.map(getBadge).filter((b) => b !== undefined);

  section.classList.toggle('hidden', badges.length === 0);
  if (badges.length === 0) return;

  $('end-badges-items').innerHTML = badges
    .map(
      (b) => `
        <div class="bg-white/15 border border-white/20 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-sm">
            <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <span class="material-symbols-rounded text-2xl ${b.color}">${b.icon}</span>
            </div>
            <div class="min-w-0">
                <p class="font-bold text-white leading-tight">${b.name}</p>
                <p class="text-xs text-blue-200 leading-tight">${b.description}</p>
            </div>
        </div>`
    )
    .join('');
}
