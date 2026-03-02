import React, { useState, useEffect } from 'react';
import type { BankAccount, FormErrors } from './types';
import {
  BANKS,
  BRANCHES,
  DISTRICTS,
  TALUKS,
  FUNDS,
  PURPOSES,
  INTEGRATIONS,
  ACCOUNT_TYPES,
} from './masterData';
import formStyles from './ModalForm.module.css';
import styles from './AddBankDetails.module.css';

interface FormState {
  bankId: string;
  branchId: string;
  ifsc: string;
  micr: string;
  shortName: string;
  addressLine1: string;
  addressLine2: string;
  districtId: string;
  talukId: string;
  pinCode: string;
  contactNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
  accountType: string;
  purposeId: string;
  fundId: string;
  integrations: string[];
  description: string;
  status: 'Active' | 'Inactive';
}

const EMPTY: FormState = {
  bankId: '',
  branchId: '',
  ifsc: '',
  micr: '',
  shortName: '',
  addressLine1: '',
  addressLine2: '',
  districtId: '',
  talukId: '',
  pinCode: '',
  contactNumber: '',
  accountNumber: '',
  confirmAccountNumber: '',
  accountType: '',
  purposeId: '',
  fundId: '',
  integrations: [],
  description: '',
  status: 'Active',
};

function validate(form: FormState): FormErrors {
  const e: FormErrors = {};

  if (!form.bankId) e.bankId = 'Please select a bank';
  if (!form.branchId) e.branchId = 'Please select a branch';

  const sn = form.shortName.trim();
  if (!sn) {
    e.shortName = 'Short name is required';
  } else if (sn.length > 50) {
    e.shortName = 'Maximum 50 characters allowed';
  } else if (!/^[a-zA-Z0-9\s]+$/.test(sn)) {
    e.shortName = 'Only alphanumeric characters and spaces are allowed';
  }

  const a1 = form.addressLine1.trim();
  if (!a1) {
    e.addressLine1 = 'Address Line 1 is required';
  } else if (a1.length > 100) {
    e.addressLine1 = 'Maximum 100 characters allowed';
  }

  if (form.addressLine2.trim().length > 100) {
    e.addressLine2 = 'Maximum 100 characters allowed';
  }

  if (!form.districtId) e.districtId = 'Please select a district';
  if (!form.talukId) e.talukId = 'Please select a taluk';

  if (!form.pinCode.trim()) {
    e.pinCode = 'Pin code is required';
  } else if (!/^\d{6}$/.test(form.pinCode.trim())) {
    e.pinCode = 'Pin code must be exactly 6 numeric digits';
  }

  if (!form.contactNumber.trim()) {
    e.contactNumber = 'Contact number is required';
  } else if (!/^\d{10}$/.test(form.contactNumber.trim())) {
    e.contactNumber = 'Contact number must be exactly 10 numeric digits';
  }

  const accNum = form.accountNumber.trim();
  if (!accNum) {
    e.accountNumber = 'Account number is required';
  } else if (!/^\d{9,18}$/.test(accNum)) {
    e.accountNumber = 'Account number must be 9–18 numeric digits';
  }

  if (!form.confirmAccountNumber.trim()) {
    e.confirmAccountNumber = 'Please confirm the account number';
  } else if (form.confirmAccountNumber !== form.accountNumber) {
    e.confirmAccountNumber = 'Account numbers do not match';
  }

  if (!form.accountType) e.accountType = 'Please select an account type';
  if (!form.purposeId) e.purposeId = 'Please select a purpose';
  if (!form.fundId) e.fundId = 'Please select a fund';

  if (form.description.trim().length > 200) {
    e.description = 'Maximum 200 characters allowed';
  }

  return e;
}

export type SavePayload = Omit<BankAccount, 'id' | 'chequeLeaves'>;

interface Props {
  account: BankAccount | null; // null = add mode
  onSave: (data: SavePayload) => void;
  onClose: () => void;
}

const BankDetailsModal: React.FC<Props> = ({ account, onSave, onClose }) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});

  /* ---------- populate on edit ---------- */
  useEffect(() => {
    if (account) {
      setForm({
        bankId: account.bankId,
        branchId: account.branchId,
        ifsc: account.ifsc,
        micr: account.micr,
        shortName: account.shortName,
        addressLine1: account.addressLine1,
        addressLine2: account.addressLine2,
        districtId: account.districtId,
        talukId: account.talukId,
        pinCode: account.pinCode,
        contactNumber: account.contactNumber,
        accountNumber: account.accountNumber,
        confirmAccountNumber: account.accountNumber, // pre-filled but masked
        accountType: account.accountType,
        purposeId: account.purposeId,
        fundId: account.fundId,
        integrations: [...account.integrations],
        description: account.description,
        status: account.status,
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [account]);

  /* ---------- derived master lists ---------- */
  const filteredBranches = BRANCHES.filter((b) => b.bankId === form.bankId);
  const filteredTaluks = TALUKS.filter((t) => t.districtId === form.districtId);

  /* ---------- handlers ---------- */
  const clearError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'bankId') {
      setForm((prev) => ({ ...prev, bankId: value, branchId: '', ifsc: '', micr: '' }));
      setErrors((prev) => ({ ...prev, bankId: undefined, branchId: undefined }));
      return;
    }

    if (name === 'branchId') {
      const branch = BRANCHES.find((b) => b.id === value);
      setForm((prev) => ({
        ...prev,
        branchId: value,
        ifsc: branch?.ifsc ?? '',
        micr: branch?.micr ?? '',
      }));
      clearError('branchId');
      return;
    }

    if (name === 'districtId') {
      setForm((prev) => ({ ...prev, districtId: value, talukId: '' }));
      setErrors((prev) => ({ ...prev, districtId: undefined, talukId: undefined }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name as keyof FormErrors);
  };

  const toggleIntegration = (item: string) => {
    setForm((prev) => ({
      ...prev,
      integrations: prev.integrations.includes(item)
        ? prev.integrations.filter((i) => i !== item)
        : [...prev.integrations, item],
    }));
  };

  const handleSubmit = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const bank = BANKS.find((b) => b.id === form.bankId);
    const branch = BRANCHES.find((b) => b.id === form.branchId);
    const district = DISTRICTS.find((d) => d.id === form.districtId);
    const taluk = TALUKS.find((t) => t.id === form.talukId);
    const purpose = PURPOSES.find((p) => p.id === form.purposeId);
    const fund = FUNDS.find((f) => f.id === form.fundId);

    onSave({
      bankId: form.bankId,
      bankName: bank?.name ?? '',
      branchId: form.branchId,
      branchName: branch?.name ?? '',
      ifsc: form.ifsc,
      micr: form.micr,
      shortName: form.shortName.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      districtId: form.districtId,
      districtName: district?.name ?? '',
      talukId: form.talukId,
      talukName: taluk?.name ?? '',
      pinCode: form.pinCode.trim(),
      contactNumber: form.contactNumber.trim(),
      accountNumber: form.accountNumber.trim(),
      accountType: form.accountType as BankAccount['accountType'],
      purposeId: form.purposeId,
      purposeName: purpose?.name ?? '',
      fundId: form.fundId,
      fundName: fund?.name ?? '',
      integrations: form.integrations,
      description: form.description.trim(),
      status: form.status,
    });
  };

  const isEdit = !!account;
  const err = (f: keyof FormErrors) => errors[f];

  /* ---------- render ---------- */
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? 'Edit Bank Details' : 'Add Bank Details'}
          </h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className={styles.formBody}>

          {/* ─── Section 1: Bank & Branch ─── */}
          <div className={formStyles.section}>
            <h3 className={formStyles.sectionTitle}>Bank &amp; Branch Details</h3>
            <div className={formStyles.fields}>

              <div className={formStyles.row}>
                {/* Bank */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>
                    <span className={formStyles.required}>Bank</span>
                  </label>
                  <select
                    name="bankId"
                    className={`${formStyles.select} ${err('bankId') ? formStyles.inputError : ''}`}
                    value={form.bankId}
                    onChange={handleChange}
                  >
                    <option value="">— Select bank —</option>
                    {BANKS.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {err('bankId') && <span className={formStyles.errorText}>{err('bankId')}</span>}
                </div>

                {/* Branch */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>
                    <span className={formStyles.required}>Branch</span>
                  </label>
                  <select
                    name="branchId"
                    className={`${formStyles.select} ${err('branchId') ? formStyles.inputError : ''}`}
                    value={form.branchId}
                    onChange={handleChange}
                    disabled={!form.bankId}
                  >
                    <option value="">— Select branch —</option>
                    {filteredBranches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {err('branchId') && <span className={formStyles.errorText}>{err('branchId')}</span>}
                </div>
              </div>

              <div className={formStyles.row}>
                {/* IFSC auto */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>IFSC Code</label>
                  <input
                    className={formStyles.readonlyInput}
                    value={form.ifsc}
                    readOnly
                    placeholder="Auto-populated on branch selection"
                  />
                  <span className={formStyles.hint}>Auto-populated from bank master</span>
                </div>

                {/* MICR auto */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>MICR Code</label>
                  <input
                    className={formStyles.readonlyInput}
                    value={form.micr}
                    readOnly
                    placeholder="Auto-populated on branch selection"
                  />
                  <span className={formStyles.hint}>Auto-populated from bank master</span>
                </div>
              </div>

            </div>
          </div>

          {/* ─── Section 2: Address ─── */}
          <div className={formStyles.section}>
            <h3 className={formStyles.sectionTitle}>Address Details</h3>
            <div className={formStyles.fields}>

              {/* Short Name */}
              <div className={formStyles.field}>
                <label className={formStyles.label}>
                  <span className={formStyles.required}>Short Name</span>
                </label>
                <input
                  name="shortName"
                  className={`${formStyles.input} ${err('shortName') ? formStyles.inputError : ''}`}
                  value={form.shortName}
                  onChange={handleChange}
                  placeholder="e.g. SBI BLG MAIN"
                  maxLength={50}
                />
                {err('shortName') && <span className={formStyles.errorText}>{err('shortName')}</span>}
                <span className={formStyles.hint}>{form.shortName.length}/50 — alphanumeric &amp; spaces only</span>
              </div>

              {/* Address Line 1 */}
              <div className={formStyles.field}>
                <label className={formStyles.label}>
                  <span className={formStyles.required}>Address Line 1</span>
                </label>
                <input
                  name="addressLine1"
                  className={`${formStyles.input} ${err('addressLine1') ? formStyles.inputError : ''}`}
                  value={form.addressLine1}
                  onChange={handleChange}
                  placeholder="Door no., street, locality"
                  maxLength={100}
                />
                {err('addressLine1') && <span className={formStyles.errorText}>{err('addressLine1')}</span>}
              </div>

              {/* Address Line 2 */}
              <div className={formStyles.field}>
                <label className={formStyles.label}>Address Line 2</label>
                <input
                  name="addressLine2"
                  className={`${formStyles.input} ${err('addressLine2') ? formStyles.inputError : ''}`}
                  value={form.addressLine2}
                  onChange={handleChange}
                  placeholder="Landmark, area (optional)"
                  maxLength={100}
                />
                {err('addressLine2') && <span className={formStyles.errorText}>{err('addressLine2')}</span>}
              </div>

              <div className={formStyles.row}>
                {/* District */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>
                    <span className={formStyles.required}>District</span>
                  </label>
                  <select
                    name="districtId"
                    className={`${formStyles.select} ${err('districtId') ? formStyles.inputError : ''}`}
                    value={form.districtId}
                    onChange={handleChange}
                  >
                    <option value="">— Select district —</option>
                    {DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {err('districtId') && <span className={formStyles.errorText}>{err('districtId')}</span>}
                </div>

                {/* Taluk — filtered by district */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>
                    <span className={formStyles.required}>Taluk</span>
                  </label>
                  <select
                    name="talukId"
                    className={`${formStyles.select} ${err('talukId') ? formStyles.inputError : ''}`}
                    value={form.talukId}
                    onChange={handleChange}
                    disabled={!form.districtId}
                  >
                    <option value="">— Select taluk —</option>
                    {filteredTaluks.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {err('talukId') && <span className={formStyles.errorText}>{err('talukId')}</span>}
                </div>
              </div>

              <div className={formStyles.row}>
                {/* Pin Code */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>
                    <span className={formStyles.required}>Pin Code</span>
                  </label>
                  <input
                    name="pinCode"
                    className={`${formStyles.input} ${err('pinCode') ? formStyles.inputError : ''}`}
                    value={form.pinCode}
                    onChange={handleChange}
                    placeholder="6-digit pin code"
                    maxLength={6}
                  />
                  {err('pinCode') && <span className={formStyles.errorText}>{err('pinCode')}</span>}
                </div>

                {/* Contact Number */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>
                    <span className={formStyles.required}>Contact Number</span>
                  </label>
                  <input
                    name="contactNumber"
                    className={`${formStyles.input} ${err('contactNumber') ? formStyles.inputError : ''}`}
                    value={form.contactNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                  {err('contactNumber') && <span className={formStyles.errorText}>{err('contactNumber')}</span>}
                </div>
              </div>

            </div>
          </div>

          {/* ─── Section 3: Account Details ─── */}
          <div className={formStyles.section}>
            <h3 className={formStyles.sectionTitle}>Account Details</h3>
            <div className={formStyles.fields}>

              {/* Account Number */}
              <div className={formStyles.field}>
                <label className={formStyles.label}>
                  <span className={formStyles.required}>Account Number</span>
                </label>
                <input
                  name="accountNumber"
                  className={`${formStyles.input} ${err('accountNumber') ? formStyles.inputError : ''}`}
                  value={form.accountNumber}
                  onChange={handleChange}
                  placeholder="9–18 numeric digits"
                  maxLength={18}
                  autoComplete="off"
                />
                {err('accountNumber') && <span className={formStyles.errorText}>{err('accountNumber')}</span>}
              </div>

              {/* Confirm Account Number — masked */}
              <div className={formStyles.field}>
                <label className={formStyles.label}>
                  <span className={formStyles.required}>Confirm Account Number</span>
                </label>
                <input
                  type="password"
                  name="confirmAccountNumber"
                  className={`${formStyles.input} ${err('confirmAccountNumber') ? formStyles.inputError : ''}`}
                  value={form.confirmAccountNumber}
                  onChange={handleChange}
                  placeholder="Re-enter account number (masked)"
                  maxLength={18}
                  autoComplete="new-password"
                />
                {err('confirmAccountNumber') && (
                  <span className={formStyles.errorText}>{err('confirmAccountNumber')}</span>
                )}
              </div>

              <div className={formStyles.row}>
                {/* Account Type */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>
                    <span className={formStyles.required}>Bank Account Type</span>
                  </label>
                  <select
                    name="accountType"
                    className={`${formStyles.select} ${err('accountType') ? formStyles.inputError : ''}`}
                    value={form.accountType}
                    onChange={handleChange}
                  >
                    <option value="">— Select type —</option>
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {err('accountType') && <span className={formStyles.errorText}>{err('accountType')}</span>}
                </div>

                {/* Purpose */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>
                    <span className={formStyles.required}>Purpose / Use</span>
                  </label>
                  <select
                    name="purposeId"
                    className={`${formStyles.select} ${err('purposeId') ? formStyles.inputError : ''}`}
                    value={form.purposeId}
                    onChange={handleChange}
                  >
                    <option value="">— Select purpose —</option>
                    {PURPOSES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {err('purposeId') && <span className={formStyles.errorText}>{err('purposeId')}</span>}
                </div>
              </div>

              <div className={formStyles.row}>
                {/* Fund */}
                <div className={formStyles.field}>
                  <label className={formStyles.label}>
                    <span className={formStyles.required}>Fund</span>
                  </label>
                  <select
                    name="fundId"
                    className={`${formStyles.select} ${err('fundId') ? formStyles.inputError : ''}`}
                    value={form.fundId}
                    onChange={handleChange}
                  >
                    <option value="">— Select fund —</option>
                    {FUNDS.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  {err('fundId') && <span className={formStyles.errorText}>{err('fundId')}</span>}
                </div>
              </div>

              {/* Integrations multi-select */}
              <div className={formStyles.field}>
                <label className={formStyles.label}>Integrations</label>
                <div className={formStyles.checkboxGroup}>
                  {INTEGRATIONS.map((intg) => (
                    <label key={intg} className={formStyles.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={form.integrations.includes(intg)}
                        onChange={() => toggleIntegration(intg)}
                      />
                      {intg}
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className={formStyles.field}>
                <label className={formStyles.label}>Description</label>
                <textarea
                  name="description"
                  className={`${formStyles.textarea} ${err('description') ? formStyles.inputError : ''}`}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional description (max 200 characters)"
                  maxLength={200}
                  rows={3}
                />
                {err('description') && <span className={formStyles.errorText}>{err('description')}</span>}
                <span className={formStyles.hint}>{form.description.length}/200 characters</span>
              </div>

              {/* Status */}
              <div className={formStyles.field}>
                <label className={formStyles.label}>Status</label>
                <div className={formStyles.radioGroup}>
                  <label className={formStyles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      className={formStyles.radioInput}
                      checked={form.status === 'Active'}
                      onChange={handleChange}
                    />
                    Active
                  </label>
                  <label className={formStyles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      className={formStyles.radioInput}
                      checked={form.status === 'Inactive'}
                      onChange={handleChange}
                    />
                    Inactive
                  </label>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className={formStyles.actions}>
          <button className={formStyles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={formStyles.submitBtn} onClick={handleSubmit}>
            {isEdit ? 'Update' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BankDetailsModal;
