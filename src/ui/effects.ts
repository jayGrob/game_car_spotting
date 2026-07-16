import { soundManager, type SoundName } from '../audio/SoundManager';
import { $ } from './dom';

const EFFECTS: SoundName[] = ['confetti', 'fireworks', 'rainbows', 'balloons'];
const CONFETTI_COLORS = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7'];

/**
 * Full-screen celebration for an activated bonus: picks a random effect,
 * plays its matching sound and renders throwaway animated DOM nodes into
 * the #effect-container layer.
 */
export function playCelebration(): void {
  const chosen = EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
  const container = $('effect-container');
  container.innerHTML = '';

  soundManager.play(chosen);

  if (chosen === 'confetti') {
    for (let i = 0; i < 40; i++) {
      const conf = document.createElement('div');
      conf.className = 'absolute rounded-sm';
      conf.style.width = `${Math.random() * 8 + 4}px`;
      conf.style.height = `${Math.random() * 8 + 4}px`;
      conf.style.left = `${Math.random() * 100}%`;
      conf.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      conf.style.animation = `fall ${1.5 + Math.random()}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
      container.appendChild(conf);
    }
  } else if (chosen === 'balloons') {
    const emojis = ['🎈', '🎈', '🎈', '⭐', '🎈'];
    for (let i = 0; i < 8; i++) {
      const bal = document.createElement('div');
      bal.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      bal.className = 'absolute text-5xl';
      bal.style.left = `${Math.random() * 80 + 10}%`;
      bal.style.bottom = '-50px';
      bal.style.animation = `floatUp ${2.5 + Math.random()}s ease-in forwards`;
      container.appendChild(bal);
    }
  } else if (chosen === 'fireworks') {
    for (let i = 0; i < 4; i++) {
      const fw = document.createElement('div');
      fw.innerText = '💥';
      fw.className = 'absolute text-6xl opacity-0';
      fw.style.left = `${Math.random() * 70 + 10}%`;
      fw.style.top = `${Math.random() * 50 + 10}%`;
      fw.style.animation = `popOut 1.2s ease-out ${i * 0.4}s forwards`;
      container.appendChild(fw);
    }
  } else {
    const rb = document.createElement('div');
    rb.innerText = '🌈';
    rb.className = 'absolute text-7xl opacity-0';
    rb.style.top = `${Math.random() * 40 + 20}%`;
    rb.style.left = '-30%';
    rb.style.animation = 'slideAcross 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    container.appendChild(rb);
  }

  setTimeout(() => {
    container.innerHTML = '';
  }, 3500);
}
