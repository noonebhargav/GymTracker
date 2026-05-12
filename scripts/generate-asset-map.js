const fs = require('fs');
const path = require('path');

const seedData = JSON.parse(fs.readFileSync('lib/seed_data.json', 'utf-8'));
const assetIds = [...new Set(seedData.map((e) => e.assetId).filter(Boolean))];
assetIds.sort();

const imgLines = [];
const gifLines = [];
let imgCount = 0;
let gifCount = 0;

for (const id of assetIds) {
  const imgFull = path.join('assets', 'exercises', 'images', id + '.jpg');
  const gifFull = path.join('assets', 'exercises', 'videos', id + '.gif');

  if (fs.existsSync(imgFull)) {
    imgLines.push(`  '${id}': require('../assets/exercises/images/${id}.jpg'),`);
    imgCount++;
  }
  if (fs.existsSync(gifFull)) {
    gifLines.push(`  '${id}': require('../assets/exercises/videos/${id}.gif'),`);
    gifCount++;
  }
}

const content = `// Auto-generated from seed_data.json. Do not edit manually.
// Maps exercise assetId -> require() for native image/GIF loading.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EXERCISE_IMAGES: Record<string, any> = {
${imgLines.join('\n')}
};

export const EXERCISE_GIFS: Record<string, ReturnType<typeof require>> = {
${gifLines.join('\n')}
};
`;

fs.writeFileSync('lib/asset-map.ts', content);
console.log(
  `Generated lib/asset-map.ts with ${imgCount} images and ${gifCount} GIFs`
);
