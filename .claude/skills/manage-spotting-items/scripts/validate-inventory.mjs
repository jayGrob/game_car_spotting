#!/usr/bin/env node
/**
 * Lints src/data/inventory.ts against the rules in SKILL.md without needing a
 * TypeScript build. Catches the mistakes that either crash the app or silently
 * ship a broken card:
 *
 *   - duplicate or non-integer ids
 *   - invalid theme / category values
 *   - non-positive points
 *   - color/bg that aren't Tailwind text-* / bg-* classes
 *   - malformed bonuses (missing question or options, options missing mult)
 *   - ICONS NOT IN THE FONT SUBSET  <-- the one that renders as raw text
 *
 * Exit code 0 = clean, 1 = at least one error. Icons registered in ICON_NAMES
 * but unused by any item are reported as info only (UI chrome or prunable).
 *
 * Usage:  node .claude/skills/manage-spotting-items/scripts/validate-inventory.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VALID_THEMES = ['city', 'highway', 'country', 'general'];
const VALID_CATEGORIES = ['vehicle', 'object', 'creature'];

// ---- Locate the project root (works from the skill dir or the repo root) ----
const here = path.dirname(fileURLToPath(import.meta.url));
const candidates = [path.resolve(here, '../../../..'), process.cwd()];
const root = candidates.find((c) => existsSync(path.join(c, 'src/data/inventory.ts')));
if (!root) {
  console.error('Could not find src/data/inventory.ts. Run from the project root.');
  process.exit(1);
}

const inventoryPath = path.join(root, 'src/data/inventory.ts');
const badgesPath = path.join(root, 'src/data/badges.ts');
const assetsPath = path.join(root, 'scripts/download-assets.mjs');

const errors = [];
const warnings = [];
const infos = [];

/** Scan `text` from `open` bracket char, returning the slice up to its match. */
function matchedSlice(text, startIdx, open, close) {
  let depth = 0;
  let inStr = false;
  let quote = '';
  for (let i = startIdx; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === quote && text[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      inStr = true;
      quote = c;
    } else if (c === open) {
      depth++;
    } else if (c === close) {
      depth--;
      if (depth === 0) return text.slice(startIdx, i + 1);
    }
  }
  return null;
}

/** Extract each top-level {…} object from an array's text. */
function extractObjects(arrayText) {
  const objs = [];
  let inStr = false;
  let quote = '';
  for (let i = 0; i < arrayText.length; i++) {
    const c = arrayText[i];
    if (inStr) {
      if (c === quote && arrayText[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      inStr = true;
      quote = c;
    } else if (c === '{') {
      const obj = matchedSlice(arrayText, i, '{', '}');
      if (obj) {
        objs.push(obj);
        i += obj.length - 1;
      }
    }
  }
  return objs;
}

// ---- Parse ICON_NAMES from download-assets.mjs ----
let registeredIcons = new Set();
if (existsSync(assetsPath)) {
  const assetsSrc = readFileSync(assetsPath, 'utf8');
  const declIdx = assetsSrc.indexOf('ICON_NAMES');
  const bracketIdx = declIdx >= 0 ? assetsSrc.indexOf('[', declIdx) : -1;
  const arr = bracketIdx >= 0 ? matchedSlice(assetsSrc, bracketIdx, '[', ']') : null;
  if (arr) {
    registeredIcons = new Set([...arr.matchAll(/'([^']+)'/g)].map((m) => m[1]));
  } else {
    warnings.push('Could not parse ICON_NAMES from scripts/download-assets.mjs — skipping font-subset check.');
  }
} else {
  warnings.push('scripts/download-assets.mjs not found — skipping font-subset check.');
}

// ---- Parse the inventory ----
const invSrc = readFileSync(inventoryPath, 'utf8');
const invDecl = invSrc.indexOf('masterInventory');
const invBracket = invDecl >= 0 ? invSrc.indexOf('[', invSrc.indexOf('=', invDecl)) : -1;
const invArr = invBracket >= 0 ? matchedSlice(invSrc, invBracket, '[', ']') : null;
if (!invArr) {
  console.error('Could not locate the masterInventory array in src/data/inventory.ts.');
  process.exit(1);
}

const objects = extractObjects(invArr);
const seenIds = new Map();
const usedIcons = new Set();
const themeCounts = Object.fromEntries(VALID_THEMES.map((t) => [t, 0]));
let itemCount = 0;

const field = (obj, key) => {
  const m = obj.match(new RegExp(`\\b${key}\\s*:\\s*('([^']*)'|"([^"]*)"|(-?\\d+)|null)`));
  if (!m) return undefined;
  return m[2] ?? m[3] ?? m[4] ?? m[1]; // string body, or numeric literal, or `null`
};

for (const obj of objects) {
  const idRaw = field(obj, 'id');
  const name = field(obj, 'name') ?? '(unnamed)';
  const label = `"${name}"`;
  itemCount++;

  // id
  if (idRaw === undefined || !/^\d+$/.test(idRaw)) {
    errors.push(`${label}: missing or non-integer id.`);
  } else {
    const id = Number(idRaw);
    if (seenIds.has(id)) {
      errors.push(`Duplicate id ${id}: used by ${seenIds.get(id)} and ${label}.`);
    } else {
      seenIds.set(id, label);
    }
  }

  // theme
  const theme = field(obj, 'theme');
  if (!VALID_THEMES.includes(theme)) {
    errors.push(`${label}: invalid theme '${theme}'. Use one of ${VALID_THEMES.join(', ')}.`);
  } else {
    themeCounts[theme]++;
  }

  // category
  const category = field(obj, 'category');
  if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`${label}: invalid category '${category}'. Use one of ${VALID_CATEGORIES.join(', ')}.`);
  }

  // points
  const pointsRaw = field(obj, 'points');
  if (pointsRaw === undefined || !/^\d+$/.test(pointsRaw) || Number(pointsRaw) <= 0) {
    errors.push(`${label}: points must be a positive integer (got ${pointsRaw}).`);
  }

  // color / bg
  const color = field(obj, 'color');
  if (!color || !color.startsWith('text-')) {
    warnings.push(`${label}: color '${color}' is not a Tailwind text-* class.`);
  }
  const bg = field(obj, 'bg');
  if (!bg || !bg.startsWith('bg-')) {
    warnings.push(`${label}: bg '${bg}' is not a Tailwind bg-* class.`);
  }

  // icon
  const icon = field(obj, 'icon');
  if (!icon) {
    errors.push(`${label}: missing icon.`);
  } else {
    usedIcons.add(icon);
    if (registeredIcons.size > 0 && !registeredIcons.has(icon)) {
      errors.push(
        `${label}: icon '${icon}' is NOT in ICON_NAMES (scripts/download-assets.mjs). ` +
          `Add it there and run \`npm run assets\`, or the card renders the text "${icon}".`
      );
    }
  }

  // bonus
  const bonusIdx = obj.indexOf('bonus');
  const bonusVal = field(obj, 'bonus');
  if (bonusVal !== 'null') {
    const bonusText = bonusIdx >= 0 ? obj.slice(bonusIdx) : '';
    if (!/question\s*:/.test(bonusText)) {
      errors.push(`${label}: bonus is present but has no question (use \`bonus: null\` for a plain item).`);
    }
    const mults = [...bonusText.matchAll(/\bmult\s*:/g)].length;
    const labels = [...bonusText.matchAll(/\blabel\s*:/g)].length;
    if (mults === 0) {
      errors.push(`${label}: bonus has no options with a mult.`);
    } else if (labels !== mults) {
      warnings.push(`${label}: bonus has ${labels} labels but ${mults} mults — each option needs both.`);
    } else if (mults < 2) {
      warnings.push(`${label}: bonus has only one option; two or three read better on the card.`);
    }
  }
}

// ---- Badges: icons need the same font-subset treatment, and any item id a
// ---- badge rule depends on must still exist or the badge becomes unearnable.
let badgeCount = 0;
if (existsSync(badgesPath)) {
  const badgeSrc = readFileSync(badgesPath, 'utf8');

  for (const m of badgeSrc.matchAll(/\bicon\s*:\s*'([^']+)'/g)) {
    const icon = m[1];
    badgeCount++;
    usedIcons.add(icon);
    if (registeredIcons.size > 0 && !registeredIcons.has(icon)) {
      errors.push(
        `Badge icon '${icon}' (src/data/badges.ts) is NOT in ICON_NAMES. ` +
          `Add it to scripts/download-assets.mjs and run \`npm run assets\`.`
      );
    }
  }

  // e.g. `const SEMI_TRUCK = 9;` — the item ids badge rules are pinned to.
  for (const m of badgeSrc.matchAll(/^const\s+([A-Z][A-Z0-9_]*)\s*=\s*(\d+)\s*;/gm)) {
    const [, constName, idStr] = m;
    if (!seenIds.has(Number(idStr))) {
      errors.push(
        `Badge dependency ${constName} = ${idStr} (src/data/badges.ts) points at an item id ` +
          `that no longer exists in the inventory — the badge using it can never be earned.`
      );
    }
  }
}

// ---- Cross-checks ----
if (registeredIcons.size > 0) {
  const orphans = [...registeredIcons].filter((i) => !usedIcons.has(i)).sort();
  if (orphans.length > 0) {
    infos.push(
      `${orphans.length} icon(s) in ICON_NAMES are unused by any item ` +
        `(likely UI chrome — safe to keep; prune only if you know they're unused): ${orphans.join(', ')}`
    );
  }
}
for (const t of VALID_THEMES) {
  const reachable = t === 'general' ? themeCounts.general : themeCounts[t] + themeCounts.general;
  if (t !== 'general' && reachable < 8) {
    warnings.push(`Theme '${t}' only has ${reachable} items (incl. general). Aim for ~8+ for a full board.`);
  }
}

// ---- Report ----
const line = '─'.repeat(60);
console.log(line);
console.log(`Inventory check — ${itemCount} items, ${seenIds.size} unique ids, ${badgeCount} badge icons`);
console.log(line);
for (const e of errors) console.log(`  ERROR  ${e}`);
for (const w of warnings) console.log(`  WARN   ${w}`);
for (const i of infos) console.log(`  info   ${i}`);
if (errors.length === 0 && warnings.length === 0) console.log('  All good. ✓');
console.log(line);
console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);

process.exit(errors.length > 0 ? 1 : 0);
