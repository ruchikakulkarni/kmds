import React, { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import styles from './ModalForm.module.css';
import type { BeneficiaryScheme, SchemeFrequency, SchemeStatus } from './types';

interface SchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BeneficiaryScheme, 'id'>) => void;
  initialData?: BeneficiaryScheme | null;
}

const EMPTY: Omit<BeneficiaryScheme, 'id'> = {
  nameEnglish: '',
  nameKannada: '',
  frequency: 'Annually',
  status: 'Active',
};

const SchemeModal: React.FC<SchemeModalProps> = ({
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
              nameEnglish: initialData.nameEnglish,
              nameKannada: initialData.nameKannada,
              frequency:   initialData.frequency,
              status:      initialData.status,
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
    if (!form.nameEnglish.trim()) errs.nameEnglish = 'Scheme Name (English) is required';
    if (!form.nameKannada.trim()) errs.nameKannada = 'Scheme Name (Kannada) is required';
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
      title={isEdit ? 'Edit Beneficiary Scheme' : 'Add Beneficiary Scheme'}
      size="md"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="scheme-form" className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isEdit ? 'Update Scheme' : 'Save Scheme'}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span>{' '}
        to {isEdit ? 'update the' : 'create a new'} scheme record.
      </p>

      <form id="scheme-form" onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>

          {/* Scheme Name (English) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="scheme-nameEn">
              Scheme Name (English)<span className={styles.required}>*</span>
            </label>
            <input
              id="scheme-nameEn"
              name="nameEnglish"
              type="text"
              className={`${styles.input} ${errors.nameEnglish ? styles.inputError : ''}`}
              placeholder="Enter scheme name in English"
              value={form.nameEnglish}
              onChange={handleChange}
            />
            {errors.nameEnglish && <span className={styles.errorMsg}>{errors.nameEnglish}</span>}
          </div>

          {/* Scheme Name (Kannada) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="scheme-nameKn">
              Scheme Name (Kannada)<span className={styles.required}>*</span>{' '}
              <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
            </label>
            <input
              id="scheme-nameKn"
              name="nameKannada"
              type="text"
              className={`${styles.input} ${errors.nameKannada ? styles.inputError : ''}`}
              placeholder="ಯೋಜನೆಯ ಹೆಸರು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
              value={form.nameKannada}
              onChange={handleChange}
            />
            {errors.nameKannada && <span className={styles.errorMsg}>{errors.nameKannada}</span>}
          </div>

          {/* Scheme Frequency + Status */}
          <div className={styles.row}>

            <div className={styles.field}>
              <label className={styles.label}>Scheme Frequency</label>
              <div className={styles.radioGroup}>
                {(['Annually', 'Once in lifetime'] as SchemeFrequency[]).map(f => (
                  <label key={f} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="frequency"
                      value={f}
                      checked={form.frequency === f}
                      onChange={handleChange}
                      className={styles.radioInput}
                    />
                    <span className={`${styles.radioCustom} ${form.frequency === f ? styles.radioChecked : ''}`} />
                    <span className={styles.radioText}>{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <div className={styles.radioGroup}>
                {(['Active', 'Inactive'] as SchemeStatus[]).map(s => (
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

        </div>
      </form>
    </Modal>
  );
};

export default SchemeModal;
