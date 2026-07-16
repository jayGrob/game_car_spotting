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
npm run stats      # refresh this README's badge + inventory tables from the data
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
    inventory.ts               Master item database (see "Inventory at a glance")
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
  generate-readme.mjs          Regenerates this README's tables from the game data
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
- The trip ends manually via "End Game" or automatically 1.5 s after the
  progress bar hits 100%. Trip end updates high score, trips played and
  history (capped at 15).

## Badges

Badges are achievements. Each one is a pure rule over a `BadgeContext`
(`(c) => c.tripScore >= 100`), so adding one is a single catalog entry in
`src/data/badges.ts` — no engine or UI changes. Earned badges are stored on the
profile by id and are never taken away.

<!-- badge-table:start -->
<!-- Generated by `npm run stats` — do not edit by hand. -->

All **14** badges, in catalog order — the profile screen shows this same list,
with locked ones greyed out as goals to chase.

| Group | Badge | How to earn |
| --- | --- | --- |
| Score | **Century** | Score 100 points in a single trip |
| Score | **Score Star** | Score 250 points in a single trip |
| Score | **Road Legend** | Score 500 points in a single trip |
| Bonuses | **Bonus Hunter** | Land 5 bonuses in a single trip |
| Bonuses | **Bonus Pro** | Land 10 bonuses in a single trip |
| Bonuses | **Bonus Master** | Land 15 bonuses in a single trip |
| Bonuses | **Bonus Champion** | Land 20 bonuses in a single trip |
| Bonuses | **Bonus Legend** | Land 25 bonuses in a single trip |
| Trips | **First Adventure** | Finish your first trip |
| Trips | **Road Tripper** | Finish 5 trips |
| Trips | **Seasoned Spotter** | Finish 10 trips |
| Trips | **Road Warrior** | Finish 25 trips |
| Spotting | **Big Rig Hunter** | Spot a semi truck on 5 different trips |
| Spotting | **Lucky** | Spot a rainbow |

**Score**, **Bonuses** and **Spotting** badges unlock the moment you qualify, mid-trip,
with a toast and a celebration. **Trips** badges can only become true once a trip is
recorded, so they land on the end-of-trip summary.
<!-- badge-table:end -->

The bonus tiers are bounded by two independent limits: how many items carry a
bonus, and the largest Surprise deck — a trip can never hold more bonuses than
it has cards, which is why raising the deck to 32 is what made the 25 tier
reachable at all. The validator in `.claude/skills/manage-spotting-items`
recomputes what one trip can hold and flags any tier that has drifted out of
reach; re-run it whenever the inventory changes.

## Inventory at a glance

The tables below are generated straight from `src/data/inventory.ts` by
`npm run stats`, which imports the real data rather than restating it — so they
can't drift out of step with the game. **Re-run `npm run stats` after adding or
editing items**; `npm run stats -- --check` fails without writing if the README
is stale, which makes it easy to catch in review.

<!-- inventory-stats:start -->
<!-- Generated by `npm run stats` — do not edit by hand. -->

**47 items** in total: **31** carry a bonus challenge, **16** are plain one-tap spots.

#### By theme

| Theme | Items | With bonus | Plain |
| --- | ---: | ---: | ---: |
| City | 7 | 6 | 1 |
| Highway | 16 | 9 | 7 |
| Country | 9 | 6 | 3 |
| General | 15 | 10 | 5 |
| **Total** | **47** | **31** | **16** |

`general` items are mixed into every themed trip, so a themed drive deals from more than
its own row above: City 22, Highway 31, Country 24. "Surprise Me" ignores theme entirely and deals from all
47 items, up to 32 cards.

#### By point value

| Points | Items | With bonus | Plain |
| --- | ---: | ---: | ---: |
| 5 pts | 5 | 1 | 4 |
| 10 pts | 15 | 8 | 7 |
| 15 pts | 15 | 10 | 5 |
| 20 pts | 9 | 9 | 0 |
| 25 pts | 3 | 3 | 0 |
| **Total** | **47** | **31** | **16** |

#### By category

| Category | Items | With bonus | Plain |
| --- | ---: | ---: | ---: |
| Vehicle | 26 | 20 | 6 |
| Object | 18 | 9 | 9 |
| Creature | 3 | 2 | 1 |
| **Total** | **47** | **31** | **16** |
<!-- inventory-stats:end -->

Adding items is documented step by step in
[.claude/skills/manage-spotting-items](.claude/skills/manage-spotting-items/SKILL.md),
including the font-subset step and the badge-reachability check.
