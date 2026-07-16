import { $ } from '../dom';
import { ui } from '../UIManager';
import { profileManager } from '../../core/ProfileManager';
import { AVATAR_EMOJI } from '../../data/constants';
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

function renderBadges(badges: { icon: string; color: string; count: number }[]): void {
  const container = $('badges-container');
  if (badges.length === 0) {
    container.innerHTML = `<p class="col-span-3 text-center text-sm font-bold text-slate-300 py-4">No badges yet. Spot bonuses to earn them!</p>`;
    return;
  }

  container.innerHTML = badges
    .map(
      (b) => `
        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center relative">
            <span class="material-symbols-rounded text-3xl ${b.color} mb-1">${b.icon}</span>
            <span class="absolute -top-2 -right-2 bg-slate-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm">x${b.count}</span>
        </div>`
    )
    .join('');
}
