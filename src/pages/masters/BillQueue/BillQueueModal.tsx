import React, { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import styles from './ModalForm.module.css';
import type { BillQueue, BillQueueStatus } from './types';

interface BillQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BillQueue, 'id'>) => void;
  initialData?: BillQueue | null;
}

const EMPTY: Omit<BillQueue, 'id'> = {
  descriptionEnglish: '',
  descriptionKannada: '',
  status: 'Active',
};

const BillQueueModal: React.FC<BillQueueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEdit = Boolean(initialData);

  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});

  /* Reset form when modal opens */
  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              descriptionEnglish: initialData.descriptionEnglish,
              descriptionKannada: initialData.descriptionKannada,
              status:             initialData.status,
            }
          : EMPTY,
      );
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof typeof EMPTY, string>> = {};
    if (!form.descriptionEnglish.trim()) errs.descriptionEnglish = 'Bill Queue Description (English) is required';
    if (!form.descriptionKannada.trim()) errs.descriptionKannada = 'Bill Queue Description (Kannada) is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Bill Queue' : 'Add New Bill Queue'}
      size="md"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="bill-queue-form" className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isEdit ? 'Update Bill Queue' : 'Save Bill Queue'}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span>{' '}
        to {isEdit ? 'update the' : 'create a new'} bill queue record.
      </p>

      <form id="bill-queue-form" onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>

          {/* Bill Queue Description (English) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bq-descEn">
              Bill Queue Description (English)<span className={styles.required}>*</span>
            </label>
            <input
              id="bq-descEn"
              name="descriptionEnglish"
              type="text"
              className={`${styles.input} ${errors.descriptionEnglish ? styles.inputError : ''}`}
              placeholder="Enter bill queue description in English"
              value={form.descriptionEnglish}
              onChange={handleChange}
            />
            {errors.descriptionEnglish && <span className={styles.errorMsg}>{errors.descriptionEnglish}</span>}
          </div>

          {/* Bill Queue Description (Kannada) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bq-descKn">
              Bill Queue Description (Kannada)<span className={styles.required}>*</span>{' '}
              <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
            </label>
            <input
              id="bq-descKn"
              name="descriptionKannada"
              type="text"
              className={`${styles.input} ${errors.descriptionKannada ? styles.inputError : ''}`}
              placeholder="ಬಿಲ್ ಕ್ಯೂ ವಿವರಣೆ ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
              value={form.descriptionKannada}
              onChange={handleChange}
            />
            {errors.descriptionKannada && <span className={styles.errorMsg}>{errors.descriptionKannada}</span>}
          </div>

          {/* Status */}
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <div className={styles.radioGroup}>
              {(['Active', 'Inactive'] as BillQueueStatus[]).map(s => (
                <label key={s} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  <span className={`${styles.radioCustom} ${form.status === s ? styles.radioChecked : ''}`}/>
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

export default BillQueueModal;
