import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lightbulb,
  Leaf,
  Menu,
  Minus,
  Play,
  Plus,
  Search,
  UsersRound,
  UserRound,
  X,
} from 'lucide-react';
import articles from './articles.json';

const categories = ['همه', ...new Set(articles.map((article) => article.category))];
const articlesPerPage = 7;

const unemploymentOutline = [
  { id: 'what-is-unemployment', title: 'بیکاری چیست؟' },
  { id: 'unemployment-rate', title: 'نرخ بیکاری چیست و چگونه محاسبه می‌شود؟' },
  {
    id: 'unemployment-types',
    title: 'انواع بیکاری کدام‌اند؟',
    children: [
      { id: 'frictional-unemployment', title: '۱. بیکاری اصطکاکی چیست؟' },
      { id: 'structural-unemployment', title: '۲. بیکاری ساختاری چیست؟' },
      { id: 'cyclical-unemployment', title: '۳. بیکاری ادواری یا چرخه‌ای چیست؟' },
      { id: 'seasonal-unemployment', title: '۴. بیکاری فصلی چیست؟' },
      { id: 'technological-unemployment', title: '۵. بیکاری ناشی از فناوری چیست؟' },
      { id: 'wage-unemployment', title: '۶. بیکاری ناشی از دستمزد بالاتر از سطح تعادلی چیست؟' },
      { id: 'hidden-unemployment', title: '۷. بیکاری پنهان چیست؟' },
    ],
  },
  {
    id: 'unemployment-causes',
    title: 'مهم‌ترین علت‌های بیکاری چیست؟',
    children: [
      { id: 'recession-and-demand', title: '۱. رکود اقتصادی و کاهش تقاضا' },
      { id: 'skills-mismatch', title: '۲. ناهماهنگی میان مهارت‌های نیروی کار و نیاز بازار' },
      { id: 'technology-and-automation', title: '۳. تغییرات فناوری و اتوماسیون' },
      { id: 'investment-and-production', title: '۴. کاهش سرمایه‌گذاری و ضعف تولید' },
      { id: 'labor-force-growth', title: '۵. رشد جمعیت فعال و ورود نیروی کار جدید' },
      { id: 'barriers-and-discrimination', title: '۶. موانع ورود به بازار کار و تبعیض' },
      { id: 'business-environment', title: '۷. مشکلات ساختاری محیط کسب‌وکار' },
    ],
  },
  {
    id: 'unemployment-employment-differences',
    title: 'تفاوت بیکاری، اشتغال ناقص و عدم مشارکت اقتصادی چیست؟',
  },
  {
    id: 'unemployment-consequences',
    title: 'بیکاری چه پیامدهایی برای اقتصاد و جامعه دارد؟',
    children: [
      { id: 'income-and-poverty', title: 'کاهش درآمد و افزایش فقر' },
      { id: 'production-capacity', title: 'کاهش تولید و استفاده‌نشدن از ظرفیت اقتصادی' },
      { id: 'inequality-and-deprivation', title: 'افزایش نابرابری و تشدید محرومیت اجتماعی' },
      { id: 'skills-and-return-to-work', title: 'کاهش مهارت‌ها و دشوارتر شدن بازگشت به بازار کار' },
      { id: 'social-consequences', title: 'پیامدهای فردی و اجتماعی' },
    ],
  },
  { id: 'reducing-unemployment', title: 'چگونه می‌توان بیکاری را کاهش داد؟' },
  { id: 'unemployment-summary', title: 'جمع‌بندی' },
  {
    id: 'unemployment-faq',
    title: 'پرسش‌های متداول درباره بیکاری',
    children: [
      { id: 'unemployment-simple-definition', title: 'بیکاری به زبان ساده چیست؟' },
      { id: 'main-unemployment-types', title: 'مهم‌ترین انواع بیکاری کدام‌اند؟' },
      { id: 'main-unemployment-cause', title: 'مهم‌ترین علت بیکاری چیست؟' },
      { id: 'structural-and-cyclical-difference', title: 'تفاوت بیکاری ساختاری و ادواری چیست؟' },
      { id: 'who-counts-as-unemployed', title: 'آیا هر فردی که شغل ندارد، بیکار محسوب می‌شود؟' },
      { id: 'unemployment-rate-calculation', title: 'نرخ بیکاری چگونه محاسبه می‌شود؟' },
      { id: 'technology-and-unemployment', title: 'آیا فناوری باعث افزایش بیکاری می‌شود؟' },
      { id: 'how-to-reduce-unemployment', title: 'چگونه می‌توان بیکاری را کاهش داد؟' },
    ],
  },
  { id: 'further-reading', title: 'منابع پیشنهادی برای مطالعه بیشتر' },
];

const unemploymentHeadings = new Map(
  unemploymentOutline.flatMap((section) => [
    [section.title, { id: section.id, level: 2 }],
    ...(section.children || []).map((heading) => [heading.title, { id: heading.id, level: 3 }]),
  ]),
);

const videos = [
  {
    id: 'aparat-special',
    title: 'اقتصاد اجتماعی چیست؟',
    subtitle: 'اقتصاد اجتماعی چیست؟',
    episode: 'قسمت ۱',
    videoUrl: 'https://www.aparat.com/video/video/embed/videohash/mwv1805/vt/frame',
    image: '/images/video-what-is-social-economy.jpg',
  },
  {
    id: 'cooperation',
    title: 'همکاری‌ها در عمل',
    subtitle: 'تعاونی‌ها و توسعه محلی',
    episode: 'قسمت ۲',
    duration: '۲۴:۰۸',
    image: '/images/video-cooperation.jpg',
  },
  {
    id: 'future',
    title: 'آینده‌ای برای همه',
    subtitle: 'راهکارهایی برای زیست پایدار',
    episode: 'قسمت ۳',
    duration: '۱۹:۴۲',
    image: '/images/video-social-economy.jpg',
  },
];

const features = [
  {
    title: 'محتوای تخصصی',
    description: 'از نظریه تا تجربه‌های واقعی',
    icon: Leaf,
    href: '#videos',
  },
  {
    title: 'دوره‌های آموزشی',
    description: 'یادگیری در کنار متخصصان',
    icon: UsersRound,
    href: '#videos',
  },
  {
    title: 'مقالات و تحلیل‌ها',
    description: 'بررسی مسائل روز جهان و ایران',
    icon: FileText,
    href: '#articles',
  },
  {
    title: 'پیشنهادهای کاربردی',
    description: 'برای کنشگران و سیاست‌گذاران',
    icon: Lightbulb,
    href: '#contact',
  },
];

const normalize = (value) =>
  value.replaceAll('ي', 'ی').replaceAll('ى', 'ی').replaceAll('ك', 'ک').trim().toLocaleLowerCase('fa');

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true" fill="none">
      <path d="M20 33.5V18.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M20.1 20.4C11.7 20.4 7.7 15.1 8 7.4c7.7-.1 13.1 3.8 13.1 11.9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.1 25.4c.1-7.8 4.7-12.3 12-12.6.3 7.8-3.5 12.6-12 12.6Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.2 33.5h13.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Header({ query, onQueryChange, onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const links = [
    ['خانه', '#home'],
    ['دوره‌ها', '#courses'],
    ['مقالات', '#articles'],
    ['موضوعات', '#topics'],
    ['درباره ما', '#about'],
    ['ارتباط با ما', '#contact'],
  ];

  return (
    <header className="site-header" id="home">
      <a className="brand" href="#home" aria-label="مدرسه اقتصاد، صفحه اصلی">
        <BrandMark />
        <span>مدرسه اقتصاد</span>
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
          placeholder="جستجو در مقالات، دوره‌ها، موضوعات و ..."
          aria-label="جستجو در مقالات، دوره‌ها و موضوعات"
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
      <button className="login-link" type="button" onClick={onLogin}>
        <span>ورود / ثبت‌نام</span>
        <span className="login-icon"><UserRound size={17} /></span>
      </button>
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
          <span className="headline-accent">اقتصاد اجتماعی</span>
        </h1>
        <p>
          با هم بیاموزیم، بیندیشیم و راهکارهای عملی برای اقتصادی عادلانه‌تر و پایدارتر پیدا کنیم.
        </p>
        <a className="hero-cta" href="#videos">
          <span className="cta-play"><Play size={15} fill="currentColor" /></span>
          <span>مشاهده مجموعه ویدیوها</span>
        </a>
      </div>
      <VideoCarousel onPlay={onPlay} />
      <FeatureCards />
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

function FeatureCards() {
  return (
    <section className="feature-grid" id="courses" aria-label="بخش‌های مدرسه اقتصاد">
      {features.map(({ title, description, icon: Icon, href }) => (
        <a className="feature-card" href={href} key={title}>
          <span className="feature-icon"><Icon size={21} strokeWidth={1.8} /></span>
          <strong>{title}</strong>
          <span className="feature-description">{description}</span>
        </a>
      ))}
    </section>
  );
}

function ArticlePanel({ query, onViewAll }) {
  const [category, setCategory] = useState('همه');
  const [page, setPage] = useState(1);
  const normalizedQuery = normalize(query);
  const filteredArticles = useMemo(
    () =>
      articles.filter((article) => {
        const matchesCategory =
          category === 'همه' ||
          article.category === category;
        const searchable = normalize(`${article.title} ${article.description || ''} ${article.category}`);
        return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
      }),
    [category, normalizedQuery],
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
        <a
          href="#article-list"
          onClick={() => {
            chooseCategory('همه');
            onViewAll();
          }}
        >
          مشاهده همه <ArrowLeft size={14} />
        </a>
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
      ) : (
        <div className="empty-results" role="status">
          <Search size={21} />
          <strong>مقاله‌ای پیدا نشد</strong>
          <span>عبارت جستجو یا دسته‌بندی دیگری را امتحان کنید.</span>
          <button
            type="button"
            onClick={() => {
              chooseCategory('همه');
              onViewAll();
            }}
          >
            نمایش همه مقالات
          </button>
        </div>
      )}
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
    <a className="featured-article article-button" href={`#/posts/${article.id}`}>
      <span className="featured-image-wrap">
        <img src={article.image} alt={`${article.title}، تصویر شاخص`} />
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
    <a className="article-card article-button" href={`#/posts/${article.id}`}>
      <span className="article-image-wrap">
        <img src={article.image} alt="" loading="lazy" />
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

function ArticleOutline() {
  const [expandedSections, setExpandedSections] = useState(() => new Set());

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
  };

  const renderLink = (heading) => (
    <a href={`#${heading.id}`} onClick={(event) => scrollToHeading(event, heading.id)}>
      {heading.title}
    </a>
  );

  return (
    <aside className="article-outline" aria-labelledby="article-outline-title">
      <h2 id="article-outline-title">فهرست مطالب</h2>
      <nav aria-label="فهرست تیترهای مقاله">
        <ol>
          {unemploymentOutline.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <li key={section.id}>
                <div className="article-outline-row">
                  {section.children && (
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
                  {renderLink(section)}
                </div>
                {section.children && (
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
  );
}

function UnemploymentArticleContent({ text }) {
  const lines = text.split(/\r?\n/);
  const sourcesIndex = lines.indexOf('منابع پیشنهادی برای مطالعه بیشتر');

  return lines.map((line, index) => {
    const content = line.trim();
    if (!content) return null;

    const heading = unemploymentHeadings.get(content);
    if (heading?.level === 2) {
      return <h2 id={heading.id} key={index}>{content}</h2>;
    }
    if (heading?.level === 3) return <h3 id={heading.id} key={index}>{content}</h3>;
    if (content.startsWith('نرخ بیکاری =')) {
      return <p className="article-equation" key={index}>{content}</p>;
    }
    return (
      <p className={sourcesIndex >= 0 && index > sourcesIndex ? 'article-source' : undefined} key={index}>
        {content}
      </p>
    );
  });
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
            <a href={`#/posts/${recentArticle.id}`}>
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

function ArticlePage({ article }) {
  const [articleText, setArticleText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isUnemploymentArticle = article.id === 'article-05';
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
      <img className="article-detail-image" src={article.image} alt={`${article.title}، تصویر شاخص`} />
      <div className="article-detail-header">
        <span className="article-category">{article.category}</span>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <ArticleMeta article={article} />
      </div>
      {loading && <p className="article-detail-status">در حال بارگذاری مقاله…</p>}
      {error && <p className="article-detail-status" role="alert">بارگذاری متن مقاله ممکن نشد.</p>}
      {articleText && (
        <div className={`article-detail-content${isUnemploymentArticle ? ' article-detail-content-structured' : ''}`}>
          {isUnemploymentArticle ? <UnemploymentArticleContent text={articleText} /> : articleText}
        </div>
      )}
    </article>
  );

  useEffect(() => {
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
  }, [article]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${article.title} | مدرسه اقتصاد`;
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
    };
  }, [article]);

  return (
    <main className={`article-page${isUnemploymentArticle ? ' article-page-with-outline' : ''}`}>
      {isUnemploymentArticle ? (
        <div className="article-reading-layout">
          <ArticleOutline />
          {articleDetail}
          <RecentCategoryArticles article={article} />
        </div>
      ) : articleDetail}
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

function App() {
  const [query, setQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(() => {
    const articleId = window.location.hash.startsWith('#/posts/')
      ? window.location.hash.slice('#/posts/'.length)
      : '';
    return articles.find((article) => article.id === articleId) || null;
  });
  const [dialogItem, setDialogItem] = useState(null);
  const [loginNotice, setLoginNotice] = useState(false);
  const noticeDialogRef = useRef(null);

  useEffect(() => {
    const updateRoute = () => {
      const articleId = window.location.hash.startsWith('#/posts/')
        ? window.location.hash.slice('#/posts/'.length)
        : '';
      setActiveArticle(articles.find((article) => article.id === articleId) || null);
    };
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    if (!loginNotice) return undefined;
    const previousFocus = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLoginNotice(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const buttons = noticeDialogRef.current?.querySelectorAll('button:not([disabled])');
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
    noticeDialogRef.current?.querySelector('button')?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('dialog-open');
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [loginNotice]);

  return (
    <>
      <Header query={query} onQueryChange={setQuery} onLogin={() => setLoginNotice(true)} />
      {activeArticle ? (
        <ArticlePage article={activeArticle} />
      ) : (
        <main className="page-layout">
          <Hero onPlay={setDialogItem} />
          <ArticlePanel query={query} onViewAll={() => setQuery('')} />
        </main>
      )}
      <footer className="site-footer" id="contact">
        <span><BrandMark /> مدرسه اقتصاد</span>
        <p>با هم برای اقتصادی عادلانه‌تر و پایدارتر.</p>
      </footer>
      <PreviewDialog item={dialogItem} onClose={() => setDialogItem(null)} />
      {loginNotice && (
        <div className="notice-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setLoginNotice(false)}>
          <section
            className="notice-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            ref={noticeDialogRef}
          >
            <button className="dialog-close icon-button" type="button" aria-label="بستن" onClick={() => setLoginNotice(false)}>
              <X size={19} />
            </button>
            <span className="notice-icon"><UserRound size={22} /></span>
            <h2 id="notice-title">ورود و ثبت‌نام</h2>
            <p>ورود کاربران در حال حاضر در دسترس نیست. به‌زودی همراه شما خواهیم بود.</p>
            <button className="dialog-done" type="button" onClick={() => setLoginNotice(false)}>متوجه شدم</button>
          </section>
        </div>
      )}
    </>
  );
}

export default App;
