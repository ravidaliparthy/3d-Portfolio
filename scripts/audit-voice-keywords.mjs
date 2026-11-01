import fs from 'fs';

const d = JSON.parse(fs.readFileSync('src/data/portfolioData.json', 'utf8'));

console.log('=== MECHANICAL ALIASES FROM EXISTING DATA ONLY ===');
const stationAliases = d.stations.map((s) => {
  const words = new Set();
  s.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).forEach((w) => {
    if (w.length > 2 && !['and', 'the', 'for', 'from'].includes(w)) words.add(w);
  });
  s.organization.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).forEach((w) => {
    if (w.length > 2 && !['and', 'the', 'for', 'from'].includes(w)) words.add(w);
  });
  s.skillIds.forEach((k) => words.add(k.replace(/_/g, ' ')));
  return {
    order: s.order,
    id: s.id,
    title: s.title,
    aliases: Array.from(words),
  };
});

stationAliases.forEach((sa) => {
  console.log(`Station ${sa.order} [${sa.id}]:`);
  console.log(`   Title: ${sa.title}`);
  console.log(`   Aliases: ${sa.aliases.join(', ')}`);
});

console.log('\n=== INTENT ROUTING AUDIT (20 SAMPLE UTTERANCES) ===');
const testUtterances = [
  'take me to the hackathon',
  'what did you build in Mozambique',
  'how can I contact you',
  'download resume',
  'go to station 1',
  'next station',
  'previous station',
  'show expense tracker',
  'recruiter view',
  'mute sound',
  'tell me about your education',
  'seismic paper',
  'who are you',
  'what is your CGPA',
  'tell me about Cloudflare Workers',
  'what AI interview coach did you build',
  'show drone segmentation',
  'where is terminus',
  'tell me about your leadership',
  'blablabla nonsense'
];

testUtterances.forEach((u, i) => {
  const lower = u.toLowerCase();
  let route = 'Fuzzy Q&A search';
  let target = '';

  if (lower.includes('next') || lower.includes('forward')) {
    route = 'Navigation Intent: Next Station';
  } else if (lower.includes('prev') || lower.includes('back')) {
    route = 'Navigation Intent: Previous Station';
  } else if (lower.includes('station 1') || lower.includes('station one')) {
    route = 'Navigation Intent: Go to Station 1';
  } else if (lower.includes('recruiter') || lower.includes('executive')) {
    route = 'Navigation Intent: Recruiter Overview';
  } else if (lower.includes('resume') || lower.includes('cv')) {
    route = 'Navigation Intent: Open Resume';
  } else if (lower.includes('contact') || lower.includes('email') || lower.includes('reach out')) {
    route = 'Navigation Intent: Contact';
  } else if (lower.includes('mute') || lower.includes('unmute') || lower.includes('audio')) {
    route = 'Navigation Intent: Toggle Audio';
  } else {
    // Check station aliases
    for (const sa of stationAliases) {
      const match = sa.aliases.find(a => lower.includes(a));
      if (match) {
        route = `Navigation Intent: Go to Station ${sa.order} (${sa.title})`;
        target = `matched keyword: "${match}"`;
        break;
      }
    }
  }
  console.log(`[${i + 1}] "${u}" -> ${route} ${target ? '(' + target + ')' : ''}`);
});

