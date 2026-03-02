import React, { useState, useMemo } from 'react';
import { useToast } from '../../../components/common/Toast';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { useAuth } from '../../../context/AuthContext';
import type { Deduction, DeductionFormData } from './types';
import DeductionModal from './DeductionModal';
import styles from './WorkBillDeductions.module.css';

/* ── Seed data ── */
const SEED: Deduction[] = [
  {
    id: '1',
    payeeType: 'Contractor',
    entityType: 'Firm',
    deductionType: 'TDS (Income Tax)',
    deductionPct: 2,
    remarks: 'Applicable on all civil works contracts',
    status: 'Active',
  },
  {
    id: '2',
    payeeType: 'Contractor',
    entityType: 'Company',
    deductionType: 'GST (Goods & Services Tax)',
    deductionPct: 18,
    remarks: '',
    status: 'Active',
  },
  {
    id: '3',
    payeeType: 'Supplier',
    entityType: 'Individual',
    deductionType: 'Labour Cess',
    deductionPct: 1,
    remarks: 'As per Building & Other Construction Workers Act',
    status: 'Active',
  },
  {
    id: '4',
    payeeType: 'Contractor',
    entityType: 'Firm',
    deductionType: 'Security Deposit',
    deductionPct: 5,
    remarks: 'Refundable after defect liability period',
    status: 'Active',
  },
  {
    id: '5',
    payeeType: 'Consultant',
    entityType: 'Individual',
    deductionType: 'TDS (Income Tax)',
    deductionPct: 10,
    remarks: 'Professional services',
    status: 'Inactive',
  },
];

const PAGE_SIZE = 8;

/* ── Component ── */
const WorkBillDeductions: React.FC = () => {
  const { showToast } = useToast();
  const { role } = useAuth();
  const isReadOnly = role === 'ULB_ADMIN';

  const [records, setRecords] = useState<Deduction[]>(SEED);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; deduction: Deduction | null }>({
    open: false,
    deduction: null,
  });

  /* ── filtered & paged ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        !q ||
        r.payeeType.toLowerCase().includes(q) ||
        r.entityType.toLowerCase().includes(q) ||
        r.deductionType.toLowerCase().includes(q) ||
        r.remarks.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── handlers ── */
  const openAdd = () => setModal({ open: true, deduction: null });
  const openEdit = (d: Deduction) => setModal({ open: true, deduction: d });
  const closeModal = () => setModal({ open: false, deduction: null });

  const handleSave = (data: DeductionFormData) => {
    if (modal.deduction) {
      setRecords((prev) =>
        prev.map((r) => (r.id === modal.deduction!.id ? { ...modal.deduction!, ...data } : r)),
      );
      showToast('Deduction updated successfully', 'success');
    } else {
      const newRecord: Deduction = { ...data, id: Date.now().toString() };
      setRecords((prev) => [newRecord, ...prev]);
      showToast('Deduction added successfully', 'success');
    }
    closeModal();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive');
    setPage(1);
  };

  /* ── render ── */
  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters', href: '/masters' },
          { label: 'Work Bill Deduction Master' },
        ]}
      />

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitles}>
          <h1 className={styles.pageTitle}>Work Bill Deduction Master</h1>
          <p className={styles.pageSubtitle}>
            Configure default deduction rules for work bills. Percentages can be overridden at payment stage.
          </p>
        </div>
        {!isReadOnly && (
          <button className={styles.addBtn} onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add Deduction
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            className={styles.searchInput}
            placeholder="Search by payee, entity or deduction type…"
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status:</span>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={handleStatusFilter}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Sl.</th>
                <th className={styles.th}>Payee Type</th>
                <th className={styles.th}>Entity Type</th>
                <th className={styles.th}>Deduction Type</th>
                <th className={styles.th}>%</th>
                <th className={styles.th}>Remarks</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    No deduction records found.
                    {search || statusFilter !== 'All' ? ' Try adjusting your filters.' : ''}
                  </td>
                </tr>
              ) : (
                paged.map((d, idx) => (
                  <tr key={d.id}>
                    <td className={styles.td}>{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className={styles.td}>{d.payeeType}</td>
                    <td className={styles.td}>{d.entityType}</td>
                    <td className={styles.td}>{d.deductionType}</td>
                    <td className={styles.td}>
                      <span className={styles.pctCell}>
                        {d.deductionPct}
                        <span className={styles.pctMuted}>%</span>
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.remarksCell} title={d.remarks}>
                        {d.remarks || '—'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={`${styles.statusBadge} ${
                          d.status === 'Active' ? styles.statusActive : styles.statusInactive
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {isReadOnly ? (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>—</span>
                      ) : (
                        <button className={styles.editBtn} onClick={() => openEdit(d)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className={styles.footer}>
            <span className={styles.footerInfo}>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} record
              {filtered.length !== 1 ? 's' : ''}
            </span>
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={safePage === 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
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
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <DeductionModal
          deduction={modal.deduction}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default WorkBillDeductions;
