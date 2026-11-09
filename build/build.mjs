#!/usr/bin/env node
/**
 * Rebuilds assets/atlas-statblocks.js and styles/ from Atlas VTT's source.
 *
 *   node build/build.mjs                  # clones Atlas at the pinned commit into build/.atlas
 *   ATLAS_SRC=/path/to/atlas-vtt node build/build.mjs   # use a checkout you already have
 *
 * The bundle contains Atlas VTT code (AGPL-3.0-only); `ATLAS_COMMIT` records
 * exactly which source it was built from.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const run = (cmd, args, options = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...options });

const pinned = fs.readFileSync(path.join(here, 'ATLAS_COMMIT'), 'utf8').trim().split(/\s+/)[0];
let atlas = process.env.ATLAS_SRC ? path.resolve(process.env.ATLAS_SRC) : path.join(here, '.atlas');

if (!process.env.ATLAS_SRC && !fs.existsSync(path.join(atlas, 'package.json'))) {
  run('git', ['clone', 'https://github.com/atlas-vtt/atlas-vtt.git', atlas]);
  run('git', ['checkout', pinned], { cwd: atlas });
}
if (!fs.existsSync(path.join(atlas, 'node_modules'))) run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: atlas });

// Atlas' own toolchain (vite, sass, react plugin) builds this config: let it resolve from there.
const link = path.join(here, 'node_modules');
if (!fs.existsSync(link)) fs.symlinkSync(path.join(atlas, 'node_modules'), link, 'dir');

run(path.join(atlas, 'node_modules/.bin/vite'), ['build', '--config', path.join(here, 'vite.config.mts')], {
  env: { ...process.env, ATLAS_SRC: atlas },
});

// Place the bundle, and join the renderer's CSS with the theme bridge.
const dist = path.join(here, 'dist');
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.mkdirSync(path.join(root, 'styles'), { recursive: true });
// The minifier drops comments, so the licence banner is written here.
const banner = `/*! Atlas Statblocks for Digital Garden, built from Atlas VTT (Copyright (C) 2025-2026 Fabian Urbanek)
 * SPDX-License-Identifier: AGPL-3.0-only
 * Corresponding source: https://github.com/atlas-vtt/atlas-vtt at the commit in build/ATLAS_COMMIT, plus this plugin's build/ folder.
 * Third-party and game-system notices: NOTICE.md */
`;
fs.writeFileSync(path.join(root, 'assets/atlas-statblocks.js'), banner + fs.readFileSync(path.join(dist, 'atlas-statblocks.js'), 'utf8'));
const theme = fs.readFileSync(path.join(here, 'theme.css'), 'utf8');
fs.writeFileSync(path.join(root, 'styles/atlas-statblocks.css'), `${theme}\n${fs.readFileSync(path.join(dist, 'atlas-statblocks-base.css'), 'utf8')}`);
console.log('Built assets/atlas-statblocks.js and styles/atlas-statblocks.css');
