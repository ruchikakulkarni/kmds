import React, { useState, useMemo, useCallback } from 'react';
import type {
  ProcurementRecord,
  PayeeType,
  VendorSubType,
  TenderType,
  SourceRow,
  ManpowerEntry,
  AssetDetailsInfo,
} from './types';
import {
  FINANCIAL_YEARS,
  WARD_OPTIONS,
  GST_RATES,
  FILE_NO_OPTIONS,
  SOURCE_OPTIONS,
  SUB_SOURCE_MAP,
  VENDOR_OPTIONS,
  WORK_RESERVATION_CATEGORIES,
  SUPPLIER_TYPES,
  EXPENSE_TYPE_MAP,
  CATEGORY_MAP,
  CLASSIFICATION_MAP,
  DOCUMENT_TYPES,
  STATUTORY_REQUIRES_PROCUREMENT,
  computeCompletionDate,
  computeExtendedDate,
  formatDisplayDate,
  getEmptyRecord,
  nextFileNoteNumber,
  fetchVendorByCode,
  fetchWorkByFileNo,
} from './data';
import styles from './ProcurementForm.module.css';

// ── Sub-components ───────────────────────────────────────────────────────────

interface CollapsibleProps {
  title: string;
  badge?: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, badge, collapsed, onToggle, children }: CollapsibleProps) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader} onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}>
        <div className={styles.sectionHeaderLeft}>
          <h3 className={styles.sectionTitle}>{title}</h3>
          {badge}
        </div>
        <span className={styles.toggleIcon}>{collapsed ? '⊕' : '⊖'}</span>
      </div>
      {!collapsed && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, required, error, children, hint }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={`${styles.label} ${required ? styles.required : ''}`}>{label}</label>
      {children}
      {hint && !error && <span className={styles.computedTag}>{hint}</span>}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

// Ward multi-select
interface WardSelectProps {
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}

function WardMultiSelect({ value, onChange, disabled }: WardSelectProps) {
  const [open, setOpen] = useState(false);
  const toggle = (ward: string) => {
    onChange(value.includes(ward) ? value.filter(w => w !== ward) : [...value, ward]);
  };
  return (
    <div className={styles.wardSelectWrap}>
      <button
        type="button"
        className={styles.wardTrigger}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value.length === 0 ? 'Select wards…' : value.join(', ')}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div className={styles.wardDropdown} style={{ zIndex: 100 }}>
            {WARD_OPTIONS.map(ward => (
              <label key={ward} className={styles.wardOption}>
                <input
                  type="checkbox"
                  checked={value.includes(ward)}
                  onChange={() => toggle(ward)}
                />
                {ward}
              </label>
            ))}
          </div>
        </>
      )}
      {value.length > 0 && (
        <div className={styles.wardTags}>
          {value.map(w => (
            <span key={w} className={styles.wardTag}>
              {w}
              {!disabled && (
                <button
                  type="button"
                  className={styles.wardTagRemove}
                  onClick={() => onChange(value.filter(x => x !== w))}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main form component ──────────────────────────────────────────────────────

interface Props {
  record: ProcurementRecord | null;
  mode: 'create' | 'edit' | 'view' | 'update';
  onSave: (record: ProcurementRecord, isDraft: boolean) => void;
  onCancel: () => void;
}

type SectionKey = 'header' | 'workDetails' | 'adminTech' | 'vendorOrder' | 'documents' | 'extension' | 'assets' | 'fileNote';

const ProcurementForm: React.FC<Props> = ({ record, mode, onSave, onCancel }) => {
  const isReadOnly = mode === 'view';
  const [form, setForm] = useState<ProcurementRecord>(() => record ?? getEmptyRecord());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    header: false,
    workDetails: false,
    adminTech: false,
    vendorOrder: false,
    documents: false,
    extension: true,
    assets: false,
    fileNote: false,
  });
  const [vendorFetching, setVendorFetching] = useState(false);
  const [workFetching, setWorkFetching] = useState(false);
  const [showConfirm, setShowConfirm] = useState<'draft' | 'submit' | null>(null);
  const [docFileNames, setDocFileNames] = useState<Record<string, string>>({});

  // ── Derived flags ────────────────────────────────────────────────────────
  const isNA =
    form.payeeType === 'Beneficiary' ||
    form.payeeType === 'Employee' ||
    (form.payeeType === 'Statutory' && !STATUTORY_REQUIRES_PROCUREMENT);

  const isIndividual = form.vendorSubType === 'Individual Payee';
  const isServiceProvider = form.vendorSubType === 'Supplier – Service Provider';
  const isContractor = form.vendorSubType === 'Contractor';
  const skipAdminTech = isIndividual || isServiceProvider;
  const skipExtension = isIndividual;
  const skipAssets = isIndividual;

  const tenderTypeOptions: TenderType[] = isIndividual
    ? ['Direct Purchase']
    : ['Quotation', 'E-Procurement', 'GeM'];

  const securityDepositMandatory = isContractor && form.workReservationCategory === 'Open';

  // ── Computed values ──────────────────────────────────────────────────────
  const net = parseFloat(form.netValue) || 0;
  const gstPct = parseFloat(form.gstPercent) || 0;
  const gstAmount = net * gstPct / 100;
  const totalValue = net + gstAmount;

  const completionDate = useMemo(
    () => computeCompletionDate(form.startDate, form.workDays),
    [form.startDate, form.workDays]
  );

  const extendedDate = useMemo(
    () => computeExtendedDate(completionDate, form.extension.extensionDays),
    [completionDate, form.extension.extensionDays]
  );

  // Document types based on sub-type
  const docTypes = form.vendorSubType ? DOCUMENT_TYPES[form.vendorSubType] ?? [] : [];
  const maxDocs = isIndividual ? 3 : docTypes.length;
  const activeDocTypes = docTypes.slice(0, maxDocs);

  // ── Update helpers ───────────────────────────────────────────────────────
  const setField = useCallback((path: string, value: unknown) => {
    setForm(prev => {
      const keys = path.split('.');
      if (keys.length === 1) return { ...prev, [path]: value };
      const [k1, k2] = keys;
      return { ...prev, [k1]: { ...(prev[k1 as keyof ProcurementRecord] as object), [k2]: value } };
    });
    setErrors(prev => { const n = { ...prev }; delete n[path]; return n; });
  }, []);

  const toggleSection = (key: SectionKey) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Sub-type change: reset tender type & docs ────────────────────────────
  const handleSubTypeChange = (subType: VendorSubType | '') => {
    setField('vendorSubType', subType);
    setField('tenderType', subType === 'Individual Payee' ? 'Direct Purchase' : '');
    setForm(prev => ({ ...prev, documents: [] }));
    setDocFileNames({});
  };

  // ── Payee type change ────────────────────────────────────────────────────
  const handlePayeeTypeChange = (pt: PayeeType) => {
    setField('payeeType', pt);
    setField('vendorSubType', '');
    setField('tenderType', '');
  };

  // ── Vendor code async fetch ──────────────────────────────────────────────
  const handleVendorCodeChange = async (code: string) => {
    setField('vendorCode', code);
    setField('vendorName', '');
    setField('vendorMobile', '');
    if (!code) return;
    setVendorFetching(true);
    try {
      const v = await fetchVendorByCode(code);
      if (v) { setField('vendorName', v.name); setField('vendorMobile', v.mobile); }
    } finally { setVendorFetching(false); }
  };

  // ── File No async fetch ──────────────────────────────────────────────────
  const handleFileNoChange = async (fileNo: string) => {
    setField('fileNo', fileNo);
    setField('workName', '');
    if (!fileNo) return;
    setWorkFetching(true);
    try {
      const name = await fetchWorkByFileNo(fileNo);
      if (name) setField('workName', name);
    } finally { setWorkFetching(false); }
  };

  // ── Sources of financing ─────────────────────────────────────────────────
  const addSource = () => {
    setForm(prev => ({
      ...prev,
      sourcesOfFinancing: [
        ...prev.sourcesOfFinancing,
        { id: `src-${Date.now()}`, source: '', subSource: '', amount: '' },
      ],
    }));
  };

  const removeSource = (id: string) => {
    setForm(prev => ({
      ...prev,
      sourcesOfFinancing: prev.sourcesOfFinancing.filter(s => s.id !== id),
    }));
  };

  const updateSource = (id: string, field: keyof SourceRow, value: string) => {
    setForm(prev => ({
      ...prev,
      sourcesOfFinancing: prev.sourcesOfFinancing.map(s =>
        s.id === id ? { ...s, [field]: value, ...(field === 'source' ? { subSource: '' } : {}) } : s
      ),
    }));
  };

  // ── Manpower entries ─────────────────────────────────────────────────────
  const addManpower = () => {
    setForm(prev => ({
      ...prev,
      manpowerEntries: [
        ...prev.manpowerEntries,
        { id: `mp-${Date.now()}`, name: '', pan: '', accountNo: '', ifscCode: '', bankName: '' },
      ],
    }));
  };

  const removeManpower = (id: string) => {
    setForm(prev => ({
      ...prev,
      manpowerEntries: prev.manpowerEntries.filter(m => m.id !== id),
    }));
  };

  const updateManpower = (id: string, field: keyof ManpowerEntry, value: string) => {
    setForm(prev => ({
      ...prev,
      manpowerEntries: prev.manpowerEntries.map(m => m.id === id ? { ...m, [field]: value } : m),
    }));
  };

  // ── Document file simulation ─────────────────────────────────────────────
  const handleFileUpload = (docType: string, fileName: string) => {
    setDocFileNames(prev => ({ ...prev, [docType]: fileName }));
    setForm(prev => {
      const existing = prev.documents.find(d => d.docType === docType);
      if (existing) {
        return { ...prev, documents: prev.documents.map(d => d.docType === docType ? { ...d, fileName } : d) };
      }
      return { ...prev, documents: [...prev.documents, { id: `doc-${Date.now()}`, docType, fileName }] };
    });
  };

  // ── Auto file note number ────────────────────────────────────────────────
  const handleAutoNoteNumber = () => {
    if (!form.fileNoteNumber) {
      setField('fileNoteNumber', nextFileNoteNumber());
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.vendorSubType) e.vendorSubType = 'Vendor sub-type is required';
    if (!form.tenderType) e.tenderType = 'Tender type is required';
    if (!form.fileNo) e.fileNo = 'File No is required';
    if (!form.workName.trim()) e.workName = 'Work Name is required';
    if (form.ward.length === 0) e.ward = 'At least one ward is required';
    if (!form.netValue || parseFloat(form.netValue) <= 0) e.netValue = 'Net Value must be > 0';
    if (!isIndividual && form.actionPlan) {
      if (!form.actionPlanDate) e.actionPlanDate = 'Meeting date is required';
      if (!form.actionPlanResolutionNumber.trim()) e.actionPlanResolutionNumber = 'Resolution number is required';
    }
    if (!form.vendorCode) e.vendorCode = 'Vendor Code is required';
    if (!form.startDate) e.startDate = 'Start Date is required';
    if (!form.workDays || parseInt(form.workDays) <= 0) e.workDays = 'Work Days must be > 0';
    if (!skipAdminTech) {
      if (!form.adminSanction.date) e['adminSanction.date'] = 'Date is required';
      if (!form.adminSanction.number) e['adminSanction.number'] = 'Number is required';
      if (!form.adminSanction.by) e['adminSanction.by'] = 'Sanctioned by is required';
    }
    if (securityDepositMandatory || form.securityDepositRequired) {
      if (!form.securityDeposit.amount) e['securityDeposit.amount'] = 'Amount is required';
    }
    if (!form.fileNoteText.trim() || form.fileNoteText.length < 3) {
      e.fileNoteText = 'File Note must be at least 3 characters';
    }
    if (form.fileNoteText.length > 1000) {
      e.fileNoteText = 'File Note must be at most 1000 characters';
    }
    if (!form.fileNoteNumber || form.fileNoteNumber.length < 3 || form.fileNoteNumber.length > 10) {
      e.fileNoteNumber = 'File Note No must be 3–10 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save flow ────────────────────────────────────────────────────────────
  const handleDraft = () => setShowConfirm('draft');
  const handleSubmit = () => {
    if (validate()) setShowConfirm('submit');
  };

  const confirmSave = (isDraft: boolean) => {
    const finalRecord: ProcurementRecord = {
      ...form,
      status: isDraft ? form.status : (mode === 'update' ? 'SWO Initiated' : 'Work Order Initiated'),
    };
    onSave(finalRecord, isDraft);
    setShowConfirm(null);
  };

  // ── Asset cascades ───────────────────────────────────────────────────────
  const expenseTypes = form.assetDetails.revenueCapital
    ? EXPENSE_TYPE_MAP[form.assetDetails.revenueCapital] ?? []
    : [];
  const categories = form.assetDetails.expenseType
    ? CATEGORY_MAP[form.assetDetails.expenseType] ?? []
    : [];
  const classifications = form.assetDetails.category
    ? CLASSIFICATION_MAP[form.assetDetails.category] ?? []
    : [];

  const updateAsset = (field: keyof AssetDetailsInfo, value: string) => {
    setForm(prev => ({
      ...prev,
      assetDetails: {
        ...prev.assetDetails,
        [field]: value,
        ...(field === 'revenueCapital' ? { expenseType: '', category: '', classification: '', assetName: '' } : {}),
        ...(field === 'expenseType' ? { category: '', classification: '', assetName: '' } : {}),
        ...(field === 'category' ? { classification: '', assetName: '' } : {}),
      },
    }));
  };

  // ── Render helpers ───────────────────────────────────────────────────────
  const inp = (field: string, value: string, placeholder?: string, type = 'text', disabled = false) => (
    <input
      type={type}
      className={`${styles.input} ${errors[field] ? styles.inputError : ''}`}
      value={value}
      placeholder={placeholder}
      disabled={isReadOnly || disabled}
      onChange={e => setField(field, e.target.value)}
    />
  );

  const sel = (field: string, value: string, options: { value: string; label: string }[], placeholder?: string, disabled = false) => (
    <select
      className={`${styles.select} ${errors[field] ? styles.inputError : ''}`}
      value={value}
      disabled={isReadOnly || disabled}
      onChange={e => setField(field, e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  // ── Not applicable message ───────────────────────────────────────────────
  if (isNA) {
    return (
      <div className={styles.formPage}>
        {renderTopBar()}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Field label="Payee Type" required>
            <select
              className={styles.select}
              value={form.payeeType}
              onChange={e => handlePayeeTypeChange(e.target.value as PayeeType)}
            >
              <option value="Beneficiary">Beneficiary</option>
              <option value="Employee">Employee</option>
              <option value="Statutory">Statutory</option>
              <option value="Vendor">Vendor</option>
            </select>
          </Field>
        </div>
        <div className={styles.alertBox}>
          <svg className={styles.alertIcon} width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9 5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="12.5" r="0.75" fill="currentColor"/>
          </svg>
          <span>
            Procurement mapping is not required for <strong>{form.payeeType}</strong> payee type.
          </span>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className={styles.formPage}>
      {renderTopBar()}

      {/* 1. Header Information */}
      <CollapsibleSection
        title="Header Information"
        collapsed={collapsed.header}
        onToggle={() => toggleSection('header')}
      >
        <div className={styles.row4}>
          <Field label="Financial Year" required>
            {sel('financialYear', form.financialYear,
              FINANCIAL_YEARS.map(y => ({ value: y, label: y })), undefined)}
          </Field>
          <Field label="Date" required>
            {inp('date', form.date, '', 'date')}
          </Field>
          <Field label="Payee Type" required>
            <select
              className={styles.select}
              value={form.payeeType}
              disabled={isReadOnly}
              onChange={e => handlePayeeTypeChange(e.target.value as PayeeType)}
            >
              <option value="Beneficiary">Beneficiary</option>
              <option value="Employee">Employee</option>
              <option value="Statutory">Statutory</option>
              <option value="Vendor">Vendor</option>
            </select>
          </Field>
          <Field label="Vendor Sub-type" required error={errors.vendorSubType}>
            <select
              className={`${styles.select} ${errors.vendorSubType ? styles.inputError : ''}`}
              value={form.vendorSubType}
              disabled={isReadOnly}
              onChange={e => handleSubTypeChange(e.target.value as VendorSubType | '')}
            >
              <option value="">Select sub-type…</option>
              <option value="Contractor">Contractor</option>
              <option value="Supplier – Product/Material">Supplier – Product/Material</option>
              <option value="Supplier – Service Provider">Supplier – Service Provider</option>
              <option value="Individual Payee">Individual Payee</option>
            </select>
          </Field>
        </div>
        <div className={styles.row4}>
          <Field label="Tender Type" required error={errors.tenderType}>
            <select
              className={`${styles.select} ${errors.tenderType ? styles.inputError : ''}`}
              value={form.tenderType}
              disabled={isReadOnly || isIndividual}
              onChange={e => setField('tenderType', e.target.value as TenderType)}
            >
              <option value="">Select tender type…</option>
              {tenderTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {isIndividual && (
              <span className={styles.computedTag}>Locked to Direct Purchase for Individual Payee</span>
            )}
          </Field>
          <Field label="Notification No">
            {inp('notificationNo', form.notificationNo, 'e.g. NOT-2026-001')}
          </Field>
          <Field label="Notification Date">
            {inp('notificationDate', form.notificationDate, '', 'date')}
          </Field>
        </div>
      </CollapsibleSection>

      {/* 2. Work / Purchase Details */}
      <CollapsibleSection
        title="Work / Purchase Details"
        collapsed={collapsed.workDetails}
        onToggle={() => toggleSection('workDetails')}
      >
        <div className={styles.row3}>
          <Field label="File No" required error={errors.fileNo}>
            <select
              className={`${styles.select} ${errors.fileNo ? styles.inputError : ''}`}
              value={form.fileNo}
              disabled={isReadOnly}
              onChange={e => handleFileNoChange(e.target.value)}
            >
              <option value="">Select file no…</option>
              {FILE_NO_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.value}</option>)}
            </select>
          </Field>
          <Field label="Work Name" required error={errors.workName}
            hint={workFetching ? 'Fetching…' : undefined}>
            <input
              type="text"
              className={`${styles.input} ${errors.workName ? styles.inputError : ''}`}
              value={form.workName}
              placeholder={workFetching ? 'Fetching…' : 'Auto-filled from File No'}
              readOnly
              style={{ background: 'var(--color-neutral-50, #f9fafb)' }}
            />
          </Field>
          {!isIndividual && (
            <Field label="Action Plan">
              <div className={styles.toggleWrap}>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={form.actionPlan}
                    disabled={isReadOnly}
                    onChange={e => setField('actionPlan', e.target.checked)}
                  />
                  <span className={styles.toggleTrack} />
                </label>
                <span className={styles.toggleLabel}>{form.actionPlan ? 'Yes' : 'No'}</span>
              </div>
            </Field>
          )}
        </div>

        {!isIndividual && form.actionPlan && (
          <div className={styles.row2}>
            <Field label="Action Plan / Meeting Date" required error={errors.actionPlanDate}>
              <input
                type="date"
                className={`${styles.input} ${errors.actionPlanDate ? styles.inputError : ''}`}
                value={form.actionPlanDate}
                disabled={isReadOnly}
                onChange={e => setField('actionPlanDate', e.target.value)}
              />
            </Field>
            <Field label="Action Plan / Resolution Number" required error={errors.actionPlanResolutionNumber}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`${styles.input} ${errors.actionPlanResolutionNumber ? styles.inputError : ''}`}
                value={form.actionPlanResolutionNumber}
                disabled={isReadOnly}
                placeholder="Enter resolution number"
                onChange={e => setField('actionPlanResolutionNumber', e.target.value.replace(/\D/g, ''))}
              />
            </Field>
          </div>
        )}

        <div className={styles.row4}>
          <Field label="Ward(s)" required error={errors.ward}>
            <WardMultiSelect
              value={form.ward}
              onChange={v => { setField('ward', v); }}
              disabled={isReadOnly}
            />
          </Field>
          <Field label="Net Value (₹)" required error={errors.netValue}>
            {inp('netValue', form.netValue, '0.00', 'number')}
          </Field>
          <Field label="GST %" required>
            {sel('gstPercent', form.gstPercent, GST_RATES.map(g => ({ value: g, label: `${g}%` })))}
          </Field>
          <Field label="GST Amount (₹)">
            <div className={`${styles.readOnlyVal} ${styles.muted}`}>
              {gstAmount > 0 ? gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—'}
            </div>
          </Field>
        </div>

        <div className={styles.row}>
          <Field label="Total Value (₹)">
            <div className={`${styles.readOnlyVal}`} style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-primary-500)' }}>
              {totalValue > 0 ? `₹ ${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
            </div>
          </Field>
        </div>

        {/* Supplier Type — only for Product/Material */}
        {form.vendorSubType === 'Supplier – Product/Material' && (
          <div className={styles.row3}>
            <Field label="Supplier Type">
              {sel('supplierType', form.supplierType,
                SUPPLIER_TYPES.map(s => ({ value: s, label: s })), 'Select supplier type…')}
            </Field>
          </div>
        )}

        {/* Sources of Financing */}
        <div className={styles.subSection}>
          <div className={styles.subSectionTitle}>Source &amp; Sub-source of Financing</div>
          <table className={styles.multiRowTable}>
            <thead>
              <tr>
                <th className={styles.multiRowTh}>Source</th>
                <th className={styles.multiRowTh}>Sub-source</th>
                <th className={styles.multiRowTh}>Amount (₹)</th>
                {!isReadOnly && <th className={styles.multiRowTh} style={{ width: 40 }}></th>}
              </tr>
            </thead>
            <tbody>
              {form.sourcesOfFinancing.map(row => (
                <tr key={row.id}>
                  <td className={styles.multiRowTd}>
                    <select
                      className={styles.select}
                      value={row.source}
                      disabled={isReadOnly}
                      onChange={e => updateSource(row.id, 'source', e.target.value)}
                    >
                      <option value="">Select source…</option>
                      {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className={styles.multiRowTd}>
                    <select
                      className={styles.select}
                      value={row.subSource}
                      disabled={isReadOnly || !row.source}
                      onChange={e => updateSource(row.id, 'subSource', e.target.value)}
                    >
                      <option value="">Select sub-source…</option>
                      {(SUB_SOURCE_MAP[row.source] ?? []).map(ss => (
                        <option key={ss} value={ss}>{ss}</option>
                      ))}
                    </select>
                  </td>
                  <td className={styles.multiRowTd}>
                    <input
                      type="number"
                      className={styles.input}
                      value={row.amount}
                      disabled={isReadOnly}
                      placeholder="0"
                      onChange={e => updateSource(row.id, 'amount', e.target.value)}
                    />
                  </td>
                  {!isReadOnly && (
                    <td className={styles.multiRowTd}>
                      <button
                        type="button"
                        className={styles.removeRowBtn}
                        onClick={() => removeSource(row.id)}
                        disabled={form.sourcesOfFinancing.length === 1}
                      >
                        −
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!isReadOnly && (
            <button type="button" className={styles.addRowBtn} onClick={addSource}>
              + Add Source Row
            </button>
          )}
        </div>
      </CollapsibleSection>

      {/* 3. Admin & Technical Details — skip for Individual Payee & Service Provider */}
      {!skipAdminTech && (
        <CollapsibleSection
          title="Administrative &amp; Technical Details"
          collapsed={collapsed.adminTech}
          onToggle={() => toggleSection('adminTech')}
        >
          <div className={styles.subSection}>
            <div className={styles.subSectionTitle}>Administrative Sanction</div>
            <div className={styles.row3}>
              <Field label="Date" required={!isReadOnly} error={errors['adminSanction.date']}>
                <input
                  type="date"
                  className={`${styles.input} ${errors['adminSanction.date'] ? styles.inputError : ''}`}
                  value={form.adminSanction.date}
                  disabled={isReadOnly}
                  onChange={e => setField('adminSanction.date', e.target.value)}
                />
              </Field>
              <Field label="Sanction No" required={!isReadOnly} error={errors['adminSanction.number']}>
                <input
                  type="text"
                  className={`${styles.input} ${errors['adminSanction.number'] ? styles.inputError : ''}`}
                  value={form.adminSanction.number}
                  disabled={isReadOnly}
                  placeholder="e.g. AS-2025-001"
                  onChange={e => setField('adminSanction.number', e.target.value)}
                />
              </Field>
              <Field label="Sanctioned By" required={!isReadOnly} error={errors['adminSanction.by']}>
                <input
                  type="text"
                  className={`${styles.input} ${errors['adminSanction.by'] ? styles.inputError : ''}`}
                  value={form.adminSanction.by}
                  disabled={isReadOnly}
                  placeholder="e.g. Municipal Commissioner"
                  onChange={e => setField('adminSanction.by', e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className={styles.subSection}>
            <div className={styles.subSectionTitle}>Technical Sanction</div>
            <div className={styles.row3}>
              <Field label="Date">
                {inp('technicalSanction.date', form.technicalSanction.date, '', 'date')}
              </Field>
              <Field label="Sanction No">
                {inp('technicalSanction.number', form.technicalSanction.number, 'e.g. TS-2025-001')}
              </Field>
              <Field label="Sanctioned By">
                {inp('technicalSanction.by', form.technicalSanction.by, 'e.g. Chief Engineer')}
              </Field>
            </div>
          </div>

          <div className={styles.row4}>
            <Field label="LOI Number">
              {inp('loiNumber', form.loiNumber, 'e.g. LOI-2025-001')}
            </Field>
            <Field label="LOI Date">
              {inp('loiDate', form.loiDate, '', 'date')}
            </Field>
            <Field label="Work Reservation Category">
              {sel('workReservationCategory', form.workReservationCategory,
                WORK_RESERVATION_CATEGORIES.map(c => ({ value: c, label: c })), 'Select category…')}
            </Field>
          </div>

          {/* Schedule B — Contractor only */}
          {isContractor && (
            <div className={styles.subSection}>
              <div className={styles.subSectionTitle}>Schedule B</div>
              <div className={styles.docRow}>
                <span className={styles.docLabel}>Schedule B Document</span>
                <span className={`${styles.docFileName} ${form.scheduleB ? styles.docUploaded : ''}`}>
                  {form.scheduleB || 'No file uploaded (PDF, max 3 MB)'}
                </span>
                <div className={styles.docActions}>
                  {!isReadOnly && (
                    <button type="button" className={styles.uploadBtn}
                      onClick={() => setField('scheduleB', `schedule_b_${Date.now()}.pdf`)}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v7M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      Upload
                    </button>
                  )}
                  {form.scheduleB && (
                    <button type="button" className={styles.viewDocBtn}>View</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* 4. Vendor & Order Details */}
      <CollapsibleSection
        title="Vendor &amp; Order Details"
        collapsed={collapsed.vendorOrder}
        onToggle={() => toggleSection('vendorOrder')}
      >
        <div className={styles.row4}>
          <Field label="Vendor Code" required error={errors.vendorCode}>
            <select
              className={`${styles.select} ${errors.vendorCode ? styles.inputError : ''}`}
              value={form.vendorCode}
              disabled={isReadOnly}
              onChange={e => handleVendorCodeChange(e.target.value)}
            >
              <option value="">Select vendor…</option>
              {VENDOR_OPTIONS.map(v => <option key={v.code} value={v.code}>{v.code}</option>)}
            </select>
          </Field>
          <Field label="Organisation Name" hint={vendorFetching ? 'Fetching…' : undefined}>
            <div className={`${styles.readOnlyVal} ${!form.vendorName ? styles.muted : ''}`}>
              {vendorFetching ? 'Fetching…' : form.vendorName || '—'}
            </div>
          </Field>
          <Field label="Mobile">
            <div className={`${styles.readOnlyVal} ${!form.vendorMobile ? styles.muted : ''}`}>
              {vendorFetching ? '…' : form.vendorMobile || '—'}
            </div>
          </Field>
        </div>

        <div className={styles.row4}>
          <Field label="Start Date" required error={errors.startDate}>
            <input
              type="date"
              className={`${styles.input} ${errors.startDate ? styles.inputError : ''}`}
              value={form.startDate}
              disabled={isReadOnly}
              onChange={e => setField('startDate', e.target.value)}
            />
          </Field>
          <Field label="Work Days" required error={errors.workDays}>
            <input
              type="number"
              className={`${styles.input} ${errors.workDays ? styles.inputError : ''}`}
              value={form.workDays}
              disabled={isReadOnly}
              placeholder="e.g. 120"
              min={1}
              onChange={e => setField('workDays', e.target.value)}
            />
          </Field>
          <Field label="Completion Date" hint="Auto-computed from Start Date + Work Days">
            <div className={`${styles.readOnlyVal} ${!completionDate ? styles.muted : ''}`}>
              {completionDate ? formatDisplayDate(completionDate) : '—'}
            </div>
          </Field>
          <Field label="Order No" hint="Populated upon approval">
            {inp('orderNo', form.orderNo, 'Pending approval…', 'text', mode !== 'update')}
          </Field>
        </div>

        <div className={styles.row4}>
          <Field label="Order Date" hint={mode !== 'update' ? 'Populated upon approval' : undefined}>
            {inp('orderDate', form.orderDate, '', 'date', mode !== 'update')}
          </Field>
        </div>

        {/* Security Deposit */}
        {(!isIndividual) && (
          <div className={styles.subSection}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div className={styles.subSectionTitle} style={{ marginBottom: 0 }}>Security Deposit</div>
              {securityDepositMandatory && (
                <span className={styles.sectionBadge}>Mandatory</span>
              )}
              {!securityDepositMandatory && (
                <label className={styles.toggleWrap} style={{ marginLeft: 'auto' }}>
                  <div className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={form.securityDepositRequired}
                      disabled={isReadOnly}
                      onChange={e => setField('securityDepositRequired', e.target.checked)}
                    />
                    <span className={styles.toggleTrack} />
                  </div>
                  <span className={styles.toggleLabel}>Required</span>
                </label>
              )}
            </div>
            {(form.securityDepositRequired || securityDepositMandatory) && (
              <div className={styles.row3}>
                <Field label="Deposit Amount (₹)" required error={errors['securityDeposit.amount']}>
                  <input
                    type="number"
                    className={`${styles.input} ${errors['securityDeposit.amount'] ? styles.inputError : ''}`}
                    value={form.securityDeposit.amount}
                    disabled={isReadOnly}
                    placeholder="0.00"
                    onChange={e => setField('securityDeposit.amount', e.target.value)}
                  />
                </Field>
                <Field label="Reference No">
                  {inp('securityDeposit.referenceNo', form.securityDeposit.referenceNo, 'e.g. SD-2026-001')}
                </Field>
                <Field label="Date Deposited">
                  {inp('securityDeposit.dateDeposited', form.securityDeposit.dateDeposited, '', 'date')}
                </Field>
              </div>
            )}
          </div>
        )}

        {/* Manpower table — Service Provider only */}
        {isServiceProvider && (
          <div className={styles.subSection}>
            <div className={styles.subSectionTitle}>Manpower Details</div>
            <table className={styles.multiRowTable}>
              <thead>
                <tr>
                  <th className={styles.multiRowTh}>Name</th>
                  <th className={styles.multiRowTh}>PAN</th>
                  <th className={styles.multiRowTh}>Account No</th>
                  <th className={styles.multiRowTh}>IFSC Code</th>
                  <th className={styles.multiRowTh}>Bank Name</th>
                  {!isReadOnly && <th className={styles.multiRowTh} style={{ width: 40 }}></th>}
                </tr>
              </thead>
              <tbody>
                {form.manpowerEntries.map(mp => (
                  <tr key={mp.id}>
                    {(['name', 'pan', 'accountNo', 'ifscCode', 'bankName'] as (keyof ManpowerEntry)[]).map(f => (
                      <td key={f} className={styles.multiRowTd}>
                        <input
                          type="text"
                          className={styles.input}
                          value={mp[f] as string}
                          disabled={isReadOnly}
                          onChange={e => updateManpower(mp.id, f, e.target.value)}
                        />
                      </td>
                    ))}
                    {!isReadOnly && (
                      <td className={styles.multiRowTd}>
                        <button type="button" className={styles.removeRowBtn}
                          onClick={() => removeManpower(mp.id)}>−</button>
                      </td>
                    )}
                  </tr>
                ))}
                {form.manpowerEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 'var(--space-3)', textAlign: 'center', fontSize: 'var(--text-body-xs)', color: 'var(--color-text-muted)' }}>
                      No manpower entries added.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {!isReadOnly && (
              <button type="button" className={styles.addRowBtn} onClick={addManpower}>
                + Add Manpower
              </button>
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* 5. Documents */}
      <CollapsibleSection
        title="Documents"
        collapsed={collapsed.documents}
        onToggle={() => toggleSection('documents')}
      >
        {activeDocTypes.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-xs)' }}>
            Select a vendor sub-type to see document requirements.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {activeDocTypes.map(docType => {
              const uploaded = form.documents.find(d => d.docType === docType);
              const fileName = docFileNames[docType] || uploaded?.fileName || '';
              const isWorkOrder = docType === 'Work Order';
              return (
                <div key={docType} className={styles.docRow}>
                  <span className={styles.docLabel}>{docType}</span>
                  <span className={`${styles.docFileName} ${fileName ? styles.docUploaded : ''}`}>
                    {fileName || 'No file uploaded (PDF, max 3 MB)'}
                  </span>
                  <div className={styles.docActions}>
                    {!isReadOnly && !isWorkOrder && (
                      <button type="button" className={styles.uploadBtn}
                        onClick={() => handleFileUpload(docType, `${docType.toLowerCase().replace(/\W+/g, '_')}_${Date.now()}.pdf`)}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 1v7M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                        Upload
                      </button>
                    )}
                    {isWorkOrder && !isReadOnly && (
                      <button type="button" className={styles.generateBtn}
                        onClick={() => handleFileUpload(docType, `work_order_generated_${Date.now()}.pdf`)}>
                        Generate
                      </button>
                    )}
                    {fileName && (
                      <button type="button" className={styles.viewDocBtn}>View</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      {/* 6. Extension / Variation — skip for Individual Payee */}
      {!skipExtension && (
        <CollapsibleSection
          title="Extension / Variation"
          badge={<span className={styles.sectionBadgeOpt}>Optional</span>}
          collapsed={collapsed.extension}
          onToggle={() => toggleSection('extension')}
        >
          {!form.extensionEnabled && !isReadOnly ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={form.extensionEnabled}
                  onChange={e => setField('extensionEnabled', e.target.checked)}
                />
                <span className={styles.toggleTrack} />
              </label>
              <span className={styles.toggleLabel}>Enable extension/variation details</span>
            </div>
          ) : (
            <>
              {!isReadOnly && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={form.extensionEnabled}
                      onChange={e => setField('extensionEnabled', e.target.checked)}
                    />
                    <span className={styles.toggleTrack} />
                  </label>
                  <span className={styles.toggleLabel}>Extension enabled</span>
                </div>
              )}
              <div className={styles.row4}>
                <Field label="Actual Start Date">
                  <input type="date" className={styles.input}
                    value={form.extension.actualStartDate}
                    disabled={isReadOnly}
                    onChange={e => setField('extension.actualStartDate', e.target.value)} />
                </Field>
                <Field label="Actual End Date">
                  <input type="date" className={styles.input}
                    value={form.extension.actualEndDate}
                    disabled={isReadOnly}
                    onChange={e => setField('extension.actualEndDate', e.target.value)} />
                </Field>
                <Field label="Extension Days">
                  <input type="number" className={styles.input} min={1}
                    value={form.extension.extensionDays}
                    disabled={isReadOnly}
                    onChange={e => setField('extension.extensionDays', e.target.value)} />
                </Field>
                <Field label="Extended Completion Date" hint="Auto-computed">
                  <div className={`${styles.readOnlyVal} ${!extendedDate ? styles.muted : ''}`}>
                    {extendedDate ? formatDisplayDate(extendedDate) : '—'}
                  </div>
                </Field>
              </div>

              {/* SWO — Contractor only */}
              {isContractor && (
                <div className={styles.subSection}>
                  <div className={styles.subSectionTitle}>SWO (Supplemental Work Order)</div>
                  <div className={styles.row3}>
                    <Field label="SWO Number">
                      {inp('extension.swoNumber', form.extension.swoNumber, 'e.g. SWO-2025-001')}
                    </Field>
                    <Field label="SWO Generated">
                      <div className={styles.docRow} style={{ padding: 'var(--space-2)' }}>
                        {!isReadOnly && !form.extension.swoGenerated && (
                          <button type="button" className={styles.generateBtn}
                            onClick={() => {
                              setField('extension.swoGenerated', true);
                              if (!form.extension.swoNumber) {
                                setField('extension.swoNumber', `SWO-${Date.now()}`);
                              }
                            }}>
                            Generate SWO
                          </button>
                        )}
                        {form.extension.swoGenerated && (
                          <button type="button" className={styles.viewDocBtn}>View SWO</button>
                        )}
                        {!form.extension.swoGenerated && isReadOnly && (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-xs)' }}>Not generated</span>
                        )}
                      </div>
                    </Field>
                  </div>
                </div>
              )}
            </>
          )}
        </CollapsibleSection>
      )}

      {/* 7. Asset Details — skip for Individual Payee */}
      {!skipAssets && (
        <CollapsibleSection
          title="Asset Details"
          collapsed={collapsed.assets}
          onToggle={() => toggleSection('assets')}
        >
          <div className={styles.row}>
            <Field label="Revenue / Capital">
              <div className={styles.radioGroup}>
                {(['Revenue', 'Capital'] as const).map(opt => (
                  <label key={opt} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="revenueCapital"
                      value={opt}
                      checked={form.assetDetails.revenueCapital === opt}
                      disabled={isReadOnly}
                      onChange={() => updateAsset('revenueCapital', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </Field>
          </div>

          {form.assetDetails.revenueCapital && (
            <div className={styles.row4}>
              <Field label="Expense Type">
                <select className={styles.select}
                  value={form.assetDetails.expenseType}
                  disabled={isReadOnly}
                  onChange={e => updateAsset('expenseType', e.target.value)}>
                  <option value="">Select expense type…</option>
                  {expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Category">
                <select className={styles.select}
                  value={form.assetDetails.category}
                  disabled={isReadOnly || !form.assetDetails.expenseType}
                  onChange={e => updateAsset('category', e.target.value)}>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Classification">
                <select className={styles.select}
                  value={form.assetDetails.classification}
                  disabled={isReadOnly || !form.assetDetails.category}
                  onChange={e => updateAsset('classification', e.target.value)}>
                  <option value="">Select classification…</option>
                  {classifications.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Asset Name">
                <input type="text" className={styles.input}
                  value={form.assetDetails.assetName}
                  disabled={isReadOnly}
                  placeholder="Asset name or description"
                  onChange={e => updateAsset('assetName', e.target.value)} />
              </Field>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* 8. File Note */}
      <CollapsibleSection
        title="File Note"
        collapsed={collapsed.fileNote}
        onToggle={() => toggleSection('fileNote')}
      >
        <div className={styles.row}>
          <Field label="File Note Number" required error={errors.fileNoteNumber}
            hint="3–10 characters; auto-increments if blank">
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="text"
                className={`${styles.input} ${errors.fileNoteNumber ? styles.inputError : ''}`}
                value={form.fileNoteNumber}
                disabled={isReadOnly}
                placeholder="e.g. FN20260001"
                minLength={3}
                maxLength={10}
                onChange={e => setField('fileNoteNumber', e.target.value)}
                onFocus={handleAutoNoteNumber}
              />
              {!isReadOnly && !form.fileNoteNumber && (
                <button type="button" className={styles.draftBtn}
                  style={{ whiteSpace: 'nowrap', padding: '0 var(--space-3)' }}
                  onClick={handleAutoNoteNumber}>
                  Auto
                </button>
              )}
            </div>
          </Field>
        </div>
        <Field label="Note Text" required error={errors.fileNoteText}>
          <textarea
            className={`${styles.textarea} ${errors.fileNoteText ? styles.inputError : ''}`}
            value={form.fileNoteText}
            disabled={isReadOnly}
            placeholder="Enter file note (max 1000 characters)…"
            rows={5}
            maxLength={1000}
            onChange={e => setField('fileNoteText', e.target.value)}
          />
          <span className={`${styles.charCount} ${form.fileNoteText.length > 1000 ? styles.charCountOver : ''}`}>
            {form.fileNoteText.length} / 1000
          </span>
        </Field>
      </CollapsibleSection>

      {/* Footer */}
      {!isReadOnly && (
        <div className={styles.formFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.draftBtn} onClick={handleDraft}>
            Save Draft
          </button>
          <button type="button" className={styles.submitBtn} onClick={handleSubmit}>
            {mode === 'update' ? 'Submit Update' : 'Submit Work Order'}
          </button>
        </div>
      )}

      {isReadOnly && (
        <div className={styles.formFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            ← Back to List
          </button>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <h3 className={styles.confirmTitle}>
              {showConfirm === 'draft' ? 'Save as Draft?' : 'Submit Work Order?'}
            </h3>
            <p className={styles.confirmMessage}>
              {showConfirm === 'draft'
                ? 'This will save your current entries as a draft. You can continue editing later.'
                : `You are about to ${mode === 'update' ? 'submit an SWO update' : 'initiate a new work order'} for "${form.workName || 'this work'}". This action will update the procurement status. Continue?`}
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setShowConfirm(null)}>
                Cancel
              </button>
              <button
                className={showConfirm === 'draft' ? styles.draftBtn : styles.submitBtn}
                onClick={() => confirmSave(showConfirm === 'draft')}
              >
                {showConfirm === 'draft' ? 'Save Draft' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Top bar (used in both NA and normal render) ──────────────────────────
  function renderTopBar() {
    const modeLabel = mode === 'view' ? 'View' : mode === 'update' ? 'Update SWO' : mode === 'edit' ? 'Edit' : 'New';
    return (
      <div className={styles.formTopBar}>
        <button type="button" className={styles.backBtn} onClick={onCancel}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className={styles.formTitles}>
          <h2 className={styles.formTitle}>{modeLabel} Work Order</h2>
          <p className={styles.formSubtitle}>
            {mode === 'view' ? 'Read-only view of procurement record' : 'Fill in the procurement details below'}
          </p>
        </div>
      </div>
    );
  }
};

export default ProcurementForm;
