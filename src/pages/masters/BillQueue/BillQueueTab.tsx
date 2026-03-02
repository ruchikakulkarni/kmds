import React, { useState, useMemo } from 'react';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import BillQueueModal from './BillQueueModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import styles from './BillQueueTab.module.css';
import type { BillQueue, BillQueueStatus } from './types';

/* ── Seed data ───────────────────────────────────────────────────────────── */
const INITIAL_DATA: BillQueue[] = [
  { id: 1,  descriptionEnglish: 'General Bill Queue',          descriptionKannada: 'ಸಾಮಾನ್ಯ ಬಿಲ್ ಕ್ಯೂ',            status: 'Active'   },
  { id: 2,  descriptionEnglish: 'Water Supply Bill Queue',     descriptionKannada: 'ನೀರು ಸರಬರಾಜು ಬಿಲ್ ಕ್ಯೂ',        status: 'Active'   },
  { id: 3,  descriptionEnglish: 'Property Tax Bill Queue',     descriptionKannada: 'ಆಸ್ತಿ ತೆರಿಗೆ ಬಿಲ್ ಕ್ಯೂ',          status: 'Active'   },
  { id: 4,  descriptionEnglish: 'Drainage Bill Queue',         descriptionKannada: 'ಚರಂಡಿ ಬಿಲ್ ಕ್ಯೂ',               status: 'Active'   },
  { id: 5,  descriptionEnglish: 'Solid Waste Bill Queue',      descriptionKannada: 'ಘನ ತ್ಯಾಜ್ಯ ಬಿಲ್ ಕ್ಯೂ',           status: 'Active'   },
  { id: 6,  descriptionEnglish: 'Street Light Bill Queue',     descriptionKannada: 'ಬೀದಿ ದೀಪ ಬಿಲ್ ಕ್ಯೂ',            status: 'Active'   },
  { id: 7,  descriptionEnglish: 'Trade License Bill Queue',    descriptionKannada: 'ವ್ಯಾಪಾರ ಪರವಾನಗಿ ಬಿಲ್ ಕ್ಯೂ',      status: 'Active'   },
  { id: 8,  descriptionEnglish: 'Building Plan Bill Queue',    descriptionKannada: 'ಕಟ್ಟಡ ಯೋಜನೆ ಬಿಲ್ ಕ್ಯೂ',         status: 'Inactive' },
  { id: 9,  descriptionEnglish: 'Encroachment Bill Queue',     descriptionKannada: 'ಒತ್ತುವರಿ ಬಿಲ್ ಕ್ಯೂ',             status: 'Active'   },
  { id: 10, descriptionEnglish: 'Maintenance Bill Queue',      descriptionKannada: 'ನಿರ್ವಹಣೆ ಬಿಲ್ ಕ್ಯೂ',             status: 'Inactive' },
];

const PAGE_SIZE = 8;

/* ─────────────────────────────────────────────────────────────────────────── */
const BillQueueTab: React.FC = () => {
  const [records, setRecords]         = useState<BillQueue[]>(INITIAL_DATA);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BillQueueStatus>('All');
  const [page, setPage]               = useState(1);
  const [nextId, setNextId]           = useState(INITIAL_DATA.length + 1);

  /* modals */
  const [modalOpen, setModalOpen]       = useState(false);
  const [editRecord, setEditRecord]     = useState<BillQueue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  /* filtered + paged */
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        r.descriptionEnglish.toLowerCase().includes(q) ||
        r.descriptionKannada.includes(search);
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* handlers */
  const openAdd  = () => { setEditRecord(null); setModalOpen(true); };
  const openEdit = (r: BillQueue) => { setEditRecord(r); setModalOpen(true); };

  const handleSubmit = (data: Omit<BillQueue, 'id'>) => {
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
              placeholder="Search by Bill Queue Description..."
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

        {/* Add button */}
        <button className={styles.addBtn} onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New Bill Queue
        </button>
      </div>

      {/* Table card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Bill Queue</h2>
          <span className={styles.tableCount}>{filtered.length} records</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Sl No</th>
                <th className={styles.th}>Bill Queue Description</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.empty}>No records found</td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr key={row.id} className={styles.tr}>
                    <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>

                    {/* Description — English + Kannada sub-label */}
                    <td className={styles.td}>
                      <span className={styles.descEn}>{row.descriptionEnglish}</span>
                      <span className={styles.descKn}>{row.descriptionKannada}</span>
                    </td>

                    <td className={styles.td}>
                      <Badge variant={row.status === 'Active' ? 'success' : 'neutral'} size="sm">
                        {row.status}
                      </Badge>
                    </td>

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
                            <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4"
                              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
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

      {/* Add / Edit modal */}
      <BillQueueModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editRecord}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
};

export default BillQueueTab;
