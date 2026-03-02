import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Badge from '../../../components/common/Badge';
import { VENDOR_SEED, SCHEME_OPTIONS } from './data';
import type { VendorRecord, PayeeTypeFilter, StatusFilter } from './types';
import VendorModal from './VendorModal';
import VendorDetailDrawer from './VendorDetailDrawer';
import styles from './Vendors.module.css';

const PAGE_SIZE = 10;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDisplayName(r: VendorRecord): string {
  if (r.payeeType === 'Beneficiary') return r.beneficiaryData?.schemeName ?? '—';
  if (r.payeeType === 'Employee') return r.employeeData?.name ?? '—';
  if (r.payeeType === 'Statutory') return r.statutoryData?.panName ?? r.payeeCode;
  if (r.payeeType === 'Vendor') return r.vendorData?.panName ?? r.payeeCode;
  return '—';
}

function getContact(r: VendorRecord): string {
  if (r.payeeType === 'Employee') return r.employeeData?.mobile ?? '—';
  if (r.payeeType === 'Statutory') return r.statutoryData?.address.mobile ?? '—';
  if (r.payeeType === 'Vendor') return r.vendorData?.address.mobile ?? '—';
  return '—';
}

function getBankDisplay(r: VendorRecord): string {
  let acct = '';
  if (r.payeeType === 'Statutory') acct = r.statutoryData?.bank.accountNumber ?? '';
  if (r.payeeType === 'Vendor') acct = r.vendorData?.bank.accountNumber ?? '';
  if (!acct) return '—';
  return '•••• ' + acct.slice(-4);
}

function getGSTDisplay(r: VendorRecord): { text: string; registered: boolean } {
  if (r.payeeType === 'Statutory') {
    const g = r.statutoryData?.gst;
    return { text: g?.gstRegistered === 'Yes' ? g.gstin : 'Not Registered', registered: g?.gstRegistered === 'Yes' };
  }
  if (r.payeeType === 'Vendor') {
    const g = r.vendorData?.gst;
    return { text: g?.gstRegistered === 'Yes' ? g.gstin : 'Not Registered', registered: g?.gstRegistered === 'Yes' };
  }
  return { text: 'N/A', registered: false };
}

function getBadgeVariant(type: string): 'primary' | 'info' | 'warning' | 'success' | 'neutral' {
  if (type === 'Vendor') return 'primary';
  if (type === 'Statutory') return 'warning';
  if (type === 'Employee') return 'info';
  if (type === 'Beneficiary') return 'success';
  return 'neutral';
}

// ── Component ─────────────────────────────────────────────────────────────────

const VendorsTab: React.FC = () => {
  const { role } = useAuth();
  const isReadOnly = role === 'ULB_ADMIN';

  const [records, setRecords] = useState<VendorRecord[]>(VENDOR_SEED);
  const [search, setSearch] = useState('');
  const [payeeTypeFilter, setPayeeTypeFilter] = useState<PayeeTypeFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [page, setPage] = useState(1);

  const [formModal, setFormModal] = useState<{ open: boolean; data: VendorRecord | null }>({
    open: false,
    data: null,
  });
  const [drawerRecord, setDrawerRecord] = useState<VendorRecord | null>(null);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const name = getDisplayName(r).toLowerCase();
      const matchesSearch =
        !q ||
        name.includes(q) ||
        r.payeeCode.toLowerCase().includes(q) ||
        r.payeeType.toLowerCase().includes(q);
      const matchesType = payeeTypeFilter === 'All' || r.payeeType === payeeTypeFilter;
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [records, search, payeeTypeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleTypeFilter = (v: PayeeTypeFilter) => { setPayeeTypeFilter(v); setPage(1); };
  const handleStatusFilter = (v: StatusFilter) => { setStatusFilter(v); setPage(1); };

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const handleSave = (record: VendorRecord) => {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });
    setFormModal({ open: false, data: null });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {/* Search */}
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM14 14l-3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              className={styles.searchInput}
              placeholder="Search by name, code, type…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Payee Type filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Type:</span>
            <select
              className={styles.filterSelect}
              value={payeeTypeFilter}
              onChange={(e) => handleTypeFilter(e.target.value as PayeeTypeFilter)}
            >
              <option value="All">All</option>
              <option value="Beneficiary">Beneficiary</option>
              <option value="Employee">Employee</option>
              <option value="Statutory">Statutory</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>

          {/* Status filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status:</span>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Add button — hidden for ULB_ADMIN */}
        {!isReadOnly && (
          <button
            className={styles.addBtn}
            onClick={() => setFormModal({ open: true, data: null })}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Create Vendor
          </button>
        )}
      </div>

      {/* Table */}
      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Sl.</th>
                <th className={styles.th}>Payee Type</th>
                <th className={styles.th}>Name / Code</th>
                <th className={styles.th}>Contact</th>
                <th className={styles.th}>Bank A/c</th>
                <th className={styles.th}>GST</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    No records found
                  </td>
                </tr>
              ) : (
                paged.map((r, idx) => {
                  const name = getDisplayName(r);
                  const contact = getContact(r);
                  const bank = getBankDisplay(r);
                  const gst = getGSTDisplay(r);

                  return (
                    <tr key={r.id} className={styles.tr}>
                      <td className={styles.td}>{(safePage - 1) * PAGE_SIZE + idx + 1}</td>

                      <td className={styles.td}>
                        <Badge variant={getBadgeVariant(r.payeeType)} size="sm">
                          {r.payeeType}
                        </Badge>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.nameCell}>
                          <span className={styles.nameText}>{name}</span>
                          <span className={styles.codeText}>{r.payeeCode}</span>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.contactCell}>
                          <span>{contact}</span>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <span className={styles.masked}>{bank}</span>
                      </td>

                      <td className={styles.td}>
                        {gst.text === 'N/A' ? (
                          <span style={{ color: 'var(--color-text-muted)' }}>N/A</span>
                        ) : gst.registered ? (
                          <Badge variant="success" size="sm">
                            Registered
                          </Badge>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                            Not Registered
                          </span>
                        )}
                      </td>

                      <td className={styles.td}>
                        <Badge variant={r.status === 'Active' ? 'success' : 'neutral'} size="sm">
                          {r.status}
                        </Badge>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.actionCell}>
                          {/* View detail drawer */}
                          <button
                            className={styles.viewBtn}
                            title="View details"
                            onClick={() => setDrawerRecord(r)}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
                                stroke="currentColor"
                                strokeWidth="1.4"
                              />
                              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
                            </svg>
                          </button>

                          {/* Edit — hidden for ULB_ADMIN */}
                          {!isReadOnly && (
                            <button
                              className={styles.editBtn}
                              onClick={() => setFormModal({ open: true, data: r })}
                            >
                              Edit
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

        {/* Pagination footer */}
        {filtered.length > 0 && (
          <div className={styles.footer}>
            <span className={styles.footerInfo}>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`${styles.pageBtn} ${n === safePage ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {formModal.open && (
        <VendorModal
          isOpen={formModal.open}
          vendor={formModal.data}
          schemes={SCHEME_OPTIONS}
          allRecords={records}
          onSave={handleSave}
          onClose={() => setFormModal({ open: false, data: null })}
        />
      )}

      {/* Detail drawer */}
      {drawerRecord && (
        <VendorDetailDrawer
          record={drawerRecord}
          onClose={() => setDrawerRecord(null)}
        />
      )}
    </>
  );
};

export default VendorsTab;
