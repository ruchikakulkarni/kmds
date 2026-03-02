import React, { useState, useMemo } from 'react';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import { useAuth } from '../../../context/AuthContext';
import SubServiceModal from './SubServiceModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import styles from './SubServicesTab.module.css';
import type { SubService, SubServiceStatus } from './types';
import { INITIAL_SUB_SERVICES, BANK_ACCOUNT_OPTIONS } from './data';

const PAGE_SIZE = 8;

const SubServicesTab: React.FC = () => {
  const { role } = useAuth();
  const isUlb = role === 'ULB_ADMIN';

  /* ── Data ── */
  const [records, setRecords]   = useState<SubService[]>(INITIAL_SUB_SERVICES);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SubServiceStatus>('All');
  const [page, setPage]         = useState(1);
  const [nextId, setNextId]     = useState(INITIAL_SUB_SERVICES.length + 1);

  /* ── Modal state ── */
  const [modalOpen, setModalOpen]       = useState(false);
  const [editRecord, setEditRecord]     = useState<SubService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  /* ── ULB bank-mapping state ── */
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [tempBank, setTempBank]       = useState('');

  /* ── Filtered + paged ── */
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        r.nameEnglish.toLowerCase().includes(q)   ||
        r.nameKannada.includes(search)             ||
        r.subServiceCode.toLowerCase().includes(q) ||
        r.serviceName.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── CRUD handlers ── */
  const openAdd  = () => { setEditRecord(null); setModalOpen(true); };
  const openEdit = (r: SubService) => { setEditRecord(r); setModalOpen(true); };

  const handleSubmit = (
    data: Omit<SubService, 'id' | 'mappedBankAccountId' | 'mappedBankAccountLabel'>,
  ) => {
    if (editRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editRecord.id
            ? { ...r, ...data }
            : r,
        ),
      );
    } else {
      setRecords((prev) => [
        ...prev,
        { ...data, id: nextId, mappedBankAccountId: '', mappedBankAccountLabel: '' },
      ]);
      setNextId((n) => n + 1);
    }
    setModalOpen(false);
    setPage(1);
  };

  const executeDelete = () => {
    if (deleteTarget === null) return;
    setRecords((prev) => prev.filter((r) => r.id !== deleteTarget));
    setDeleteTarget(null);
  };

  /* ── ULB mapping handlers ── */
  const handleSelectBank = (row: SubService) => {
    setSelectingId(row.id);
    setTempBank(row.mappedBankAccountId || '');
  };

  const handleSaveMapping = (id: number) => {
    if (!tempBank) return;
    const bankOpt = BANK_ACCOUNT_OPTIONS.find((b) => b.id === tempBank);
    if (!bankOpt) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, mappedBankAccountId: bankOpt.id, mappedBankAccountLabel: bankOpt.shortName }
          : r,
      ),
    );
    setSelectingId(null);
    setTempBank('');
  };

  const handleCancelMapping = () => {
    setSelectingId(null);
    setTempBank('');
  };

  /* ── Render ── */
  return (
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
              placeholder="Search by name, code or service..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Status filter */}
          <div className={styles.filterBox}>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
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

        {/* Add button — DMA_ADMIN only */}
        {!isUlb && (
          <button className={styles.addBtn} onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New Sub-Service
          </button>
        )}
      </div>

      {/* Table card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Sub-Services</h2>
          <span className={styles.tableCount}>{filtered.length} records</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Sl No</th>
                <th className={styles.th}>Sub-Service</th>
                <th className={styles.th}>Code</th>
                <th className={styles.th}>Service</th>
                <th className={styles.th}>Account Type</th>
                <th className={styles.th}>Composite Account</th>
                <th className={styles.th}>Fund</th>
                <th className={styles.th}>Status</th>
                {isUlb  && <th className={styles.th}>Bank Mapping</th>}
                {!isUlb && <th className={styles.th}>Edit</th>}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={isUlb ? 9 : 9} className={styles.empty}>
                    No records found
                  </td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr key={row.id} className={styles.tr}>
                    <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>

                    {/* Sub-Service name */}
                    <td className={styles.td}>
                      <span className={styles.nameEn}>{row.nameEnglish}</span>
                      <span className={styles.nameKn}>{row.nameKannada}</span>
                    </td>

                    {/* Code */}
                    <td className={styles.td}>
                      <span className={styles.codeChip}>{row.subServiceCode}</span>
                    </td>

                    {/* Service */}
                    <td className={styles.td}>{row.serviceName}</td>

                    {/* Account Type */}
                    <td className={styles.td}>{row.accountTypeName}</td>

                    {/* Composite Account */}
                    <td className={styles.td}>
                      <div className={styles.compositeCell}>
                        <span className={styles.compositeCode}>{row.compositeCode}</span>
                        <span className={styles.compositeDesc}>{row.compositeDescription}</span>
                      </div>
                    </td>

                    {/* Fund */}
                    <td className={styles.td}>{row.fundName}</td>

                    {/* Status */}
                    <td className={styles.td}>
                      <Badge
                        variant={row.status === 'Active' ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {row.status}
                      </Badge>
                    </td>

                    {/* Bank Mapping (ULB_ADMIN only) */}
                    {isUlb && (
                      <td className={styles.td}>
                        {selectingId === row.id ? (
                          <div className={styles.bankSelectInline}>
                            <div className={styles.bankSelectBox}>
                              <select
                                className={styles.bankSelect}
                                value={tempBank}
                                onChange={(e) => setTempBank(e.target.value)}
                              >
                                <option value="">-- Select Bank Account --</option>
                                {BANK_ACCOUNT_OPTIONS.map((b) => (
                                  <option key={b.id} value={b.id}>{b.label}</option>
                                ))}
                              </select>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.bankSelectChevron}>
                                <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <button
                              className={styles.saveMappingBtn}
                              onClick={() => handleSaveMapping(row.id)}
                              disabled={!tempBank}
                            >
                              Save
                            </button>
                            <button
                              className={styles.cancelMappingBtn}
                              onClick={handleCancelMapping}
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : row.mappedBankAccountId ? (
                          <div className={styles.bankMapped}>
                            <span className={styles.bankMappedLabel}>{row.mappedBankAccountLabel}</span>
                            <button
                              className={styles.changeBtn}
                              onClick={() => handleSelectBank(row)}
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.selectBtn}
                            onClick={() => handleSelectBank(row)}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            Select
                          </button>
                        )}
                      </td>
                    )}

                    {/* Edit / Delete (DMA_ADMIN only) */}
                    {!isUlb && (
                      <td className={styles.td}>
                        <div className={styles.actionGroup}>
                          <button className={styles.editBtn} onClick={() => openEdit(row)}>
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
                              <path
                                d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
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

      {/* Add / Edit modal (DMA_ADMIN only) */}
      {!isUlb && (
        <>
          <SubServiceModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
            initialData={editRecord}
          />
          <DeleteConfirmModal
            isOpen={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            onConfirm={executeDelete}
          />
        </>
      )}
    </div>
  );
};

export default SubServicesTab;
