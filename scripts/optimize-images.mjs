import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const articles = JSON.parse(await readFile(new URL('../src/articles.json', import.meta.url), 'utf8'));
const imagePaths = [
  ...articles.map(({ image }) => {
    const inputPath = path.join('public', image.slice(1)).replace(/\.webp$/i, '.jpg');
    return { inputPath, outputPath: inputPath.replace(/\.jpe?g$/i, '.webp') };
  }),
  ...[
    'public/images/video-what-is-social-economy.jpg',
    'public/images/video-winter-school.jpg',
    'pic/bgg.png',
  ].map((inputPath) => ({
    inputPath,
    outputPath: inputPath.replace(/\.(?:jpe?g|png)$/i, '.webp'),
  })),
  {
    inputPath: 'pic/Screenshot 2026-10-18 141537.jpg',
    outputPath: 'public/images/hero-banner.webp',
  },
];

let inputBytes = 0;
let outputBytes = 0;

for (const { inputPath, outputPath } of imagePaths) {
  const inputSize = (await stat(inputPath)).size;
  const { size: outputSize } = await sharp(inputPath)
    .rotate()
    .resize({ width: 1440, height: 1440, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(outputPath);

  inputBytes += inputSize;
  outputBytes += outputSize;
  console.log(`${inputPath}: ${Math.round(inputSize / 1024)} KB -> ${Math.round(outputSize / 1024)} KB`);
}

const reduction = ((inputBytes - outputBytes) / inputBytes) * 100;
console.log(`Total: ${Math.round(inputBytes / 1024)} KB -> ${Math.round(outputBytes / 1024)} KB (${reduction.toFixed(1)}% smaller)`);
