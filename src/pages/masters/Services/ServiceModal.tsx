import React, { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import styles from './ModalForm.module.css';
import type { Service, ServiceStatus } from './types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Service, 'id'>) => void;
  initialData?: Service | null;
}

const EMPTY: Omit<Service, 'id'> = {
  serviceCode: '',
  nameEnglish: '',
  nameKannada: '',
  status: 'Active',
};

const ServiceModal: React.FC<ServiceModalProps> = ({
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
              serviceCode: initialData.serviceCode,
              nameEnglish: initialData.nameEnglish,
              nameKannada: initialData.nameKannada,
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
    if (!form.serviceCode.trim()) errs.serviceCode = 'Service Code is required';
    if (!form.nameEnglish.trim()) errs.nameEnglish = 'Service Name (English) is required';
    if (!form.nameKannada.trim()) errs.nameKannada = 'Service Name (Kannada) is required';
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
      title={isEdit ? 'Edit Service' : 'Add New Service'}
      size="md"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="service-form" className={styles.submitBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isEdit ? 'Update Service' : 'Save Service'}
          </button>
        </div>
      }
    >
      <p className={styles.hint}>
        Fill in all required fields marked with <span className={styles.required}>*</span>{' '}
        to {isEdit ? 'update the' : 'create a new'} service record.
      </p>

      <form id="service-form" onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>

          {/* Service Name (English) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="svc-nameEn">
              Service Name (English)<span className={styles.required}>*</span>
            </label>
            <input
              id="svc-nameEn"
              name="nameEnglish"
              type="text"
              className={`${styles.input} ${errors.nameEnglish ? styles.inputError : ''}`}
              placeholder="Enter service name in English"
              value={form.nameEnglish}
              onChange={handleChange}
            />
            {errors.nameEnglish && <span className={styles.errorMsg}>{errors.nameEnglish}</span>}
          </div>

          {/* Service Name (Kannada) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="svc-nameKn">
              Service Name (Kannada)<span className={styles.required}>*</span>{' '}
              <span className={styles.kannadaHint}>(ಕನ್ನಡ)</span>
            </label>
            <input
              id="svc-nameKn"
              name="nameKannada"
              type="text"
              className={`${styles.input} ${errors.nameKannada ? styles.inputError : ''}`}
              placeholder="ಸೇವೆಯ ಹೆಸರು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
              value={form.nameKannada}
              onChange={handleChange}
            />
            {errors.nameKannada && <span className={styles.errorMsg}>{errors.nameKannada}</span>}
          </div>

          {/* Service Code + Status */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="svc-code">
                Service Code<span className={styles.required}>*</span>
              </label>
              <input
                id="svc-code"
                name="serviceCode"
                type="text"
                className={`${styles.input} ${errors.serviceCode ? styles.inputError : ''}`}
                placeholder="e.g. SVC-001"
                value={form.serviceCode}
                onChange={handleChange}
              />
              {errors.serviceCode && <span className={styles.errorMsg}>{errors.serviceCode}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <div className={styles.radioGroup}>
                {(['Active', 'Inactive'] as ServiceStatus[]).map(s => (
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

        </div>
      </form>
    </Modal>
  );
};

export default ServiceModal;
