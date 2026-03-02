import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Tabs from '../../../components/common/Tabs';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import FundCodeModal from './FundCodeModal';
import SourceFinancingTab from './SourceFinancing';
import { FunctionCodeTab } from '../FunctionCode';
import { AccountCodeTab } from '../AccountCode';
import styles from './BankDetails.module.css';
import type { FundCode } from './types';

const TABS = [
  { key: 'fund-code', label: 'Fund Code' },
  { key: 'source-financing', label: 'Source & Sub-Source of Financing' },
  { key: 'account-code', label: 'Account Code' },
  { key: 'function-code', label: 'Function Code' },
];

// Maps tab IDs ↔ URL segments
const TAB_TO_URL: Record<string, string> = {
  'fund-code':        'fund-code',
  'source-financing': 'source-subsource-financing',
  'account-code':     'account-code',
  'function-code':    'function-code',
};

const URL_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_URL).map(([tab, url]) => [url, tab])
);

const INITIAL_DATA: FundCode[] = [
  { id: 1, fundCode: '101', nameEnglish: 'General Fund', nameKannada: 'ಸಾಮಾನ್ಯ ನಿಧಿ', description: 'General purpose fund for ULB operations', status: 'Active' },
  { id: 2, fundCode: '102', nameEnglish: 'Water Supply & Sewerage Fund', nameKannada: 'ನೀರು ಸರಬರಾಜು ನಿಧಿ', description: 'Fund for water supply infrastructure', status: 'Active' },
  { id: 3, fundCode: '101', nameEnglish: 'General Fund', nameKannada: 'ಒಳಚರಂಡಿ ನಿಧಿ', description: 'Fund for drainage & sewerage', status: 'Active' },
  { id: 4, fundCode: '101', nameEnglish: 'General Fund', nameKannada: 'ಎಸ್ಎಫ್‍ಸಿ ಅನುದಾನ ನಿಧಿ', description: 'State Finance Commission grants', status: 'Active' },
  { id: 5, fundCode: '102', nameEnglish: 'Water Supply & Sewerage Fund', nameKannada: 'ಸಿಎಫ್‍ಸಿ ಅನುದಾನ ನಿಧಿ', description: 'Central Finance Commission grants', status: 'Inactive' },
  { id: 6, fundCode: '201', nameEnglish: 'Enterprise Fund', nameKannada: 'ಉದ್ಯಮ ನಿಧಿ', description: 'Infrastructure development fund', status: 'Active' },
  { id: 7, fundCode: '103', nameEnglish: 'Road Fund', nameKannada: 'ರಸ್ತೆ ನಿಧಿ', description: 'Fund for road construction and maintenance', status: 'Active' },
  { id: 8, fundCode: '104', nameEnglish: 'Health Fund', nameKannada: 'ಆರೋಗ್ಯ ನಿಧಿ', description: 'Municipal health services fund', status: 'Active' },
  { id: 9, fundCode: '105', nameEnglish: 'Education Fund', nameKannada: 'ಶಿಕ್ಷಣ ನಿಧಿ', description: 'Fund for municipal schools', status: 'Inactive' },
  { id: 10, fundCode: '106', nameEnglish: 'Parks & Gardens Fund', nameKannada: 'ಉದ್ಯಾನ ನಿಧಿ', description: 'Green spaces maintenance fund', status: 'Active' },
];

const PAGE_SIZE = 8;

const BankDetails: React.FC = () => {
  const { tab: urlTab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  // Derive active tab from URL; fall back to fund-code for unknown segments
  const activeTab = URL_TO_TAB[urlTab ?? ''] ?? 'fund-code';

  const handleTabChange = (tabId: string) => {
    navigate(`/masters/charts-of-accounts/${TAB_TO_URL[tabId]}`);
  };

  const [records, setRecords] = useState<FundCode[]>(INITIAL_DATA);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FundCode | null>(null);
  const [nextId, setNextId] = useState(INITIAL_DATA.length + 1);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !search ||
        r.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
        r.fundCode.includes(search) ||
        r.nameKannada.includes(search);
      const matchStatus =
        statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditRecord(null);
    setModalOpen(true);
  };

  const openEdit = (record: FundCode) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleSubmit = (data: Omit<FundCode, 'id'>) => {
    if (editRecord) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editRecord.id ? { ...data, id: editRecord.id } : r))
      );
    } else {
      setRecords((prev) => [...prev, { ...data, id: nextId }]);
      setNextId((n) => n + 1);
    }
    setModalOpen(false);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters', href: '/masters' },
          { label: 'Charts of Accounts' },
        ]}
      />

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bank Details Management</h1>
          <p className={styles.pageSubtitle}>
            Manage bank accounts mapped to ULB financial operations and payment workflows
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        items={TABS}
        activeKey={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab content */}
      {activeTab === 'fund-code' && (
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
                  placeholder="Search by Bank Name, IFSC, or Account..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>

              {/* Status filter */}
              <div className={styles.filterBox}>
                <select
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as typeof statusFilter);
                    setPage(1);
                  }}
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
              New Fund Code
            </button>
          </div>

          {/* Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Bank Accounts</h2>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Sl</th>
                    <th className={styles.th}>FUND CODE</th>
                    <th className={styles.th}>NAME (ENGLISH)</th>
                    <th className={styles.th}>NAME (KANNADA)</th>
                    <th className={styles.th}>DESCRIPTION</th>
                    <th className={styles.th}>STATUS</th>
                    <th className={styles.th}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.empty}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    paged.map((row, idx) => (
                      <tr key={row.id} className={styles.tr}>
                        <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className={styles.td}>{row.fundCode}</td>
                        <td className={styles.td}>{row.nameEnglish}</td>
                        <td className={styles.td}>{row.nameKannada}</td>
                        <td className={styles.td}>{row.description}</td>
                        <td className={styles.td}>
                          <Badge
                            variant={row.status === 'Active' ? 'success' : 'neutral'}
                            size="sm"
                          >
                            {row.status}
                          </Badge>
                        </td>
                        <td className={styles.td}>
                          <button
                            className={styles.editBtn}
                            onClick={() => openEdit(row)}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
        </div>
      )}

      {activeTab === 'source-financing' && <SourceFinancingTab />}

      {activeTab === 'account-code' && <AccountCodeTab />}

      {activeTab === 'function-code' && <FunctionCodeTab />}

      {activeTab !== 'fund-code' && activeTab !== 'source-financing' && activeTab !== 'account-code' && activeTab !== 'function-code' && (
        <div className={styles.tabPlaceholder}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 20h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>This section is under development</p>
        </div>
      )}

      {/* Modal */}
      <FundCodeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editRecord}
      />
    </div>
  );
};

export default BankDetails;
