import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../components/common/Modal';
import { INITIAL_ACCOUNT_TYPES } from '../AccountCode/data';
import {
  FUND_CODES_REF,
  SOURCES_REF,
  SUBSOURCES_REF,
  buildFlatCode,
  getDetailCodesByAccountType,
} from './data';
import type { AccountFundSOFMapping, MappingStatus } from './types';
import type { DetailCode } from '../AccountCode/types';
import styles from './ModalForm.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AccountFundSOFMapping, 'id'>) => void;
  initialData: AccountFundSOFMapping | null;
}

const MappingModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEdit = Boolean(initialData);

  const [accountTypeId, setAccountTypeId] = useState<number | ''>('');
  const [detailCodeId,  setDetailCodeId]  = useState<number | ''>('');
  const [fundCodeId,    setFundCodeId]    = useState<number | ''>('');
  const [sourceId,      setSourceId]      = useState<number | ''>('');
  const [subSourceId,   setSubSourceId]   = useState<number | ''>('');
  const [status,        setStatus]        = useState<MappingStatus>('Active');
  const [errors,        setErrors]        = useState<Record<string, string>>({});

  /* ── Initialise on open ── */
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setAccountTypeId(initialData.accountTypeId);
      setDetailCodeId(initialData.detailCodeId);
      setFundCodeId(initialData.fundCodeId);
      setSourceId(initialData.sourceId);
      setSubSourceId(initialData.subSourceId);
      setStatus(initialData.status);
    } else {
      setAccountTypeId('');
      setDetailCodeId('');
      setFundCodeId('');
      setSourceId('');
      setSubSourceId('');
      setStatus('Active');
    }
    setErrors({});
  }, [isOpen, initialData]);

  /* ── Cascading: composite code options filtered by AT ── */
  const filteredDetailCodes = useMemo<DetailCode[]>(() => {
    if (!accountTypeId) return [];
    return getDetailCodesByAccountType(accountTypeId as number);
  }, [accountTypeId]);

  /* Reset detail code when AT changes and current selection is out of scope */
  useEffect(() => {
    if (detailCodeId && !filteredDetailCodes.find(d => d.id === detailCodeId)) {
      setDetailCodeId('');
    }
  }, [filteredDetailCodes]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Autofill from selected composite code ── */
  const flat = useMemo(
    () => (detailCodeId ? buildFlatCode(detailCodeId as number) : null),
    [detailCodeId],
  );

  /* ── Cascading: sub-source options filtered by source ── */
  const filteredSubSources = useMemo(
    () => SUBSOURCES_REF.filter(ss => ss.sourceId === sourceId),
    [sourceId],
  );

  /* Reset sub-source when source changes and current selection is out of scope */
  useEffect(() => {
    if (subSourceId && !filteredSubSources.find(ss => ss.id === subSourceId)) {
      setSubSourceId('');
    }
  }, [filteredSubSources]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!accountTypeId) errs.accountTypeId = 'Account Type is required';
    if (!detailCodeId)  errs.detailCodeId  = 'Composite Account Code is required';
    if (!fundCodeId)    errs.fundCodeId    = 'Fund Name is required';
    if (!sourceId)      errs.sourceId      = 'Source of Financing is required';
    if (!subSourceId)   errs.subSourceId   = 'Sub-Source is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !flat) return;
    onSubmit({
      accountTypeId: accountTypeId as number,
      majorHeadId:   flat.majorHead.id,
      minorHeadId:   flat.minorHead.id,
      subHeadId:     flat.subHead.id,
      detailCodeId:  detailCodeId as number,
      compositeCode: flat.compositeCode,
      fundCodeId:    fundCodeId as number,
      sourceId:      sourceId as number,
      subSourceId:   subSourceId as number,
      status,
    });
  };

  const FORM_ID = 'mapping-modal-form';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Mapping' : 'New Account – Fund – SOF Mapping'}
      size="lg"
      footer={
        <>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form={FORM_ID} className={styles.submitBtn}>
            {isEdit ? 'Save Changes' : 'Create Mapping'}
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className={styles.form}>

        {/* Account Type */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Account Type <span className={styles.required}>*</span>
          </label>
          <div className={styles.selectWrap}>
            <select
              className={`${styles.select} ${errors.accountTypeId ? styles.selectError : ''}`}
              value={accountTypeId}
              onChange={e => setAccountTypeId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Select Account Type</option>
              {INITIAL_ACCOUNT_TYPES.map(at => (
                <option key={at.id} value={at.id}>{at.nameEnglish}</option>
              ))}
            </select>
            <svg className={styles.selectChevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {errors.accountTypeId && <p className={styles.error}>{errors.accountTypeId}</p>}
        </div>

        {/* Composite Account Code */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Composite Account Code <span className={styles.required}>*</span>
          </label>
          <div className={styles.selectWrap}>
            <select
              className={`${styles.select} ${errors.detailCodeId ? styles.selectError : ''}`}
              value={detailCodeId}
              onChange={e => setDetailCodeId(e.target.value ? Number(e.target.value) : '')}
              disabled={!accountTypeId}
            >
              <option value="">
                {!accountTypeId ? 'Select Account Type first' : 'Select Composite Code'}
              </option>
              {filteredDetailCodes.map(dc => {
                const f = buildFlatCode(dc.id);
                return (
                  <option key={dc.id} value={dc.id}>
                    {f ? f.compositeCode : ''} – {dc.nameEnglish}
                  </option>
                );
              })}
            </select>
            <svg className={styles.selectChevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {errors.detailCodeId && <p className={styles.error}>{errors.detailCodeId}</p>}
        </div>

        {/* Autofill readonly section */}
        {flat && (
          <div className={styles.autofillBox}>
            <p className={styles.autofillTitle}>Auto-filled from selected code</p>
            <div className={styles.autofillGrid}>
              <div className={styles.autofillItem}>
                <span className={styles.autofillLabel}>Major Head</span>
                <span className={styles.autofillValue}>{flat.majorHead.nameEnglish}</span>
              </div>
              <div className={styles.autofillItem}>
                <span className={styles.autofillLabel}>Minor Head</span>
                <span className={styles.autofillValue}>{flat.minorHead.nameEnglish}</span>
              </div>
              <div className={styles.autofillItem}>
                <span className={styles.autofillLabel}>Sub Head</span>
                <span className={styles.autofillValue}>{flat.subHead.nameEnglish}</span>
              </div>
              <div className={styles.autofillItem}>
                <span className={styles.autofillLabel}>Detail Code</span>
                <span className={styles.autofillValue}>{flat.detailCode.nameEnglish}</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.divider} />

        {/* Fund Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Fund Name <span className={styles.required}>*</span>
          </label>
          <div className={styles.selectWrap}>
            <select
              className={`${styles.select} ${errors.fundCodeId ? styles.selectError : ''}`}
              value={fundCodeId}
              onChange={e => setFundCodeId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Select Fund</option>
              {FUND_CODES_REF.map(f => (
                <option key={f.id} value={f.id}>{f.fundCode} – {f.nameEnglish}</option>
              ))}
            </select>
            <svg className={styles.selectChevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {errors.fundCodeId && <p className={styles.error}>{errors.fundCodeId}</p>}
        </div>

        {/* Source + Sub-Source (2-column) */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Source of Financing <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrap}>
              <select
                className={`${styles.select} ${errors.sourceId ? styles.selectError : ''}`}
                value={sourceId}
                onChange={e => setSourceId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select Source</option>
                {SOURCES_REF.map(s => (
                  <option key={s.id} value={s.id}>{s.sourceCode} – {s.nameEnglish}</option>
                ))}
              </select>
              <svg className={styles.selectChevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {errors.sourceId && <p className={styles.error}>{errors.sourceId}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Sub-Source <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrap}>
              <select
                className={`${styles.select} ${errors.subSourceId ? styles.selectError : ''}`}
                value={subSourceId}
                onChange={e => setSubSourceId(e.target.value ? Number(e.target.value) : '')}
                disabled={!sourceId || filteredSubSources.length === 0}
              >
                <option value="">
                  {!sourceId
                    ? 'Select Source first'
                    : filteredSubSources.length === 0
                    ? 'No sub-sources available'
                    : 'Select Sub-Source'}
                </option>
                {filteredSubSources.map(ss => (
                  <option key={ss.id} value={ss.id}>
                    {ss.subSourceCode} – {ss.nameEnglish}
                  </option>
                ))}
              </select>
              <svg className={styles.selectChevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {errors.subSourceId && <p className={styles.error}>{errors.subSourceId}</p>}
          </div>
        </div>

        {/* Status */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Status</label>
          <div className={styles.radioGroup}>
            {(['Active', 'Inactive'] as MappingStatus[]).map(s => (
              <label key={s} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="mapping-status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className={styles.radioInput}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

      </form>
    </Modal>
  );
};

export default MappingModal;
