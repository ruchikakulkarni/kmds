import React, { useState, useMemo } from 'react';
import Badge from '../../../../components/common/Badge';
import Pagination from '../../../../components/common/Pagination';
import SourceModal from './SourceModal';
import SubSourceModal from './SubSourceModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import styles from './SourceFinancing.module.css';
import type { SourceFinancing, SubSourceFinancing, SourceStatus } from './types';

/* ── Sample seed data ── */
const INITIAL_SOURCES: SourceFinancing[] = [
  { id: 1, sourceCode: 'SF-001', nameEnglish: 'Own Revenue', nameKannada: 'ಸ್ವಂತ ರಾಜಸ್ವ', description: 'Revenue generated from ULB own sources', status: 'Active' },
  { id: 2, sourceCode: 'SF-002', nameEnglish: 'State Grants', nameKannada: 'ರಾಜ್ಯ ಅನುದಾನ', description: 'Grants received from State Government', status: 'Active' },
  { id: 3, sourceCode: 'SF-003', nameEnglish: 'Central Grants', nameKannada: 'ಕೇಂದ್ರ ಅನುದಾನ', description: 'Grants received from Central Government', status: 'Active' },
  { id: 4, sourceCode: 'SF-004', nameEnglish: 'Loans & Borrowings', nameKannada: 'ಸಾಲ ಮತ್ತು ಸಾಲ', description: 'External loans and borrowings', status: 'Active' },
  { id: 5, sourceCode: 'SF-005', nameEnglish: 'External Aid', nameKannada: 'ಬಾಹ್ಯ ನೆರವು', description: 'Aid from multilateral agencies and donors', status: 'Inactive' },
  { id: 6, sourceCode: 'SF-006', nameEnglish: 'Capital Receipts', nameKannada: 'ಬಂಡವಾಳ ರಸೀದಿ', description: 'Receipts from capital account transactions', status: 'Active' },
  { id: 7, sourceCode: 'SF-007', nameEnglish: 'Special Purpose Grants', nameKannada: 'ವಿಶೇಷ ಉದ್ದೇಶ ಅನುದಾನ', description: 'Grants for specific projects or schemes', status: 'Active' },
  { id: 8, sourceCode: 'SF-008', nameEnglish: 'Devolution Funds', nameKannada: 'ವಿಕೇಂದ್ರೀಕರಣ ನಿಧಿ', description: 'Funds devolved under Finance Commission', status: 'Active' },
];

const INITIAL_SUBSOURCES: SubSourceFinancing[] = [
  { id: 1,  sourceId: 2, subSourceCode: 'SF-002-01', nameEnglish: 'SFC Grants', nameKannada: 'ರಾಜ್ಯ ಹಣಕಾಸು ಆಯೋಗ ಅನುದಾನ', description: 'State Finance Commission grants', status: 'Active' },
  { id: 2,  sourceId: 2, subSourceCode: 'SF-002-02', nameEnglish: 'State Dev. Grants', nameKannada: 'ರಾಜ್ಯ ಅಭಿವೃದ್ಧಿ ಅನುದಾನ', description: 'State development grants', status: 'Active' },
  { id: 3,  sourceId: 2, subSourceCode: 'SF-002-03', nameEnglish: 'AMRUT Grants', nameKannada: 'ಅಮೃತ್ ಅನುದಾನ', description: 'AMRUT scheme grants', status: 'Active' },
  { id: 4,  sourceId: 3, subSourceCode: 'SF-003-01', nameEnglish: 'CFC Grants', nameKannada: 'ಕೇಂದ್ರ ಹಣಕಾಸು ಆಯೋಗ ಅನುದಾನ', description: 'Central Finance Commission grants', status: 'Active' },
  { id: 5,  sourceId: 3, subSourceCode: 'SF-003-02', nameEnglish: 'Smart City Mission', nameKannada: 'ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಮಿಷನ್', description: 'Smart City Mission grants', status: 'Active' },
  { id: 6,  sourceId: 3, subSourceCode: 'SF-003-03', nameEnglish: 'PMAY Grants', nameKannada: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನಾ', description: 'Pradhan Mantri Awas Yojana grants', status: 'Inactive' },
  { id: 7,  sourceId: 1, subSourceCode: 'SF-001-01', nameEnglish: 'Property Tax', nameKannada: 'ಆಸ್ತಿ ತೆರಿಗೆ', description: 'Revenue from property tax', status: 'Active' },
  { id: 8,  sourceId: 1, subSourceCode: 'SF-001-02', nameEnglish: 'Water Charges', nameKannada: 'ನೀರು ಶುಲ್ಕ', description: 'Revenue from water charges', status: 'Active' },
  { id: 9,  sourceId: 4, subSourceCode: 'SF-004-01', nameEnglish: 'HUDCO Loans', nameKannada: 'ಹಡ್ಕೋ ಸಾಲ', description: 'Loans from HUDCO', status: 'Active' },
  { id: 10, sourceId: 4, subSourceCode: 'SF-004-02', nameEnglish: 'Bank Loans', nameKannada: 'ಬ್ಯಾಂಕ್ ಸಾಲ', description: 'Commercial bank loans', status: 'Active' },
];

const PAGE_SIZE = 8;

const SourceFinancingTab: React.FC = () => {
  /* ── State: data ── */
  const [sources, setSources] = useState<SourceFinancing[]>(INITIAL_SOURCES);
  const [subSources, setSubSources] = useState<SubSourceFinancing[]>(INITIAL_SUBSOURCES);
  const [nextSourceId, setNextSourceId] = useState(INITIAL_SOURCES.length + 1);
  const [nextSubId, setNextSubId] = useState(INITIAL_SUBSOURCES.length + 1);

  /* ── State: navigation ── */
  const [selectedSource, setSelectedSource] = useState<SourceFinancing | null>(null);

  /* ── State: source list filters ── */
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceStatus, setSourceStatus] = useState<'All' | SourceStatus>('All');
  const [sourcePage, setSourcePage] = useState(1);

  /* ── State: sub-source list filters ── */
  const [subSearch, setSubSearch] = useState('');
  const [subStatus, setSubStatus] = useState<'All' | SourceStatus>('All');
  const [subPage, setSubPage] = useState(1);

  /* ── State: modals ── */
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [editSource, setEditSource] = useState<SourceFinancing | null>(null);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editSub, setEditSub] = useState<SubSourceFinancing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'source' | 'subsource'; id: number } | null>(null);

  /* ── Filtered & paged sources ── */
  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchSearch =
        !sourceSearch ||
        s.nameEnglish.toLowerCase().includes(sourceSearch.toLowerCase()) ||
        s.sourceCode.toLowerCase().includes(sourceSearch.toLowerCase()) ||
        s.nameKannada.includes(sourceSearch);
      const matchStatus = sourceStatus === 'All' || s.status === sourceStatus;
      return matchSearch && matchStatus;
    });
  }, [sources, sourceSearch, sourceStatus]);

  const sourceTotalPages = Math.ceil(filteredSources.length / PAGE_SIZE);
  const pagedSources = filteredSources.slice((sourcePage - 1) * PAGE_SIZE, sourcePage * PAGE_SIZE);

  /* ── Filtered & paged sub-sources ── */
  const filteredSubs = useMemo(() => {
    if (!selectedSource) return [];
    return subSources.filter((ss) => {
      if (ss.sourceId !== selectedSource.id) return false;
      const matchSearch =
        !subSearch ||
        ss.nameEnglish.toLowerCase().includes(subSearch.toLowerCase()) ||
        ss.subSourceCode.toLowerCase().includes(subSearch.toLowerCase()) ||
        ss.nameKannada.includes(subSearch);
      const matchStatus = subStatus === 'All' || ss.status === subStatus;
      return matchSearch && matchStatus;
    });
  }, [subSources, selectedSource, subSearch, subStatus]);

  const subTotalPages = Math.ceil(filteredSubs.length / PAGE_SIZE);
  const pagedSubs = filteredSubs.slice((subPage - 1) * PAGE_SIZE, subPage * PAGE_SIZE);

  /* ── Source CRUD ── */
  const openAddSource = () => { setEditSource(null); setSourceModalOpen(true); };
  const openEditSource = (s: SourceFinancing) => { setEditSource(s); setSourceModalOpen(true); };

  const handleSourceSubmit = (data: Omit<SourceFinancing, 'id'>) => {
    if (editSource) {
      setSources((prev) => prev.map((s) => s.id === editSource.id ? { ...data, id: editSource.id } : s));
    } else {
      setSources((prev) => [...prev, { ...data, id: nextSourceId }]);
      setNextSourceId((n) => n + 1);
    }
    setSourceModalOpen(false);
    setSourcePage(1);
  };

  const confirmDeleteSource = (id: number) => setDeleteTarget({ type: 'source', id });

  const executeDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'source') {
      setSources((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSubSources((prev) => prev.filter((ss) => ss.sourceId !== deleteTarget.id));
      if (selectedSource?.id === deleteTarget.id) setSelectedSource(null);
    } else {
      setSubSources((prev) => prev.filter((ss) => ss.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  /* ── Sub-source CRUD ── */
  const openAddSub = () => { setEditSub(null); setSubModalOpen(true); };
  const openEditSub = (ss: SubSourceFinancing) => { setEditSub(ss); setSubModalOpen(true); };

  const handleSubSubmit = (data: Omit<SubSourceFinancing, 'id'>) => {
    if (editSub) {
      setSubSources((prev) => prev.map((ss) => ss.id === editSub.id ? { ...data, id: editSub.id } : ss));
    } else {
      setSubSources((prev) => [...prev, { ...data, id: nextSubId }]);
      setNextSubId((n) => n + 1);
    }
    setSubModalOpen(false);
    setSubPage(1);
  };

  const confirmDeleteSub = (id: number) => setDeleteTarget({ type: 'subsource', id });

  /* ── Navigate to sub-source view ── */
  const openSubSources = (source: SourceFinancing) => {
    setSelectedSource(source);
    setSubSearch('');
    setSubStatus('All');
    setSubPage(1);
  };

  const backToSources = () => setSelectedSource(null);

  /* ── Render: Source List ── */
  if (!selectedSource) {
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
                placeholder="Search by Source Code or Name..."
                value={sourceSearch}
                onChange={(e) => { setSourceSearch(e.target.value); setSourcePage(1); }}
              />
            </div>
            <div className={styles.filterBox}>
              <select
                className={styles.filterSelect}
                value={sourceStatus}
                onChange={(e) => { setSourceStatus(e.target.value as typeof sourceStatus); setSourcePage(1); }}
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
          <button className={styles.addBtn} onClick={openAddSource}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Source of Financing
          </button>
        </div>

        {/* Table card */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Source of Financing</h2>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Sl</th>
                  <th className={styles.th}>Source Code</th>
                  <th className={styles.th}>Name (English)</th>
                  <th className={styles.th}>Name (Kannada)</th>
                  <th className={styles.th}>Description</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedSources.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.empty}>No records found</td>
                  </tr>
                ) : (
                  pagedSources.map((row, idx) => (
                    <tr key={row.id} className={styles.tr}>
                      <td className={styles.td}>{(sourcePage - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className={styles.td}>
                        <span className={styles.codeChip}>{row.sourceCode}</span>
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
                          <button className={styles.actionBtn} onClick={() => openEditSource(row)} title="Edit">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className={styles.subSourceBtn}
                            onClick={() => openSubSources(row)}
                            title="View Sub-Sources"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <rect x="1" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                              <rect x="8" y="6" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                              <path d="M3.5 8v1.5H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            Sub Sources
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => confirmDeleteSource(row.id)}
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
              currentPage={sourcePage}
              totalPages={sourceTotalPages}
              totalRecords={filteredSources.length}
              pageSize={PAGE_SIZE}
              onPageChange={setSourcePage}
            />
          </div>
        </div>

        {/* Source Modal */}
        <SourceModal
          isOpen={sourceModalOpen}
          onClose={() => setSourceModalOpen(false)}
          onSubmit={handleSourceSubmit}
          initialData={editSource}
        />

        {/* Delete Confirm */}
        <DeleteConfirmModal
          isOpen={deleteTarget?.type === 'source'}
          onClose={() => setDeleteTarget(null)}
          onConfirm={executeDelete}
          message="Are you sure you want to delete this Source of Financing? All associated Sub-Sources will also be removed. This action cannot be undone."
        />
      </div>
    );
  }

  /* ── Render: Sub-Source List ── */
  return (
    <div className={styles.content}>
      {/* Back navigation */}
      <div className={styles.subNav}>
        <button className={styles.backBtn} onClick={backToSources}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Sources
        </button>

        {/* Source context card */}
        <div className={styles.sourceContext}>
          <div className={styles.sourceContextItem}>
            <span className={styles.sourceContextLabel}>Source Code</span>
            <span className={styles.sourceContextCode}>{selectedSource.sourceCode}</span>
          </div>
          <div className={styles.sourceContextDivider} />
          <div className={styles.sourceContextItem}>
            <span className={styles.sourceContextLabel}>Source Name</span>
            <span className={styles.sourceContextValue}>{selectedSource.nameEnglish}</span>
          </div>
          <div className={styles.sourceContextDivider} />
          <div className={styles.sourceContextItem}>
            <span className={styles.sourceContextLabel}>ಮೂಲ ಹೆಸರು</span>
            <span className={styles.sourceContextValue}>{selectedSource.nameKannada}</span>
          </div>
          <div className={styles.sourceContextDivider} />
          <div className={styles.sourceContextItem}>
            <span className={styles.sourceContextLabel}>Status</span>
            <Badge variant={selectedSource.status === 'Active' ? 'success' : 'neutral'} size="sm">
              {selectedSource.status}
            </Badge>
          </div>
        </div>
      </div>

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
              placeholder="Search by Sub-Source Code or Name..."
              value={subSearch}
              onChange={(e) => { setSubSearch(e.target.value); setSubPage(1); }}
            />
          </div>
          <div className={styles.filterBox}>
            <select
              className={styles.filterSelect}
              value={subStatus}
              onChange={(e) => { setSubStatus(e.target.value as typeof subStatus); setSubPage(1); }}
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
        <button className={styles.addBtn} onClick={openAddSub}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Sub-Source
        </button>
      </div>

      {/* Sub-source table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeaderSub}>
          <h2 className={styles.tableTitle}>Sub-Sources of Financing</h2>
          <span className={styles.tableSubtitle}>for {selectedSource.nameEnglish} ({selectedSource.sourceCode})</span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Sl</th>
                <th className={styles.th}>Sub-Source Code</th>
                <th className={styles.th}>Name (English)</th>
                <th className={styles.th}>Name (Kannada)</th>
                <th className={styles.th}>Description</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.empty}>
                    No sub-sources found for this source.{' '}
                    <button className={styles.emptyAddLink} onClick={openAddSub}>Add one now</button>
                  </td>
                </tr>
              ) : (
                pagedSubs.map((row, idx) => (
                  <tr key={row.id} className={styles.tr}>
                    <td className={styles.td}>{(subPage - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className={styles.td}>
                      <span className={styles.codeChip}>{row.subSourceCode}</span>
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
                        <button className={styles.actionBtn} onClick={() => openEditSub(row)}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                          </svg>
                          Edit
                        </button>
                        <button className={styles.deleteBtn} onClick={() => confirmDeleteSub(row.id)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
            currentPage={subPage}
            totalPages={subTotalPages}
            totalRecords={filteredSubs.length}
            pageSize={PAGE_SIZE}
            onPageChange={setSubPage}
          />
        </div>
      </div>

      {/* Sub-source Modal */}
      <SubSourceModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onSubmit={handleSubSubmit}
        initialData={editSub}
        parentSource={selectedSource}
      />

      {/* Delete Confirm */}
      <DeleteConfirmModal
        isOpen={deleteTarget?.type === 'subsource'}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        message="Are you sure you want to delete this Sub-Source of Financing? This action cannot be undone."
      />
    </div>
  );
};

export default SourceFinancingTab;
