import { $ } from '../dom';
import { ui } from '../UIManager';
import { profileManager } from '../../core/ProfileManager';
import { AVATAR_EMOJI } from '../../data/constants';

export function initHomeScreen(): void {
  $('btn-home-profile').addEventListener('click', () => ui.navigate('screen-profiles'));
  $('btn-home-start').addEventListener('click', () => ui.navigate('screen-game-config'));
  ui.register('screen-home', render);
}

function render(): void {
  const p = profileManager.active;
  $('home-profile-name').innerText = p.name;
  $('home-avatar-bg').className = `w-14 h-14 rounded-full flex items-center justify-center text-white shadow-sm ${p.color}`;
  $('home-avatar-icon').innerText = AVATAR_EMOJI[p.avatar];
}
