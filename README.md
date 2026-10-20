# مدرسه اقتصاد

A responsive Persian RTL homepage for social-economy learning, articles, and video previews.

## Development

```sh
npm install
npm run dev
```

Create a production build with `npm run build`. The pre-build step generates a single, lazy-loaded search index from the Markdown articles; `npm run dev` generates the same index for local development.

Article text is stored in `public/articles` and article metadata, including each stable Persian URL slug, is stored in `src/articles.json`. The production build prerenders a separate page under `/articles/<slug>/` for each article and generates `/articles/` as a crawlable index. Markdown is included in the initial article HTML; React hydrates that markup for the existing interactive outline and navigation.

## Deploying to Vercel

The site is a static Vite app. Import the repository into Vercel and use the configured Vite framework, `npm run build` build command, and `dist` output directory. No environment variables or backend services are required. The included `vercel.json` sets static-asset caching and baseline response security headers. Generated article HTML is written into `dist/articles/<slug>/index.html`, and a noindex `dist/404.html` provides an explicit static not-found page. No catch-all route rewrite is configured.

The canonical site URL, generated sitemap, and social metadata use `https://school.socialeconomy.ir/`; update `src/article-routes.js` and `index.html` if the production domain changes. Legacy `/#/posts/<article-id>` URLs can only be redirected in the browser because URL fragments are not sent to Vercel; new links, canonicals, and sitemap entries use the independent article paths.

Run `npm run validate:articles` to check Markdown content and `npm run validate:seo` after a production build to verify generated pages, canonical URLs, sitemap entries, and structured data. Vite's local preview may use SPA fallback behavior for an unknown path; the output includes a dedicated 404 page for static hosting. Article JSON-LD omits author and date fields unless accurate editorial values are added to the article metadata.

To regenerate WebP assets from their source files, run `npm run optimize:images`.
