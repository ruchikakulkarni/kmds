import React, { useEffect } from 'react';
import Badge from '../../../components/common/Badge';
import type { VendorRecord } from './types';
import styles from './VendorDetailDrawer.module.css';

interface Props {
  record: VendorRecord;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value || '—'}</span>
    </div>
  );
}

function maskAccount(acct: string): string {
  if (!acct) return '—';
  if (acct.length <= 4) return acct;
  return '•'.repeat(acct.length - 4) + acct.slice(-4);
}

// ── Component ─────────────────────────────────────────────────────────────────

const VendorDetailDrawer: React.FC<Props> = ({ record: r, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const typeBadgeVariant = () => {
    if (r.payeeType === 'Vendor') return 'primary' as const;
    if (r.payeeType === 'Statutory') return 'warning' as const;
    if (r.payeeType === 'Employee') return 'info' as const;
    return 'success' as const;
  };

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Drawer */}
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Payee Details">
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>Payee Details</h2>
            <p className={styles.drawerSubtitle}>{r.payeeCode}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {/* Common summary */}
          <div className={styles.drawerSection}>
            <h3 className={styles.drawerSectionTitle}>Basic Information</h3>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Payee Type</span>
                <Badge variant={typeBadgeVariant()} size="sm">{r.payeeType}</Badge>
              </div>
              <Field label="Payee Code" value={r.payeeCode} />
              <Field label="Date" value={r.date} />
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Status</span>
                <Badge variant={r.status === 'Active' ? 'success' : 'neutral'} size="sm">
                  {r.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Beneficiary-specific */}
          {r.payeeType === 'Beneficiary' && r.beneficiaryData && (
            <>
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>Scheme Information</h3>
                <div className={styles.fieldGrid}>
                  <Field label="Scheme Name" value={r.beneficiaryData.schemeName} />
                  <Field label="Frequency" value={r.beneficiaryData.schemeFrequency} />
                  <Field label="Financial Year" value={r.beneficiaryData.financialYear} />
                  <Field
                    label="No. of Beneficiaries"
                    value={String(r.beneficiaryData.beneficiaries.length)}
                  />
                </div>
              </div>
              {r.beneficiaryData.beneficiaries.length > 0 && (
                <div className={styles.drawerSection}>
                  <h3 className={styles.drawerSectionTitle}>
                    Beneficiary List ({r.beneficiaryData.beneficiaries.length})
                  </h3>
                  <div className={styles.benList}>
                    {r.beneficiaryData.beneficiaries.map((b) => (
                      <div key={b.id} className={styles.benItem}>
                        <span className={styles.benName}>{b.name}</span>
                        <span className={styles.benDetail}>
                          Aadhaar: {'•'.repeat(8) + b.aadhaar.slice(-4)}
                        </span>
                        <span className={styles.benDetail}>Mobile: {b.mobile}</span>
                        <span className={styles.benDetail}>IFSC: {b.ifsc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Employee-specific */}
          {r.payeeType === 'Employee' && r.employeeData && (
            <div className={styles.drawerSection}>
              <h3 className={styles.drawerSectionTitle}>Employee Details</h3>
              <div className={styles.fieldGrid}>
                <Field label="Name" value={r.employeeData.name} />
                <Field label="Employee Type" value={r.employeeData.employeeType} />
                <Field label="Designation" value={r.employeeData.designation} />
                <Field label="Department" value={r.employeeData.department} />
                <Field label="Mobile" value={r.employeeData.mobile} />
                <Field label="Email" value={r.employeeData.email} />
                {r.employeeData.employeeType === 'Permanent' && (
                  <>
                    <Field label="KGID" value={r.employeeData.kgid} />
                    <Field label="HRMS ID" value={r.employeeData.hrmsId} />
                    <Field label="K2 ID" value={r.employeeData.k2Id} />
                  </>
                )}
                {r.employeeData.endDate && (
                  <Field label="End Date" value={r.employeeData.endDate} />
                )}
              </div>
            </div>
          )}

          {/* Statutory-specific */}
          {r.payeeType === 'Statutory' && r.statutoryData && (
            <>
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>Statutory Details</h3>
                <div className={styles.fieldGrid}>
                  <Field label="Payment Type" value={r.statutoryData.statutoryPaymentType} />
                  <Field label="PAN" value={r.statutoryData.pan} />
                  <Field label="PAN Name" value={r.statutoryData.panName} />
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>PAN Status</span>
                    <Badge
                      variant={r.statutoryData.panStatus === 'Active' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {r.statutoryData.panStatus || '—'}
                    </Badge>
                  </div>
                </div>
              </div>
              <AddressSection address={r.statutoryData.address} />
              <BankSection bank={r.statutoryData.bank} />
              <GSTSection gst={r.statutoryData.gst} />
            </>
          )}

          {/* Vendor-specific */}
          {r.payeeType === 'Vendor' && r.vendorData && (
            <>
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>Vendor Details</h3>
                <div className={styles.fieldGrid}>
                  <Field label="PAN" value={r.vendorData.pan} />
                  <Field label="PAN Name" value={r.vendorData.panName} />
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>PAN Status</span>
                    <Badge
                      variant={r.vendorData.panStatus === 'Active' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {r.vendorData.panStatus || '—'}
                    </Badge>
                  </div>
                  <Field label="MSME Registered" value={r.vendorData.msmeRegistered} />
                  {r.vendorData.msmeRegistered === 'Yes' && (
                    <Field label="Udyam No." value={r.vendorData.udyamRegistrationNo} />
                  )}
                  <Field label="K2 Recipient ID" value={r.vendorData.k2RecipientId} />
                  <Field label="PFMS Vendor ID" value={r.vendorData.pfmsVendorId} />
                </div>
              </div>
              <AddressSection address={r.vendorData.address} />
              <BankSection bank={r.vendorData.bank} />
              <GSTSection gst={r.vendorData.gst} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ── Sub-sections ──────────────────────────────────────────────────────────────

function AddressSection({ address }: { address: import('./types').AddressContact }) {
  return (
    <div className={styles.drawerSection}>
      <h3 className={styles.drawerSectionTitle}>Address &amp; Contact</h3>
      <div className={styles.fieldGrid}>
        <Field label="Address Line 1" value={address.addressLine1} />
        {address.addressLine2 && <Field label="Address Line 2" value={address.addressLine2} />}
        <Field label="District" value={address.district} />
        <Field label="Taluk / City" value={address.talukCity} />
        <Field label="State" value={address.state} />
        <Field label="Pin Code" value={address.pinCode} />
        <Field label="Contact Person" value={address.contactPersonName} />
        <Field label="Mobile" value={address.mobile} />
        <Field label="Email" value={address.email} />
      </div>
    </div>
  );
}

function BankSection({ bank }: { bank: import('./types').BankInfo }) {
  return (
    <div className={styles.drawerSection}>
      <h3 className={styles.drawerSectionTitle}>Bank Details</h3>
      <div className={styles.fieldGrid}>
        <Field label="Account Number" value={maskAccount(bank.accountNumber)} />
        <Field label="IFSC Code" value={bank.ifscCode} />
        <Field label="Bank Name" value={bank.bankName} />
        <Field label="Branch" value={bank.branchName} />
        <Field label="MICR" value={bank.micr} />
      </div>
    </div>
  );
}

function GSTSection({ gst }: { gst: import('./types').GSTInfo }) {
  return (
    <div className={styles.drawerSection}>
      <h3 className={styles.drawerSectionTitle}>GST Details</h3>
      <div className={styles.fieldGrid}>
        <Field label="GST Registered" value={gst.gstRegistered} />
        {gst.gstRegistered === 'Yes' && (
          <>
            <Field label="GSTIN" value={gst.gstin} />
            <Field label="Legal Name" value={gst.legalName} />
            <Field label="Trade Name" value={gst.tradeName} />
            <div className={styles.field}>
              <span className={styles.fieldLabel}>GST Status</span>
              <Badge
                variant={gst.gstStatus === 'Active' ? 'success' : 'neutral'}
                size="sm"
              >
                {gst.gstStatus || '—'}
              </Badge>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VendorDetailDrawer;
