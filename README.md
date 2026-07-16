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
npm run stats      # refresh the inventory tables in this README from the data
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
    inventory.ts               Master item database (46 items across 4 themes)
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
  inventory-stats.mjs          Regenerates the README inventory tables from the data
  make-icons.ps1               Regenerates the PWA launcher PNGs
public/
  audio/*.m4a  fonts/*.woff2  icons/*.png  favicon.svg
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
  (~1.1 MB total). After one online visit the game is fully playable in dead
  zones and airplane mode.
- `manifest.json` is generated at build time (see `vite.config.ts`) with
  installable standalone display, portrait orientation and 192/512 icons.
- The Material Symbols font is **self-hosted and subsetted** to only the ~75
  glyphs the app uses (131 KB instead of 5.2 MB). If you add an inventory item
  or badge with a new icon, add its name to `ICON_NAMES` in
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
  "Surprise Me" deals a random deck of 8/16/24/32 from the whole inventory.
- Score = base points × chosen multiplier (missed bonus = ×1). Activated
  bonuses also fire a celebration and count toward the trip's Bonuses stat.
- **Badges are achievements** defined in `src/data/badges.ts`: score milestones
  in a single trip (100 / 250 / 500), bonus milestones in a single trip
  (5 / 10 / 15 / 20 / 25), trips-played milestones (1 / 5 / 10 / 25), and
  spotting feats (a semi truck on 5 different trips; spot a rainbow). Each is a
  pure rule over a `BadgeContext`, so adding one is a single catalog entry.
  Score, bonus and item badges unlock live mid-trip with a toast; trips-played
  badges land on the summary. Once earned they're permanent, and the profile
  screen shows the whole catalog with locked badges greyed out as goals to chase.
- Bonus tiers are bounded by two things: how many items carry a bonus (28 of 46)
  and the largest Surprise deck (32 cards), since a trip can never hold more
  bonuses than it has cards. All five tiers are currently reachable — Bonus
  Legend (25) needs a Surprise-32 deck; the best themed trip holds 16. The
  validator in `.claude/skills/manage-spotting-items` recomputes this and flags
  any tier that has drifted out of reach — re-run it as the inventory changes.
- The trip ends manually via "End Game" or automatically 1.5 s after the
  progress bar hits 100%. Trip end updates high score, trips played and
  history (capped at 15).

## Inventory at a glance

The tables below are generated straight from `src/data/inventory.ts` by
`npm run stats`, which imports the real data rather than restating it — so they
can't drift out of step with the game. **Re-run `npm run stats` after adding or
editing items**; `npm run stats -- --check` fails without writing if the README
is stale, which makes it easy to catch in review.

<!-- inventory-stats:start -->
<!-- Generated by `npm run stats` — do not edit by hand. -->

**46 items** in total: **28** carry a bonus challenge, **18** are plain one-tap spots.

#### By theme

| Theme | Items | With bonus | Plain |
| --- | ---: | ---: | ---: |
| City | 7 | 6 | 1 |
| Highway | 16 | 9 | 7 |
| Country | 9 | 6 | 3 |
| General | 14 | 7 | 7 |
| **Total** | **46** | **28** | **18** |

`general` items are mixed into every themed trip, so a themed drive deals from
more than its own row above: City 21, Highway 30, Country 23. "Surprise Me" ignores theme entirely
and deals from all 46, up to 32 cards.

#### By point value

| Points | Items | With bonus | Plain |
| --- | ---: | ---: | ---: |
| 5 pts | 5 | 1 | 4 |
| 10 pts | 15 | 8 | 7 |
| 15 pts | 15 | 10 | 5 |
| 20 pts | 9 | 9 | 0 |
| 25 pts | 2 | 0 | 2 |
| **Total** | **46** | **28** | **18** |

#### By category

| Category | Items | With bonus | Plain |
| --- | ---: | ---: | ---: |
| Vehicle | 25 | 18 | 7 |
| Object | 18 | 8 | 10 |
| Creature | 3 | 2 | 1 |
| **Total** | **46** | **28** | **18** |
<!-- inventory-stats:end -->

Adding items is documented step by step in
[.claude/skills/manage-spotting-items](.claude/skills/manage-spotting-items/SKILL.md),
including the font-subset step and the badge-reachability check.
