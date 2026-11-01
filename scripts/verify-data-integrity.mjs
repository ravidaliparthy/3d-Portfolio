import fs from 'fs';
import path from 'path';

const allowList = ['story'];

const backupPath = path.resolve('data-backup/original/portfolioData.json');
const currentPath = path.resolve('src/data/portfolioData.json');

if (!fs.existsSync(backupPath)) {
  console.error('[FAIL] Backup file not found at:', backupPath);
  process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));

let hasDiff = false;
const diffs = [];

function assertDeepEqual(b, c, p = '') {
  if (b === c) return;
  if (typeof b !== typeof c) {
    diffs.push(`Type mismatch at ${p}: backup=${typeof b}, current=${typeof c}`);
    hasDiff = true;
    return;
  }
  if (b === null || c === null || typeof b !== 'object') {
    if (b !== c) {
      diffs.push(`Value mismatch at ${p}: backup=${JSON.stringify(b)}, current=${JSON.stringify(c)}`);
      hasDiff = true;
    }
    return;
  }

  if (Array.isArray(b)) {
    if (!Array.isArray(c)) {
      diffs.push(`Type mismatch at ${p}: backup is array, current is not`);
      hasDiff = true;
      return;
    }
    if (b.length !== c.length) {
      diffs.push(`Array length mismatch at ${p}: backup=${b.length}, current=${c.length}`);
      hasDiff = true;
    }
    const maxLen = Math.max(b.length, c.length);
    for (let i = 0; i < maxLen; i++) {
      assertDeepEqual(b[i], c[i], `${p}[${i}]`);
    }
    return;
  }

  // Object checks
  for (const key of Object.keys(b)) {
    if (!(key in c)) {
      diffs.push(`Key missing in current at ${p ? p + '.' + key : key}`);
      hasDiff = true;
    } else {
      assertDeepEqual(b[key], c[key], p ? `${p}.${key}` : key);
    }
  }

  // Check new keys in current
  for (const key of Object.keys(c)) {
    if (!(key in b)) {
      const fullKeyPath = p ? `${p}.${key}` : key;
      if (!p && allowList.includes(key)) {
        // Top-level allowed key
        continue;
      }
      diffs.push(`Unallowed new key in current at ${fullKeyPath}`);
      hasDiff = true;
    }
  }
}

// 1. Assert all existing keys/values match backup identically
assertDeepEqual(backup, current);

// 2. Specific checks for stations
if (backup.stations.length !== current.stations.length) {
  diffs.push(`Station count changed: backup=${backup.stations.length}, current=${current.stations.length}`);
  hasDiff = true;
}

for (let i = 0; i < backup.stations.length; i++) {
  if (backup.stations[i].id !== current.stations[i]?.id) {
    diffs.push(`Station id changed at [${i}]: backup=${backup.stations[i].id}, current=${current.stations[i]?.id}`);
    hasDiff = true;
  }
  if (backup.stations[i].order !== current.stations[i]?.order) {
    diffs.push(`Station order changed at [${i}]: backup=${backup.stations[i].order}, current=${current.stations[i]?.order}`);
    hasDiff = true;
  }
}

if (hasDiff) {
  console.error('[FAIL] Data integrity assertion failed:');
  diffs.forEach(d => console.error('  - ' + d));
  process.exit(1);
} else {
  console.log('[PASS] Data integrity verified:');
  console.log('  - All existing keys and values match backup identically.');
  console.log(`  - Station count (${current.stations.length}), station IDs, and order numbers are unchanged.`);
  console.log('  - Only allowed keys added:', allowList.filter(k => k in current).join(', ') || 'none');
  process.exit(0);
}

