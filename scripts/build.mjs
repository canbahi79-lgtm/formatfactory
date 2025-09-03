/**
 * Simple build script for React + TypeScript using esbuild (Windows-friendly).
 * - Bundles src/main.tsx into dist/app.js
 * - Writes a minimal dist/index.html that loads app.js
 * - No regex, no plugins, no HTML entities → robust on Windows/OneDrive paths
 *
 * Usage:
 *   node scripts/build.mjs            # dev build
 *   node scripts/build.mjs --production
 */

import { build } from 'esbuild'
import { existsSync, mkdirSync, rmSync, writeFileSync, cpSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Resolve current directory in ESM */
const __dirname = dirname(fileURLToPath(import.meta.url))

/** Determine mode */
const isProd = process.argv.includes('--production')
const mode = isProd ? 'production' : 'development'

/** Paths */
const root = join(__dirname, '..')
const srcEntry = join(root, 'src', 'main.tsx')
const outDir = join(root, 'dist')

/** Ensure entry exists */
if (!existsSync(srcEntry)) {
  console.error('[build] Entry not found:', srcEntry)
  console.error('[build] Create src/main.tsx (and basic app files) first.')
  process.exit(1)
}

/** Clean dist */
try {
  rmSync(outDir, { recursive: true, force: true })
} catch {}
mkdirSync(outDir, { recursive: true })

/** Build with esbuild (single outfile for simplicity) */
await build({
  entryPoints: [srcEntry],
  outfile: join(outDir, 'app.js'),
  bundle: true,
  format: 'esm',
  sourcemap: !isProd,
  minify: isProd,
  target: ['es2020'],
  jsx: 'automatic',
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file',
    '.svg': 'file',
    '.css': 'css', // CSS imports get injected at runtime → no separate CSS file needed
  },
  logLevel: 'info',
  color: true,
  write: true,
})

/** Write a minimal index.html */
const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0f172a" />
  <title>AI Journal Formatter</title>
</head>
<body class="min-h-screen bg-white">
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>
`
writeFileSync(join(outDir, 'index.html'), html, 'utf-8')

/** Copy public/ if exists */
const publicDir = join(root, 'public')
if (existsSync(publicDir)) {
  cpSync(publicDir, outDir, { recursive: true })
}

console.log(`\n✓ Build ${mode} ready at: ${outDir}\n`)