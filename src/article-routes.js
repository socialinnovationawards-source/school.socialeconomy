export const SITE_ORIGIN = 'https://school.socialeconomy.ir';

export function articlePath(article) {
  return `/articles/${encodeURIComponent(article.slug)}/`;
}

export function articleUrl(article) {
  return new URL(articlePath(article), SITE_ORIGIN).href;
}

export function findArticleByPath(pathname, articles) {
  const match = pathname.match(/^\/articles\/([^/]+)\/?$/);
  if (!match) return null;

  let slug;
  try {
    slug = decodeURIComponent(match[1]);
  } catch {
    return null;
  }
  return articles.find((article) => article.slug === slug) || null;
}
