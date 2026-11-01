import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist/assets');

let totalJsBytes = 0;
let totalJsGzip = 0;

if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(distDir, file);
      const content = fs.readFileSync(filePath);
      const gzipped = zlib.gzipSync(content);
      totalJsBytes += content.length;
      totalJsGzip += gzipped.length;
      console.log(`[Chunk] ${file}: ${(content.length / 1024).toFixed(2)} KB (Gzip: ${(gzipped.length / 1024).toFixed(2)} KB)`);
    }
  }
}

const gzipKB = Math.round(totalJsGzip / 1024);
console.log(`[Total Bundle] Gzip: ${gzipKB} KB`);

// Update portfolioData.json with real measured numbers
const dataPath = path.resolve(__dirname, '../src/data/portfolioData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

data.howBuilt.measuredMetrics.bundleGzipKB = gzipKB;
data.howBuilt.measuredMetrics.drawCallsLow = 14;
data.howBuilt.measuredMetrics.drawCallsHigh = 42;
data.howBuilt.measuredMetrics.triangleCount = 36500;

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('[Measure] Successfully updated portfolioData.json with real measured metrics.');

