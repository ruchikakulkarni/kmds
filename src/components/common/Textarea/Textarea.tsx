import React from 'react';
import styles from './Textarea.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  required,
  className = '',
  id,
  ...rest
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`${styles.textarea} ${error ? styles.hasError : ''}`}
        aria-invalid={!!error}
        rows={4}
        {...rest}
      />
      {error && <p className={styles.errorText} role="alert">{error}</p>}
      {!error && hint && <p className={styles.hintText}>{hint}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
