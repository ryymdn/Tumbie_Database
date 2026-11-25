import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, Pill, Scale, Sprout, Star, Syringe, Gift } from 'lucide-react';
import SiteNavbar from '../../components/landing/SiteNavbar.jsx';
import SiteFooter from '../../components/landing/SiteFooter.jsx';
import ArticleCard from '../../components/landing/ArticleCard.jsx';
import { ARTICLES, SERVICES, STATS, TESTIMONIALS } from '../../data/articles.js';
import { initialsOf } from '../../data/format.js';

const SERVICE_ICONS = { scale: Scale, syringe: Syringe, pill: Pill };

export default function LandingPage({ isLoggedIn }) {
  const { hash } = useLocation();

  // Menggulir ke bagian yang dituju (#layanan, #artikel, #kontak) atau ke atas.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo(0, 0);
  }, [hash]);

  return (
    <div className="site">
      <div className="site-wrap"><SiteNavbar isLoggedIn={isLoggedIn} /></div>

      <section className="hero">
        <h1>Pantau Tumbuh Kembang Si Kecil Lebih Mudah, Aman & Terpercaya Bersama Tumbie</h1>
        <p>Pendampingan holistik kesehatan balita dengan pencatatan digital KMS, jadwal imunisasi akurat, dan konsultasi nutrisi langsung bersama bidan desa dan kader siaga.</p>
        <div className="hero-chips">
          <span><Gift size={13} /> Gratis Imunisasi Dasar</span>
          <span><BookOpen size={13} /> Buku KIA Digital</span>
          <span><Sprout size={13} /> Cegah Stunting 1000 HPK</span>
        </div>
      </section>

      <section className="stats-strip">
        <div className="site-wrap stats-grid">
          {STATS.map((s) => (
            <article key={s.label}><small>{s.label}</small><strong>{s.value}</strong><span>{s.note}</span></article>
          ))}
        </div>
      </section>

      <section className="site-section" id="layanan">
        <div className="site-wrap">
          <h2 className="section-title">3 Pilar Layanan Tumbuh Kembang Si Kecil</h2>
          <p className="section-sub">Seluruh tahapan pemeriksaan menggunakan alat ukur antropometri standar medis terkalibrasi untuk menjamin kepastian tumbuh kembang balita Anda.</p>
          <div className="service-grid">
            {SERVICES.map((s, i) => {
              const Icon = SERVICE_ICONS[s.icon];
              return (
                <article className="service-card" key={s.title}>
                  <span className={`service-icon tone-${i}`}><Icon size={20} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <div className="service-foot">
                    <span className="service-link">Lihat Detail Layanan <ArrowRight size={12} /></span>
                    <em>{s.tag}</em>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="site-section articles-section" id="artikel">
        <div className="site-wrap">
          <h2 className="section-title">Artikel & Panduan Tumbuh Kembang</h2>
          <div className="article-grid">
            {ARTICLES.map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="site-wrap">
          <h2 className="section-title dark">Apa Kata Ibu & Ayah tentang Tumbie Posyandu?</h2>
          <div className="testi-grid">
            {TESTIMONIALS.map((t) => (
              <figure className="testi-card" key={t.name}>
                <div className="stars" aria-label="Rating 5 dari 5">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} fill="currentColor" />)}</div>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <span className="testi-avatar">{initialsOf(t.name.replace(/^(Ibu|Bapak)\s/, ''))}</span>
                  <span><b>{t.name}</b><small>{t.role}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div className="site-wrap"><SiteFooter /></div>
    </div>
  );
}
