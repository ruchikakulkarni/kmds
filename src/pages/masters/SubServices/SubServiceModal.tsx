import React, { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import styles from './ModalForm.module.css';
import type { SubService, SubServiceStatus } from './types';
import {
  SERVICE_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
  COMPOSITE_OPTIONS,
  FUND_OPTIONS,
} from './data';

interface SubServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SubService, 'id' | 'mappedBankAccountId' | 'mappedBankAccountLabel'>) => void;
  initialData?: SubService | null;
}

type FormState = Omit<SubService, 'id' | 'mappedBankAccountId' | 'mappedBankAccountLabel'>;

const EMPTY: FormState = {
  subServiceCode: '',
  nameEnglish: '',
  nameKannada: '',
  serviceId: 0,
  serviceName: '',
  serviceCode: '',
  accountTypeId: 0,
  accountTypeName: '',
  compositeCode: '',
  compositeDescription: '',
  fundId: '',
  fundName: '',
  status: 'Active',
};

const ChevronIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.selectChevron}>
    <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SubServiceModal: React.FC<SubServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  /* Reset form on open */
  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              subServiceCode:       initialData.subServiceCode,
              nameEnglish:          initialData.nameEnglish,
              nameKannada:          initialData.nameKannada,
              serviceId:            initialData.serviceId,
              serviceName:          initialData.serviceName,
              serviceCode:          initialData.serviceCode,
              accountTypeId:        initialData.accountTypeId,
              accountTypeName:      initialData.accountTypeName,
              compositeCode:        initialData.compositeCode,
              compositeDescription: initialData.compositeDescription,
              fundId:               initialData.fundId,
              fundName:             initialData.fundName,
              status:               initialData.status,
            }
          : EMPTY,
      );
      setErrors({});
    }
  }, [isOpen, initialData]);

  /* Composite options filtered by selected account type */
  const filteredComposites = COMPOSITE_OPTIONS.filter(
    (c) => c.accountTypeId === form.accountTypeId,
  );

  /* Handlers */
  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const svc = SERVICE_OPTIONS.find((s) => s.id === id);
    setForm((prev) => ({
      ...prev,
      serviceId:   svc ? svc.id   : 0,
      serviceName: svc ? svc.name : '',
      serviceCode: svc ? svc.code : '',
    }));
    setErrors((prev) => ({ ...prev, serviceId: '' }));
  };

  const handleAccountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const at = ACCOUNT_TYPE_OPTIONS.find((a) => a.id === id);
    /* Reset composite when account type changes */
    setForm((prev) => ({
      ...prev,
      accountTypeId:        at ? at.id   : 0,
      accountTypeName:      at ? at.name : '',
      compositeCode:        '',
      compositeDescription: '',
    }));
    setErrors((prev) => ({ ...prev, accountTypeId: '', compositeCode: '' }));
  };

  const handleCompositeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const opt = COMPOSITE_OPTIONS.find((c) => c.code === code);
    setForm((prev) => ({
      ...prev,
      compositeCode:        opt ? opt.code        : '',
      compositeDescription: opt ? opt.description : '',
    }));
    setErrors((prev) => ({ ...prev, compositeCode: '' }));
  };

  const handleFundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const fund = FUND_OPTIONS.find((f) => f.id === id);
    setForm((prev) => ({
      ...prev,
      fundId:   fund ? fund.id   : '',
      fundName: fund ? fund.name : '',
    }));
    setErrors((prev) => ({ ...prev, fundId: '' }));
  };

  const handleStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, status: e.target.value as SubServiceStatus }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.nameEnglish.trim())   errs.nameEnglish   = 'Sub-Service Name (English) is required';
    if (!form.nameKannada.trim())   errs.nameKannada   = 'Sub-Service Name (Kannada) is required';
    if (!form.subServiceCode.trim()) errs.subServiceCode = 'Sub-Service Code is required';
    if (!form.serviceId)            errs.serviceId     = 'Service Name is required';
    if (!form.accountTypeId)        errs.accountTypeId = 'Account Type is required';
    if (!form.compositeCode)        errs.compositeCode = 'Composite Account Code is required';
    if (!form.fundId)               errs.fundId        = 'Fund Name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Sub-Service' : 'Add New Sub-Service'}
      size="lg"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="sub-service-form" className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isEdit ? 'Update Sub-Service' : 'Save Sub-Service'}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span>{' '}
        to {isEdit ? 'update the' : 'create a new'} sub-service record.
      </p>

      <form id="sub-service-form" onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>

          {/* Row 1: Name English | Name Kannada */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ssv-nameEn">
                Sub-Service Name (English)<span className={styles.required}>*</span>
              </label>
              <input
                id="ssv-nameEn"
                name="nameEnglish"
                type="text"
                className={`${styles.input} ${errors.nameEnglish ? styles.inputError : ''}`}
                placeholder="Enter name in English"
                value={form.nameEnglish}
                onChange={handleText}
              />
              {errors.nameEnglish && <span className={styles.errorMsg}>{errors.nameEnglish}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ssv-nameKn">
                Sub-Service Name (Kannada)<span className={styles.required}>*</span>{' '}
                <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
              </label>
              <input
                id="ssv-nameKn"
                name="nameKannada"
                type="text"
                className={`${styles.input} ${errors.nameKannada ? styles.inputError : ''}`}
                placeholder="ಸೇವೆಯ ಹೆಸರು ಕನ್ನಡದಲ್ಲಿ"
                value={form.nameKannada}
                onChange={handleText}
              />
              {errors.nameKannada && <span className={styles.errorMsg}>{errors.nameKannada}</span>}
            </div>
          </div>

          {/* Row 2: Sub-Service Code | Service Name */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ssv-code">
                Sub-Service Code<span className={styles.required}>*</span>
              </label>
              <input
                id="ssv-code"
                name="subServiceCode"
                type="text"
                className={`${styles.input} ${errors.subServiceCode ? styles.inputError : ''}`}
                placeholder="e.g. SSV-001"
                value={form.subServiceCode}
                onChange={handleText}
              />
              {errors.subServiceCode && <span className={styles.errorMsg}>{errors.subServiceCode}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ssv-service">
                Service Name<span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="ssv-service"
                  className={`${styles.select} ${errors.serviceId ? styles.selectError : ''}`}
                  value={form.serviceId || ''}
                  onChange={handleServiceChange}
                >
                  <option value="">-- Select Service --</option>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
              {errors.serviceId && <span className={styles.errorMsg}>{errors.serviceId}</span>}
            </div>
          </div>

          {/* Row 3: Service Code (autofetch) | Account Type */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Service Code</label>
              <div className={styles.inputReadonly}>
                {form.serviceCode || <span style={{ color: 'var(--color-text-muted)' }}>Auto-filled on service selection</span>}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ssv-accountType">
                Account Type<span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="ssv-accountType"
                  className={`${styles.select} ${errors.accountTypeId ? styles.selectError : ''}`}
                  value={form.accountTypeId || ''}
                  onChange={handleAccountTypeChange}
                >
                  <option value="">-- Select Account Type --</option>
                  {ACCOUNT_TYPE_OPTIONS.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
              {errors.accountTypeId && <span className={styles.errorMsg}>{errors.accountTypeId}</span>}
            </div>
          </div>

          {/* Row 4: Composite Account Code | Composite Description (autofetch) */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ssv-composite">
                Composite Account Code<span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="ssv-composite"
                  className={`${styles.select} ${errors.compositeCode ? styles.selectError : ''}`}
                  value={form.compositeCode}
                  onChange={handleCompositeChange}
                  disabled={!form.accountTypeId}
                >
                  <option value="">
                    {form.accountTypeId ? '-- Select Code --' : 'Select Account Type first'}
                  </option>
                  {filteredComposites.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
              {errors.compositeCode && <span className={styles.errorMsg}>{errors.compositeCode}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Composite Description</label>
              <div className={styles.inputReadonly}>
                {form.compositeDescription || <span style={{ color: 'var(--color-text-muted)' }}>Auto-filled on code selection</span>}
              </div>
            </div>
          </div>

          {/* Row 5: Fund Name | Status */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ssv-fund">
                Fund Name<span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="ssv-fund"
                  className={`${styles.select} ${errors.fundId ? styles.selectError : ''}`}
                  value={form.fundId}
                  onChange={handleFundChange}
                >
                  <option value="">-- Select Fund --</option>
                  {FUND_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
              {errors.fundId && <span className={styles.errorMsg}>{errors.fundId}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <div className={styles.radioGroup}>
                {(['Active', 'Inactive'] as SubServiceStatus[]).map((s) => (
                  <label key={s} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={form.status === s}
                      onChange={handleStatus}
                      className={styles.radioInput}
                    />
                    <span className={`${styles.radioCustom} ${form.status === s ? styles.radioChecked : ''}`} />
                    <span className={styles.radioText}>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

        </div>
      </form>
    </Modal>
  );
};

export default SubServiceModal;
