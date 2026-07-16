---
name: manage-spotting-items
description: >-
  Add, edit, or remove the cars, vehicles, objects, and creatures players can
  spot in the Car Spotting game. Use this whenever the user wants to change the
  game's inventory — "add a new item/car/animal to spot", "change how many
  points X is worth", "add a bonus question", "remove/rename an item", "make
  something appear in the highway theme", or anything touching the deck of
  spottable cards. All game content lives in one data file; this skill covers
  the full edit → validate → deploy flow, including the font-subset step that
  is easy to forget and silently ships a broken icon if skipped.
---

# Managing spottable items

The game is data-driven: every spottable card is one object in a single array,
[`src/data/inventory.ts`](../../../src/data/inventory.ts). Adding, editing, or
removing items means editing that array — no UI, rendering, or game-logic code
changes. The screens read the array at runtime and lay themselves out.

There is exactly **one thing that bites people**: each item's `icon` is a
Google Material Symbols glyph, and the app ships a *subsetted* font containing
only the glyphs it actually uses (86 KB instead of 5.2 MB). A new icon must be
registered and the font re-downloaded, or the card renders the icon's raw text
name instead of a picture. The validation script below catches this before it
ships. Everything else is straightforward.

## The item shape

Each entry in `masterInventory` looks like this:

```ts
{
  id: 29,                       // unique integer, never reused (see "Choosing an id")
  theme: 'country',             // which trip it belongs to
  category: 'creature',         // filter bucket on the game screen
  name: 'Deer',                 // shown on the card
  points: 20,                   // base points before any bonus multiplier
  icon: 'forest',               // Material Symbols (Rounded) glyph name
  color: 'text-emerald-700',    // Tailwind text-* class — the icon's color
  bg: 'bg-emerald-50',          // Tailwind bg-* class — the icon circle behind it
  bonus: {                      // optional challenge (or `bonus: null`)
    question: 'Is it a whole family?',
    options: [
      { label: 'Just one', mult: 1 },              // baseline: no bonus
      { label: 'A family!', mult: 3, isBonus: true } // scores points × 3, triggers celebration
    ]
  }
},
```

### Field reference

| Field | Rule |
|-------|------|
| `id` | Unique integer. **Never reuse an old id**, even after deleting — an in-progress game saved on a kid's device references items by id. |
| `theme` | One of `'city'`, `'highway'`, `'country'`, `'general'`. |
| `category` | One of `'vehicle'`, `'object'`, `'creature'`. Drives the All / Vehicles / Objects filter. |
| `name` | Short label. Keep it a couple of words so it fits the card. |
| `points` | Positive integer. Rough scale in use: common/easy = 5–10, notable = 15, rare = 20–25. |
| `icon` | A Material Symbols **Rounded** glyph name. Browse at https://fonts.google.com/icons (set Style → Rounded). Must also be registered in the font subset — see below. |
| `color` | Any Tailwind `text-*` class. |
| `bg` | Any Tailwind `bg-*` class — usually the same hue as `color` but a light `-50`/`-100` shade. |
| `bonus` | `null` for a plain one-tap spot, or a challenge object. |

### How `theme` works

- `'city'`, `'highway'`, `'country'` items appear when the player picks that
  theme on the Trip Setup screen.
- `'general'` items are mixed into **every** themed trip (things you see
  everywhere — road signs, planes, trains). Use it for anything not tied to one
  setting.
- "Surprise Me" ignores theme entirely and deals a random deck from the whole
  inventory, so every item can show up there regardless of its theme.

Keep at least ~8 items per theme (including `general`) so a themed trip has a
full-looking board. `general` items count toward every theme's total.

### How `bonus` works

`points × mult` is the score for that spot. The first option is the baseline
"I spotted it but the bonus condition wasn't met" — give it `mult: 1` and no
`isBonus`. Options with `isBonus: true` are the reward path: they score the
higher multiplier, fire a celebration animation + sound, and count toward the
player's bonus/badge totals. Two or three options work best (the sheet lays
out 2 as a pair, 3 as a row). Phrase the question so a kid can answer it from
the back seat with a yes/no or a quick pick.

## Adding an item

1. **Choose an id.** Use one higher than the current maximum. Don't fill gaps
   left by deleted items and don't renumber existing ones.
2. **Add the object** to the right theme section of `masterInventory` in
   [`src/data/inventory.ts`](../../../src/data/inventory.ts). The file is
   grouped by theme with `// ---------- City ----------` style comment headers —
   put it under the matching header to keep the file readable.
3. **Register the icon** (only if the `icon` name is new to the project): add it
   to the `ICON_NAMES` array in
   [`scripts/download-assets.mjs`](../../../scripts/download-assets.mjs), keeping
   the list alphabetical-ish, then re-download the font subset:
   ```
   npm run assets
   ```
   Skipping this is the #1 mistake — the card will show the literal text
   "forest" instead of a deer icon. If several items reuse an existing icon,
   no font change is needed.
4. **Validate and test** (see below).

## Editing an item

Find the item by `name` or `id` and change the fields. Notes:

- Changing `points`, `name`, `color`, `bg`, `theme`, `category`, or `bonus`
  wording is safe and needs no font step.
- Changing `icon` to a glyph **not already used elsewhere** means you must add
  the new name to `ICON_NAMES` and run `npm run assets`. (You don't need to
  remove the old icon from `ICON_NAMES` — an unused entry only wastes a few KB.
  The validator lists orphans if you want to prune.)
- **Don't change `id`** to "fix" anything — it breaks saved in-progress games.

## Removing an item

Delete its object from the array. Do **not** renumber the remaining ids to close
the gap — ids are permanent handles, and a kid's saved in-progress game
references them.

One thing to check first: some **badges depend on specific item ids** (see the
constants at the top of [`src/data/badges.ts`](../../../src/data/badges.ts) —
e.g. Big Rig Hunter needs the Semi Truck, Lucky needs the Rainbow). Deleting one
of those items makes its badge permanently unearnable. The validator catches
this, but if you hit it, either keep the item or retire the badge alongside it.

Optionally, if the removed item used a unique icon, drop that icon from
`ICON_NAMES` and run `npm run assets` to shave the font — leaving it is harmless.

## Validate, test, deploy

1. **Validate** the inventory — catches duplicate ids, bad enum values,
   unregistered icons (the font trap, for both items and badges), malformed
   bonuses, and badges left pointing at a deleted item:
   ```
   node .claude/skills/manage-spotting-items/scripts/validate-inventory.mjs
   ```
   Fix anything it flags. A clean run means the data is internally consistent
   and every icon is in the font subset.
2. **Preview locally:**
   ```
   npm run dev
   ```
   Open the game, start a trip in the relevant theme (or Surprise Me), and
   confirm the new/edited card shows the right icon, color, points, and bonus
   question.
3. **Ship it** — the repo auto-deploys to GitHub Pages on push:
   ```
   git add -A
   git commit -m "Add Deer to country inventory"
   git push
   ```
   The live site at https://jaygrob.github.io/game_car_spotting/ updates in
   about a minute; players pick up the change next time they open the app
   online.

## Valid values cheat-sheet

- **themes:** `city`, `highway`, `country`, `general`
- **categories:** `vehicle`, `object`, `creature`
- **icons:** any name from https://fonts.google.com/icons (Style → Rounded),
  and it must appear in `ICON_NAMES` in `scripts/download-assets.mjs`
- **colors/bg:** any Tailwind `text-*` / `bg-*` utility class

## Environment note (this machine)

If `npm` or `node` isn't recognized in a fresh terminal, Node is installed but
not on the PATH — prepend it first:

```powershell
$env:Path = "C:\Program Files\nodejs;$env:Path"
```

`npm run assets` also needs **ffmpeg** (to transcode the celebration sounds to
iOS-friendly AAC), but only when audio files are being re-fetched; editing items
and re-subsetting the font does not require it beyond what a normal
`npm run assets` already expects.
