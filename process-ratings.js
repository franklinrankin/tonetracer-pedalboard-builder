// Process the CSV and generate review with new tags

const fs = require('fs');

// Tag ranges from categories.ts
const TAG_RANGES = {
  gain: {
    tags: ['mr. clean', 'dirty bird', 'burner', 'screamer', 'melt my face'],
    ranges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
  },
  modulation: {
    tags: ['still water', 'a little motion', 'swirly', 'spin cycle', 'twister'],
    ranges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
  },
  delay: {
    tags: ['come again?', 'repeater', 'spelunker', 'long term memory', 'time traveler'],
    ranges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
  },
  reverb: {
    tags: ['bone dry', 'moist', 'drippy', 'dreamy', 'floating'],
    ranges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
  },
  dynamics: {
    tags: ['wide open', 'gluey', 'smooth operator', 'squashed', 'clamped down'],
    ranges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
  },
  filter: {
    tags: ['town crier', 'quack doctor', 'funky chicken', 'street sweeper', 'talking'],
    ranges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
  },
  pitch: {
    tags: ['pitchy', 'pitchier', 'harmonious', 'warped', 'unrecognizable'],
    ranges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
  },
  eq: {
    tags: ['shaper', 'sculptor', 'surgical'],
    ranges: [[0, 3], [4, 7], [8, 10]]
  },
  volume: {
    tags: ['in control', 'manager', 'board admin'],
    ranges: [[0, 3], [4, 7], [8, 10]]
  },
  amp: {
    tags: ['direct', 'amplifier', 'simulator'],
    ranges: [[0, 3], [4, 7], [8, 10]]
  },
  utility: {
    tags: ['work smarter', 'router', 'pedal nerd', 'geeked out', 'board scholar'],
    ranges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
  },
  synth: {
    tags: ['effect flavor', 'synth-like', 'sound design'],
    ranges: [[0, 3], [4, 7], [8, 10]]
  },
  multi: {
    tags: ['multi-fx', 'multi-fx', 'multi-fx'],
    ranges: [[0, 3], [4, 7], [8, 10]]
  }
};

function getTag(category, rating) {
  const catLower = category.toLowerCase().trim();
  const info = TAG_RANGES[catLower];
  if (!info) return 'unknown';
  
  for (let i = 0; i < info.ranges.length; i++) {
    const [min, max] = info.ranges[i];
    if (rating >= min && rating <= max) {
      return info.tags[i];
    }
  }
  return info.tags[0];
}

// Read CSV
const csv = fs.readFileSync('/Users/franklinrankin/Downloads/pedal-ratings 1_5 - pedal-ratings.csv', 'utf8');
const lines = csv.trim().split('\n');
const header = lines[0];

const results = [];
const toRemove = [];
const dualCategory = [];
const ratingChanges = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  // Parse CSV properly (handle commas in quoted strings)
  const parts = line.split(',');
  
  const pedal = parts[0];
  const category = parts[1];
  const type = parts[2];
  const currentRating = parseInt(parts[3]) || 0;
  const currentTag = parts[4];
  const newRatingStr = parts[5]?.trim();
  
  // Check for removal
  if (category.toLowerCase() === 'remove') {
    toRemove.push({ pedal, type, currentRating });
    continue;
  }
  
  // Check for dual categories
  if (category.includes(' and ')) {
    const cats = category.split(' and ').map(c => c.trim());
    const finalRating = newRatingStr ? parseInt(newRatingStr) : currentRating;
    dualCategory.push({
      pedal,
      categories: cats,
      type,
      rating: finalRating,
      tags: cats.map(c => getTag(c, finalRating))
    });
    continue;
  }
  
  // Calculate new tag if new rating provided
  const finalRating = newRatingStr ? parseInt(newRatingStr) : currentRating;
  const newTag = getTag(category, finalRating);
  
  if (newRatingStr && parseInt(newRatingStr) !== currentRating) {
    ratingChanges.push({
      pedal,
      category,
      type,
      oldRating: currentRating,
      oldTag: currentTag,
      newRating: finalRating,
      newTag
    });
  }
  
  results.push({
    pedal,
    category,
    type,
    finalRating,
    newTag
  });
}

// Generate summary
console.log('=== PEDALS TO REMOVE (' + toRemove.length + ') ===');
toRemove.forEach(p => console.log(`  - ${p.pedal}`));

console.log('\n=== DUAL CATEGORY PEDALS (' + dualCategory.length + ') ===');
dualCategory.forEach(p => {
  console.log(`  - ${p.pedal}`);
  console.log(`    Categories: ${p.categories.join(', ')}`);
  console.log(`    Rating: ${p.rating} → Tags: ${p.tags.join(', ')}`);
});

console.log('\n=== RATING CHANGES (' + ratingChanges.length + ') ===');

// Create review TSV
const reviewLines = ['Pedal\tCategory\tType\tOld Rating\tOld Tag\tNew Rating\tNew Tag\tChange'];

ratingChanges.forEach(r => {
  const change = r.newRating > r.oldRating ? '↑' : '↓';
  reviewLines.push(`${r.pedal}\t${r.category}\t${r.type}\t${r.oldRating}\t${r.oldTag}\t${r.newRating}\t${r.newTag}\t${change}`);
});

fs.writeFileSync('/Users/franklinrankin/Desktop/TONETRACER/rating-changes-review.tsv', reviewLines.join('\n'));

console.log(`\nCreated rating-changes-review.tsv with ${ratingChanges.length} changes`);
console.log(`Total pedals to keep: ${results.length}`);

