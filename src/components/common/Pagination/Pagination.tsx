import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  pageSize?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  pageSize,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const start = pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const end   = pageSize ? Math.min(currentPage * pageSize, totalRecords ?? 0) : undefined;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {totalRecords !== undefined && pageSize && (
        <span className={styles.info}>
          Page {currentPage} of {totalPages} — Showing {start}–{end} of {totalRecords} records
        </span>
      )}
      <nav className={styles.nav} aria-label="Pagination">
        <button
          className={`${styles.btn} ${styles.btnNav}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>

        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
          ) : (
            <button
              key={page}
              className={`${styles.btn} ${currentPage === page ? styles.btnActive : ''}`}
              onClick={() => onPageChange(page as number)}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          className={`${styles.btn} ${styles.btnNav}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next ›
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
