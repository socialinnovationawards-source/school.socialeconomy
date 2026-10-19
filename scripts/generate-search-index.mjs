import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articles = JSON.parse(await readFile(path.join(root, 'src/articles.json'), 'utf8'));
const entries = await Promise.all(
  articles.map(async ({ id, content }) => {
    const articlePath = path.join(root, 'public', content.slice(1));
    const text = await readFile(articlePath, 'utf8');
    return [id, text];
  }),
);
const outputPath = path.join(root, 'public/search-index.json');

await writeFile(outputPath, JSON.stringify(Object.fromEntries(entries)));
console.log(`Generated article search index for ${entries.length} articles.`);
