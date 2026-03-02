import React from 'react';
import Modal from '../../../components/common/Modal';
import styles from './ModalForm.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Scheme"
      size="sm"
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.deleteConfirmBtn} onClick={onConfirm}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M6 4V2.5h4V4M6.5 7v5M9.5 7v5M3 4l.9 9.5h8.2L13 4"
                stroke="white"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Delete
          </button>
        </div>
      }
    >
      <div className={styles.deleteBody}>
        <div className={styles.deleteIcon}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="#FFF1F0"/>
            <path d="M24 16v10M24 30v2" stroke="#FF554A" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className={styles.deleteMessage}>
          Are you sure you want to delete this Scheme record?
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
