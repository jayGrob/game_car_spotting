import { $ } from '../dom';
import { ui } from '../UIManager';
import { soundManager } from '../../audio/SoundManager';
import type { TripSummary } from '../../types';

export function initEndTripScreen(): void {
  $('btn-end-new-trip').addEventListener('click', () => ui.navigate('screen-game-config'));
  $('btn-end-home').addEventListener('click', () => ui.navigate('screen-home'));
}

export function showEndTrip(summary: TripSummary, isNewHighScore: boolean): void {
  $('end-score').innerText = String(summary.score);
  $('end-items').innerText = `${summary.foundCount}/${summary.totalCount}`;
  $('end-bonuses').innerText = String(summary.bonusesEarned);
  $('end-badges').innerText = String(summary.badgesEarned);

  $('new-highscore-badge').classList.toggle('hidden', !(isNewHighScore && summary.score > 0));

  ui.navigate('screen-end-trip');

  if (summary.score > 0) soundManager.play('balloons');
}
