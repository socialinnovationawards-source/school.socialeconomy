import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { articleUrl, SITE_ORIGIN } from '../src/article-routes.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articles = JSON.parse(await readFile(path.join(root, 'src/articles.json'), 'utf8'));
const slugs = articles.map(({ slug }) => slug);
if (slugs.some((slug) => typeof slug !== 'string' || !slug.trim())) {
  throw new Error('Every article must have a non-empty slug before generating the sitemap.');
}
if (new Set(slugs).size !== slugs.length) {
  throw new Error('Article slugs must be unique before generating the sitemap.');
}

const urls = [new URL('/', SITE_ORIGIN).href, new URL('/articles/', SITE_ORIGIN).href, ...articles.map(articleUrl)];
if (new Set(urls).size !== urls.length) {
  throw new Error('The sitemap URL list contains duplicates.');
}

const xmlEscape = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

await writeFile(path.join(root, 'public/sitemap.xml'), sitemap);
console.log(`Generated sitemap with ${urls.length} canonical URLs.`);
