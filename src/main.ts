import './style.css';
import { registerSW } from 'virtual:pwa-register';

import { ui } from './ui/UIManager';
import { gameState } from './core/GameState';
import { initHomeScreen } from './ui/screens/home';
import { initProfilesScreen } from './ui/screens/profiles';
import { initProfileViewerScreen } from './ui/screens/profileViewer';
import { initProfileEditorScreen } from './ui/screens/profileEditor';
import { initGameConfigScreen } from './ui/screens/gameConfig';
import { initGameScreen } from './ui/screens/game';
import { initEndTripScreen } from './ui/screens/endTrip';

// Offline-first service worker (precaches app shell, font and audio).
registerSW({ immediate: true });

initHomeScreen();
initProfilesScreen();
initProfileViewerScreen();
initProfileEditorScreen();
initGameConfigScreen();
initGameScreen();
initEndTripScreen();

// Resume a trip that was in progress when the app was last closed,
// otherwise start at the home dashboard.
ui.navigate(gameState.isActive ? 'screen-game' : 'screen-home');
