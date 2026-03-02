import React from 'react';
import styles from './RadioGroup.module.css';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  label?: string;
  error?: string;
  required?: boolean;
  direction?: 'horizontal' | 'vertical';
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  label,
  error,
  required,
  direction = 'horizontal',
}) => {
  return (
    <fieldset className={styles.fieldset}>
      {label && (
        <legend className={styles.legend}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </legend>
      )}
      <div className={`${styles.group} ${styles[`group--${direction}`]}`}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`${styles.option} ${opt.disabled ? styles.disabled : ''} ${value === opt.value ? styles.checked : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              disabled={opt.disabled}
              className={styles.radio}
            />
            <span className={styles.radioCustom} />
            <span className={styles.optionLabel}>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className={styles.errorText} role="alert">{error}</p>}
    </fieldset>
  );
};

export default RadioGroup;
