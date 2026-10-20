import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import GithubSlugger from 'github-slugger';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { normalizeArticleSearchText } from './article-search.js';
import { articlePath, findArticleByPath } from './article-routes.js';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Minus,
  Play,
  Plus,
  Search,
  X,
} from 'lucide-react';
import articles from './articles.json';

const categories = ['همه', ...new Set(articles.map((article) => article.category))];
const articlesPerPage = 7;

const videos = [
  {
    id: 'aparat-special',
    title: 'اقتصاد اجتماعی چیست؟',
    subtitle: 'اقتصاد اجتماعی چیست؟',
    episode: 'قسمت ۱',
    videoUrl: 'https://www.aparat.com/video/video/embed/videohash/mwv1805/vt/frame',
    image: '/images/video-what-is-social-economy.webp',
  },
  {
    id: 'social-excellence',
    title: 'تجربه الگوی تعالی اجتماعی رسالت',
    subtitle: 'محمدحسین حسین‌زاده',
    episode: 'قسمت ۲',
    videoUrl: 'https://www.aparat.com/video/video/embed/videohash/rya1c7o/vt/frame',
    image: '/images/hajhosein.jpg',
  },
  {
    id: 'behavioral-governance',
    title: 'کارگاه ابزارها و تجربیات حکمرانی رفتاری در ایران',
    subtitle: 'دکتر علیرضا نفیسی',
    episode: 'قسمت ۳',
    videoUrl: 'https://www.aparat.com/video/video/embed/videohash/ipq75k4/vt/frame',
    image: '/images/nafisi.jpg',
  },
  {
    id: 'institutional-development',
    title: 'وضعیت توسعه ایران از منظر نظریات نهادی',
    subtitle: 'دکتر فرشاد مومنی',
    episode: 'قسمت ۴',
    videoUrl: 'https://www.aparat.com/video/video/embed/videohash/ihz1033/vt/frame',
    image: '/images/momeni.jpg',
  },
  {
    id: 'social-schools',
    title: 'تاریخ مکاتب اجتماعی در دانش اقتصاد',
    subtitle: 'دکتر علی‌اکبر ناسخیان',
    episode: 'قسمت ۵',
    videoUrl: 'https://www.aparat.com/video/video/embed/videohash/kdk0751/vt/frame',
    image: '/images/nasekhian.jpg',
  },
];

let articleSearchIndexPromise;

function loadArticleSearchIndex() {
  if (!articleSearchIndexPromise) {
    articleSearchIndexPromise = fetch('/search-index.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load article search index: ${response.status}`);
        }
        return response.json();
      })
      .then((index) => {
        if (!index || typeof index !== 'object' || Array.isArray(index)) {
          throw new Error('Article search index has an invalid format.');
        }

        return Object.fromEntries(
          Object.entries(index).map(([id, text]) => {
            if (typeof text !== 'string') {
              throw new Error(`Article search index entry "${id}" is not text.`);
            }
            return [id, normalizeArticleSearchText(text)];
          }),
        );
      })
      .catch((error) => {
        articleSearchIndexPromise = undefined;
        throw error;
      });
  }

  return articleSearchIndexPromise;
}

function BrandLogo() {
  return (
    <span
      className="brand-logo"
      style={{ '--brand-logo-image': 'url("/images/logo.png")' }}
      aria-hidden="true"
    />
  );
}

function Header({ query, onQueryChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const links = [
    ['خانه', 'https://socialeconomy.ir'],
    ['مدرسه اقتصاد', '/'],
    ['مقالات', '/articles/'],
    ['درباره ما', 'https://socialeconomy.ir/about-us/'],
    ['ارتباط با ما', 'https://socialeconomy.ir/contact-us/'],
  ];

  return (
    <header className="site-header" id="home">
      <a className="brand" href="/" aria-label="مدرسه اقتصاد، صفحه اصلی">
        <BrandLogo />
      </a>
      <button
        className="mobile-menu-toggle icon-button"
        type="button"
        aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
      <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="ناوبری اصلی">
        {links.map(([label, href], index) => (
          <a
            className={index === 0 ? 'active' : ''}
            href={href}
            key={label}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className={`search-box${mobileSearchOpen ? ' mobile-search-open' : ''}`}>
        <Search size={17} aria-hidden="true" />
        <button
          className="mobile-search-toggle"
          type="button"
          aria-label={mobileSearchOpen ? 'بستن جستجو' : 'باز کردن جستجو'}
          aria-expanded={mobileSearchOpen}
          onClick={() => setMobileSearchOpen((open) => !open)}
        >
          <Search size={18} />
        </button>
        <input
          type="search"
          dir="rtl"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="جستجو در متن کامل مقاله‌ها..."
          aria-label="جستجو در مقاله‌ها"
        />
        {query && (
          <button
            className="search-clear"
            type="button"
            aria-label="پاک کردن جستجو"
            onClick={() => onQueryChange('')}
          >
            <X size={15} />
          </button>
        )}
      </div>
    </header>
  );
}

function Hero({ onPlay }) {
  return (
    <section className="hero-column" id="about" aria-labelledby="hero-title">
      <div className="hero-backdrop" />
      <div className="hero-copy">
        <div className="hero-kicker" id="topics">
          <span>یادگیری</span>
          <i />
          <span>کاوش</span>
          <i />
          <span>ساختن آینده‌ای بهتر</span>
        </div>
        <h1 id="hero-title">
          <span>مدرسه اقتصاد</span>
          <span className="headline-accent">
            اقتصاد را در پیوند با زندگی اجتماعی، توسعه پایدار و عدالت اجتماعی بیاموزید.
          </span>
        </h1>
        <a
          className="hero-cta"
          href="https://www.aparat.com/socialeconomy.ir"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="cta-play"><Play size={15} fill="currentColor" /></span>
          <span>مشاهده مجموعه ویدیوها</span>
        </a>
      </div>
      <VideoCarousel onPlay={onPlay} />
    </section>
  );
}

function VideoCarousel({ onPlay }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = videos[activeIndex];
  const secondary = videos[(activeIndex + 1) % videos.length];
  const changeVideo = (step) =>
    setActiveIndex((index) => (index + step + videos.length) % videos.length);

  return (
    <section className="video-section" id="videos" aria-label="مجموعه ویدیوها">
      <div className="video-row">
        <article className="video-card video-card-featured" style={{ backgroundImage: `url("${featured.image}")` }}>
          <div className="video-scrim" />
          <span className="video-special">ویژه</span>
          <button
            className="video-play"
            type="button"
            aria-label={`نمایش پیش‌نمایش: ${featured.title}`}
            onClick={() => onPlay(featured)}
          >
            <Play size={22} fill="currentColor" />
          </button>
          <div className="video-caption">
            <span className="video-episode">{featured.episode}</span>
            <h2>{featured.title}</h2>
            <p>{featured.subtitle}</p>
          </div>
          <span className="video-duration">{featured.duration}</span>
          <button
            className="carousel-arrow arrow-prev"
            type="button"
            aria-label="ویدیوی قبلی"
            onClick={() => changeVideo(-1)}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            className="carousel-arrow arrow-next"
            type="button"
            aria-label="ویدیوی بعدی"
            onClick={() => changeVideo(1)}
          >
            <ChevronRight size={17} />
          </button>
        </article>
        <article className="video-card video-card-secondary" style={{ backgroundImage: `url("${secondary.image}")` }}>
          <div className="video-scrim" />
          <span className="video-episode-badge">{secondary.episode}</span>
          <button
            className="secondary-play"
            type="button"
            aria-label={`نمایش پیش‌نمایش: ${secondary.title}`}
            onClick={() => onPlay(secondary)}
          >
            <Play size={16} fill="currentColor" />
          </button>
          <div className="video-caption secondary-caption">
            <h2>{secondary.title}</h2>
            <p>{secondary.subtitle}</p>
          </div>
          <div className="secondary-arrows">
            <button type="button" aria-label="ویدیوی قبلی" onClick={() => changeVideo(-1)}>
              <ChevronLeft size={15} />
            </button>
            <button type="button" aria-label="ویدیوی بعدی" onClick={() => changeVideo(1)}>
              <ChevronRight size={15} />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

function ArticlePanel({ query, onClearSearch }) {
  const [category, setCategory] = useState('همه');
  const [page, setPage] = useState(1);
  const [articleText, setArticleText] = useState(null);
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchAttempt, setSearchAttempt] = useState(0);
  const normalizedQuery = normalizeArticleSearchText(query);

  useEffect(() => {
    if (!normalizedQuery) {
      setSearchStatus('idle');
      return undefined;
    }
    if (articleText) return undefined;

    let cancelled = false;
    setSearchStatus('loading');
    loadArticleSearchIndex().then(
      (index) => {
        if (cancelled) return;
        setArticleText(index);
        setSearchStatus('idle');
      },
      (error) => {
        if (cancelled) return;
        console.error('Full-text article search failed.', error);
        setSearchStatus('error');
      },
    );

    return () => {
      cancelled = true;
    };
  }, [articleText, normalizedQuery, searchAttempt]);

  const filteredArticles = useMemo(
    () =>
      articles.filter((article) => {
        const matchesCategory =
          category === 'همه' ||
          article.category === category;
        const searchable = normalizeArticleSearchText(
          `${article.title} ${article.description || ''} ${article.category} ${articleText?.[article.id] || ''}`,
        );
        return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
      }),
    [articleText, category, normalizedQuery],
  );
  const pageCount = Math.ceil(filteredArticles.length / articlesPerPage);
  const currentPage = Math.min(page, pageCount || 1);
  const pageArticles = filteredArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage,
  );
  const featured = pageArticles[0];
  const cards = pageArticles.slice(1);

  const chooseCategory = (value) => {
    setCategory(value);
  };

  useEffect(() => {
    setPage(1);
  }, [category, normalizedQuery]);

  return (
    <aside className="articles-panel" id="articles">
      <div className="articles-heading">
        <h2>مقالات آموزشی</h2>
        <a href="/articles/" className="all-articles-link">نمایش همه مقاله‌ها</a>
      </div>
      <div className="category-row" id="article-list" aria-label="دسته‌بندی مقالات">
        <div className="category-list">
          {categories.map((value) => (
            <button
              className={`category-chip${category === value ? ' selected' : ''}`}
              type="button"
              aria-pressed={category === value}
              onClick={() => chooseCategory(value)}
              key={value}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      {searchStatus === 'error' && (
        <div className="empty-results" role="alert">
          <strong>جست‌وجوی متن کامل مقاله‌ها انجام نشد.</strong>
          <span>اتصال را بررسی کنید و دوباره تلاش کنید.</span>
          <button type="button" onClick={() => setSearchAttempt((attempt) => attempt + 1)}>
            تلاش دوباره
          </button>
        </div>
      )}
      {searchStatus === 'loading' && (
        <div className="search-status" role="status">در حال جست‌وجو در متن کامل مقاله‌ها…</div>
      )}
      {filteredArticles.length ? (
        <>
          {featured && <FeaturedArticle article={featured} />}
          {cards.length > 0 && (
            <div className="article-grid">
              {cards.map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          )}
        </>
      ) : searchStatus !== 'loading' && searchStatus !== 'error' ? (
        <div className="empty-results" role="status">
          <Search size={21} />
          <strong>مقاله‌ای پیدا نشد</strong>
          <span>عبارت جستجو یا دسته‌بندی دیگری را امتحان کنید.</span>
          <button
            type="button"
            onClick={() => {
              chooseCategory('همه');
              onClearSearch();
            }}
          >
            نمایش همه مقالات
          </button>
        </div>
      ) : null}
      {pageCount > 1 && (
        <nav className="article-pagination" aria-label="صفحه‌های مقالات">
          <button
            type="button"
            aria-label="صفحه قبلی"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronRight size={16} />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <button
              className={currentPage === pageNumber ? 'current' : ''}
              type="button"
              aria-label={`صفحه ${pageNumber}`}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
              onClick={() => setPage(pageNumber)}
              key={pageNumber}
            >
              {pageNumber.toLocaleString('fa-IR')}
            </button>
          ))}
          <button
            type="button"
            aria-label="صفحه بعدی"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronLeft size={16} />
          </button>
        </nav>
      )}
    </aside>
  );
}

function FeaturedArticle({ article }) {
  return (
    <a className="featured-article article-button" href={articlePath(article)} title={article.title}>
      <span className="featured-image-wrap">
        <img src={article.image} alt={`${article.title}، تصویر شاخص`} decoding="async" />
      </span>
      <span className="featured-copy">
        <span className="article-category">{article.category}</span>
        <strong className="featured-title">{article.title}</strong>
        <span className="featured-description">{article.description}</span>
        <ArticleMeta article={article} />
      </span>
    </a>
  );
}

function ArticleCard({ article }) {
  return (
    <a className="article-card article-button" href={articlePath(article)} title={article.title}>
      <span className="article-image-wrap">
        <img src={article.image} alt="" loading="lazy" decoding="async" />
      </span>
      <span className="article-card-copy">
        <strong>{article.title}</strong>
        <ArticleMeta article={article} />
      </span>
    </a>
  );
}

function ArticleMeta({ article }) {
  return (
    <span className="article-meta">
      {article.date && <><span>{article.date}</span><i /></>}
      <span>{article.readTime}</span>
    </span>
  );
}

function PreviewDialog({ item, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!item) return undefined;
    const previousFocus = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const buttons = dialogRef.current?.querySelectorAll('button:not([disabled])');
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('dialog-open');
    dialogRef.current?.querySelector('button')?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('dialog-open');
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [item, onClose]);

  if (!item) return null;
  const isVideo = Object.hasOwn(item, 'duration') || Object.hasOwn(item, 'videoUrl');

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        ref={dialogRef}
      >
        <button className="dialog-close icon-button" type="button" aria-label="بستن" onClick={onClose}>
          <X size={19} />
        </button>
        <div className={`dialog-image${item.videoUrl ? ' has-video' : ''}`} style={{ backgroundImage: `url("${item.image}")` }}>
          {item.videoUrl ? (
            <iframe
              src={item.videoUrl}
              title={item.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : isVideo && <span className="dialog-play-mark"><Play size={19} fill="currentColor" /></span>}
        </div>
        <div className="dialog-copy">
          <span className="dialog-eyebrow">{isVideo ? 'پیش‌نمایش مجموعه ویدیوها' : item.category}</span>
          <h2 id="dialog-title">{item.title}</h2>
          <p>
            {isVideo
              ? item.videoUrl ? item.subtitle : `${item.subtitle} — فایل ویدیویی این مجموعه هنوز منتشر نشده است.`
              : item.description}
          </p>
          {!isVideo && <ArticleMeta article={item} />}
          {isVideo && item.duration && <span className="dialog-duration">مدت مجموعه: {item.duration}</span>}
          <button className="dialog-done" type="button" onClick={onClose}>متوجه شدم</button>
        </div>
      </section>
    </div>
  );
}

function getArticleOutline(text) {
  const slugger = new GithubSlugger();
  const sections = [];
  let currentSection = null;

  text.split(/\r?\n/).forEach((line) => {
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line.trim());
    if (!match) return;

    const heading = { id: slugger.slug(match[2]), title: match[2], children: [] };
    if (match[1].length === 2) {
      currentSection = heading;
      sections.push(heading);
    } else if (currentSection) {
      currentSection.children.push(heading);
    }
  });

  return sections;
}

function ArticleOutline({ sections }) {
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const triggerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const outlineRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 700px)');
    const updateViewport = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) setMobileOpen(false);
    };
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        outlineRef.current?.querySelectorAll('a[href], button:not([disabled])') || [],
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusableElements.length) {
        event.preventDefault();
        outlineRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (window.matchMedia('(max-width: 700px)').matches) triggerRef.current?.focus();
    };
  }, [isMobile, mobileOpen]);

  const toggleSection = (sectionId) => {
    setExpandedSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const scrollToHeading = (event, headingId) => {
    event.preventDefault();
    document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (isMobile) setMobileOpen(false);
  };

  const renderLink = (heading) => (
    <a href={`#${heading.id}`} onClick={(event) => scrollToHeading(event, heading.id)}>
      {heading.title}
    </a>
  );

  return (
    <>
      <button
        ref={triggerRef}
        className="article-outline-mobile-trigger"
        type="button"
        aria-controls="article-outline-panel"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} aria-hidden="true" />
        <span>فهرست مطالب</span>
        <ChevronLeft size={15} aria-hidden="true" />
      </button>
      <button
        className="article-outline-backdrop"
        type="button"
        aria-label="بستن فهرست مطالب"
        hidden={!isMobile || !mobileOpen}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        ref={outlineRef}
        id="article-outline-panel"
        className={`article-outline${mobileOpen ? ' article-outline-open' : ''}`}
        aria-labelledby="article-outline-title"
        aria-hidden={isMobile && !mobileOpen}
        aria-modal={isMobile && mobileOpen ? 'true' : undefined}
        role={isMobile && mobileOpen ? 'dialog' : undefined}
        tabIndex={-1}
      >
        <div className="article-outline-heading">
          <h2 id="article-outline-title">فهرست مطالب</h2>
          <button
            ref={closeButtonRef}
            className="article-outline-close"
            type="button"
            aria-label="بستن فهرست مطالب"
            onClick={() => setMobileOpen(false)}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="فهرست تیترهای مقاله">
          <ol>
            {sections.map((section) => {
              const isExpanded = expandedSections.has(section.id);
              return (
                <li key={section.id}>
                  <div className="article-outline-row">
                    {section.children.length > 0 && (
                      <button
                        type="button"
                        aria-label={`${isExpanded ? 'بستن' : 'باز کردن'} زیرتیترهای ${section.title}`}
                        aria-expanded={isExpanded}
                        aria-controls={`${section.id}-subheadings`}
                        onClick={() => toggleSection(section.id)}
                      >
                        {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                      </button>
                    )}
                    {section.children.length === 0 && <span className="article-outline-toggle-spacer" aria-hidden="true" />}
                    {renderLink(section)}
                  </div>
                  {section.children.length > 0 && (
                    <ol
                      className="article-outline-children"
                      id={`${section.id}-subheadings`}
                      hidden={!isExpanded}
                    >
                      {section.children.map((heading) => (
                        <li key={heading.id}>{renderLink(heading)}</li>
                      ))}
                    </ol>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>
    </>
  );
}

function ArticleMarkdown({ text }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        blockquote: ({ children }) => <blockquote className="article-key-point">{children}</blockquote>,
        p: ({ children }) => {
          const text = React.Children.toArray(children)
            .filter((child) => typeof child === 'string')
            .join('');
          const isEquation = text.includes('=') && text.length < 180;
          return <p className={isEquation ? 'article-equation' : undefined}>{children}</p>;
        },
        table: ({ children }) => (
          <div className="article-table-scroll">
            <table>{children}</table>
          </div>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function RecentCategoryArticles({ article }) {
  const latestArticles = articles
    .filter((candidate) => candidate.id !== article.id && candidate.category === article.category)
    .slice(-4)
    .reverse();

  return (
    <aside className="recent-category-articles" aria-labelledby="recent-category-articles-title">
      <h2 id="recent-category-articles-title">مقالات آموزشی مرتبط</h2>
      <p className="recent-category-name">{article.category}</p>
      <ol>
        {latestArticles.map((recentArticle, index) => (
          <li key={recentArticle.id}>
            <a href={articlePath(recentArticle)}>
                <span className="recent-article-number">
                  {(index + 1).toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}
                </span>
              <span className="recent-article-copy">
                <strong>{recentArticle.title}</strong>
                <small>{recentArticle.readTime}</small>
              </span>
              <ChevronLeft size={15} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function ArticlePage({ article, initialMarkdown, initialContentHtml, initialOutline }) {
  const [articleText, setArticleText] = useState(initialMarkdown || '');
  const [loading, setLoading] = useState(!initialMarkdown && !initialContentHtml);
  const [error, setError] = useState(false);
  const outlineSections = useMemo(
    () => initialOutline || getArticleOutline(articleText),
    [articleText, initialOutline],
  );
  const hasOutline = outlineSections.length >= 3;
  const relatedArticles = useMemo(() => {
    const sameCategory = articles.filter(
      (candidate) => candidate.id !== article.id && candidate.category === article.category,
    );
    return (sameCategory.length >= 3
      ? sameCategory
      : articles.filter((candidate) => candidate.id !== article.id)
    ).slice(0, 3);
  }, [article]);
  const articleDetail = (
    <article className="article-detail">
      <div className="article-detail-hero">
        <img className="article-detail-image" src={article.image} alt={`${article.title}، تصویر شاخص`} />
        <div className="article-detail-header">
          <span className="article-category">{article.category}</span>
          <h1>{article.title}</h1>
          <ArticleMeta article={article} />
        </div>
      </div>
      {loading && <p className="article-detail-status">در حال بارگذاری مقاله…</p>}
      {error && <p className="article-detail-status" role="alert">بارگذاری متن مقاله ممکن نشد.</p>}
      {articleText && (
        <div className="article-detail-content article-detail-content-structured">
          <ArticleMarkdown text={articleText} />
        </div>
      )}
      {!articleText && initialContentHtml && (
        <div
          className="article-detail-content article-detail-content-structured"
          dangerouslySetInnerHTML={{ __html: initialContentHtml }}
        />
      )}
    </article>
  );

  useEffect(() => {
    if (initialMarkdown || initialContentHtml) return undefined;
    const controller = new AbortController();
    setArticleText('');
    setLoading(true);
    setError(false);
    fetch(article.content, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Article content unavailable');
        return response.text();
      })
      .then(setArticleText)
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [article, initialContentHtml, initialMarkdown]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${article.title} | مدرسه اقتصاد`;
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
    };
  }, [article]);

  return (
    <main className="article-page">
      <div className={`article-reading-layout${hasOutline ? '' : ' article-reading-layout-no-outline'}`}>
        {hasOutline && <ArticleOutline sections={outlineSections} />}
        {articleDetail}
        <RecentCategoryArticles article={article} />
      </div>
      {relatedArticles.length > 0 && (
        <section className="related-articles" aria-labelledby="related-articles-title">
          <h2 id="related-articles-title">مقالات مشابه</h2>
          <div className="article-grid">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard article={relatedArticle} key={relatedArticle.id} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function getLocationRoute() {
  const article = findArticleByPath(window.location.pathname, articles);
  if (article) return { article, notFound: false };

  const legacyMatch = window.location.hash.match(/^#\/posts\/([^/?#]+)$/);
  const legacyArticle = legacyMatch
    ? articles.find((candidate) => candidate.id === legacyMatch[1])
    : null;
  if (legacyArticle) return { article: legacyArticle, notFound: false };

  const isUnknownArticlePath =
    window.location.pathname.startsWith('/articles/') &&
    window.location.pathname !== '/articles/' &&
    window.location.pathname !== '/articles/index.html';
  return { article: null, notFound: isUnknownArticlePath };
}

function ArticleNotFound() {
  useEffect(() => {
    document.title = 'مقاله پیدا نشد | مدرسه اقتصاد';
  }, []);

  return (
    <main className="article-not-found">
      <h1>مقاله پیدا نشد</h1>
      <p>نشانی این مقاله معتبر نیست یا مقاله در دسترس نیست.</p>
      <a href="/articles/">مشاهده فهرست مقاله‌ها</a>
    </main>
  );
}

function App({
  initialHome,
  initialArticleId,
  initialArticleMarkdown,
  initialArticleContentHtml,
  initialArticleOutline,
}) {
  const [query, setQuery] = useState('');
  const [route, setRoute] = useState(() => {
    if (initialHome) return { article: null, notFound: false };
    if (initialArticleId) {
      return {
        article: articles.find((article) => article.id === initialArticleId) || null,
        notFound: false,
      };
    }
    return getLocationRoute();
  });
  const [dialogItem, setDialogItem] = useState(null);

  useEffect(() => {
    const updateRoute = () => {
      setRoute(getLocationRoute());
    };
    window.addEventListener('popstate', updateRoute);
    window.addEventListener('hashchange', updateRoute);
    return () => {
      window.removeEventListener('popstate', updateRoute);
      window.removeEventListener('hashchange', updateRoute);
    };
  }, []);

  return (
    <>
      <Header query={query} onQueryChange={setQuery} />
      {route.article ? (
        <ArticlePage
          key={route.article.id}
          article={route.article}
          initialMarkdown={route.article.id === initialArticleId ? initialArticleMarkdown : undefined}
          initialContentHtml={route.article.id === initialArticleId ? initialArticleContentHtml : undefined}
          initialOutline={route.article.id === initialArticleId ? initialArticleOutline : undefined}
        />
      ) : route.notFound ? (
        <ArticleNotFound />
      ) : (
        <main className="page-layout">
          <Hero onPlay={setDialogItem} />
          <ArticlePanel query={query} onClearSearch={() => setQuery('')} />
        </main>
      )}
      <footer className="site-footer" id="contact">
        <span><BrandLogo /></span>
        <p>کلیه حقوق این وبسایت برای رسانه اقتصاد اجتماعی محفوظ است.</p>
      </footer>
      <PreviewDialog item={dialogItem} onClose={() => setDialogItem(null)} />
    </>
  );
}

export default App;
