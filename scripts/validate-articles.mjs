import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articles = JSON.parse(fs.readFileSync(path.join(root, 'src/articles.json'), 'utf8'));
const errors = [];

if (articles.length !== 20) errors.push(`Expected 20 articles, found ${articles.length}`);

for (const article of articles) {
  if (!article.image?.startsWith('/images/')) {
    errors.push(`${article.id}: image path must point to a public image`);
  } else if (!fs.existsSync(path.join(root, 'public', article.image.slice(1)))) {
    errors.push(`${article.id}: missing ${article.image}`);
  }

  if (!article.content.startsWith('/articles/') || !article.content.endsWith('.md')) {
    errors.push(`${article.id}: content path must point to a Markdown file`);
    continue;
  }

  const filePath = path.join(root, 'public', article.content.slice(1));
  if (!fs.existsSync(filePath)) {
    errors.push(`${article.id}: missing ${article.content}`);
    continue;
  }

  const markdown = fs.readFileSync(filePath, 'utf8');
  const headings = [...markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)];
  const sectionCount = headings.filter((heading) => heading[1] === '##').length;
  if (sectionCount < 3) errors.push(`${article.id}: expected at least 3 top-level sections`);
  if (/<\/?جدول>/.test(markdown)) errors.push(`${article.id}: legacy table marker remains`);

  const slugger = new GithubSlugger();
  const ids = headings.map((heading) => slugger.slug(heading[2]));
  if (new Set(ids).size !== ids.length) errors.push(`${article.id}: heading anchors are not unique`);

  const lines = markdown.split(/\r?\n/);
  let tableColumns = 0;
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\|/.test(lines[index])) {
      tableColumns = 0;
      continue;
    }

    const cells = lines[index].split('|').length - 2;
    if (/^\|\s*:?-{3,}/.test(lines[index])) {
      if (!tableColumns || cells !== tableColumns) {
        errors.push(`${article.id}: invalid table separator at line ${index + 1}`);
      }
      continue;
    }

    if (!tableColumns) {
      const nextIsSeparator = /^\|\s*:?-{3,}/.test(lines[index + 1] || '');
      if (!nextIsSeparator) errors.push(`${article.id}: table at line ${index + 1} is missing a separator row`);
      tableColumns = cells;
    } else if (cells !== tableColumns) {
      errors.push(`${article.id}: inconsistent table columns at line ${index + 1}`);
    }
    if (cells < 2) errors.push(`${article.id}: table at line ${index + 1} has fewer than two columns`);
  }

  const wordCount = markdown.trim().split(/\s+/).length;
  if (wordCount < 300) errors.push(`${article.id}: unexpectedly short article (${wordCount} words)`);
  process.stdout.write(`${article.id}: ${sectionCount} sections, ${wordCount} words\n`);
}

if (errors.length) {
  process.stderr.write(`${errors.map((error) => `- ${error}`).join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Validated ${articles.length} Markdown articles.\n`);
}