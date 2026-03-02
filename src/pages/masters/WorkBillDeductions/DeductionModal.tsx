import React, { useState, useEffect } from 'react';
import type { Deduction, DeductionFormData } from './types';
import { PAYEE_TYPES, ENTITY_TYPES, DEDUCTION_TYPES } from './types';
import pageStyles from './WorkBillDeductions.module.css';
import fm from '../AddBankDetails/ModalForm.module.css';

interface Props {
  deduction: Deduction | null;
  onSave: (data: DeductionFormData) => void;
  onClose: () => void;
}

const EMPTY: DeductionFormData = {
  payeeType: '',
  entityType: '',
  deductionType: '',
  deductionPct: 0,
  remarks: '',
  status: 'Active',
};

type Errors = Partial<Record<keyof DeductionFormData, string>>;

const DeductionModal: React.FC<Props> = ({ deduction, onSave, onClose }) => {
  const [form, setForm] = useState<DeductionFormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (deduction) {
      const { id, ...rest } = deduction;
      setForm(rest);
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [deduction]);

  const set = <K extends keyof DeductionFormData>(key: K, value: DeductionFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.payeeType) e.payeeType = 'Payee type is required.';
    if (!form.entityType) e.entityType = 'Entity type is required.';
    if (!form.deductionType) e.deductionType = 'Deduction type is required.';
    if (form.deductionPct < 0 || form.deductionPct > 100)
      e.deductionPct = 'Percentage must be between 0 and 100.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form);
  };

  const isEdit = !!deduction;

  return (
    <div className={pageStyles.overlay} onClick={onClose}>
      <div
        className={pageStyles.formModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit Deduction' : 'Add Deduction'}
      >
        {/* Header */}
        <div className={pageStyles.modalHeader}>
          <div>
            <h2 className={pageStyles.modalTitle}>
              {isEdit ? 'Edit Deduction' : 'Add Deduction'}
            </h2>
            <p className={pageStyles.modalSubtitle}>
              {isEdit
                ? 'Update deduction master record'
                : 'Define a new bill deduction rule. The % can be overridden per payment.'}
            </p>
          </div>
          <button className={pageStyles.modalClose} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={pageStyles.formBody}>
          {/* Row 1 – Payee Type & Entity Type */}
          <div className={fm.row}>
            <div className={fm.field}>
              <label className={`${fm.label} ${fm.required}`}>Payee Type</label>
              <select
                className={`${fm.select} ${errors.payeeType ? fm.inputError : ''}`}
                value={form.payeeType}
                onChange={(e) => set('payeeType', e.target.value)}
              >
                <option value="">Select payee type</option>
                {PAYEE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
              {errors.payeeType && <span className={fm.errorText}>{errors.payeeType}</span>}
            </div>

            <div className={fm.field}>
              <label className={`${fm.label} ${fm.required}`}>Entity Type</label>
              <select
                className={`${fm.select} ${errors.entityType ? fm.inputError : ''}`}
                value={form.entityType}
                onChange={(e) => set('entityType', e.target.value)}
              >
                <option value="">Select entity type</option>
                {ENTITY_TYPES.map((et) => (
                  <option key={et} value={et}>{et}</option>
                ))}
              </select>
              {errors.entityType && <span className={fm.errorText}>{errors.entityType}</span>}
            </div>
          </div>

          {/* Row 2 – Deduction Type & Deduction % */}
          <div className={fm.row}>
            <div className={fm.field}>
              <label className={`${fm.label} ${fm.required}`}>Deduction Type</label>
              <select
                className={`${fm.select} ${errors.deductionType ? fm.inputError : ''}`}
                value={form.deductionType}
                onChange={(e) => set('deductionType', e.target.value)}
              >
                <option value="">Select deduction type</option>
                {DEDUCTION_TYPES.map((dt) => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
              {errors.deductionType && <span className={fm.errorText}>{errors.deductionType}</span>}
            </div>

            <div className={fm.field}>
              <label className={fm.label}>Deduction %</label>
              <div className={pageStyles.pctWrapper}>
                <input
                  type="number"
                  className={`${fm.input} ${pageStyles.pctInput} ${errors.deductionPct ? fm.inputError : ''}`}
                  value={form.deductionPct}
                  min={0}
                  max={100}
                  step={0.01}
                  onChange={(e) => set('deductionPct', parseFloat(e.target.value) || 0)}
                />
                <span className={pageStyles.pctSymbol}>%</span>
              </div>
              {errors.deductionPct
                ? <span className={fm.errorText}>{errors.deductionPct}</span>
                : <span className={fm.hint}>Default %; can be overridden at payment stage.</span>
              }
            </div>
          </div>

          {/* Row 3 – Remarks */}
          <div className={fm.field}>
            <label className={fm.label}>Remarks</label>
            <textarea
              className={fm.textarea}
              value={form.remarks}
              rows={3}
              placeholder="Optional notes about this deduction rule…"
              onChange={(e) => set('remarks', e.target.value)}
            />
          </div>

          {/* Row 4 – Status */}
          <div className={fm.field}>
            <label className={fm.label}>Status</label>
            <div className={fm.radioGroup}>
              {(['Active', 'Inactive'] as const).map((s) => (
                <label key={s} className={fm.radioLabel}>
                  <input
                    type="radio"
                    className={fm.radioInput}
                    name="deductionStatus"
                    value={s}
                    checked={form.status === s}
                    onChange={() => set('status', s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={fm.actions}>
          <button className={fm.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={fm.submitBtn} onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Add Deduction'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeductionModal;
