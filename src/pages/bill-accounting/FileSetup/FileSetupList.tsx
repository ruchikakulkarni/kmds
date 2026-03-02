import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Badge, Modal } from '../../../components/common';
import { useAuth } from '../../../context/AuthContext';
import styles from './FileSetupList.module.css';

// ── Types ────────────────────────────────────────────────────────────────────
interface FileRecord {
  id:           number;
  fy:           string;
  section:      string;
  subsection:   string;
  dateOfCreation: string;
  fileName:     string;
  fileSeries:   string;
  fileSubject:  string;
  fileNumber:   string;
  fileCreatedFor: string;
  status:       'active' | 'inactive';
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_FILES: FileRecord[] = [
  { id: 1,  fy: '2024-25', section: 'Health',        subsection: 'Civil',        dateOfCreation: '19-12-2025', fileName: 'ABCD', fileSeries: 'FS-HL/2024-25/001', fileSubject: 'Health Dept Civil Works Material Supply',           fileNumber: 'FILE/HL/2024-25/001', fileCreatedFor: 'Supplier – Product or Material Supplier', status: 'active'   },
  { id: 2,  fy: '2024-25', section: 'Revenue',       subsection: '—',            dateOfCreation: '19-12-2025', fileName: 'EFGH', fileSeries: 'FS-RV/2024-25/001', fileSubject: 'Revenue Dept Cess Payment Processing',             fileNumber: 'FILE/RV/2024-25/001', fileCreatedFor: 'Recurring Payee – Cess Payment',           status: 'inactive' },
  { id: 3,  fy: '2024-25', section: 'Engineering',   subsection: 'East Zone',    dateOfCreation: '20-12-2025', fileName: 'ENG1', fileSeries: 'FS-EG/2024-25/001', fileSubject: 'Engineering Works Contractor Payment Q3',          fileNumber: 'FILE/EG/2024-25/001', fileCreatedFor: 'Works',                                   status: 'active'   },
  { id: 4,  fy: '2024-25', section: 'Roads & Bldg',  subsection: 'North Zone',   dateOfCreation: '21-12-2025', fileName: 'RB01', fileSeries: 'FS-RB/2024-25/001', fileSubject: 'Roads Maintenance Staff Salary Bill Dec 2024',     fileNumber: 'FILE/RB/2024-25/001', fileCreatedFor: 'Employee Payee',                          status: 'active'   },
  { id: 5,  fy: '2024-25', section: 'Finance',       subsection: '—',            dateOfCreation: '22-12-2025', fileName: 'FIN1', fileSeries: 'FS-FN/2024-25/001', fileSubject: 'Finance Dept EPF Monthly Deduction Dec 2024',      fileNumber: 'FILE/FN/2024-25/001', fileCreatedFor: 'Statutory – EPF',                         status: 'active'   },
  { id: 6,  fy: '2024-25', section: 'Education',     subsection: 'South Zone',   dateOfCreation: '23-12-2025', fileName: 'EDU1', fileSeries: 'FS-ED/2024-25/001', fileSubject: 'Education Dept TA/DA Reimbursement Q3',            fileNumber: 'FILE/ED/2024-25/001', fileCreatedFor: 'Employee Payee',                          status: 'active'   },
  { id: 7,  fy: '2024-25', section: 'Health',        subsection: 'West Zone',    dateOfCreation: '24-12-2025', fileName: 'HLT2', fileSeries: 'FS-HL/2024-25/002', fileSubject: 'Primary Health Centre Medicine Procurement',       fileNumber: 'FILE/HL/2024-25/002', fileCreatedFor: 'Vendor',                                  status: 'inactive' },
  { id: 8,  fy: '2024-25', section: 'Revenue',       subsection: 'Central Zone', dateOfCreation: '26-12-2025', fileName: 'REV2', fileSeries: 'FS-RV/2024-25/002', fileSubject: 'Property Tax Collection Professional Tax TDS',     fileNumber: 'FILE/RV/2024-25/002', fileCreatedFor: 'Statutory – Professional Tax',             status: 'active'   },
  { id: 9,  fy: '2025-26', section: 'Engineering',   subsection: 'South Zone',   dateOfCreation: '01-01-2026', fileName: 'ENG2', fileSeries: 'FS-EG/2025-26/001', fileSubject: 'Engineering Infrastructure Vendor Supply Q4',      fileNumber: 'FILE/EG/2025-26/001', fileCreatedFor: 'Vendor',                                  status: 'active'   },
  { id: 10, fy: '2025-26', section: 'Roads & Bldg',  subsection: 'East Zone',    dateOfCreation: '02-01-2026', fileName: 'RB02', fileSeries: 'FS-RB/2025-26/001', fileSubject: 'Roads Dept Contractor Billing Jan 2026',          fileNumber: 'FILE/RB/2025-26/001', fileCreatedFor: 'Works',                                   status: 'active'   },
  { id: 11, fy: '2025-26', section: 'Finance',       subsection: '—',            dateOfCreation: '03-01-2026', fileName: 'FIN2', fileSeries: 'FS-FN/2025-26/001', fileSubject: 'Finance ESI Monthly Statutory Deduction Jan 2026', fileNumber: 'FILE/FN/2025-26/001', fileCreatedFor: 'Statutory – ESI',                         status: 'active'   },
  { id: 12, fy: '2025-26', section: 'Education',     subsection: 'North Zone',   dateOfCreation: '04-01-2026', fileName: 'EDU2', fileSeries: 'FS-ED/2025-26/001', fileSubject: 'Education Dept Staff Salary Bill Feb 2026',        fileNumber: 'FILE/ED/2025-26/001', fileCreatedFor: 'Employee Payee',                          status: 'active'   },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25] as const;

// ── Component ────────────────────────────────────────────────────────────────
const FileSetupList: React.FC = () => {
  const { role }  = useAuth();
  const navigate  = useNavigate();
  const isAEE     = role === 'AEE_CREATOR';

  const [records,    setRecords]    = useState<FileRecord[]>(SEED_FILES);
  const [search,     setSearch]     = useState('');
  const [pageSize,   setPageSize]   = useState<number>(5);
  const [page,       setPage]       = useState(1);
  const [deleteId,   setDeleteId]   = useState<number | null>(null);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter(r =>
      r.fileName.toLowerCase().includes(q)       ||
      r.section.toLowerCase().includes(q)        ||
      r.fileSubject.toLowerCase().includes(q)    ||
      r.fileNumber.toLowerCase().includes(q)     ||
      r.fileCreatedFor.toLowerCase().includes(q) ||
      r.fy.includes(q),
    );
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const startEntry = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endEntry   = Math.min(safePage * pageSize, filtered.length);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePageSizeChange = (n: number) => { setPageSize(n); setPage(1); };
  const handleSearch         = (q: string) => { setSearch(q);   setPage(1); };

  const confirmDelete = () => {
    if (deleteId === null) return;
    setRecords(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  // ── Breadcrumb ───────────────────────────────────────────────────────────
  const breadcrumbs = [
    { label: 'Home',    href: '/home' },
    { label: 'Masters' },
    { label: 'File Setup' },
  ];

  // ── Pagination range ─────────────────────────────────────────────────────
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.page}>
      <Breadcrumb items={breadcrumbs} />

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>File Setup</h1>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.showEntries}>
          <span>Show</span>
          <select
            className={styles.entriesSelect}
            value={pageSize}
            onChange={e => handlePageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            placeholder="Search"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th>Financial<br/>Year</th>
              <th>Section</th>
              <th>Subsection</th>
              <th>Date of<br/>Creation</th>
              <th>File Name</th>
              <th>File Series</th>
              <th>File Subject</th>
              <th>File Number</th>
              <th>File Created<br/>For</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={12} className={styles.emptyCell}>
                  No records found.
                </td>
              </tr>
            ) : (
              paginated.map((r, idx) => (
                <tr key={r.id} className={r.status === 'inactive' ? styles.inactiveRow : ''}>
                  <td className={styles.centerCell}>
                    {(safePage - 1) * pageSize + idx + 1}
                  </td>
                  <td className={styles.centerCell}>{r.fy}</td>
                  <td>{r.section}</td>
                  <td className={styles.centerCell}>{r.subsection}</td>
                  <td className={styles.centerCell}>{r.dateOfCreation}</td>
                  <td className={styles.centerCell}><strong>{r.fileName}</strong></td>
                  <td className={styles.centerCell}>{r.fileSeries}</td>
                  <td>
                    <span className={styles.linkText} title={r.fileSubject}>
                      {r.fileSubject.length > 32
                        ? r.fileSubject.slice(0, 32) + '…'
                        : r.fileSubject}
                    </span>
                  </td>
                  <td>
                    <span className={styles.linkText}>{r.fileNumber}</span>
                  </td>
                  <td>{r.fileCreatedFor}</td>
                  <td className={styles.centerCell}>
                    <Badge
                      variant={r.status === 'active' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {r.status === 'active' ? 'Active' : 'In Active'}
                    </Badge>
                  </td>
                  <td className={styles.centerCell}>
                    {r.status === 'active' && (
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          title="Edit"
                          onClick={() => navigate(`/bill-accounting/file-setup/edit/${r.id}`)}
                          aria-label={`Edit ${r.fileName}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z"
                                  stroke="currentColor" strokeWidth="1.3"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {isAEE && (
                          <button
                            className={styles.deleteBtn}
                            title="Delete"
                            onClick={() => setDeleteId(r.id)}
                            aria-label={`Delete ${r.fileName}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3 5h10M6 5V3h4v2M7 8v4M9 8v4"
                                    stroke="currentColor" strokeWidth="1.3"
                                    strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M4 5l.8 8h6.4l.8-8"
                                    stroke="currentColor" strokeWidth="1.3"
                                    strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: pagination + File Setup button ──────────────────────── */}
      <div className={styles.tableFooter}>
        {/* Entry count + page buttons */}
        <span className={styles.entryInfo}>
          Showing {startEntry} to {endEntry} of {filtered.length} entries
        </span>

        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={safePage === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>

          {pageNumbers.map(n => (
            <button
              key={n}
              className={`${styles.pageBtn} ${n === safePage ? styles.pageBtnActive : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}

          <button
            className={styles.pageBtn}
            disabled={safePage === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>

        {/* File Setup + button – AEE only */}
        {isAEE && (
          <button
            className={styles.fileSetupBtn}
            onClick={() => navigate('/bill-accounting/file-setup/create')}
          >
            File Setup
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 5v8M5 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Delete confirm modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete File"
        size="sm"
        footer={
          <div className={styles.confirmFooter}>
            <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button className={styles.deleteCfmBtn} onClick={confirmDelete}>
              Delete
            </button>
          </div>
        }
      >
        <p className={styles.confirmMsg}>
          Are you sure you want to delete file{' '}
          <strong>{records.find(r => r.id === deleteId)?.fileName}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default FileSetupList;
