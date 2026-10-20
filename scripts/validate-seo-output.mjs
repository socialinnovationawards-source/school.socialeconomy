import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { articlePath, articleUrl, SITE_ORIGIN } from '../src/article-routes.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const articles = JSON.parse(await readFile(path.join(root, 'src/articles.json'), 'utf8'));
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};
const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);
const expectedUrls = [
  new URL('/', SITE_ORIGIN).href,
  new URL('/articles/', SITE_ORIGIN).href,
  ...articles.map(articleUrl),
];
expect(sitemapUrls.length === expectedUrls.length, `Expected ${expectedUrls.length} sitemap URLs; found ${sitemapUrls.length}.`);
expect(new Set(sitemapUrls).size === sitemapUrls.length, 'Sitemap contains duplicate URLs.');
for (const url of expectedUrls) expect(sitemapUrls.includes(url), `Sitemap is missing ${url}.`);
expect(!sitemap.includes('#'), 'Sitemap must not contain URL fragments.');
const robots = await readFile(path.join(root, 'public/robots.txt'), 'utf8');
expect(robots.includes(`Sitemap: ${new URL('/sitemap.xml', SITE_ORIGIN).href}`), 'robots.txt does not reference the production sitemap.');

const homeHtml = await readFile(path.join(dist, 'index.html'), 'utf8');
expect(homeHtml.includes('<h1 id="hero-title">'), 'Homepage HTML is missing its initial H1.');
expect(homeHtml.includes('href="/articles/"'), 'Homepage HTML is missing a crawlable article-index link.');

const notFoundHtml = await readFile(path.join(dist, '404.html'), 'utf8');
expect(notFoundHtml.includes('<h1>صفحه پیدا نشد</h1>'), 'Static 404 page is missing its not-found message.');
expect(notFoundHtml.includes('name="robots" content="noindex"'), 'Static 404 page must be marked noindex.');
expect(!notFoundHtml.includes('rel="canonical"'), 'Static 404 page must not have a canonical URL.');
expect(!/<script\b(?=[^>]*\btype=["']module["'])/i.test(notFoundHtml), 'Static 404 page should not load application JavaScript.');

const indexPath = path.join(dist, 'articles/index.html');
await access(indexPath).catch(() => failures.push('Generated article index is missing.'));
const indexHtml = await readFile(indexPath, 'utf8');
expect(indexHtml.includes('<h1>فهرست مقاله‌های مدرسه اقتصاد</h1>'), 'Article index is missing its heading.');
expect(!/<script\b(?=[^>]*\btype=["']module["'])/i.test(indexHtml), 'Article index should not load the app JavaScript.');
for (const article of articles) {
  expect(indexHtml.includes(`href="${escapeHtml(articlePath(article))}"`), `Article index is missing the link for ${article.id}.`);
}

for (const article of articles) {
  const outputPath = path.join(dist, decodeURIComponent(articlePath(article).slice(1)), 'index.html');
  await access(outputPath).catch(() => failures.push(`${article.id}: generated HTML file is missing.`));
  const html = await readFile(outputPath, 'utf8');
  const canonical = articleUrl(article);
  const title = `${article.title} | مدرسه اقتصاد`;
  expect(html.includes(`<title>${escapeHtml(title)}</title>`), `${article.id}: article-specific title is missing.`);
  expect(html.includes(`rel="canonical" href="${canonical}"`), `${article.id}: canonical URL is missing or incorrect.`);
  expect((html.match(/rel="canonical"/g) || []).length === 1, `${article.id}: expected exactly one canonical URL.`);
  expect(html.includes(`property="og:url" content="${canonical}"`), `${article.id}: Open Graph URL is missing or incorrect.`);
  expect(html.includes(`property="og:title" content="${escapeHtml(title)}"`), `${article.id}: Open Graph title is missing or incorrect.`);
  expect(html.includes(`name="twitter:card" content="summary_large_image"`), `${article.id}: Twitter Card metadata is missing.`);
  expect(html.includes(`name="description" content="${escapeHtml(article.description.trim())}"`), `${article.id}: article description is missing.`);
  expect(html.includes(`property="og:image" content="${new URL(article.image, SITE_ORIGIN).href}"`), `${article.id}: absolute social image is missing.`);
  expect(html.includes(`<h1>${escapeHtml(article.title)}</h1>`), `${article.id}: initial HTML is missing the article H1.`);
  expect(html.includes('article-detail-content-structured'), `${article.id}: initial HTML is missing rendered article content.`);
  expect(!html.includes('"markdown":'), `${article.id}: source Markdown is duplicated in the HTML payload.`);
  expect(!html.includes('#/posts/'), `${article.id}: legacy hash-based article links remain.`);
  expect(html.includes('src="/assets/index-'), `${article.id}: client hydration entry is missing.`);
  expect(html.includes(`href="${article.image}" fetchpriority="high"`), `${article.id}: primary article image is not preloaded.`);

  const rootMarkupStart = html.indexOf('<div id="root">');
  const bodyEnd = html.lastIndexOf('</body>');
  const rootMarkup = html.slice(rootMarkupStart, bodyEnd);
  const visibleText = rootMarkup.replace(/<[^>]*>/g, ' ').replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, ' ');
  expect(visibleText.length > 3000, `${article.id}: initial HTML does not contain meaningful article text.`);

  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  expect(jsonLdMatches.length === 1, `${article.id}: expected exactly one article JSON-LD entity.`);
  if (jsonLdMatches.length === 1) {
    try {
      const jsonLd = JSON.parse(jsonLdMatches[0][1]);
      expect(jsonLd['@type'] === 'Article', `${article.id}: JSON-LD should describe an Article.`);
      expect(jsonLd.headline === article.title, `${article.id}: JSON-LD headline does not match the article.`);
      expect(jsonLd.mainEntityOfPage?.['@id'] === canonical, `${article.id}: JSON-LD mainEntityOfPage does not match canonical.`);
      expect(jsonLd.image === new URL(article.image, SITE_ORIGIN).href, `${article.id}: JSON-LD image does not match article image.`);
      expect(!('author' in jsonLd) && !('datePublished' in jsonLd) && !('dateModified' in jsonLd), `${article.id}: JSON-LD must not invent missing editorial metadata.`);
    } catch (error) {
      failures.push(`${article.id}: JSON-LD is invalid JSON (${error.message}).`);
    }
  }
}

if (failures.length) {
  process.stderr.write(`${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Validated ${articles.length} static article pages, ${expectedUrls.length} sitemap URLs, crawlable index links, metadata, and JSON-LD.\n`);
}
