import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../../components/common/Modal';
import { FLAT_ACCOUNT_CODES, FUNCTION_CODES, generateBudgetCode } from './data';
import { INITIAL_ACCOUNT_TYPES } from '../AccountCode/data';
import type { BudgetCodeRecord, BudgetStatus, BudgetType } from './types';
import styles from './ModalForm.module.css';

interface BudgetCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BudgetCodeRecord, 'id'>) => void;
  initialData?: BudgetCodeRecord | null;
}

interface FormState {
  accountTypeId: number | '';
  compositeAccountCode: string;
  majorHeadName: string;
  minorHeadName: string;
  subHeadName: string;
  detailCodeName: string;
  functionCodeId: number | '';
  functionCode: string;
  functionName: string;
  budgetType: BudgetType;
  descriptionEnglish: string;
  descriptionKannada: string;
  budgetCode: string;
  status: BudgetStatus;
}

const EMPTY: FormState = {
  accountTypeId:        '',
  compositeAccountCode: '',
  majorHeadName:        '',
  minorHeadName:        '',
  subHeadName:          '',
  detailCodeName:       '',
  functionCodeId:       '',
  functionCode:         '',
  functionName:         '',
  budgetType:           'Revenue',
  descriptionEnglish:   '',
  descriptionKannada:   '',
  budgetCode:           '',
  status:               'Active',
};

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.selectChevron}>
    <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AutoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.autoIcon}>
    <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.9 2.9l1.4 1.4M7.7 7.7l1.4 1.4M2.9 9.1l1.4-1.4M7.7 4.3l1.4-1.4"
      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const BudgetCodeModal: React.FC<BudgetCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEdit = Boolean(initialData);
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  /* ── Reset form on open ── */
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setForm({
        accountTypeId:        initialData.accountTypeId,
        compositeAccountCode: initialData.compositeAccountCode,
        majorHeadName:        initialData.majorHeadName,
        minorHeadName:        initialData.minorHeadName,
        subHeadName:          initialData.subHeadName,
        detailCodeName:       initialData.detailCodeName,
        functionCodeId:       initialData.functionCodeId,
        functionCode:         initialData.functionCode,
        functionName:         initialData.functionName,
        budgetType:           initialData.budgetType,
        descriptionEnglish:   initialData.descriptionEnglish,
        descriptionKannada:   initialData.descriptionKannada,
        budgetCode:           initialData.budgetCode,
        status:               initialData.status,
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [isOpen, initialData]);

  /* ── Derived: filtered composite list by accountType ── */
  const filteredComposites = useMemo(() => {
    if (form.accountTypeId === '') return FLAT_ACCOUNT_CODES;
    return FLAT_ACCOUNT_CODES.filter(c => c.accountTypeId === form.accountTypeId);
  }, [form.accountTypeId]);

  /* ── Handlers ── */
  const handleAccountType = (val: string) => {
    const atId = val === '' ? '' : +val;
    setForm(prev => ({
      ...prev,
      accountTypeId:        atId,
      compositeAccountCode: '',
      majorHeadName:        '',
      minorHeadName:        '',
      subHeadName:          '',
      detailCodeName:       '',
      budgetCode:           prev.functionCode && prev.budgetType ? '' : '',
    }));
    setErrors(prev => ({ ...prev, accountTypeId: '', compositeAccountCode: '' }));
  };

  const handleComposite = (val: string) => {
    const opt = FLAT_ACCOUNT_CODES.find(c => c.compositeCode === val);
    const newBudgetCode = opt && form.functionCode
      ? generateBudgetCode(val, form.functionCode, form.budgetType)
      : '';
    setForm(prev => ({
      ...prev,
      compositeAccountCode: val,
      majorHeadName:        opt?.majorHeadName  ?? '',
      minorHeadName:        opt?.minorHeadName  ?? '',
      subHeadName:          opt?.subHeadName    ?? '',
      detailCodeName:       opt?.detailCodeName ?? '',
      budgetCode:           newBudgetCode,
    }));
    setErrors(prev => ({ ...prev, compositeAccountCode: '' }));
  };

  const handleFunctionCode = (val: string) => {
    const opt = FUNCTION_CODES.find(f => f.id === +val);
    const newBudgetCode = opt && form.compositeAccountCode
      ? generateBudgetCode(form.compositeAccountCode, opt.code, form.budgetType)
      : '';
    setForm(prev => ({
      ...prev,
      functionCodeId: val === '' ? '' : +val,
      functionCode:   opt?.code ?? '',
      functionName:   opt?.name ?? '',
      budgetCode:     newBudgetCode,
    }));
    setErrors(prev => ({ ...prev, functionCodeId: '' }));
  };

  const handleBudgetType = (val: BudgetType) => {
    const newBudgetCode = form.compositeAccountCode && form.functionCode
      ? generateBudgetCode(form.compositeAccountCode, form.functionCode, val)
      : '';
    setForm(prev => ({ ...prev, budgetType: val, budgetCode: newBudgetCode }));
  };

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleStatus = (val: BudgetStatus) => {
    setForm(prev => ({ ...prev, status: val }));
  };

  /* ── Validation ── */
  const validate = () => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (form.accountTypeId === '')        errs.accountTypeId        = 'Account Type is required';
    if (!form.compositeAccountCode)       errs.compositeAccountCode = 'Composite Account Code is required';
    if (form.functionCodeId === '')       errs.functionCodeId       = 'Function Name is required';
    if (!form.descriptionEnglish.trim())  errs.descriptionEnglish   = 'Budget Head Description (English) is required';
    if (!form.descriptionKannada.trim())  errs.descriptionKannada   = 'Budget Head Description (Kannada) is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({
      accountTypeId:        form.accountTypeId as number,
      compositeAccountCode: form.compositeAccountCode,
      majorHeadName:        form.majorHeadName,
      minorHeadName:        form.minorHeadName,
      subHeadName:          form.subHeadName,
      detailCodeName:       form.detailCodeName,
      functionCodeId:       form.functionCodeId as number,
      functionCode:         form.functionCode,
      functionName:         form.functionName,
      budgetType:           form.budgetType,
      descriptionEnglish:   form.descriptionEnglish.trim(),
      descriptionKannada:   form.descriptionKannada.trim(),
      budgetCode:           form.budgetCode,
      status:               form.status,
    });
  };

  /* ── Readonly display helper ── */
  const ReadonlyField: React.FC<{ value: string; placeholder?: string }> = ({ value, placeholder }) => (
    <div className={styles.readonlyInput}>
      <AutoIcon />
      {value
        ? <span>{value}</span>
        : <span className={styles.readonlyPlaceholder}>{placeholder ?? 'Auto-fetched'}</span>
      }
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Budget Code' : 'Add New Budget Code'}
      size="lg"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="budget-code-form" className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isEdit ? 'Update Budget Code' : 'Save Budget Code'}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span>{' '}
        to {isEdit ? 'update the' : 'create a new'} budget code record.
      </p>

      <form id="budget-code-form" onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>

          {/* ── Section: Account Code ── */}
          <div className={styles.sectionLabel}>Account Code</div>

          {/* Row 1: Account Type | Composite Account Code */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="accountTypeId">
                Account Type<span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="accountTypeId"
                  className={`${styles.select} ${errors.accountTypeId ? styles.selectError : ''}`}
                  value={form.accountTypeId}
                  onChange={e => handleAccountType(e.target.value)}
                >
                  <option value="">Select Account Type</option>
                  {INITIAL_ACCOUNT_TYPES.map(at => (
                    <option key={at.id} value={at.id}>{at.code} – {at.nameEnglish}</option>
                  ))}
                </select>
                <ChevronDown />
              </div>
              {errors.accountTypeId && <span className={styles.errorMsg}>{errors.accountTypeId}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="compositeAccountCode">
                Composite Account Code<span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="compositeAccountCode"
                  className={`${styles.select} ${errors.compositeAccountCode ? styles.selectError : ''}`}
                  value={form.compositeAccountCode}
                  onChange={e => handleComposite(e.target.value)}
                  disabled={filteredComposites.length === 0}
                >
                  <option value="">Select Composite Code</option>
                  {filteredComposites.map(c => (
                    <option key={c.compositeCode} value={c.compositeCode}>
                      {c.compositeCode}
                    </option>
                  ))}
                </select>
                <ChevronDown />
              </div>
              {errors.compositeAccountCode && (
                <span className={styles.errorMsg}>{errors.compositeAccountCode}</span>
              )}
            </div>
          </div>

          {/* Row 2: Major Head | Minor Head (auto-fetched) */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Major Head</label>
              <ReadonlyField value={form.majorHeadName} placeholder="Auto-fetched from composite" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Minor Head</label>
              <ReadonlyField value={form.minorHeadName} placeholder="Auto-fetched from composite" />
            </div>
          </div>

          {/* Row 3: Sub Head | Detail Code (auto-fetched) */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Sub Head</label>
              <ReadonlyField value={form.subHeadName} placeholder="Auto-fetched from composite" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Detail Code</label>
              <ReadonlyField value={form.detailCodeName} placeholder="Auto-fetched from composite" />
            </div>
          </div>

          {/* ── Section: Function ── */}
          <div className={styles.sectionLabel}>Function</div>

          {/* Row 4: Function Name | Function Code */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="functionCodeId">
                Function Name<span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="functionCodeId"
                  className={`${styles.select} ${errors.functionCodeId ? styles.selectError : ''}`}
                  value={form.functionCodeId}
                  onChange={e => handleFunctionCode(e.target.value)}
                >
                  <option value="">Select Function</option>
                  {FUNCTION_CODES.map(fc => (
                    <option key={fc.id} value={fc.id}>{fc.name}</option>
                  ))}
                </select>
                <ChevronDown />
              </div>
              {errors.functionCodeId && <span className={styles.errorMsg}>{errors.functionCodeId}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Function Code</label>
              <ReadonlyField value={form.functionCode} placeholder="Auto-fetched from function" />
            </div>
          </div>

          {/* ── Section: Budget ── */}
          <div className={styles.sectionLabel}>Budget Details</div>

          {/* Row 5: Budget Type | Status */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="budgetType">Budget Type</label>
              <div className={styles.selectWrap}>
                <select
                  id="budgetType"
                  className={styles.select}
                  value={form.budgetType}
                  onChange={e => handleBudgetType(e.target.value as BudgetType)}
                >
                  <option value="Revenue">Revenue</option>
                  <option value="Capital">Capital</option>
                  <option value="Deposit">Deposit</option>
                </select>
                <ChevronDown />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <div className={styles.radioGroup}>
                {(['Active', 'Inactive'] as BudgetStatus[]).map(s => (
                  <label key={s} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => handleStatus(s)}
                      className={styles.radioInput}
                    />
                    <span className={`${styles.radioCustom} ${form.status === s ? styles.radioChecked : ''}`} />
                    <span className={styles.radioText}>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Row 6: Budget Head Description (English) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="descriptionEnglish">
              Budget Head Description (English)<span className={styles.required}>*</span>
            </label>
            <input
              id="descriptionEnglish"
              name="descriptionEnglish"
              type="text"
              className={`${styles.input} ${errors.descriptionEnglish ? styles.inputError : ''}`}
              placeholder="Enter budget head description in English"
              value={form.descriptionEnglish}
              onChange={handleText}
            />
            {errors.descriptionEnglish && (
              <span className={styles.errorMsg}>{errors.descriptionEnglish}</span>
            )}
          </div>

          {/* Row 7: Budget Head Description (Kannada) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="descriptionKannada">
              Budget Head Description (Kannada)<span className={styles.required}>*</span>{' '}
              <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
            </label>
            <input
              id="descriptionKannada"
              name="descriptionKannada"
              type="text"
              className={`${styles.input} ${errors.descriptionKannada ? styles.inputError : ''}`}
              placeholder="ಬಜೆಟ್ ಮುಖ್ಯ ವಿವರಣೆ ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
              value={form.descriptionKannada}
              onChange={handleText}
            />
            {errors.descriptionKannada && (
              <span className={styles.errorMsg}>{errors.descriptionKannada}</span>
            )}
          </div>

          {/* Row 8: Budget Code (auto-generated) */}
          <div className={styles.field}>
            <label className={styles.label}>Budget Code (Auto-generated)</label>
            <div className={styles.budgetCodeBox}>
              <span className={styles.budgetCodeLabel}>Code:</span>
              {form.budgetCode
                ? <span className={styles.budgetCodeValue}>{form.budgetCode}</span>
                : <span className={styles.budgetCodeEmpty}>
                    Select composite account code + function + budget type to generate
                  </span>
              }
            </div>
          </div>

        </div>
      </form>
    </Modal>
  );
};

export default BudgetCodeModal;
