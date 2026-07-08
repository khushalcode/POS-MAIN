// Next.js "standalone" output does NOT automatically include `public/` or
// `.next/static` next to the bundled server.js — the docs require copying
// them in manually after `next build`. Electron's main.js spawns
// `.next/standalone/server.js` directly, so without this step every static
// asset (CSS, JS chunks, images, logo) 404s even though the server itself
// starts fine.
//
// Run automatically via `npm run electron:prebuild` (part of electron:build).

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[prepare-standalone] Skipping missing path: ${src}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

if (!fs.existsSync(standaloneDir)) {
  console.error(
    `[prepare-standalone] ${standaloneDir} not found.\n` +
    `Make sure next.config.ts has "output: 'standalone'" and that "next build" ran first.`
  );
  process.exit(1);
}

console.log('[prepare-standalone] Copying .next/static -> .next/standalone/.next/static');
copyRecursive(
  path.join(root, '.next', 'static'),
  path.join(standaloneDir, '.next', 'static')
);

console.log('[prepare-standalone] Copying public/ -> .next/standalone/public');
copyRecursive(
  path.join(root, 'public'),
  path.join(standaloneDir, 'public')
);

console.log('[prepare-standalone] Done.');
