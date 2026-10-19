# مدرسه اقتصاد

A responsive Persian RTL homepage for social-economy learning, articles, and video previews.

## Development

```sh
npm install
npm run dev
```

Create a production build with `npm run build`. The pre-build step generates a single, lazy-loaded search index from the Markdown articles; `npm run dev` generates the same index for local development.

Article text is stored in `public/articles` and served by the site itself; article pages use the `#/posts/<article-id>` route and show related articles. The featured Aparat video is configured in `src/App.jsx`.

## Deploying to Vercel

The site is a static Vite app. Import the repository into Vercel and use the configured Vite framework, `npm run build` build command, and `dist` output directory. No environment variables or backend services are required. The included `vercel.json` sets static-asset caching and baseline response security headers. Hash-based article routes are handled client-side, so they do not need server rewrites.

The canonical site URL, sitemap, and social metadata use `https://school.socialeconomy.ir/`; update these references if the production domain changes. Article detail routes currently use URL fragments and client-side rendering, so the sitemap lists only the canonical homepage.

To regenerate WebP assets from their source files, run `npm run optimize:images`.
