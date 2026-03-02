import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Badge, Modal, useToast } from '../../../components/common';
import { useAuth } from '../../../context/AuthContext';
import styles from './FileSetup.module.css';

// ── AEE mock profile (in real app, from session/auth) ───────────────────────
const AEE_PROFILE = {
  name: 'Rajesh Kumar',
  designation: 'Assistant Executive Engineer',
  section: 'Roads & Buildings',
  sectionCode: 'RB',
  subsection: 'North Zone',
  ulbType: 'city_corporation' as 'city_corporation' | 'municipality' | 'town_panchayat',
};

const CURRENT_FY = '2025-26';
const FILE_SERIES_PREVIEW = `FS-${AEE_PROFILE.sectionCode}/${CURRENT_FY}/001`;
const FILE_NO_PREVIEW     = `FILE/${AEE_PROFILE.sectionCode}/${CURRENT_FY}/001`;

// ── Option lists ─────────────────────────────────────────────────────────────
type FileCreatedFor = '' | 'employee_payee' | 'statutory' | 'vendor' | 'works';

const FILE_CREATED_FOR_OPTIONS = [
  { value: 'employee_payee', label: 'Employee Payee' },
  { value: 'statutory',      label: 'Statutory' },
  { value: 'vendor',         label: 'Vendor' },
  { value: 'works',          label: 'Works' },
];

const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'regular',     label: 'Regular Employee' },
  { value: 'contract',    label: 'Contract Employee' },
  { value: 'daily_wage',  label: 'Daily Wage Employee' },
  { value: 'retired',     label: 'Retired Employee' },
];

const BILL_TYPE_OPTIONS = [
  { value: 'salary',           label: 'Salary Bill' },
  { value: 'ta_da',            label: 'TA/DA Bill' },
  { value: 'medical',          label: 'Medical Reimbursement' },
  { value: 'leave_encashment', label: 'Leave Encashment' },
  { value: 'incentive',        label: 'Incentive Bill' },
];

const STATUTORY_PAYMENT_OPTIONS = [
  { value: 'epf',               label: 'EPF – Employee Provident Fund' },
  { value: 'esi',               label: 'ESI – Employee State Insurance' },
  { value: 'income_tax',        label: 'Income Tax (TDS)' },
  { value: 'professional_tax',  label: 'Professional Tax' },
  { value: 'gst',               label: 'GST' },
  { value: 'labour_cess',       label: 'Labour Cess' },
];

// ── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  financialYear:        string;
  section:              string;
  subsection:           string;
  dateOfCreation:       string;
  fileName:             string;
  fileSubject:          string;
  fileCreatedFor:       FileCreatedFor;
  employeeType:         string;
  billType:             string;
  statutoryPaymentType: string;
}

interface FormErrors {
  dateOfCreation?:       string;
  fileName?:             string;
  fileSubject?:          string;
  fileCreatedFor?:       string;
  employeeType?:         string;
  billType?:             string;
  statutoryPaymentType?: string;
}

// ── Component ────────────────────────────────────────────────────────────────
const FileSetup: React.FC = () => {
  const { role } = useAuth();
  const navigate  = useNavigate();
  const { showToast } = useToast();

  const isAEE      = role === 'AEE_CREATOR';
  const isReadOnly = !isAEE;
  const showSubsection = AEE_PROFILE.ulbType === 'city_corporation';

  const [form, setForm] = useState<FormState>({
    financialYear:        CURRENT_FY,
    section:              AEE_PROFILE.section,
    subsection:           AEE_PROFILE.subsection,
    dateOfCreation:       '',
    fileName:             '',
    fileSubject:          '',
    fileCreatedFor:       '',
    employeeType:         '',
    billType:             '',
    statutoryPaymentType: '',
  });

  const [errors,      setErrors]      = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  // ── Field change handler ─────────────────────────────────────────────────
  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'fileCreatedFor') {
        next.employeeType         = '';
        next.billType             = '';
        next.statutoryPaymentType = '';
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.dateOfCreation) {
      errs.dateOfCreation = 'Date of creation is required.';
    }

    const name = form.fileName.trim();
    if (!name) {
      errs.fileName = 'File name is required.';
    } else if (name.length < 3) {
      errs.fileName = 'File name must be at least 3 characters.';
    } else if (name.length > 30) {
      errs.fileName = 'File name must not exceed 30 characters.';
    }

    const subject = form.fileSubject.trim();
    if (!subject) {
      errs.fileSubject = 'File subject is required.';
    } else if (subject.length < 3) {
      errs.fileSubject = 'File subject must be at least 3 characters.';
    } else if (subject.length > 200) {
      errs.fileSubject = 'File subject must not exceed 200 characters.';
    }

    if (!form.fileCreatedFor) {
      errs.fileCreatedFor = 'Please select who this file is created for.';
    }

    if (form.fileCreatedFor === 'employee_payee') {
      if (!form.employeeType) errs.employeeType = 'Employee type is required.';
      if (!form.billType)     errs.billType     = 'Bill type is required.';
    }

    if (form.fileCreatedFor === 'statutory') {
      if (!form.statutoryPaymentType) {
        errs.statutoryPaymentType = 'Statutory payment type is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    setSubmitted(true);
    showToast(
      `File "${form.fileName}" created. File No: ${FILE_NO_PREVIEW}`,
      'success',
    );
  };

  // ── Breadcrumb ───────────────────────────────────────────────────────────
  const breadcrumbs = [
    { label: 'Home',       href: '/home' },
    { label: 'Masters' },
    { label: 'File Setup', href: '/bill-accounting/file-setup' },
    { label: 'Create' },
  ];

  // ── Frozen / success state ───────────────────────────────────────────────
  if (submitted) {
    return (
      <div className={styles.page}>
        <Breadcrumb items={breadcrumbs} />
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l6 6 10-12" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className={styles.successTitle}>File Created & Frozen</h2>
          <p className={styles.successSubtitle}>
            <strong>{form.fileName}</strong> has been saved and frozen.
          </p>
          <div className={styles.successMeta}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>File No</span>
              <strong className={styles.metaVal}>{FILE_NO_PREVIEW}</strong>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>File Series</span>
              <strong className={styles.metaVal}>{FILE_SERIES_PREVIEW}</strong>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Section</span>
              <strong className={styles.metaVal}>{form.section}</strong>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Financial Year</span>
              <strong className={styles.metaVal}>{form.financialYear}</strong>
            </div>
          </div>
          <div className={styles.successActions}>
            <button
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              className={styles.submitBtn}
              onClick={() => {
                setSubmitted(false);
                setForm({
                  financialYear: CURRENT_FY, section: AEE_PROFILE.section,
                  subsection: AEE_PROFILE.subsection, dateOfCreation: '',
                  fileName: '', fileSubject: '', fileCreatedFor: '',
                  employeeType: '', billType: '', statutoryPaymentType: '',
                });
                setErrors({});
              }}
            >
              Create Another File
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────
  const fcfLabel = FILE_CREATED_FOR_OPTIONS.find(o => o.value === form.fileCreatedFor)?.label ?? '';

  return (
    <div className={styles.page}>
      <Breadcrumb items={breadcrumbs} />

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Create Bill Accounting File</h1>
          <p className={styles.subtitle}>
            Financial Year: <strong>{CURRENT_FY}</strong>
          </p>
        </div>
        <Badge variant={isAEE ? 'primary' : 'neutral'}>
          {isAEE
            ? `AEE | ${AEE_PROFILE.name}`
            : role === 'ULB_ADMIN' ? 'ULB Admin – View Only' : 'DMA Admin – View Only'}
        </Badge>
      </div>

      {/* Read-only notice */}
      {isReadOnly && (
        <div className={styles.readonlyBanner} role="note">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          You are viewing this form in read-only mode. Only AEE can create files.
        </div>
      )}

      <div className={styles.formCard}>

        {/* ═══════════════════ SECTION: BASIC DETAILS ═══════════════════════ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Details</h2>

          <div className={styles.grid2}>

            {/* Financial Year */}
            <div className={styles.field}>
              <label className={styles.label}>
                Financial Year <span className={styles.req}>*</span>
              </label>
              <input
                className={`${styles.input} ${styles.readonly}`}
                value={form.financialYear}
                readOnly
                tabIndex={-1}
              />
            </div>

            {/* Section */}
            <div className={styles.field}>
              <label className={styles.label}>
                Section <span className={styles.req}>*</span>
              </label>
              <input
                className={`${styles.input} ${styles.readonly}`}
                value={form.section}
                readOnly
                tabIndex={-1}
              />
            </div>

            {/* Subsection – city corporation only */}
            {showSubsection && (
              <div className={styles.field}>
                <label className={styles.label}>Subsection</label>
                <input
                  className={`${styles.input} ${styles.readonly}`}
                  value={form.subsection}
                  readOnly
                  tabIndex={-1}
                />
              </div>
            )}

            {/* Date of Creation */}
            <div className={styles.field}>
              <label className={styles.label}>
                Date of Creation <span className={styles.req}>*</span>
              </label>
              <input
                type="date"
                className={`${styles.input} ${errors.dateOfCreation ? styles.inputError : ''}`}
                value={form.dateOfCreation}
                onChange={e => handleChange('dateOfCreation', e.target.value)}
                readOnly={isReadOnly}
              />
              {errors.dateOfCreation && (
                <span className={styles.error}>{errors.dateOfCreation}</span>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════ SECTION: FILE IDENTITY ═══════════════════════ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>File Identity</h2>

          <div className={styles.grid2}>

            {/* File Name */}
            <div className={styles.field}>
              <label className={styles.label}>
                File Name <span className={styles.req}>*</span>
                <span className={styles.hint}>(3–30 chars)</span>
              </label>
              <input
                className={`${styles.input} ${errors.fileName ? styles.inputError : ''}`}
                placeholder="Enter file name"
                value={form.fileName}
                onChange={e => handleChange('fileName', e.target.value)}
                maxLength={30}
                readOnly={isReadOnly}
              />
              <div className={styles.fieldMeta}>
                {errors.fileName
                  ? <span className={styles.error}>{errors.fileName}</span>
                  : <span />}
                <span className={styles.charCount}>{form.fileName.length}/30</span>
              </div>
            </div>

            {/* File Series – auto */}
            <div className={styles.field}>
              <label className={styles.label}>
                File Series
                <Badge variant="info" size="sm" className={styles.autoBadge}>Auto</Badge>
              </label>
              <input
                className={`${styles.input} ${styles.readonly}`}
                value={FILE_SERIES_PREVIEW}
                readOnly
                tabIndex={-1}
              />
              <span className={styles.hint2}>Assigned automatically on save</span>
            </div>
          </div>

          {/* File Subject – full width */}
          <div className={styles.grid1}>
            <div className={styles.field}>
              <label className={styles.label}>
                File Subject <span className={styles.req}>*</span>
                <span className={styles.hint}>(3–200 chars)</span>
              </label>
              <textarea
                className={`${styles.textarea} ${errors.fileSubject ? styles.inputError : ''}`}
                placeholder="Describe the subject of this file…"
                rows={3}
                value={form.fileSubject}
                onChange={e => handleChange('fileSubject', e.target.value)}
                maxLength={200}
                readOnly={isReadOnly}
              />
              <div className={styles.fieldMeta}>
                {errors.fileSubject
                  ? <span className={styles.error}>{errors.fileSubject}</span>
                  : <span />}
                <span className={styles.charCount}>{form.fileSubject.length}/200</span>
              </div>
            </div>
          </div>

          <div className={styles.grid2} style={{ marginTop: 'var(--space-4)' }}>

            {/* File No – auto */}
            <div className={styles.field}>
              <label className={styles.label}>
                File No
                <Badge variant="info" size="sm" className={styles.autoBadge}>Auto</Badge>
              </label>
              <input
                className={`${styles.input} ${styles.readonly}`}
                value={FILE_NO_PREVIEW}
                readOnly
                tabIndex={-1}
              />
              <span className={styles.hint2}>Assigned automatically on save</span>
            </div>

            {/* File Created For */}
            <div className={styles.field}>
              <label className={styles.label}>
                File Created For <span className={styles.req}>*</span>
              </label>
              <select
                className={`${styles.select} ${errors.fileCreatedFor ? styles.inputError : ''}`}
                value={form.fileCreatedFor}
                onChange={e => handleChange('fileCreatedFor', e.target.value)}
                disabled={isReadOnly}
              >
                <option value="">— Select —</option>
                {FILE_CREATED_FOR_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.fileCreatedFor && (
                <span className={styles.error}>{errors.fileCreatedFor}</span>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════ CONDITIONAL: EMPLOYEE PAYEE DETAILS ═══════════════ */}
        {form.fileCreatedFor === 'employee_payee' && (
          <section className={`${styles.section} ${styles.conditionalSection}`}>
            <div className={styles.conditionalHeader}>
              <h2 className={styles.sectionTitle}>Employee Payee Details</h2>
              <Badge variant="warning" size="sm">Conditional</Badge>
            </div>

            <div className={styles.grid2}>

              {/* Employee Type */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Employee Type <span className={styles.req}>*</span>
                </label>
                <select
                  className={`${styles.select} ${errors.employeeType ? styles.inputError : ''}`}
                  value={form.employeeType}
                  onChange={e => handleChange('employeeType', e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">— Select Employee Type —</option>
                  {EMPLOYEE_TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.employeeType && (
                  <span className={styles.error}>{errors.employeeType}</span>
                )}
              </div>

              {/* Bill Type */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Bill Type <span className={styles.req}>*</span>
                </label>
                <select
                  className={`${styles.select} ${errors.billType ? styles.inputError : ''}`}
                  value={form.billType}
                  onChange={e => handleChange('billType', e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">— Select Bill Type —</option>
                  {BILL_TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.billType && (
                  <span className={styles.error}>{errors.billType}</span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ════════════════ CONDITIONAL: STATUTORY DETAILS ════════════════════ */}
        {form.fileCreatedFor === 'statutory' && (
          <section className={`${styles.section} ${styles.conditionalSection}`}>
            <div className={styles.conditionalHeader}>
              <h2 className={styles.sectionTitle}>Statutory Details</h2>
              <Badge variant="warning" size="sm">Conditional</Badge>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Statutory Payment Type <span className={styles.req}>*</span>
                </label>
                <select
                  className={`${styles.select} ${errors.statutoryPaymentType ? styles.inputError : ''}`}
                  value={form.statutoryPaymentType}
                  onChange={e => handleChange('statutoryPaymentType', e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">— Select Payment Type —</option>
                  {STATUTORY_PAYMENT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.statutoryPaymentType && (
                  <span className={styles.error}>{errors.statutoryPaymentType}</span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════ FORM FOOTER ═══════════════════════════════ */}
        <div className={styles.formFooter}>
          <button className={styles.cancelBtn} onClick={() => navigate(-1)}>
            Cancel
          </button>
          {!isReadOnly && (
            <button className={styles.submitBtn} onClick={handleSubmit}>
              Submit File
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════ CONFIRM DIALOG ══════════════════════════════════ */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm File Creation"
        size="sm"
        footer={
          <div className={styles.confirmFooter}>
            <button className={styles.cancelBtn} onClick={() => setConfirmOpen(false)}>
              Cancel
            </button>
            <button className={styles.confirmBtn} onClick={handleConfirm}>
              Confirm &amp; Create File
            </button>
          </div>
        }
      >
        <div className={styles.confirmBody}>
          <div className={styles.confirmIconWrap}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" stroke="var(--color-warning-500, #FFC14A)" strokeWidth="2"/>
              <path d="M18 12v9M18 24v1"
                    stroke="var(--color-warning-500, #FFC14A)"
                    strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <p className={styles.confirmMessage}>
            You are about to create a new Bill Accounting file.
          </p>

          <div className={styles.confirmDetails}>
            {[
              { key: 'File Name',       val: form.fileName },
              { key: 'Section',         val: form.section },
              { key: 'Created For',     val: fcfLabel },
              { key: 'File No (Preview)', val: FILE_NO_PREVIEW },
            ].map(({ key, val }) => (
              <div key={key} className={styles.confirmRow}>
                <span className={styles.confirmKey}>{key}</span>
                <strong className={styles.confirmVal}>{val}</strong>
              </div>
            ))}
          </div>

          <p className={styles.confirmWarning}>
            Once submitted, this file will be <strong>frozen</strong> and cannot be edited.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default FileSetup;
