import { Link } from 'react-router-dom';
import { ArrowRight, Clock3 } from 'lucide-react';
import { articlePath } from '../../data/routes.js';

// Kartu artikel; seluruh kartu bisa diklik lewat tautan judul (stretched link).
export default function ArticleCard({ article, showReadTime = false }) {
  const to = articlePath(article.slug);
  return (
    <article className="article-card">
      <div className="article-card-media">
        <img src={article.image} alt="" loading="lazy" />
        <span className="article-chip">{article.category}</span>
        {showReadTime && <span className="article-time"><Clock3 size={11} /> {article.readMinutes} Menit Baca</span>}
      </div>
      <div className="article-card-body">
        <p className="article-meta">{article.date} <i /> {article.author}</p>
        <h3><Link to={to} className="stretch">{article.cardTitle}</Link></h3>
        <p className="article-excerpt">{article.excerpt}</p>
        <span className="read-more">Baca Selengkapnya <ArrowRight size={13} /></span>
      </div>
    </article>
  );
}
