import React from 'react';
import Modal from '../../../components/common/Modal';
import styles from './ModalForm.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Record"
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
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="20" fill="#FFF1F0"/>
            <path d="M22 14v9M22 27v2" stroke="#FF554A" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className={styles.deleteMessage}>{message}</p>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
