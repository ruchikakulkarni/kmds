import React, { useState } from 'react';
import type { BankAccount, ChequeRange, ChequeFormErrors } from './types';
import formStyles from './ModalForm.module.css';
import styles from './AddBankDetails.module.css';

interface ChequeForm {
  issuedDate: string;
  from: string;
  to: string;
}

const EMPTY: ChequeForm = { issuedDate: '', from: '', to: '' };

function maskAccount(num: string): string {
  if (num.length <= 4) return 'X'.repeat(num.length);
  return 'X'.repeat(num.length - 4) + num.slice(-4);
}

function validateCheque(form: ChequeForm): ChequeFormErrors {
  const errors: ChequeFormErrors = {};

  if (!form.issuedDate.trim()) {
    errors.issuedDate = 'Issued date is required';
  } else if (!/^\d{2}-\d{2}-\d{4}$/.test(form.issuedDate.trim())) {
    errors.issuedDate = 'Date must be in DD-MM-YYYY format';
  }

  const fromNum = parseInt(form.from, 10);
  if (!form.from.trim()) {
    errors.from = 'From is required';
  } else if (!/^\d+$/.test(form.from.trim()) || fromNum <= 0) {
    errors.from = 'Must be a positive whole number';
  }

  const toNum = parseInt(form.to, 10);
  if (!form.to.trim()) {
    errors.to = 'To is required';
  } else if (!/^\d+$/.test(form.to.trim()) || toNum <= 0) {
    errors.to = 'Must be a positive whole number';
  } else if (!errors.from && toNum <= fromNum) {
    errors.to = '"To" must be greater than "From"';
  }

  return errors;
}

interface Props {
  account: BankAccount;
  onAddRange: (accountId: string, range: ChequeRange) => void;
  onToggleExhausted: (accountId: string, rangeId: string) => void;
  onClose: () => void;
}

const ChequeLeafModal: React.FC<Props> = ({
  account,
  onAddRange,
  onToggleExhausted,
  onClose,
}) => {
  const [form, setForm] = useState<ChequeForm>(EMPTY);
  const [errors, setErrors] = useState<ChequeFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAdd = () => {
    const errs = validateCheque(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const range: ChequeRange = {
      id: Date.now().toString(),
      issuedDate: form.issuedDate.trim(),
      from: parseInt(form.from, 10),
      to: parseInt(form.to, 10),
      exhausted: false,
    };
    onAddRange(account.id, range);
    setForm(EMPTY);
    setErrors({});
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.chequeModal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Cheque Leaf</h2>
            <p className={styles.modalSubtitle}>
              A/c: {maskAccount(account.accountNumber)} &mdash; {account.bankName},{' '}
              {account.branchName}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.chequeBody}>
          {/* Add range form */}
          <div className={styles.chequeForm}>
            <p className={styles.chequeFormTitle}>Add Cheque Range</p>
            <div className={styles.chequeRow}>
              <div className={formStyles.field}>
                <label className={formStyles.label}>
                  <span className={formStyles.required}>Issued Date</span>
                </label>
                <input
                  name="issuedDate"
                  className={`${formStyles.input} ${errors.issuedDate ? formStyles.inputError : ''}`}
                  value={form.issuedDate}
                  onChange={handleChange}
                  placeholder="DD-MM-YYYY"
                />
                {errors.issuedDate && (
                  <span className={formStyles.errorText}>{errors.issuedDate}</span>
                )}
              </div>

              <div className={formStyles.field}>
                <label className={formStyles.label}>
                  <span className={formStyles.required}>From</span>
                </label>
                <input
                  name="from"
                  className={`${formStyles.input} ${errors.from ? formStyles.inputError : ''}`}
                  value={form.from}
                  onChange={handleChange}
                  placeholder="e.g. 1001"
                />
                {errors.from && (
                  <span className={formStyles.errorText}>{errors.from}</span>
                )}
              </div>

              <div className={formStyles.field}>
                <label className={formStyles.label}>
                  <span className={formStyles.required}>To</span>
                </label>
                <input
                  name="to"
                  className={`${formStyles.input} ${errors.to ? formStyles.inputError : ''}`}
                  value={form.to}
                  onChange={handleChange}
                  placeholder="e.g. 1100"
                />
                {errors.to && (
                  <span className={formStyles.errorText}>{errors.to}</span>
                )}
              </div>

              <div className={styles.chequeAddBtnWrap}>
                <button className={formStyles.addBtn} onClick={handleAdd}>
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Cheque ranges grid */}
          <div className={styles.chequeTableWrap}>
            <table className={styles.chequeTable}>
              <thead>
                <tr>
                  <th className={styles.chequeTh} style={{ width: 40, textAlign: 'center' }}>Sl.</th>
                  <th className={styles.chequeTh}>Issued Date</th>
                  <th className={styles.chequeTh}>From</th>
                  <th className={styles.chequeTh}>To</th>
                  <th className={styles.chequeTh}>Cheques</th>
                  <th className={styles.chequeTh}>Exhausted</th>
                </tr>
              </thead>
              <tbody>
                {account.chequeLeaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={styles.chequeTd}
                      style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}
                    >
                      No cheque ranges added yet.
                    </td>
                  </tr>
                ) : (
                  account.chequeLeaves.map((range, idx) => (
                    <tr key={range.id}>
                      <td className={styles.chequeTd} style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td className={styles.chequeTd}>{range.issuedDate}</td>
                      <td className={styles.chequeTd}>{range.from}</td>
                      <td className={styles.chequeTd}>{range.to}</td>
                      <td className={styles.chequeTd}>{range.to - range.from + 1}</td>
                      <td className={styles.chequeTd}>
                        <input
                          type="checkbox"
                          className={styles.exhaustedCheck}
                          checked={range.exhausted}
                          onChange={() => onToggleExhausted(account.id, range.id)}
                          title="Mark as exhausted"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className={formStyles.actions}>
          <button className={formStyles.cancelBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ChequeLeafModal;
