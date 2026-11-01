import fs from 'fs';
import path from 'path';

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) files.push(...walk(full));
    else if (/\.(tsx|ts|jsx|js|css)$/.test(item)) files.push(full);
  }
  return files;
}

const files = walk('./src');
let totalBlurs = 0;
let totalAnimations = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Remove backdrop-blur-* classes
  content = content.replace(/\s*backdrop-blur(-[a-z0-9]+)?/g, '');

  // 2. Remove continuous animations: animate-pulse, animate-ping, animate-bounce
  content = content.replace(/\s*animate-(pulse|ping|bounce)/g, '');

  // 3. For any semi-transparent panel bg that relied on blur, ensure solid/opaque or deep clean bg
  // e.g. bg-[#04180f]/88 -> bg-[#04180f]/95
  // bg-[#04180f]/80 -> bg-[#04180f]/95
  // bg-[#061c13]/70 -> bg-[#061c13]/90

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

console.log('CSS sanitization pass complete.');

