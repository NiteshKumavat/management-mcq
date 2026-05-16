const fs = require('fs');
const inPath = 'src/Management.json';
const outPath = 'src/extracted_100_per_chp_custom_management.json';

function safeParse(json) {
  try { return JSON.parse(json); } catch (e) { console.error('Failed to parse JSON:', e); process.exit(1); }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const raw = safeParse(fs.readFileSync(inPath, 'utf8'));
const chaptersMap = {};

if (Array.isArray(raw)) {
  raw.forEach(q => {
    const ch = q.chapter || q.chapterName || q.chapter_title || q.Chapter || 'Unknown Chapter';
    const topic = q.topic || q.topicName || q.section || 'General';
    chaptersMap[ch] = chaptersMap[ch] || {};
    chaptersMap[ch][topic] = chaptersMap[ch][topic] || [];
    chaptersMap[ch][topic].push(q);
  });
} else if (typeof raw === 'object' && raw !== null) {
  for (const [ch, val] of Object.entries(raw)) {
    if (Array.isArray(val)) {
      chaptersMap[ch] = { All: val.slice() };
    } else if (typeof val === 'object' && val !== null) {
      // assume topic -> array mapping
      chaptersMap[ch] = {};
      for (const [t, arr] of Object.entries(val)) {
        chaptersMap[ch][t] = Array.isArray(arr) ? arr.slice() : [];
      }
    } else {
      chaptersMap[ch] = { All: [] };
    }
  }
} else {
  console.error('Unsupported Management.json structure');
  process.exit(1);
}

const result = {};

for (const [ch, topics] of Object.entries(chaptersMap)) {
  // shuffle each topic list
  const topicNames = Object.keys(topics);
  topicNames.forEach(t => shuffle(topics[t]));

  const selected = [];
  let totalAvailable = topicNames.reduce((s, t) => s + topics[t].length, 0);
  let idx = 0;

  while (selected.length < 100 && totalAvailable > 0) {
    const t = topicNames[idx % topicNames.length];
    if (topics[t].length > 0) {
      selected.push(topics[t].shift());
      totalAvailable--;
    }
    idx++;
    if (idx > topicNames.length * 1000) break;
  }

  result[ch] = selected;
  console.log(`Chapter: ${ch} -> selected ${selected.length} items`);
}

fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
console.log('Wrote', outPath);