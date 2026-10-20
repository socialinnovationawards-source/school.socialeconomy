function markdownToPlainText(markdown) {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/(^|\s)[>#*+-]+(?=\s)/g, ' ')
    .replace(/[`*_~]/g, '')
    .replace(/\\([\\`*_{}\[\]()#+\-.!])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createArticleDescription(markdown, maxLength = 160) {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map(markdownToPlainText)
    .filter((paragraph) => paragraph && !/^منبع[:：]/.test(paragraph) && !/^\|/.test(paragraph));
  let description = '';

  for (const paragraph of paragraphs) {
    if (!description && paragraph.length < 48) continue;
    description += `${description ? ' ' : ''}${paragraph}`;
    if (description.length >= maxLength + 5) break;
  }

  if (description.length <= maxLength) return description;

  const truncated = description.slice(0, maxLength - 1);
  const lastWordBoundary = truncated.lastIndexOf(' ');
  const safeEnd = lastWordBoundary > maxLength * 0.65 ? lastWordBoundary : maxLength - 1;
  return `${truncated.slice(0, safeEnd).trimEnd()}…`;
}
