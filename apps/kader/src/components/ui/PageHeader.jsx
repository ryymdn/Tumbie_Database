// Header halaman: (opsional) tag posyandu + meta, judul, subjudul, dan aksi di kanan.
export default function PageHeader({ tag, meta, title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        {(tag || meta) && (
          <div className="page-meta">
            {tag && <span className="tag-pill">{tag}</span>}
            {meta}
          </div>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
