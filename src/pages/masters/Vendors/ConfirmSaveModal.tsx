import React from 'react';
import Modal from '../../../components/common/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmSaveModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Save"
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              height: '36px',
              padding: '0 1rem',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-body-xs)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              height: '36px',
              padding: '0 1.25rem',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-500)',
              color: '#fff',
              fontSize: 'var(--text-body-xs)',
              fontWeight: 'var(--font-semibold)',
              cursor: 'pointer',
            }}
          >
            Confirm
          </button>
        </div>
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.5rem 0',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--color-primary-25, #eef4ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              stroke="var(--color-primary-500)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p
          style={{
            fontSize: 'var(--text-body-sm, 0.875rem)',
            color: 'var(--color-text-primary)',
            maxWidth: '280px',
            lineHeight: 1.5,
          }}
        >
          Are you sure you want to save vendor details?
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmSaveModal;
