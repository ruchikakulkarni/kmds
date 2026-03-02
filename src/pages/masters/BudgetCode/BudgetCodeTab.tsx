import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import BudgetCodeModal from './BudgetCodeModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { INITIAL_BUDGET_CODES } from './data';
import type { BudgetCodeRecord, BudgetStatus, BudgetType } from './types';
import styles from './BudgetCodeTab.module.css';

const PAGE_SIZE = 8;

const BUDGET_TYPE_LABELS: Record<BudgetType, string> = {
  Revenue: 'Revenue',
  Capital: 'Capital',
  Deposit: 'Deposit',
};

const BudgetCodeTab: React.FC = () => {
  const { role } = useAuth();
  const isReadOnly = role === 'ULB_ADMIN';

  /* ── Data state ── */
  const [records, setRecords] = useState<BudgetCodeRecord[]>(INITIAL_BUDGET_CODES);
  const [nextId, setNextId]   = useState(INITIAL_BUDGET_CODES.length + 1);

  /* ── Filter / search ── */
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BudgetStatus>('All');
  const [typeFilter,   setTypeFilter]   = useState<'All' | BudgetType>('All');
  const [page,         setPage]         = useState(1);

  /* ── Modal state ── */
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editRecord,   setEditRecord]   = useState<BudgetCodeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  /* ── Filtered records ── */
  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchSearch =
        !search ||
        r.budgetCode.toLowerCase().includes(search.toLowerCase()) ||
        r.compositeAccountCode.includes(search) ||
        r.functionCode.toLowerCase().includes(search.toLowerCase()) ||
        r.descriptionEnglish.toLowerCase().includes(search.toLowerCase()) ||
        r.descriptionKannada.includes(search);
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchType   = typeFilter   === 'All' || r.budgetType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [records, search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Handlers ── */
  const openAdd  = () => { setEditRecord(null); setModalOpen(true); };
  const openEdit = (r: BudgetCodeRecord) => { setEditRecord(r); setModalOpen(true); };

  const handleSubmit = (data: Omit<BudgetCodeRecord, 'id'>) => {
    if (editRecord) {
      setRecords(prev => prev.map(r => r.id === editRecord.id ? { ...data, id: editRecord.id } : r));
    } else {
      setRecords(prev => [...prev, { ...data, id: nextId }]);
      setNextId(n => n + 1);
    }
    setModalOpen(false);
    setPage(1);
  };

  const executeDelete = () => {
    if (deleteTarget === null) return;
    setRecords(prev => prev.filter(r => r.id !== deleteTarget));
    setDeleteTarget(null);
  };

  /* ── Budget type badge class ── */
  const budgetTypeClass = (bt: BudgetType) => {
    if (bt === 'Revenue') return styles.btRevenue;
    if (bt === 'Capital') return styles.btCapital;
    return styles.btDeposit;
  };

  return (
    <div className={styles.content}>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {/* Search */}
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.searchIcon}>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by Budget Code, Account Code, Function..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Budget Type filter */}
          <div className={styles.filterBox}>
            <select
              className={styles.filterSelect}
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }}
            >
              <option value="All">All Types</option>
              <option value="Revenue">Revenue</option>
              <option value="Capital">Capital</option>
              <option value="Deposit">Deposit</option>
            </select>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.filterChevron}>
              <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Status filter */}
          <div className={styles.filterBox}>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.filterChevron}>
              <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {isReadOnly ? (
          <span className={styles.readOnlyBadge}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            View Only
          </span>
        ) : (
          <button className={styles.addBtn} onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Budget Code
          </button>
        )}
      </div>

      {/* ── Table card ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Budget Codes</h2>
          <span className={styles.tableCount}>{filtered.length} records</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Sl</th>
                <th className={styles.th}>Composite Account Code</th>
                <th className={styles.th}>Function Code</th>
                <th className={styles.th}>Budget Type</th>
                <th className={styles.th}>Budget Code</th>
                <th className={styles.th}>Description (English)</th>
                <th className={styles.th}>Status</th>
                {!isReadOnly && <th className={styles.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>No records found</td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr key={row.id} className={styles.tr}>
                    <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>

                    <td className={styles.td}>
                      <span className={styles.compositeChip}>{row.compositeAccountCode}</span>
                    </td>

                    <td className={styles.td}>
                      <span className={styles.codeChip}>{row.functionCode}</span>
                    </td>

                    <td className={styles.td}>
                      <span className={`${styles.budgetTypeBadge} ${budgetTypeClass(row.budgetType)}`}>
                        {BUDGET_TYPE_LABELS[row.budgetType]}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span className={styles.budgetCodeChip}>{row.budgetCode}</span>
                    </td>

                    <td className={styles.td}>{row.descriptionEnglish}</td>

                    <td className={styles.td}>
                      <Badge variant={row.status === 'Active' ? 'success' : 'neutral'} size="sm">
                        {row.status}
                      </Badge>
                    </td>

                    {!isReadOnly && (
                      <td className={styles.td}>
                        <div className={styles.actionGroup}>
                          <button className={styles.actionBtn} onClick={() => openEdit(row)}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setDeleteTarget(row.id)}
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4"
                                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationBar}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalRecords={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ── Add / Edit modal ── */}
      <BudgetCodeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editRecord}
      />

      {/* ── Delete confirmation ── */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        message="Delete this Budget Code record? This action cannot be undone."
      />
    </div>
  );
};

export default BudgetCodeTab;
