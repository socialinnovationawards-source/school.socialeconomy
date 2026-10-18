# مدرسه اقتصاد

A responsive Persian RTL homepage for social-economy learning, articles, and video previews.

## Development

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

Article text is stored in `public/articles` and served by the site itself; article pages use the `#/posts/<article-id>` route and show related articles. The featured Aparat video is configured in `src/App.jsx`.
