import { useState } from 'react';

// Paginasi tampilan. `variant`: 'numbered' (Sebelumnya 1 2 3 Selanjutnya),
// 'arrows' (‹ 1 2 3 ›) atau 'plain' (hanya Sebelumnya / Berikutnya).
export default function Pagination({ pages = 1, variant = 'numbered', prevLabel = 'Sebelumnya', nextLabel = 'Selanjutnya' }) {
  const [page, setPage] = useState(1);
  const numbers = Array.from({ length: pages }, (_, i) => i + 1);
  const arrows = variant === 'arrows';

  return (
    <div className={`pager ${variant}`}>
      <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Sebelumnya">
        {arrows ? '‹' : prevLabel}
      </button>
      {variant !== 'plain' && numbers.map((n) => (
        <button key={n} className={n === page ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
      ))}
      <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} aria-label="Berikutnya">
        {arrows ? '›' : nextLabel}
      </button>
    </div>
  );
}
