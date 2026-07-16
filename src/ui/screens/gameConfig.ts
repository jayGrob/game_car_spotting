import { $ } from '../dom';
import { ui } from '../UIManager';
import { gameState } from '../../core/GameState';
import { DEFAULT_CARD_COUNT } from '../../data/constants';
import type { GameTheme } from '../../types';

let selectedTheme: GameTheme = 'surprise';
let cardCount = DEFAULT_CARD_COUNT;

export function initGameConfigScreen(): void {
  $('btn-config-back').addEventListener('click', () => ui.navigate('screen-home'));

  document.querySelectorAll<HTMLElement>('.theme-card').forEach((card) => {
    card.addEventListener('click', () => selectTheme(card.dataset.theme as GameTheme));
  });

  document.querySelectorAll<HTMLElement>('.count-btn').forEach((btn) => {
    btn.addEventListener('click', () => setCardCount(Number(btn.dataset.count)));
  });

  $('btn-launch-game').addEventListener('click', () => {
    gameState.start(selectedTheme, cardCount);
    ui.navigate('screen-game');
  });
}

function selectTheme(theme: GameTheme): void {
  selectedTheme = theme;
  document.querySelectorAll('.theme-card').forEach((el) => el.classList.remove('selected'));
  $(`theme-${theme}`).classList.add('selected');

  const surpriseOptions = $('surprise-options');
  if (theme === 'surprise') {
    surpriseOptions.style.display = 'block';
    setTimeout(() => (surpriseOptions.style.opacity = '1'), 10);
  } else {
    surpriseOptions.style.opacity = '0';
    setTimeout(() => (surpriseOptions.style.display = 'none'), 300);
  }
}

function setCardCount(count: number): void {
  cardCount = count;
  document.querySelectorAll<HTMLElement>('.count-btn').forEach((el) => {
    el.className = 'count-btn flex-1 py-3 rounded-xl font-bold bg-white text-purple-600 border border-purple-200 shadow-sm transition-colors';
  });
  $(`count-${count}`).className = 'count-btn flex-1 py-3 rounded-xl font-bold bg-purple-600 text-white shadow-md border border-purple-600 transition-colors';
}
