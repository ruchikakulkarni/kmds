import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../components/common/Modal';
import styles from './ModalForm.module.css';
import type {
  AccountType, MajorHead, MinorHead, SubHead, DetailCode,
  AccountStatus, AccountTypeCategory,
} from './types';

type ModalLevel = 'account-type' | 'major-head' | 'minor-head' | 'sub-head' | 'detail-code';

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AccountType | MajorHead | MinorHead | SubHead | DetailCode, 'id'>) => void;
  level: ModalLevel;
  initialData?: AccountType | MajorHead | MinorHead | SubHead | DetailCode | null;
  /* parent data for cascading dropdowns */
  accountTypes: AccountType[];
  majorHeads:   MajorHead[];
  minorHeads:   MinorHead[];
  subHeads:     SubHead[];
  /* pre-selected parent IDs from the filter context */
  defaultAccountTypeId?: number;
  defaultMajorHeadId?:   number;
  defaultMinorHeadId?:   number;
  defaultSubHeadId?:     number;
}

// const EMPTY_COMMON = { code: '', nameEnglish: '', nameKannada: '', status: 'Active' as AccountStatus };

const LEVEL_TITLES: Record<ModalLevel, string> = {
  'account-type': 'Account Type',
  'major-head':   'Major Head',
  'minor-head':   'Minor Head',
  'sub-head':     'Sub Head',
  'detail-code':  'Detail Code',
};

const CATEGORIES: AccountTypeCategory[] = ['Income', 'Expense', 'Asset', 'Liability'];

/* ── Composite code builder helpers (mirrors AccountCodeTab) ── */
const cc = (...parts: (string | undefined)[]) => parts.filter(Boolean).join('');

/* ─────────────────────────────────────────────────────────────────────────── */
const LevelModal: React.FC<LevelModalProps> = ({
  isOpen, onClose, onSubmit, level, initialData,
  accountTypes, majorHeads, minorHeads, subHeads,
  defaultAccountTypeId, defaultMajorHeadId, defaultMinorHeadId, defaultSubHeadId,
}) => {
  const isEdit = Boolean(initialData);

  /* ── Form fields ── */
  const [code,        setCode]        = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [nameKannada, setNameKannada] = useState('');
  const [status,      setStatus]      = useState<AccountStatus>('Active');
  const [category,    setCategory]    = useState<AccountTypeCategory>('Income');

  /* ── Parent selections ── */
  const [selAtId,  setSelAtId]  = useState<number | ''>('');
  const [selMhId,  setSelMhId]  = useState<number | ''>('');
  const [selMinId, setSelMinId] = useState<number | ''>('');
  const [selShId,  setSelShId]  = useState<number | ''>('');

  /* ── Validation errors ── */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Initialise on open ── */
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});

    if (initialData) {
      setCode(initialData.code);
      setNameEnglish(initialData.nameEnglish);
      setNameKannada(initialData.nameKannada);
      setStatus(initialData.status);

      if (level === 'account-type') {
        setCategory((initialData as AccountType).category);
      }
      if (level === 'major-head') {
        const d = initialData as MajorHead;
        setSelAtId(d.accountTypeId);
      }
      if (level === 'minor-head') {
        const d  = initialData as MinorHead;
        const mh = majorHeads.find(m => m.id === d.majorHeadId);
        setSelAtId(mh?.accountTypeId ?? '');
        setSelMhId(d.majorHeadId);
      }
      if (level === 'sub-head') {
        const d   = initialData as SubHead;
        const min = minorHeads.find(m => m.id === d.minorHeadId);
        const mh  = majorHeads.find(m => m.id === min?.majorHeadId);
        setSelAtId(mh?.accountTypeId ?? '');
        setSelMhId(min?.majorHeadId ?? '');
        setSelMinId(d.minorHeadId);
      }
      if (level === 'detail-code') {
        const d   = initialData as DetailCode;
        const sh  = subHeads.find(s => s.id === d.subHeadId);
        const min = minorHeads.find(m => m.id === sh?.minorHeadId);
        const mh  = majorHeads.find(m => m.id === min?.majorHeadId);
        setSelAtId(mh?.accountTypeId ?? '');
        setSelMhId(min?.majorHeadId ?? '');
        setSelMinId(sh?.minorHeadId ?? '');
        setSelShId(d.subHeadId);
      }
    } else {
      /* New record – use defaults from parent filter context */
      setCode('');
      setNameEnglish('');
      setNameKannada('');
      setStatus('Active');
      setCategory('Income');
      setSelAtId(defaultAccountTypeId ?? '');
      setSelMhId(defaultMajorHeadId   ?? '');
      setSelMinId(defaultMinorHeadId  ?? '');
      setSelShId(defaultSubHeadId     ?? '');
    }
  }, [isOpen, initialData, level]);

  /* ── Cascading dropdown options ── */
  const filteredMh  = useMemo(() => majorHeads.filter(m => m.accountTypeId === selAtId),  [majorHeads, selAtId]);
  const filteredMin = useMemo(() => minorHeads.filter(m => m.majorHeadId   === selMhId),  [minorHeads, selMhId]);
  const filteredSh  = useMemo(() => subHeads.filter(s  => s.minorHeadId    === selMinId), [subHeads, selMinId]);

  /* ── Composite code preview ── */
  const compositePreview = useMemo(() => {
    const at  = accountTypes.find(a => a.id === selAtId);
    const mh  = majorHeads.find(m   => m.id === selMhId);
    const min = minorHeads.find(m   => m.id === selMinId);
    const sh  = subHeads.find(s     => s.id === selShId);

    switch (level) {
      case 'account-type': return code || '?';
      case 'major-head':   return cc(at?.code, code || '?');
      case 'minor-head':   return cc(at?.code, mh?.code, code || '?');
      case 'sub-head':     return cc(at?.code, mh?.code, min?.code, code || '?');
      case 'detail-code':  return cc(at?.code, mh?.code, min?.code, sh?.code, code || '??');
    }
  }, [level, code, selAtId, selMhId, selMinId, selShId, accountTypes, majorHeads, minorHeads, subHeads]);

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!code.trim())        errs.code        = 'Code is required';
    if (!nameEnglish.trim()) errs.nameEnglish = 'Name (English) is required';
    if (!nameKannada.trim()) errs.nameKannada = 'Name (Kannada) is required';
    if (level !== 'account-type' && !selAtId)  errs.selAtId  = 'Account Type is required';
    if (['minor-head', 'sub-head', 'detail-code'].includes(level) && !selMhId)  errs.selMhId  = 'Major Head is required';
    if (['sub-head', 'detail-code'].includes(level) && !selMinId) errs.selMinId = 'Minor Head is required';
    if (level === 'detail-code' && !selShId)   errs.selShId  = 'Sub Head is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (level === 'account-type') {
      onSubmit({ code, nameEnglish, nameKannada, status, category } as Omit<AccountType, 'id'>);
    } else if (level === 'major-head') {
      onSubmit({ code, nameEnglish, nameKannada, status, accountTypeId: selAtId as number } as Omit<MajorHead, 'id'>);
    } else if (level === 'minor-head') {
      onSubmit({ code, nameEnglish, nameKannada, status, majorHeadId: selMhId as number } as Omit<MinorHead, 'id'>);
    } else if (level === 'sub-head') {
      onSubmit({ code, nameEnglish, nameKannada, status, minorHeadId: selMinId as number } as Omit<SubHead, 'id'>);
    } else {
      onSubmit({ code, nameEnglish, nameKannada, status, subHeadId: selShId as number } as Omit<DetailCode, 'id'>);
    }
  };

  const title    = isEdit ? `Edit ${LEVEL_TITLES[level]}` : `Add New ${LEVEL_TITLES[level]}`;
  const formId   = `level-modal-form`;
  const needsAt  = level !== 'account-type';
  const needsMh  = ['minor-head', 'sub-head', 'detail-code'].includes(level);
  const needsMin = ['sub-head', 'detail-code'].includes(level);
  const needsSh  = level === 'detail-code';

  /* ── Inline select renderer helper ── */
  const Sel = ({
    label, value, onChange, options, errorKey, placeholder,
  }: {
    label: string; value: number | ''; errorKey: string; placeholder: string;
    onChange: (v: number | '') => void;
    options: { id: number; display: string }[];
  }) => (
    <div className={styles.field}>
      <label className={styles.label}>{label}<span className={styles.required}>*</span></label>
      <div className={styles.selectWrap}>
        <select
          className={`${styles.select} ${errors[errorKey] ? styles.inputError : ''}`}
          value={value}
          onChange={e => onChange(e.target.value === '' ? '' : +e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o.id} value={o.id}>{o.display}</option>)}
        </select>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.selectChevron}>
          <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {errors[errorKey] && <span className={styles.errorMsg}>{errors[errorKey]}</span>}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" form={formId} className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isEdit ? `Update ${LEVEL_TITLES[level]}` : `Save ${LEVEL_TITLES[level]}`}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span> to{' '}
        {isEdit ? 'update this' : 'create a new'} {LEVEL_TITLES[level].toLowerCase()} record.
      </p>

      <form id={formId} onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>

          {/* ── Composite code preview ── */}
          <div className={styles.compositePreview}>
            <span className={styles.compositePreviewLabel}>Composite Account Code Preview</span>
            <span className={styles.compositePreviewCode}>{compositePreview}</span>
          </div>

          {/* ── Account Type dropdown (levels 2-5) ── */}
          {needsAt && (
            <Sel
              label="Account Type"
              value={selAtId}
              errorKey="selAtId"
              placeholder="Select Account Type"
              onChange={v => { setSelAtId(v); setSelMhId(''); setSelMinId(''); setSelShId(''); }}
              options={accountTypes.map(a => ({ id: a.id, display: `${a.code} – ${a.nameEnglish} (${a.category})` }))}
            />
          )}

          {/* ── Major Head dropdown (levels 3-5) ── */}
          {needsMh && (
            <Sel
              label="Major Head"
              value={selMhId}
              errorKey="selMhId"
              placeholder="Select Major Head"
              onChange={v => { setSelMhId(v); setSelMinId(''); setSelShId(''); }}
              options={filteredMh.map(m => {
                const at = accountTypes.find(a => a.id === m.accountTypeId);
                return { id: m.id, display: `${cc(at?.code, m.code)} – ${m.nameEnglish}` };
              })}
            />
          )}

          {/* ── Minor Head dropdown (levels 4-5) ── */}
          {needsMin && (
            <Sel
              label="Minor Head"
              value={selMinId}
              errorKey="selMinId"
              placeholder="Select Minor Head"
              onChange={v => { setSelMinId(v); setSelShId(''); }}
              options={filteredMin.map(m => {
                const mh = majorHeads.find(x => x.id === m.majorHeadId);
                const at = accountTypes.find(a => a.id === mh?.accountTypeId);
                return { id: m.id, display: `${cc(at?.code, mh?.code, m.code)} – ${m.nameEnglish}` };
              })}
            />
          )}

          {/* ── Sub Head dropdown (level 5 only) ── */}
          {needsSh && (
            <Sel
              label="Sub Head"
              value={selShId}
              errorKey="selShId"
              placeholder="Select Sub Head"
              onChange={v => setSelShId(v)}
              options={filteredSh.map(s => {
                const min = minorHeads.find(m => m.id === s.minorHeadId);
                const mh  = majorHeads.find(m => m.id === min?.majorHeadId);
                const at  = accountTypes.find(a => a.id === mh?.accountTypeId);
                return { id: s.id, display: `${cc(at?.code, mh?.code, min?.code, s.code)} – ${s.nameEnglish}` };
              })}
            />
          )}

          {/* ── Category (Account Type level only) ── */}
          {level === 'account-type' && (
            <div className={styles.field}>
              <label className={styles.label}>Category<span className={styles.required}>*</span></label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={category}
                  onChange={e => setCategory(e.target.value as AccountTypeCategory)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.selectChevron}>
                  <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )}

          {/* ── Code + Status row ── */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lm-code">
                {LEVEL_TITLES[level]} Code<span className={styles.required}>*</span>
              </label>
              <input
                id="lm-code"
                type="text"
                className={`${styles.input} ${errors.code ? styles.inputError : ''}`}
                placeholder={
                  level === 'account-type' ? 'e.g. 1'
                  : level === 'major-head' ? 'e.g. 1'
                  : level === 'minor-head' ? 'e.g. 1'
                  : level === 'sub-head'   ? 'e.g. 1'
                  : 'e.g. 01'
                }
                value={code}
                onChange={e => { setCode(e.target.value); setErrors(p => ({ ...p, code: '' })); }}
              />
              {errors.code && <span className={styles.errorMsg}>{errors.code}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <div className={styles.radioGroup}>
                {(['Active', 'Inactive'] as AccountStatus[]).map(s => (
                  <label key={s} className={styles.radioLabel}>
                    <input
                      type="radio" name="lm-status" value={s}
                      checked={status === s}
                      onChange={() => setStatus(s)}
                      className={styles.radioInput}
                    />
                    <span className={`${styles.radioCustom} ${status === s ? styles.radioChecked : ''}`}/>
                    <span className={styles.radioText}>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Name (English) ── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lm-nameEn">
              Name (English)<span className={styles.required}>*</span>
            </label>
            <input
              id="lm-nameEn"
              type="text"
              className={`${styles.input} ${errors.nameEnglish ? styles.inputError : ''}`}
              placeholder={`Enter ${LEVEL_TITLES[level].toLowerCase()} name in English`}
              value={nameEnglish}
              onChange={e => { setNameEnglish(e.target.value); setErrors(p => ({ ...p, nameEnglish: '' })); }}
            />
            {errors.nameEnglish && <span className={styles.errorMsg}>{errors.nameEnglish}</span>}
          </div>

          {/* ── Name (Kannada) ── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lm-nameKn">
              Name (Kannada)<span className={styles.required}>*</span>{' '}
              <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
            </label>
            <input
              id="lm-nameKn"
              type="text"
              className={`${styles.input} ${errors.nameKannada ? styles.inputError : ''}`}
              placeholder="ಕನ್ನಡದಲ್ಲಿ ಹೆಸರು ನಮೂದಿಸಿ"
              value={nameKannada}
              onChange={e => { setNameKannada(e.target.value); setErrors(p => ({ ...p, nameKannada: '' })); }}
            />
            {errors.nameKannada && <span className={styles.errorMsg}>{errors.nameKannada}</span>}
          </div>

        </div>
      </form>
    </Modal>
  );
};

export default LevelModal;
