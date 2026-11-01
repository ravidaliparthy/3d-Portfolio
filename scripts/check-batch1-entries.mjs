import fs from 'fs';
const d = JSON.parse(fs.readFileSync('src/data/portfolioData.json', 'utf8'));

const summaries = [
  { id: 'story-chance-svamitva', text: "SVAMITVA surveys India's villages by drone, but turning that data into plans meant tracing features by hand. Our team built two systems: one that reads drone photos, one that turns LiDAR scans into terrain and drainage maps, tested on a village it had never seen." },
  { id: 'story-mistake-seismic', text: "Our seismic project scored between about 95% and 99% inside each region. A trained model's own region says little about somewhere new, so the paper tested across regions. One model fell to 70% on a region where plain logistic regression scored 92%." },
  { id: 'story-care-honesty', text: "Across my repos the same habit repeats: the seismic project admits what it never tested, the Expense Tracker lists its limits, my Resume Agent refuses to invent facts, and the booking app names the AI tool I used." },
  { id: 'story-think-rooftop', text: "In Nacala, Mozambique, roofs touch, so a normal model merges two houses into one. Outline quality and house counting pulled in opposite directions, so the model predicts two things: the full roof and a shrunken core of each roof, then splits them." },
  { id: 'story-own-expense-tracker', text: "On free hosting the server's disk is wiped whenever it sleeps, which would lose people's expenses. The Expense Tracker reads from a fast local copy, saves every write to the cloud first, and queues writes if the cloud is unreachable." }
];

console.log('--- SUMMARY CHARACTER COUNTS (Max 280) ---');
summaries.forEach(s => {
  console.log(`${s.id}: ${s.text.length} chars (within budget: ${s.text.length <= 280})`);
});

console.log('\n--- EXISTING STATION TITLES ---');
d.stations.forEach(s => console.log(`[${s.id}] "${s.title}"`));

console.log('\n--- CHECKING EXACT TITLE MATCHES FOR HINTS ---');
const hints = [
  { id: 'story-chance-svamitva', hint: "National hackathon station" },
  { id: 'story-mistake-seismic', hint: "IIT Dhanbad seismic paper station" },
  { id: 'story-care-honesty', hint: null },
  { id: 'story-think-rooftop', hint: "Nacala rooftop segmentation station" },
  { id: 'story-own-expense-tracker', hint: "Expense Tracker station" }
];

hints.forEach(item => {
  if (!item.hint) {
    console.log(`${item.id}: hint is null -> linkedStationId: null`);
    return;
  }
  const exact = d.stations.find(s => s.title === item.hint);
  console.log(`${item.id}: hint "${item.hint}" -> exact match: ${exact ? `"${exact.title}" (id: ${exact.id})` : 'NONE (leaving null)'}`);
});

