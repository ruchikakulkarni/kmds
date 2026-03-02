import React, { useEffect, useState } from 'react';
import Modal from '../../../../components/common/Modal';
import styles from './ModalForm.module.css';
import type { SourceFinancing, SourceStatus } from './types';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SourceFinancing, 'id'>) => void;
  initialData?: SourceFinancing | null;
}

const EMPTY: Omit<SourceFinancing, 'id'> = {
  sourceCode: '',
  nameEnglish: '',
  nameKannada: '',
  description: '',
  status: 'Active',
};

const SourceModal: React.FC<SourceModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              sourceCode: initialData.sourceCode,
              nameEnglish: initialData.nameEnglish,
              nameKannada: initialData.nameKannada,
              description: initialData.description,
              status: initialData.status,
            }
          : EMPTY
      );
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof EMPTY, string>> = {};
    if (!form.sourceCode.trim()) newErrors.sourceCode = 'Source Code is required';
    if (!form.nameEnglish.trim()) newErrors.nameEnglish = 'Source Name (English) is required';
    if (!form.nameKannada.trim()) newErrors.nameKannada = 'Source Name (Kannada) is required';
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
      title={isEdit ? 'Edit Source of Financing' : 'Add New Source of Financing'}
      size="md"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" form="source-form" className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isEdit ? 'Update Source' : 'Save Source'}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span>{' '}
        to {isEdit ? 'update the' : 'create a new'} source of financing record.
      </p>

      <form id="source-form" onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          {/* Source Code */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sourceCode">
              Source Code<span className={styles.required}>*</span>
            </label>
            <input
              id="sourceCode"
              name="sourceCode"
              type="text"
              className={`${styles.input} ${errors.sourceCode ? styles.inputError : ''}`}
              placeholder="e.g. SF-001"
              value={form.sourceCode}
              onChange={handleChange}
            />
            {errors.sourceCode && <span className={styles.errorMsg}>{errors.sourceCode}</span>}
          </div>

          {/* Name English */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameEnglish">
              Source Name (English)<span className={styles.required}>*</span>
            </label>
            <input
              id="nameEnglish"
              name="nameEnglish"
              type="text"
              className={`${styles.input} ${errors.nameEnglish ? styles.inputError : ''}`}
              placeholder="Enter source name in English"
              value={form.nameEnglish}
              onChange={handleChange}
            />
            {errors.nameEnglish && <span className={styles.errorMsg}>{errors.nameEnglish}</span>}
          </div>

          {/* Name Kannada */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameKannada">
              Source Name (Kannada)<span className={styles.required}>*</span>{' '}
              <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
            </label>
            <input
              id="nameKannada"
              name="nameKannada"
              type="text"
              className={`${styles.input} ${errors.nameKannada ? styles.inputError : ''}`}
              placeholder="ಮೂಲದ ಹೆಸರು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
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
              placeholder="Enter a brief description of this source of financing"
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

export default SourceModal;
