const { execSync } = require('child_process');
const fs = require('fs');
const git = '"C:\\Program Files\\Git\\cmd\\git.exe"';

if (fs.existsSync('.git/index.lock')) {
  try { fs.unlinkSync('.git/index.lock'); } catch (_) {}
}

function run(cmd) {
  console.log(`> ${cmd}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (out.trim()) console.log(out.trim());
  } catch (e) {
    console.error(e.message);
  }
}

run(`${git} add .gitignore package.json package-lock.json tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html README.md ASSET_MANIFEST.md public/ src/ scripts/ data-backup/`);
run(`${git} commit -m "Baseline state before smoothness restoration"`);
run(`${git} tag pre-changes`);
run(`${git} branch restore-smoothness`);
run(`${git} checkout restore-smoothness`);
run(`${git} status`);
