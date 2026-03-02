import React, { useState, useMemo } from 'react';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import MappingModal from './MappingModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import {
  INITIAL_MAPPINGS,
  buildFlatCode,
  getAccountTypeName,
  getFundLabel,
  getSourceName,
  getSubSourceName,
} from './data';
import type { AccountFundSOFMapping, MappingStatus } from './types';
import styles from './AccountFundSOFMapping.module.css';

const PAGE_SIZE = 8;

const AccountFundSOFMappingPage: React.FC = () => {
  const [records,      setRecords]      = useState<AccountFundSOFMapping[]>(INITIAL_MAPPINGS);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | MappingStatus>('All');
  const [page,         setPage]         = useState(1);
  const [nextId,       setNextId]       = useState(INITIAL_MAPPINGS.length + 1);

  const [modalOpen,     setModalOpen]     = useState(false);
  const [editRecord,    setEditRecord]    = useState<AccountFundSOFMapping | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<number | null>(null);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter(r => {
      const matchSearch =
        !q ||
        r.compositeCode.includes(q) ||
        getAccountTypeName(r.accountTypeId).toLowerCase().includes(q) ||
        getFundLabel(r.fundCodeId).toLowerCase().includes(q) ||
        getSourceName(r.sourceId).toLowerCase().includes(q) ||
        getSubSourceName(r.subSourceId).toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── Handlers ── */
  const openAdd  = () => { setEditRecord(null); setModalOpen(true); };
  const openEdit = (r: AccountFundSOFMapping) => { setEditRecord(r); setModalOpen(true); };

  const handleSubmit = (data: Omit<AccountFundSOFMapping, 'id'>) => {
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

  /* ── Render ── */
  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters', href: '/masters' },
          { label: 'Account – Fund – SOF Mapping' },
        ]}
      />

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Account – Fund – SOF Mapping</h1>
          <p className={styles.pageSubtitle}>
            Map chart-of-account detail codes to their corresponding fund and source of financing
          </p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New Mapping
        </button>
      </div>

      <div className={styles.content}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            {/* Search */}
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.searchIcon}>
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by account type, composite code, fund, or SOF…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
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
                <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Account – Fund – SOF Mappings</h2>
            <span className={styles.tableCount}>
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Sl</th>
                  <th className={styles.th}>Account Type</th>
                  <th className={styles.th}>Composite Code</th>
                  <th className={styles.th}>Fund</th>
                  <th className={styles.th}>Source of Financing</th>
                  <th className={styles.th}>Sub-Source</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.empty}>No mappings found</td>
                  </tr>
                ) : (
                  paged.map((row, idx) => {
                    const flat = buildFlatCode(row.detailCodeId);
                    return (
                      <tr key={row.id} className={styles.tr}>
                        <td className={styles.td}>{(safePage - 1) * PAGE_SIZE + idx + 1}</td>

                        {/* Account Type */}
                        <td className={styles.td}>
                          <span className={styles.atChip}>
                            {getAccountTypeName(row.accountTypeId)}
                          </span>
                        </td>

                        {/* Composite Code */}
                        <td className={styles.td}>
                          <div className={styles.compositeCell}>
                            <span className={styles.compositeCode}>{row.compositeCode}</span>
                            {flat && (
                              <span className={styles.compositeLabel}>
                                {flat.detailCode.nameEnglish}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Fund */}
                        <td className={styles.td}>
                          <span className={styles.descCell}>{getFundLabel(row.fundCodeId)}</span>
                        </td>

                        {/* SOF */}
                        <td className={styles.td}>{getSourceName(row.sourceId)}</td>

                        {/* Sub-SOF */}
                        <td className={styles.td}>{getSubSourceName(row.subSourceId)}</td>

                        {/* Status */}
                        <td className={styles.td}>
                          <Badge
                            variant={row.status === 'Active' ? 'success' : 'neutral'}
                            size="sm"
                          >
                            {row.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className={styles.td}>
                          <div className={styles.actionGroup}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => openEdit(row)}
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                              </svg>
                              Edit
                            </button>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => setDeleteTarget(row.id)}
                              title="Delete"
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.paginationBar}>
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalRecords={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <MappingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editRecord}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        message="Are you sure you want to delete this mapping? This action cannot be undone."
      />
    </div>
  );
};

export default AccountFundSOFMappingPage;
