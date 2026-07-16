import { $, escapeHtml } from '../dom';
import { ui } from '../UIManager';
import { profileManager } from '../../core/ProfileManager';
import { AVATAR_EMOJI } from '../../data/constants';
import { openProfileViewer } from './profileViewer';
import { openProfileEditor } from './profileEditor';

export function initProfilesScreen(): void {
  $('btn-profiles-back').addEventListener('click', () => ui.navigate('screen-home'));
  $('btn-create-profile').addEventListener('click', () => openProfileEditor(null));

  $('profile-list').addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'select') {
      profileManager.select(id);
      ui.navigate('screen-home');
    } else if (btn.dataset.action === 'view') {
      openProfileViewer(id);
    }
  });

  ui.register('screen-profiles', render);
}

function render(): void {
  const activeId = profileManager.active.id;
  $('profile-list').innerHTML = profileManager
    .list()
    .map(
      (p) => `
        <div class="flex items-center gap-3 bg-white p-3 rounded-3xl shadow-sm border ${p.id === activeId ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-100'}">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-white ${p.color}">
                ${AVATAR_EMOJI[p.avatar]}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-slate-800 truncate">${escapeHtml(p.name)}</h3>
                <p class="text-xs text-slate-400 font-medium">Best: ${p.highScore}</p>
            </div>
            <button data-action="select" data-id="${p.id}" class="px-3 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 active:bg-slate-200">
                Select
            </button>
            <button data-action="view" data-id="${p.id}" class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:bg-slate-200">
                <span class="material-symbols-rounded text-xl">visibility</span>
            </button>
        </div>`
    )
    .join('');
}
