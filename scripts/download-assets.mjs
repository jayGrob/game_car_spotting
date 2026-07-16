/**
 * Downloads the external assets the app needs so they can be bundled and
 * precached by the service worker (the game must work fully offline):
 *
 *  - The four Google Actions celebration sounds -> public/audio/*.ogg
 *  - The Material Symbols Rounded variable font -> public/fonts/*.woff2
 *
 * Run with:  npm run assets   (requires Node 18+, one-time, needs internet)
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

// NOTE: Google has removed three of the sounds the original wireframe used
// (beeps_and_honks, fireworks_with_whistle, crowd_cheering all now 404).
// These are the closest still-available equivalents from the same library.
const AUDIO = {
  'confetti.ogg': 'https://actions.google.com/sounds/v1/cartoon/clown_horn.ogg',
  'fireworks.ogg': 'https://actions.google.com/sounds/v1/cartoon/siren_whistle.ogg',
  'rainbows.ogg': 'https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg',
  'balloons.ogg': 'https://actions.google.com/sounds/v1/crowds/battle_crowd_celebrate_stutter.ogg'
};

// Every Material Symbols glyph the app uses (inventory items, badges, and UI
// chrome). Keep this in sync when adding items to src/data/inventory.ts or
// badges to src/data/badges.ts, then re-run `npm run assets`. Subsetting
// shrinks the font from ~5 MB to ~10s of KB.
const ICON_NAMES = [
  'add', 'agriculture', 'airport_shuttle', 'ambulance', 'arrow_back',
  'bedroom_baby', 'bolt', 'car_repair', 'casino', 'cell_tower', 'check',
  'check_circle', 'chevron_right', 'close', 'construction', 'cottage',
  'directions_bus', 'directions_car', 'edit', 'edit_road', 'electric_car',
  'emoji_events', 'explore', 'fire_extinguisher', 'fire_truck', 'flag',
  'flight', 'grass', 'local_gas_station', 'local_police', 'local_shipping',
  'local_taxi', 'location_city', 'looks', 'map', 'military_tech', 'pedal_bike',
  'pets', 'play_arrow', 'route', 'search', 'search_check', 'shield', 'speed',
  'stars', 'traffic', 'train', 'trophy', 'two_wheeler', 'visibility',
  'visibility_off', 'volume_off', 'volume_up', 'water_drop', 'wind_power',
  'workspace_premium'
].sort();

// Request full axis RANGES (not pinned values) so the served woff2 keeps the
// FILL axis variable — the app toggles FILL 0/1 via font-variation-settings.
const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' +
  `&icon_names=${ICON_NAMES.join(',')}&display=block`;

// A browser UA is required or Google serves legacy (non-woff2) font formats.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function download(url, dest, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`  ok ${path.basename(dest)} (${(buf.length / 1024).toFixed(0)} KB)`);
}

/**
 * The library serves Ogg Vorbis, which iOS Safari cannot decode, so each
 * download is transcoded to AAC (.m4a) — playable in every modern browser.
 * Looks for ffmpeg on PATH, then in the winget install location.
 */
async function findFfmpeg() {
  if (spawnSync('ffmpeg', ['-version'], { shell: true }).status === 0) return 'ffmpeg';
  const wingetPkgs = path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages');
  try {
    for (const dir of await readdir(wingetPkgs)) {
      if (!dir.startsWith('Gyan.FFmpeg')) continue;
      for (const sub of await readdir(path.join(wingetPkgs, dir))) {
        const candidate = path.join(wingetPkgs, dir, sub, 'bin', 'ffmpeg.exe');
        if (spawnSync(candidate, ['-version']).status === 0) return candidate;
      }
    }
  } catch {
    /* fall through */
  }
  return null;
}

const ffmpeg = await findFfmpeg();
if (!ffmpeg) {
  console.error(
    'ffmpeg is required to transcode the audio to iOS-compatible AAC.\n' +
    'Install it (e.g. `winget install Gyan.FFmpeg`) and re-run `npm run assets`.'
  );
  process.exit(1);
}

console.log('Downloading audio -> public/audio/ (transcoding ogg -> m4a)');
const audioDir = path.join(publicDir, 'audio');
await mkdir(audioDir, { recursive: true });
for (const [file, url] of Object.entries(AUDIO)) {
  const oggPath = path.join(audioDir, file);
  await download(url, oggPath);
  const m4aPath = oggPath.replace(/\.ogg$/, '.m4a');
  const result = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', oggPath, '-c:a', 'aac', '-b:a', '128k', m4aPath]);
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${file}: ${result.stderr}`);
  }
  await rm(oggPath);
  console.log(`  ok ${path.basename(m4aPath)} (transcoded)`);
}

console.log('Downloading Material Symbols Rounded font -> public/fonts/');
await mkdir(path.join(publicDir, 'fonts'), { recursive: true });
const cssRes = await fetch(FONT_CSS_URL, { headers: { 'User-Agent': BROWSER_UA } });
if (!cssRes.ok) throw new Error(`HTTP ${cssRes.status} fetching font CSS`);
const css = await cssRes.text();
const match = css.match(/src:\s*url\((https:[^)]+)\)\s*format\('woff2'\)/);
if (!match) throw new Error('Could not find a .woff2 URL in the Google Fonts CSS response');
await download(match[1], path.join(publicDir, 'fonts', 'material-symbols-rounded.woff2'));

console.log('All assets downloaded.');
