import { $ } from '../dom';
import { ui } from '../UIManager';
import { profileManager } from '../../core/ProfileManager';
import { DEFAULT_AVATAR, DEFAULT_COLOR } from '../../data/constants';
import type { AvatarId, ProfileColor } from '../../types';
import { openProfileViewer } from './profileViewer';

let editingProfileId: number | null = null;
let tempAvatar: AvatarId = DEFAULT_AVATAR;
let tempColor: ProfileColor = DEFAULT_COLOR;

export function initProfileEditorScreen(): void {
  $('btn-editor-back').addEventListener('click', () => {
    if (editingProfileId !== null) {
      openProfileViewer(editingProfileId);
    } else {
      ui.navigate('screen-profiles');
    }
  });

  $('avatar-options').addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-avatar]');
    if (btn) selectAvatar(btn.dataset.avatar as AvatarId);
  });

  $('color-options').addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-color]');
    if (btn) selectColor(btn.dataset.color as ProfileColor);
  });

  $('btn-save-profile').addEventListener('click', save);
}

/** Opens the editor for an existing profile (id) or in create mode (null). */
export function openProfileEditor(id: number | null): void {
  editingProfileId = id;
  const input = $('profile-name-input') as HTMLInputElement;
  const statsDiv = $('profile-stats');

  const existing = id !== null ? profileManager.get(id) : undefined;
  if (existing) {
    $('editor-title').innerText = 'Edit Explorer';
    input.value = existing.name;
    selectAvatar(existing.avatar);
    selectColor(existing.color);
    statsDiv.classList.remove('hidden');
    $('stat-highscore').innerText = String(existing.highScore);
    $('stat-trips').innerText = String(existing.tripsPlayed);
  } else {
    editingProfileId = null;
    $('editor-title').innerText = 'New Explorer';
    input.value = '';
    selectAvatar(DEFAULT_AVATAR);
    selectColor(DEFAULT_COLOR);
    statsDiv.classList.add('hidden');
  }

  ui.navigate('screen-profile-editor');
}

function selectAvatar(avatar: AvatarId): void {
  tempAvatar = avatar;
  document.querySelectorAll('.avatar-option').forEach((el) => el.classList.remove('selected'));
  $(`avatar-${avatar}`).classList.add('selected');
}

function selectColor(color: ProfileColor): void {
  tempColor = color;
  document.querySelectorAll('.color-option').forEach((el) => el.classList.remove('selected'));
  $(`color-${color}`).classList.add('selected');
}

function save(): void {
  const name = ($('profile-name-input') as HTMLInputElement).value;
  const wasEditing = editingProfileId !== null;

  const profile = profileManager.upsert({
    id: editingProfileId,
    name,
    avatar: tempAvatar,
    color: tempColor
  });
  profileManager.select(profile.id);

  if (wasEditing) {
    openProfileViewer(profile.id);
  } else {
    ui.navigate('screen-home');
  }
}
