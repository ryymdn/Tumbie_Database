import { Fragment, useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Clock3, Footprints, HeartPulse, Lightbulb, Share2, Stethoscope } from 'lucide-react';
import SiteNavbar from '../../components/landing/SiteNavbar.jsx';
import SiteFooter from '../../components/landing/SiteFooter.jsx';
import ArticleCard from '../../components/landing/ArticleCard.jsx';
import { ARTICLES, getArticle } from '../../data/articles.js';
import { PATHS } from '../../data/routes.js';

const SUMMARY_ICONS = { bulb: Lightbulb, steps: Footprints };
const REVIEWER_ICONS = { stethoscope: Stethoscope, pulse: HeartPulse };

// Mengubah **teks** menjadi huruf tebal.
function Rich({ text }) {
  return text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>));
}

function Block({ block }) {
  switch (block.type) {
    case 'h2': return <h2>{block.text}</h2>;
    case 'p': return <p><Rich text={block.text} /></p>;
    case 'cards':
      return (
        <div className={`info-cards ${block.columns === 2 ? 'two' : ''}`}>
          {block.items.map((c) => (
            <div key={c.title}>
              <h3>{c.title}</h3>
              {c.text && <p>{c.text}</p>}
              {c.list && <ul>{c.list.map((li) => <li key={li}>{li}</li>)}</ul>}
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div className="article-table-wrap">
          <table className="article-table">
            <thead><tr>{block.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{block.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => (i === 0 ? <th scope="row" key={i}>{c}</th> : <td key={i}>{c}</td>))}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'recipe':
      return (
        <aside className="recipe-box">
          <h3>{block.title}</h3>
          {block.lines.map((l, i) => (
            <p key={i} className={l.strong ? 'strong' : ''}>{l.label && <b>{l.label}: </b>}{l.text}</p>
          ))}
        </aside>
      );
    default: return null;
  }
}

export default function ArticlePage({ isLoggedIn }) {
  const { slug } = useParams();
  const article = getArticle(slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!article) return <Navigate to={PATHS.landing} replace />;

  const SummaryIcon = SUMMARY_ICONS[article.summary.icon] ?? Lightbulb;
  const ReviewerIcon = REVIEWER_ICONS[article.reviewer.icon] ?? Stethoscope;
  const others = ARTICLES.filter((a) => a.slug !== article.slug);

  return (
    <div className="site">
      <div className="site-wrap"><SiteNavbar isLoggedIn={isLoggedIn} /></div>

      <main className="article-main">
        <header className="article-head">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to={PATHS.landing}>Beranda</Link><ChevronRight size={11} />
            <Link to={{ pathname: PATHS.landing, hash: '#artikel' }}>Artikel Edukasi</Link><ChevronRight size={11} />
            <span aria-current="page">{article.category}</span>
          </nav>
          <div className="article-tags">
            <span className="tag-cat">{article.category}</span>
            <span className="tag-time"><Clock3 size={11} /> {article.readMinutes} Menit Baca</span>
          </div>
          <h1>{article.title}</h1>
          <p className="article-lead">{article.lead}</p>
          <div className="reviewer">
            <span className="reviewer-icon"><ReviewerIcon size={16} /></span>
            <span><b>Ditinjau oleh {article.reviewer.name}</b><small>{article.reviewer.meta}</small></span>
            {article.reviewer.share && (
              <button type="button" className="share-btn" aria-label="Bagikan artikel" onClick={() => navigator.share?.({ title: article.title, url: window.location.href }).catch(() => {})}>
                <Share2 size={14} />
              </button>
            )}
          </div>
        </header>

        <img className="article-hero" src={article.image} alt={article.title} />

        <section className="article-body">
          <aside className="summary-box">
            <h2><SummaryIcon size={14} /> {article.summary.title}</h2>
            <ul>{article.summary.items.map((t) => <li key={t}><CheckCircle2 size={13} />{t}</li>)}</ul>
          </aside>

          {article.body.map((b, i) => <Block key={i} block={b} />)}

          <h2 className="more-title">Artikel & Panduan Tumbuh Kembang Lainnya</h2>
          <div className="article-grid two">
            {others.map((a) => <ArticleCard key={a.slug} article={a} showReadTime />)}
          </div>
        </section>
      </main>

      <div className="site-wrap"><SiteFooter /></div>
    </div>
  );
}
