import React, { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import styles from './FundCodeModal.module.css';
import type { FundCode, FundStatus } from './types';

interface FundCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FundCode, 'id'>) => void;
  initialData?: FundCode | null;
}

const EMPTY_FORM = {
  fundCode: '',
  nameEnglish: '',
  nameKannada: '',
  description: '',
  status: 'Active' as FundStatus,
};

const FundCodeModal: React.FC<FundCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              fundCode: initialData.fundCode,
              nameEnglish: initialData.nameEnglish,
              nameKannada: initialData.nameKannada,
              description: initialData.description,
              status: initialData.status,
            }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Partial<typeof EMPTY_FORM> = {};
    if (!form.fundCode.trim()) newErrors.fundCode = 'Fund Code is required';
    if (!form.nameEnglish.trim()) newErrors.nameEnglish = 'Fund Name (English) is required';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Fund Code' : 'Add New Fund Code'}
      size="md"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="fund-code-form" className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isEdit ? 'Update' : 'Save for Fund Code'}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span>{' '}
        to {isEdit ? 'edit an existing' : 'create a new'} record.
      </p>

      <form id="fund-code-form" onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          {/* Fund Code */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fundCode">
              Fund Code<span className={styles.required}>*</span>
            </label>
            <input
              id="fundCode"
              name="fundCode"
              type="text"
              className={`${styles.input} ${errors.fundCode ? styles.inputError : ''}`}
              placeholder="e.g. 201"
              value={form.fundCode}
              onChange={handleChange}
            />
            {errors.fundCode && (
              <span className={styles.errorMsg}>{errors.fundCode}</span>
            )}
          </div>

          {/* Name (English) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameEnglish">
              Fund Name (English)<span className={styles.required}>*</span>
            </label>
            <input
              id="nameEnglish"
              name="nameEnglish"
              type="text"
              className={`${styles.input} ${errors.nameEnglish ? styles.inputError : ''}`}
              placeholder="Enter fund name in English"
              value={form.nameEnglish}
              onChange={handleChange}
            />
            {errors.nameEnglish && (
              <span className={styles.errorMsg}>{errors.nameEnglish}</span>
            )}
          </div>

          {/* Name (Kannada) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameKannada">
              Fund Name (Kannada)<span className={styles.required}>*</span>{' '}
              <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
            </label>
            <input
              id="nameKannada"
              name="nameKannada"
              type="text"
              className={styles.input}
              placeholder="ನಿಧಿಯ ಹೆಸರು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
              value={form.nameKannada}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="Enter description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Status */}
          <div className={styles.radioGroup}>
            {(['Active', 'Inactive'] as FundStatus[]).map((s) => (
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
      </form>
    </Modal>
  );
};

export default FundCodeModal;
