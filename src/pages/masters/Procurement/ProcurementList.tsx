import React, { useState, useMemo } from 'react';
import type { ProcurementRecord, ProcurementStatus } from './types';
import { formatDisplayDate, formatAmount } from './data';
import styles from './Procurement.module.css';

interface Props {
  records: ProcurementRecord[];
  onView: (record: ProcurementRecord) => void;
  onEdit: (record: ProcurementRecord) => void;
  onUpdate: (record: ProcurementRecord) => void;
  onCreateNew: () => void;
  readOnly: boolean;
}

function statusClass(status: ProcurementStatus): string {
  switch (status) {
    case 'Work Order Initiated': return styles.badgeInitiated;
    case 'Approved & Shared':   return styles.badgeApproved;
    case 'SWO Initiated':       return styles.badgeSWO;
    case 'Send Back for Corrections': return styles.badgeSendBack;
  }
}

function calcTotal(record: ProcurementRecord): number {
  const net = parseFloat(record.netValue) || 0;
  const gst = net * (parseFloat(record.gstPercent) || 0) / 100;
  return net + gst;
}

const PAGE_SIZE = 10;

const ProcurementList: React.FC<Props> = ({
  records,
  onView,
  onEdit,
  onUpdate,
  onCreateNew,
  readOnly,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProcurementStatus | ''>('');
  const [fyFilter, setFyFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchSearch =
        !search ||
        r.workName.toLowerCase().includes(search.toLowerCase()) ||
        r.fileNo.toLowerCase().includes(search.toLowerCase()) ||
        r.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        r.notificationNo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchFY = !fyFilter || r.financialYear === fyFilter;
      return matchSearch && matchStatus && matchFY;
    });
  }, [records, search, statusFilter, fyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fyOptions = Array.from(new Set(records.map(r => r.financialYear))).sort();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitles}>
          <h1 className={styles.pageTitle}>Procurement Management</h1>
          <p className={styles.pageSubtitle}>
            Manage procurement work orders across all vendor types
          </p>
        </div>
        {!readOnly && (
          <button className={styles.addBtn} onClick={onCreateNew}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Procurement Management
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by work name, file no, vendor…"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={fyFilter}
            onChange={e => { setFyFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Financial Years</option>
            {fyOptions.map(fy => <option key={fy} value={fy}>{fy}</option>)}
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as ProcurementStatus | ''); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="Work Order Initiated">Work Order Initiated</option>
            <option value="Approved & Shared">Approved &amp; Shared</option>
            <option value="SWO Initiated">SWO Initiated</option>
            <option value="Send Back for Corrections">Send Back for Corrections</option>
          </select>
        </div>
        <span className={styles.countBadge}>{filtered.length}</span>
      </div>

      {/* Table */}
      <div className={styles.tableSection}>
        <div className={styles.tableScrollWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Sl. No.</th>
              <th className={styles.th}>Financial Year</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Tender Type</th>
              <th className={styles.th}>Tender / Quotation Notification Number</th>
              <th className={styles.th}>Tender / Quotation Notification Date</th>
              <th className={styles.th}>Name of the Work</th>
              <th className={styles.th}>Ward Number</th>
              <th className={styles.th}>Ward Name</th>
              <th className={styles.th}>Total Value (incl. GST)</th>
              <th className={styles.th}>File No.</th>
              <th className={styles.th}>Source of Financing</th>
              <th className={styles.th}>Sub Source of Financing</th>
              <th className={styles.th}>Vendor Name – Code</th>
              <th className={styles.th}>File Note</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={17} className={styles.emptyRow}>
                  No work orders found. {!readOnly && 'Click "Procurement Management" to create one.'}
                </td>
              </tr>
            ) : (
              pageData.map((r, idx) => {
                const total = calcTotal(r);
                const firstSrc = r.sourcesOfFinancing[0];
                const wardNumbers = r.ward.map(w => w.replace(/\D/g, '')).join(', ');
                const wardNames   = r.ward.join(', ');
                return (
                  <tr key={r.id} className={styles.tr}>
                    <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className={styles.td}>{r.financialYear}</td>
                    <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>
                      {formatDisplayDate(r.date)}
                    </td>
                    <td className={styles.td}>{r.tenderType || '—'}</td>
                    <td className={styles.td}>{r.notificationNo || '—'}</td>
                    <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>
                      {r.notificationDate ? formatDisplayDate(r.notificationDate) : '—'}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.workName} title={r.workName}>
                        {r.workName || '—'}
                      </div>
                    </td>
                    <td className={styles.td}>{wardNumbers || '—'}</td>
                    <td className={styles.td}>{wardNames || '—'}</td>
                    <td className={styles.td}>
                      <div className={styles.amount}>{formatAmount(String(total))}</div>
                    </td>
                    <td className={styles.td}>{r.fileNo || '—'}</td>
                    <td className={styles.td}>{firstSrc?.source || '—'}</td>
                    <td className={styles.td}>{firstSrc?.subSource || '—'}</td>
                    <td className={styles.td}>
                      {r.vendorName ? (
                        <>
                          <div>{r.vendorName}</div>
                          {r.vendorCode && (
                            <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                              {r.vendorCode}
                            </div>
                          )}
                        </>
                      ) : '—'}
                    </td>
                    <td className={styles.td}>{r.fileNoteNumber || '—'}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${statusClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actionCell}>
                        <button className={styles.viewBtn} onClick={() => onView(r)}>
                          View
                        </button>
                        {r.status === 'Send Back for Corrections' && !readOnly && (
                          <button className={styles.editBtn} onClick={() => onEdit(r)}>
                            Edit
                          </button>
                        )}
                        {r.status === 'Approved & Shared' && !readOnly && (
                          <button className={styles.updateBtn} onClick={() => onUpdate(r)}>
                            Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationWrap}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-body-xs)', color: 'var(--color-text-secondary)' }}>
              <button
                style={{ padding: '4px 10px', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-surface)', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ‹
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                style={{ padding: '4px 10px', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-surface)', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcurementList;
