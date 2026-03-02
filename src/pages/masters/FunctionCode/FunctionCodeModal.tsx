import React, { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import styles from './ModalForm.module.css';
import type { FunctionCode, FunctionStatus } from './types';

interface FunctionCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FunctionCode, 'id'>) => void;
  initialData?: FunctionCode | null;
}

const EMPTY: Omit<FunctionCode, 'id'> = {
  functionCode: '',
  nameEnglish: '',
  nameKannada: '',
  description: '',
  status: 'Active',
};

const FunctionCodeModal: React.FC<FunctionCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEdit = Boolean(initialData);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              functionCode: initialData.functionCode,
              nameEnglish:  initialData.nameEnglish,
              nameKannada:  initialData.nameKannada,
              description:  initialData.description,
              status:       initialData.status,
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
    const errs: Partial<Record<keyof typeof EMPTY, string>> = {};
    if (!form.functionCode.trim()) errs.functionCode = 'Function Code is required';
    if (!form.nameEnglish.trim())  errs.nameEnglish  = 'Function Name (English) is required';
    if (!form.nameKannada.trim())  errs.nameKannada  = 'Function Name (Kannada) is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Function Code' : 'Add New Function Code'}
      size="md"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="function-code-form" className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isEdit ? 'Update Function Code' : 'Save Function Code'}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span>{' '}
        to {isEdit ? 'update the' : 'create a new'} function code record.
      </p>

      <form id="function-code-form" onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>

          {/* Row: code + status side-by-side */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="functionCode">
                Function Code<span className={styles.required}>*</span>
              </label>
              <input
                id="functionCode"
                name="functionCode"
                type="text"
                className={`${styles.input} ${errors.functionCode ? styles.inputError : ''}`}
                placeholder="e.g. FC-01"
                value={form.functionCode}
                onChange={handleChange}
              />
              {errors.functionCode && <span className={styles.errorMsg}>{errors.functionCode}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <div className={styles.radioGroup}>
                {(['Active', 'Inactive'] as FunctionStatus[]).map((s) => (
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

          {/* Name English */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameEnglish">
              Function Name (English)<span className={styles.required}>*</span>
            </label>
            <input
              id="nameEnglish"
              name="nameEnglish"
              type="text"
              className={`${styles.input} ${errors.nameEnglish ? styles.inputError : ''}`}
              placeholder="Enter function name in English"
              value={form.nameEnglish}
              onChange={handleChange}
            />
            {errors.nameEnglish && <span className={styles.errorMsg}>{errors.nameEnglish}</span>}
          </div>

          {/* Name Kannada */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameKannada">
              Function Name (Kannada)<span className={styles.required}>*</span>{' '}
              <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
            </label>
            <input
              id="nameKannada"
              name="nameKannada"
              type="text"
              className={`${styles.input} ${errors.nameKannada ? styles.inputError : ''}`}
              placeholder="ಕಾರ್ಯದ ಹೆಸರು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
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
              placeholder="Enter a brief description of this function code"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

        </div>
      </form>
    </Modal>
  );
};

export default FunctionCodeModal;
