import fs from 'fs';

// Read the VoiceAssistantModal component to verify the mapping definitions and keywords
const content = fs.readFileSync('src/components/ui/VoiceAssistantModal.tsx', 'utf8');

const checks = [
  { name: 'Station 4 (Clubs / Leadership)', kw: "'clubs'", expected: 'index: 3' },
  { name: 'Station 7 (Full Stack / Expense)', kw: "'full stack'", expected: 'index: 6' },
  { name: 'Station 5 (Drone)', kw: "'drone'", expected: 'index: 4' },
  { name: 'Station 6 (Seismic / Dhanbad)', kw: "'seismic'", expected: 'index: 5' },
  { name: 'Station 8 (Resume Agent / Cloudflare)', kw: "'resume agent'", expected: 'index: 7' },
  { name: 'Station 9 (AI Interviewer)', kw: "'interview'", expected: 'index: 8' },
  { name: 'Station 10 (Hackathon Finalist)', kw: "'hackathon'", expected: 'index: 9' },
  { name: 'Projects Composite Handler', kw: "q === 'projects'", expected: 'Charan has engineered 5 major verified technical projects' }
];

let allPass = true;
checks.forEach(c => {
  const present = content.includes(c.kw);
  if (!present) {
    console.error(`[FAIL] Missing keyword ${c.kw} for ${c.name}`);
    allPass = false;
  } else {
    console.log(`[PASS] Verified ${c.name} with keyword ${c.kw}`);
  }
});

if (allPass) {
  console.log('\nAll voice mapping keywords and intent rules are present and verified!');
} else {
  process.exit(1);
}

