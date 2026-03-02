import React, { useState, useMemo } from 'react';
import { useToast } from '../../../components/common/Toast';
import Breadcrumb from '../../../components/common/Breadcrumb';
import type { BankAccount, ChequeRange } from './types';
import type { SavePayload } from './BankDetailsModal';
import BankDetailsModal from './BankDetailsModal';
import ChequeLeafModal from './ChequeLeafModal';
import AddressViewModal from './AddressViewModal';
import styles from './AddBankDetails.module.css';

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function maskAccountNumber(num: string): string {
  if (num.length <= 4) return 'X'.repeat(num.length);
  return 'X'.repeat(num.length - 4) + num.slice(-4);
}

function auditLog(action: 'Create' | 'Update', account: BankAccount): void {
  console.log(
    `[AUDIT] ${new Date().toISOString()} | ${action} | ` +
    `A/c: ${maskAccountNumber(account.accountNumber)} | ` +
    `Bank: ${account.bankName} | Branch: ${account.branchName}`,
  );
}

/* ─────────────────────────────────────────
   Seed data (mock existing records)
───────────────────────────────────────── */
const SEED: BankAccount[] = [
  {
    id: '1',
    bankId: 'sbi',
    bankName: 'State Bank of India',
    branchId: 'sbi_blg',
    branchName: 'Belagavi Main',
    ifsc: 'SBIN0004628',
    micr: '590002004',
    shortName: 'SBI BLG MAIN',
    addressLine1: 'Market Road, Belagavi',
    addressLine2: 'Near Gandhi Nagar',
    districtId: 'blg',
    districtName: 'Belagavi',
    talukId: 'blg_blg',
    talukName: 'Belagavi',
    pinCode: '590001',
    contactNumber: '9876543210',
    accountNumber: '12345678901',
    accountType: 'Current',
    purposeId: 'sal',
    purposeName: 'Bank Account-Nationalised Banks-Specific Grants',
    fundId: 'gen',
    fundName: 'General Fund',
    integrations: ['NEFT/RTGS', 'PFMS'],
    description: 'Main salary account for municipal staff',
    status: 'Active',
    chequeLeaves: [
      { id: 'c1', issuedDate: '01-01-2025', from: 1001, to: 1100, exhausted: false },
    ],
  },
  {
    id: '2',
    bankId: 'cnrb',
    bankName: 'Canara Bank',
    branchId: 'cnrb_blg',
    branchName: 'Belagavi Branch',
    ifsc: 'CNRB0001234',
    micr: '590015001',
    shortName: 'CNB BLG',
    addressLine1: 'College Road, Belagavi',
    addressLine2: '',
    districtId: 'blg',
    districtName: 'Belagavi',
    talukId: 'blg_blg',
    talukName: 'Belagavi',
    pinCode: '590002',
    contactNumber: '9876501234',
    accountNumber: '9876543210',
    accountType: 'Savings',
    purposeId: 'rev',
    purposeName: 'Bank Account-Nationalised Banks-General',
    fundId: 'ws',
    fundName: 'Water Supply Fund',
    integrations: ['BBPS', 'UPI'],
    description: 'Water supply revenue collection account',
    status: 'Active',
    chequeLeaves: [],
  },
  {
    id: '3',
    bankId: 'bob',
    bankName: 'Bank of Baroda',
    branchId: 'bob_blg',
    branchName: 'Belagavi Branch',
    ifsc: 'BARB0BELAGA',
    micr: '590012001',
    shortName: 'BOB SW FUND',
    addressLine1: 'Khanapur Road, Belagavi',
    addressLine2: '',
    districtId: 'blg',
    districtName: 'Belagavi',
    talukId: 'blg_blg',
    talukName: 'Belagavi',
    pinCode: '590003',
    contactNumber: '7890123456',
    accountNumber: '11223344556677',
    accountType: 'Current',
    purposeId: 'cap',
    purposeName: 'Bank Account-Nationalized Banks-Collection',
    fundId: 'sw',
    fundName: 'Solid Waste Management Fund',
    integrations: ['PFMS'],
    description: 'Solid waste capital works account',
    status: 'Inactive',
    chequeLeaves: [],
  },
];

const PAGE_SIZE = 8;

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
const AddBankDetails: React.FC = () => {
  const { addToast } = useToast();

  /* state */
  const [records, setRecords] = useState<BankAccount[]>(SEED);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [page, setPage] = useState(1);

  /* modal state */
  const [formModal, setFormModal] = useState<{ open: boolean; account: BankAccount | null }>({
    open: false,
    account: null,
  });
  const [chequeModal, setChequeModal] = useState<BankAccount | null>(null);
  const [addressModal, setAddressModal] = useState<BankAccount | null>(null);

  /* ── filtered + paged data ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesSearch =
        !q ||
        r.bankName.toLowerCase().includes(q) ||
        r.branchName.toLowerCase().includes(q) ||
        r.shortName.toLowerCase().includes(q) ||
        r.accountNumber.includes(q);
      const matchesStatus =
        statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── handlers ── */
  const openAdd = () => setFormModal({ open: true, account: null });
  const openEdit = (account: BankAccount) => setFormModal({ open: true, account });
  const closeForm = () => setFormModal({ open: false, account: null });

  const handleSave = (data: SavePayload) => {
    if (formModal.account) {
      /* edit */
      const updated: BankAccount = {
        ...formModal.account,
        ...data,
      };
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      auditLog('Update', updated);
      addToast('Data Saved Successfully', 'success');
    } else {
      /* add */
      const newAccount: BankAccount = {
        ...data,
        id: Date.now().toString(),
        chequeLeaves: [],
      };
      setRecords((prev) => [...prev, newAccount]);
      auditLog('Create', newAccount);
      addToast('Data Saved Successfully', 'success');
    }
    closeForm();
  };

  const handleAddChequeRange = (accountId: string, range: ChequeRange) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === accountId
          ? { ...r, chequeLeaves: [...r.chequeLeaves, range] }
          : r,
      ),
    );
    /* keep cheque modal open — user can add more ranges */
    /* sync the chequeModal state so the table re-renders */
    setChequeModal((prev) =>
      prev?.id === accountId
        ? { ...prev, chequeLeaves: [...prev.chequeLeaves, range] }
        : prev,
    );
  };

  const handleToggleExhausted = (accountId: string, rangeId: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === accountId
          ? {
              ...r,
              chequeLeaves: r.chequeLeaves.map((c) =>
                c.id === rangeId ? { ...c, exhausted: !c.exhausted } : c,
              ),
            }
          : r,
      ),
    );
    setChequeModal((prev) =>
      prev?.id === accountId
        ? {
            ...prev,
            chequeLeaves: prev.chequeLeaves.map((c) =>
              c.id === rangeId ? { ...c, exhausted: !c.exhausted } : c,
            ),
          }
        : prev,
    );
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
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters', href: '/masters' },
          { label: 'Add Bank Details' },
        ]}
      />

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitles}>
          <h1 className={styles.pageTitle}>Add Bank Details</h1>
          <p className={styles.pageSubtitle}>
            Manage bank accounts for Urban Local Body financial operations
          </p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add Bank Details
        </button>
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
            placeholder="Search by bank, branch or short name…"
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status:</span>
          <select className={styles.filterSelect} value={statusFilter} onChange={handleStatusFilter}>
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
                <th className={styles.th}>Bank Name</th>
                <th className={styles.th}>Branch Name</th>
                <th className={styles.th}>Address &amp; Contact</th>
                <th className={styles.th}>Account Number</th>
                <th className={styles.th}>Account Type</th>
                <th className={styles.th}>Purpose / Use</th>
                <th className={styles.th}>Fund</th>
                <th className={styles.th}>Description</th>
                <th className={styles.th}>Cheque Leaf</th>
                <th className={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={11} className={styles.empty}>
                    No bank accounts found.
                    {search || statusFilter !== 'All' ? ' Try adjusting your filters.' : ''}
                  </td>
                </tr>
              ) : (
                paged.map((account, idx) => (
                  <tr key={account.id}>
                    <td className={styles.td}>{(safePage - 1) * PAGE_SIZE + idx + 1}</td>

                    <td className={styles.td}>{account.bankName}</td>

                    <td className={styles.td}>{account.branchName}</td>

                    {/* Address & Contact — View link */}
                    <td className={styles.td}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setAddressModal(account)}
                      >
                        View
                      </button>
                    </td>

                    {/* Account number — masked */}
                    <td className={styles.td}>
                      <span className={styles.masked}>
                        {maskAccountNumber(account.accountNumber)}
                      </span>
                    </td>

                    <td className={styles.td}>{account.accountType}</td>

                    <td className={styles.td}>{account.purposeName}</td>

                    <td className={styles.td}>{account.fundName}</td>

                    {/* Description — truncated */}
                    <td className={styles.td}>
                      <span className={styles.descCell} title={account.description}>
                        {account.description || '—'}
                      </span>
                    </td>

                    {/* Cheque Leaf — Add/View link */}
                    <td className={styles.td}>
                      <button
                        className={styles.chequeBtn}
                        onClick={() => setChequeModal(account)}
                      >
                        {account.chequeLeaves.length > 0
                          ? `View (${account.chequeLeaves.length})`
                          : 'Add / View'}
                      </button>
                    </td>

                    {/* Action */}
                    <td className={styles.td}>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.editBtn}
                          onClick={() => openEdit(account)}
                        >
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
                      </div>
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

      {/* ── Modals ── */}
      {formModal.open && (
        <BankDetailsModal
          account={formModal.account}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {chequeModal && (
        <ChequeLeafModal
          account={chequeModal}
          onAddRange={handleAddChequeRange}
          onToggleExhausted={handleToggleExhausted}
          onClose={() => setChequeModal(null)}
        />
      )}

      {addressModal && (
        <AddressViewModal
          account={addressModal}
          onClose={() => setAddressModal(null)}
        />
      )}
    </div>
  );
};

export default AddBankDetails;
