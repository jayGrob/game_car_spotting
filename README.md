# Car Spotting 🚗

A mobile-first, offline-first PWA road-trip game for kids. Built with Vite,
vanilla TypeScript and a local Tailwind CSS v4 installation.

## Getting started

```bash
npm install        # install dependencies
npm run assets     # one-time: download audio + icon font into public/ (needs internet)
npm run dev        # dev server at http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build (service worker active)
```

> The PWA service worker only runs against a **built** app (`preview` or a real
> deploy). `npm run dev` is for fast iteration; offline behavior is tested with
> `npm run build && npm run preview`.

## Architecture

```
index.html                     All 7 screens as hidden <section class="screen"> elements
src/
  main.ts                      Entry: registers SW, wires up screens, resumes games
  types.ts                     Shared domain types
  style.css                    Tailwind v4 import + @font-face + keyframes/component CSS
  storage/storage.ts           Versioned, crash-proof localStorage wrapper
  data/
    constants.ts               Avatars, colors, tuning knobs (history cap, timings…)
    inventory.ts               Master item database (28 items across 4 themes)
    badges.ts                  Achievement catalog (name, icon, unlock rule)
  core/
    ProfileManager.ts          Profiles CRUD, active selection, trip recording, badge awarding
    GameState.ts               Active trip: deck, spots, score; persisted every mutation
    badges.ts                  Badge rule evaluation (context assembly + what's newly earned)
  audio/SoundManager.ts        Local celebration sounds + persisted mute state
  ui/
    UIManager.ts               Screen router (show/hide, onShow re-render hooks)
    dom.ts                     $ helper + HTML escaping
    effects.ts                 Confetti / fireworks / rainbows / balloons overlays
    screens/                   One module per screen (home, profiles, viewer,
                               editor, gameConfig, game, endTrip)
scripts/
  download-assets.mjs          Fetches audio + subsetted Material Symbols font
  make-icons.ps1               Regenerates the PWA launcher PNGs
public/
  audio/*.ogg  fonts/*.woff2  icons/*.png  favicon.svg
```

## Data persistence

Everything lives in namespaced, versioned localStorage keys
(`car-spotting.v1.*`): profiles (high scores, last-15 trip history, badges),
the active profile id, the mute setting — and the **in-progress game**, so a
trip survives the browser being killed mid-drive and resumes on next launch.
Corrupt or missing data always falls back to safe defaults; it never crashes
the game.

## PWA / offline

- `vite-plugin-pwa` (Workbox `generateSW`) precaches the entire app on first
  visit: HTML, JS, CSS, the icon font, all audio, and launcher icons
  (~600 KB total). After one online visit the game is fully playable in dead
  zones and airplane mode.
- `manifest.json` is generated at build time (see `vite.config.ts`) with
  installable standalone display, portrait orientation and 192/512 icons.
- The Material Symbols font is **self-hosted and subsetted** to only the ~50
  glyphs the app uses (86 KB instead of 5.2 MB). If you add an inventory item
  with a new icon, add its name to `ICON_NAMES` in
  `scripts/download-assets.mjs` and re-run `npm run assets`.

## Asset notes

- Google removed three of the four original wireframe sounds from
  actions.google.com (they now 404). `download-assets.mjs` fetches the closest
  surviving equivalents from the same library (clown horn, siren whistle,
  magic chime, crowd celebration) and saves them under stable local names.
- The library serves Ogg Vorbis, which **iOS Safari cannot decode**, so
  `npm run assets` transcodes each download to AAC (`.m4a`) — playable on
  iOS, Android and desktop alike. The script therefore needs **ffmpeg**
  (`winget install Gyan.FFmpeg`); it exits with instructions if it can't
  find it.

## Game rules (as specced)

- Themed trips load all items tagged with that theme **plus** `general` items;
  "Surprise Me" deals a random deck of 8/16/24 from the whole inventory.
- Score = base points × chosen multiplier (missed bonus = ×1). Activated
  bonuses also fire a celebration and count toward the trip's Bonuses stat.
- **Badges are achievements** defined in `src/data/badges.ts`: score milestones
  in a single trip (100 / 250 / 500), trips-played milestones (1 / 5 / 10 / 25),
  and spotting feats (a semi truck on 5 different trips; spot a rainbow). Each
  is a pure rule over a `BadgeContext`, so adding one is a single catalog entry.
  Score and item badges unlock live mid-trip with a toast; trips-played badges
  land on the summary. Once earned they're permanent, and the profile screen
  shows the whole catalog with locked badges greyed out as goals to chase.
- The trip ends manually via "End Game" or automatically 1.5 s after the
  progress bar hits 100%. Trip end updates high score, trips played and
  history (capped at 15).
