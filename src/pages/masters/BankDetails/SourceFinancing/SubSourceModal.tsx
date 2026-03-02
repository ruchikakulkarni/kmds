import React, { useEffect, useState } from 'react';
import Modal from '../../../../components/common/Modal';
import styles from './ModalForm.module.css';
import type { SourceFinancing, SubSourceFinancing, SourceStatus } from './types';

interface SubSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SubSourceFinancing, 'id'>) => void;
  initialData?: SubSourceFinancing | null;
  parentSource: SourceFinancing;
}

const SubSourceModal: React.FC<SubSourceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentSource,
}) => {
  const isEdit = Boolean(initialData);

  const emptyForm = {
    sourceId: parentSource.id,
    subSourceCode: '',
    nameEnglish: '',
    nameKannada: '',
    description: '',
    status: 'Active' as SourceStatus,
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              sourceId: initialData.sourceId,
              subSourceCode: initialData.subSourceCode,
              nameEnglish: initialData.nameEnglish,
              nameKannada: initialData.nameKannada,
              description: initialData.description,
              status: initialData.status,
            }
          : { ...emptyForm, sourceId: parentSource.id }
      );
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData, parentSource.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!form.subSourceCode.trim()) newErrors.subSourceCode = 'Sub-Source Code is required';
    if (!form.nameEnglish.trim()) newErrors.nameEnglish = 'Sub-Source Name (English) is required';
    if (!form.nameKannada.trim()) newErrors.nameKannada = 'Sub-Source Name (Kannada) is required';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Sub-Source of Financing' : 'Add New Sub-Source of Financing'}
      size="md"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" form="subsource-form" className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isEdit ? 'Update Sub-Source' : 'Save Sub-Source'}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span>{' '}
        to {isEdit ? 'update the' : 'create a new'} sub-source of financing record.
      </p>

      <form id="subsource-form" onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          {/* Parent Source (read-only) */}
          <div className={styles.field}>
            <label className={styles.label}>Parent Source</label>
            <div className={styles.readonlyField}>
              <span className={styles.readonlyCode}>{parentSource.sourceCode}</span>
              <span className={styles.readonlyName}>{parentSource.nameEnglish}</span>
            </div>
          </div>

          {/* Sub-Source Code */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="subSourceCode">
              Sub-Source Code<span className={styles.required}>*</span>
            </label>
            <input
              id="subSourceCode"
              name="subSourceCode"
              type="text"
              className={`${styles.input} ${errors.subSourceCode ? styles.inputError : ''}`}
              placeholder="e.g. SF-002-01"
              value={form.subSourceCode}
              onChange={handleChange}
            />
            {errors.subSourceCode && <span className={styles.errorMsg}>{errors.subSourceCode}</span>}
          </div>

          {/* Name English */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameEnglish">
              Sub-Source Name (English)<span className={styles.required}>*</span>
            </label>
            <input
              id="nameEnglish"
              name="nameEnglish"
              type="text"
              className={`${styles.input} ${errors.nameEnglish ? styles.inputError : ''}`}
              placeholder="Enter sub-source name in English"
              value={form.nameEnglish}
              onChange={handleChange}
            />
            {errors.nameEnglish && <span className={styles.errorMsg}>{errors.nameEnglish}</span>}
          </div>

          {/* Name Kannada */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameKannada">
              Sub-Source Name (Kannada)<span className={styles.required}>*</span>{' '}
              <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
            </label>
            <input
              id="nameKannada"
              name="nameKannada"
              type="text"
              className={`${styles.input} ${errors.nameKannada ? styles.inputError : ''}`}
              placeholder="ಉಪ-ಮೂಲದ ಹೆಸರು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
              value={form.nameKannada}
              onChange={handleChange}
            />
            {errors.nameKannada && <span className={styles.errorMsg}>{errors.nameKannada}</span>}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="Enter a brief description of this sub-source"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Status */}
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <div className={styles.radioGroup}>
              {(['Active', 'Inactive'] as SourceStatus[]).map((s) => (
                <label key={s} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  <span className={`${styles.radioCustom} ${form.status === s ? styles.radioChecked : ''}`} />
                  <span className={styles.radioText}>{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SubSourceModal;
