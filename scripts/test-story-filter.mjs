import fs from 'fs';

const Ot = JSON.parse(fs.readFileSync('src/data/portfolioData.json', 'utf8'));

function testFilter(search) {
  const allowDrafts = search.includes('drafts=1');
  const filtered = Ot.story ? Ot.story.filter(a => allowDrafts || a.status === 'verified') : undefined;
  console.log(`With search "${search}": active story count = ${filtered ? filtered.length : 0}`);
}

console.log('Testing Story Filtering in Production:');
testFilter('');
testFilter('?station=1');
testFilter('?drafts=1');
testFilter('?view=cab&drafts=1');

