import { $ } from '../dom';
import { ui } from '../UIManager';
import { profileManager } from '../../core/ProfileManager';
import { AVATAR_EMOJI } from '../../data/constants';
import { BADGES } from '../../data/badges';
import type { EarnedBadge } from '../../types';
import { openProfileEditor } from './profileEditor';

let viewingProfileId: number | null = null;

export function initProfileViewerScreen(): void {
  $('btn-viewer-back').addEventListener('click', () => ui.navigate('screen-profiles'));
  $('btn-viewer-edit').addEventListener('click', () => {
    if (viewingProfileId !== null) openProfileEditor(viewingProfileId);
  });
  ui.register('screen-profile-viewer', render);
}

export function openProfileViewer(id: number): void {
  viewingProfileId = id;
  ui.navigate('screen-profile-viewer');
}

function render(): void {
  const p = viewingProfileId !== null ? profileManager.get(viewingProfileId) : undefined;
  if (!p) {
    ui.navigate('screen-profiles');
    return;
  }

  $('viewer-name').innerText = p.name;
  $('viewer-avatar-bg').className = `w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl text-white shadow-sm mb-4 ${p.color}`;
  $('viewer-avatar-icon').innerText = AVATAR_EMOJI[p.avatar];
  $('viewer-highscore').innerText = String(p.highScore);
  $('viewer-trips').innerText = String(p.tripsPlayed);

  renderChart(p.history);
  renderBadges(p.badges);
}

function renderChart(history: number[]): void {
  const container = $('chart-container');
  if (history.length === 0) {
    container.innerHTML = `<p class="w-full text-center text-sm font-bold text-slate-300 self-center">No trips yet — go spotting!</p>`;
    return;
  }

  const maxScore = Math.max(...history, 100);
  container.innerHTML = history
    .map(
      (score) => `
        <div class="flex-1 h-full flex flex-col justify-end group relative">
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">${score}</div>
            <div class="w-full bg-blue-100 rounded-t-sm" style="height: ${(score / maxScore) * 100}%">
                <div class="w-full h-full bg-blue-500 rounded-t-sm opacity-80 group-hover:opacity-100"></div>
            </div>
        </div>`
    )
    .join('');
}

/**
 * Shows the whole catalog rather than only what's been earned: a locked badge
 * still shows its icon and description, so the list doubles as the list of
 * things left to chase.
 */
function renderBadges(earnedBadges: EarnedBadge[]): void {
  const earned = new Set(earnedBadges.map((b) => b.id));
  $('badge-progress').innerText = `${earned.size} of ${BADGES.length}`;

  $('badges-container').innerHTML = BADGES.map((def) => {
    const isEarned = earned.has(def.id);
    return `
        <div class="flex items-center gap-3 py-3">
            <div class="w-11 h-11 rounded-2xl ${isEarned ? def.bg : 'bg-slate-50'} flex items-center justify-center shrink-0">
                <span class="material-symbols-rounded text-2xl ${isEarned ? def.color : 'text-slate-300'}">${def.icon}</span>
            </div>
            <div class="min-w-0 flex-1">
                <p class="font-bold text-sm ${isEarned ? 'text-slate-800' : 'text-slate-400'} leading-tight">${def.name}</p>
                <p class="text-xs ${isEarned ? 'text-slate-400' : 'text-slate-300'} leading-tight">${def.description}</p>
            </div>
            ${
              isEarned
                ? `<span class="material-symbols-rounded text-green-500 text-xl shrink-0">check_circle</span>`
                : ''
            }
        </div>`;
  }).join('');
}
