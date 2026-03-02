import React from 'react';
import type { BankAccount } from './types';
import formStyles from './ModalForm.module.css';
import styles from './AddBankDetails.module.css';

interface Props {
  account: BankAccount;
  onClose: () => void;
}

const AddressViewModal: React.FC<Props> = ({ account, onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.viewModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Address &amp; Contact</h2>
            <p className={styles.modalSubtitle}>{account.bankName} — {account.branchName}</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.viewBody}>
          <div className={formStyles.fields}>
            <div className={formStyles.row}>
              <div className={formStyles.field}>
                <span className={formStyles.label}>Short Name</span>
                <span className={styles.viewValue}>{account.shortName}</span>
              </div>
              <div className={formStyles.field}>
                <span className={formStyles.label}>Contact Number</span>
                <span className={styles.viewValue}>{account.contactNumber}</span>
              </div>
            </div>

            <div className={formStyles.field}>
              <span className={formStyles.label}>Address Line 1</span>
              <span className={styles.viewValue}>{account.addressLine1}</span>
            </div>

            {account.addressLine2 && (
              <div className={formStyles.field}>
                <span className={formStyles.label}>Address Line 2</span>
                <span className={styles.viewValue}>{account.addressLine2}</span>
              </div>
            )}

            <div className={formStyles.row}>
              <div className={formStyles.field}>
                <span className={formStyles.label}>District</span>
                <span className={styles.viewValue}>{account.districtName}</span>
              </div>
              <div className={formStyles.field}>
                <span className={formStyles.label}>Taluk</span>
                <span className={styles.viewValue}>{account.talukName}</span>
              </div>
            </div>

            <div className={formStyles.field}>
              <span className={formStyles.label}>Pin Code</span>
              <span className={styles.viewValue}>{account.pinCode}</span>
            </div>
          </div>
        </div>

        <div className={formStyles.actions}>
          <button className={formStyles.cancelBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AddressViewModal;
