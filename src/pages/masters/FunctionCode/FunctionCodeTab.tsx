import React, { useState, useMemo } from 'react';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import FunctionCodeModal from './FunctionCodeModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import styles from './FunctionCodeTab.module.css';
import type { FunctionCode, FunctionStatus } from './types';

const INITIAL_DATA: FunctionCode[] = [
  { id: 1,  functionCode: 'FC-01', nameEnglish: 'General Administration',        nameKannada: 'ಸಾಮಾನ್ಯ ಆಡಳಿತ',                description: 'ULB general administration and governance activities',      status: 'Active' },
  { id: 2,  functionCode: 'FC-02', nameEnglish: 'Urban Planning & Development',   nameKannada: 'ನಗರ ಯೋಜನೆ ಮತ್ತು ಅಭಿವೃದ್ಧಿ',        description: 'Master planning, zoning and urban development',            status: 'Active' },
  { id: 3,  functionCode: 'FC-03', nameEnglish: 'Roads & Bridges',                nameKannada: 'ರಸ್ತೆ ಮತ್ತು ಸೇತುವೆ',              description: 'Construction and maintenance of roads and bridges',        status: 'Active' },
  { id: 4,  functionCode: 'FC-04', nameEnglish: 'Water Supply',                   nameKannada: 'ನೀರು ಸರಬರಾಜು',                  description: 'Provision of safe drinking water to citizens',             status: 'Active' },
  { id: 5,  functionCode: 'FC-05', nameEnglish: 'Sewerage & Drainage',            nameKannada: 'ಒಳಚರಂಡಿ ಮತ್ತು ಚರಂಡಿ',           description: 'Sewerage network and stormwater drainage management',     status: 'Active' },
  { id: 6,  functionCode: 'FC-06', nameEnglish: 'Public Health',                  nameKannada: 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ',               description: 'Public health services, clinics and sanitation drives',   status: 'Active' },
  { id: 7,  functionCode: 'FC-07', nameEnglish: 'Primary Education',              nameKannada: 'ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ',                description: 'Municipal primary schools and education programmes',      status: 'Active' },
  { id: 8,  functionCode: 'FC-08', nameEnglish: 'Parks & Gardens',                nameKannada: 'ಉದ್ಯಾನ ಮತ್ತು ತೋಟ',              description: 'Maintenance of public parks, playgrounds and gardens',    status: 'Active' },
  { id: 9,  functionCode: 'FC-09', nameEnglish: 'Street Lighting',                nameKannada: 'ಬೀದಿ ದೀಪ',                      description: 'Installation and maintenance of street lights',            status: 'Active' },
  { id: 10, functionCode: 'FC-10', nameEnglish: 'Solid Waste Management',         nameKannada: 'ಘನ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ',             description: 'Collection, segregation and disposal of solid waste',     status: 'Active' },
  { id: 11, functionCode: 'FC-11', nameEnglish: 'Social Welfare',                 nameKannada: 'ಸಮಾಜ ಕಲ್ಯಾಣ',                   description: 'Social welfare schemes for vulnerable populations',       status: 'Active' },
  { id: 12, functionCode: 'FC-12', nameEnglish: 'Regulation & Enforcement',       nameKannada: 'ನಿಯಂತ್ರಣ ಮತ್ತು ಜಾರಿ',            description: 'Building regulation, licensing and enforcement actions',  status: 'Inactive' },
];

const PAGE_SIZE = 8;

const FunctionCodeTab: React.FC = () => {
  const [records, setRecords]       = useState<FunctionCode[]>(INITIAL_DATA);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | FunctionStatus>('All');
  const [page, setPage]             = useState(1);
  const [nextId, setNextId]         = useState(INITIAL_DATA.length + 1);

  /* modals */
  const [modalOpen, setModalOpen]       = useState(false);
  const [editRecord, setEditRecord]     = useState<FunctionCode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  /* filtered + paged */
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !search ||
        r.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
        r.functionCode.toLowerCase().includes(search.toLowerCase()) ||
        r.nameKannada.includes(search);
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* handlers */
  const openAdd  = () => { setEditRecord(null);   setModalOpen(true); };
  const openEdit = (r: FunctionCode) => { setEditRecord(r); setModalOpen(true); };

  const handleSubmit = (data: Omit<FunctionCode, 'id'>) => {
    if (editRecord) {
      setRecords((prev) => prev.map((r) => r.id === editRecord.id ? { ...data, id: editRecord.id } : r));
    } else {
      setRecords((prev) => [...prev, { ...data, id: nextId }]);
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

  return (
    <div className={styles.content}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.searchIcon}>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by Function Code or Name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
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
              <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Function Code
        </button>
      </div>

      {/* Table card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Function Codes</h2>
          <span className={styles.tableCount}>{filtered.length} records</span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Sl</th>
                <th className={styles.th}>Function Code</th>
                <th className={styles.th}>Name (English)</th>
                <th className={styles.th}>Name (Kannada)</th>
                <th className={styles.th}>Description</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.empty}>No records found</td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr key={row.id} className={styles.tr}>
                    <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className={styles.td}>
                      <span className={styles.codeChip}>{row.functionCode}</span>
                    </td>
                    <td className={styles.td}>{row.nameEnglish}</td>
                    <td className={styles.td}>{row.nameKannada}</td>
                    <td className={styles.td}>
                      <span className={styles.descCell}>{row.description}</span>
                    </td>
                    <td className={styles.td}>
                      <Badge variant={row.status === 'Active' ? 'success' : 'neutral'} size="sm">
                        {row.status}
                      </Badge>
                    </td>
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
      <FunctionCodeModal
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

export default FunctionCodeTab;
