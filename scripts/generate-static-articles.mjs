import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import react from '@vitejs/plugin-react';
import { createServer } from 'vite';
import { articlePath, articleUrl, SITE_ORIGIN } from '../src/article-routes.js';
import { createArticleDescription } from './article-seo-metadata.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const articles = JSON.parse(await readFile(path.join(root, 'src/articles.json'), 'utf8'));
const template = await readFile(path.join(dist, 'index.html'), 'utf8');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

function replaceMeta(html, title, description, canonical, image, jsonLd, ogType = 'article') {
  const removeHeadTags = [
    /<title>[\s\S]*?<\/title>\s*/i,
    /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>\s*/gi,
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi,
    /<meta\b(?=[^>]*\bproperty=["']og:[^"']+["'])[^>]*>\s*/gi,
    /<meta\b(?=[^>]*\bname=["']twitter:[^"']+["'])[^>]*>\s*/gi,
    /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi,
  ];
  for (const expression of removeHeadTags) html = html.replace(expression, '');

  const metadata = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    ...(canonical ? [`<link rel="canonical" href="${escapeHtml(canonical)}" />`] : []),
    ...(ogType ? [`<meta property="og:type" content="${escapeHtml(ogType)}" />`] : []),
    '<meta property="og:locale" content="fa_IR" />',
    '<meta property="og:site_name" content="مدرسه اقتصاد" />',
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    ...(canonical ? [`<meta property="og:url" content="${escapeHtml(canonical)}" />`] : []),
    ...(image ? [`<meta property="og:image" content="${escapeHtml(image)}" />`] : []),
    ...(image ? ['<meta name="twitter:card" content="summary_large_image" />'] : []),
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    ...(image ? [`<meta name="twitter:image" content="${escapeHtml(image)}" />`] : []),
  ].join('\n    ');
  const structuredData = jsonLd
    ? `\n    <script type="application/ld+json">${escapeJsonForHtml(jsonLd)}</script>`
    : '';
  return html.replace('</head>', `    ${metadata}${structuredData}\n  </head>`);
}

function withRootMarkup(html, markup) {
  return html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
}

function articleJsonLd(article) {
  const canonical = articleUrl(article);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDescription,
    url: canonical,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    image: new URL(article.image, SITE_ORIGIN).href,
    inLanguage: 'fa-IR',
    publisher: {
      '@type': 'Organization',
      name: 'رسانه اقتصاد اجتماعی',
      logo: {
        '@type': 'ImageObject',
        url: new URL('/images/logo.png', SITE_ORIGIN).href,
      },
    },
  };
}

function articleIndexMarkup() {
  const links = articles
    .map(
      (article) =>
        `<li><a href="${escapeHtml(articlePath(article))}"><strong>${escapeHtml(article.title)}</strong><span>${escapeHtml(article.description.trim())}</span><small>${escapeHtml(article.category)}</small></a></li>`,
    )
    .join('\n');
  return `<main class="article-index-page"><a class="article-index-home" href="/">بازگشت به صفحهٔ اصلی</a><h1>فهرست مقاله‌های مدرسه اقتصاد</h1><p>همهٔ مقاله‌های آموزشی مدرسه اقتصاد را بر اساس موضوع مرور کنید.</p><ol class="article-index-list">${links}</ol></main>`;
}

const slugs = articles.map((article) => article.slug);
if (articles.length !== 20) throw new Error(`Expected 20 articles; found ${articles.length}.`);
if (slugs.some((slug) => typeof slug !== 'string' || !slug.trim())) {
  throw new Error('Every article must have a non-empty slug before static generation.');
}
if (new Set(slugs).size !== slugs.length) throw new Error('Article slugs must be unique.');

const server = await createServer({
  configFile: false,
  root,
  plugins: [react()],
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
});

try {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx');

  const homeMarkup = renderToString(React.createElement(App, { initialHome: true }));
  const homeHtml = withRootMarkup(template, homeMarkup).replace(
    '</head>',
    `    <script id="seo-page-data" type="application/json">${escapeJsonForHtml({ home: true })}</script>\n  </head>`,
  );
  await writeFile(path.join(dist, 'index.html'), homeHtml);

  for (const article of articles) {
    const markdown = await readFile(path.join(root, 'public', article.content.slice(1)), 'utf8');
    const description = createArticleDescription(markdown);
    if (!description) throw new Error(`${article.id}: could not create a description from article content.`);
    article.seoDescription = description;
    const markup = renderToString(
      React.createElement(App, {
        initialArticleId: article.id,
        initialArticleMarkdown: markdown,
      }),
    );
    const canonical = articleUrl(article);
    const jsonLd = articleJsonLd(article);
    const pageHtml = replaceMeta(
      withRootMarkup(template, markup),
      `${article.title} | مدرسه اقتصاد`,
      description,
      canonical,
      new URL(article.image, SITE_ORIGIN).href,
      jsonLd,
    )
      .replace(/<link\b(?=[^>]*\brel=["']preload["'][^>]*\bas=["']image["'])[^>]*>/gi, '')
      .replace(
        '</head>',
        `    <link rel="preload" as="image" href="${escapeHtml(article.image)}" fetchpriority="high" />\n    <script id="seo-page-data" type="application/json">${escapeJsonForHtml({ articleId: article.id })}</script>\n  </head>`,
      );
    const output = path.join(dist, decodeURIComponent(articlePath(article).slice(1)), 'index.html');
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, pageHtml);
  }

  const indexCanonical = new URL('/articles/', SITE_ORIGIN).href;
  const indexHtml = replaceMeta(
    withRootMarkup(template, articleIndexMarkup()),
    'فهرست مقاله‌ها | مدرسه اقتصاد',
    'فهرست مقاله‌های آموزشی مدرسه اقتصاد درباره اقتصاد اجتماعی، رفاه، سیاست‌گذاری و مفاهیم اقتصادی.',
    indexCanonical,
    new URL('/images/hero-banner.webp', SITE_ORIGIN).href,
    null,
    'website',
  )
    .replace(/<script id="seo-page-data"[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>\s*/gi, '')
    .replace(/<script\b(?=[^>]*\btype=["']module["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '');
  const indexOutput = path.join(dist, 'articles/index.html');
  await mkdir(path.dirname(indexOutput), { recursive: true });
  await writeFile(indexOutput, indexHtml);

  const notFoundHtml = replaceMeta(
    withRootMarkup(
      template,
      '<main class="article-not-found"><h1>صفحه پیدا نشد</h1><p>نشانی موردنظر در مدرسه اقتصاد وجود ندارد.</p><a href="/articles/">مشاهده فهرست مقاله‌ها</a></main>',
    ),
    'صفحه پیدا نشد | مدرسه اقتصاد',
    'صفحهٔ موردنظر پیدا نشد. فهرست مقاله‌های مدرسه اقتصاد را ببینید.',
    null,
    null,
    null,
    null,
  )
    .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>\s*/gi, '')
    .replace(/<script\b(?=[^>]*\btype=["']module["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '')
    .replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>');
  await writeFile(path.join(dist, '404.html'), notFoundHtml);
} finally {
  await server.close();
}

console.log(`Generated ${articles.length} static article pages and the article index.`);
