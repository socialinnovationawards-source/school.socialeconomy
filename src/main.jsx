import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import articles from './articles.json';
import { articlePath, findArticleByPath } from './article-routes.js';
import './styles.css';

const legacyRoute = window.location.hash.match(/^#\/posts\/([^/?#]+)$/);
const legacyArticle = legacyRoute
  ? articles.find((article) => article.id === legacyRoute[1])
  : null;

if (legacyArticle) {
  window.location.replace(articlePath(legacyArticle));
} else {
  const root = document.getElementById('root');
  const pageDataElement = document.getElementById('seo-page-data');
  const pageData = pageDataElement ? JSON.parse(pageDataElement.textContent) : null;
  const pathArticle = findArticleByPath(window.location.pathname, articles);
  const articleContentElement = root.querySelector('.article-detail-content-structured');
  const initialArticleContentHtml = articleContentElement?.innerHTML;
  const initialArticleOutline = articleContentElement
    ? [...articleContentElement.querySelectorAll('h2, h3')].reduce((sections, heading) => {
        const item = { id: heading.id, title: heading.textContent, children: [] };
        if (heading.tagName === 'H2') {
          sections.push(item);
        } else {
          sections.at(-1)?.children.push(item);
        }
        return sections;
      }, [])
    : undefined;
  const pageDataMatchesLocation =
    (pageData?.home && (window.location.pathname === '/' || window.location.pathname === '/index.html')) ||
    (pageData?.articleId && pathArticle?.id === pageData.articleId);
  const app = (
    <React.StrictMode>
      <App
        initialHome={pageDataMatchesLocation && pageData?.home}
        initialArticleId={pageDataMatchesLocation ? pageData?.articleId : undefined}
        initialArticleContentHtml={pageDataMatchesLocation ? initialArticleContentHtml : undefined}
        initialArticleOutline={pageDataMatchesLocation ? initialArticleOutline : undefined}
      />
    </React.StrictMode>
  );

  if (pageDataMatchesLocation) {
    hydrateRoot(root, app);
  } else {
    createRoot(root).render(app);
  }
}
