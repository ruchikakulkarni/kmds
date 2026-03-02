import React from 'react';
import Modal from '../../../components/common/Modal';
import styles from './ModalForm.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const DeleteConfirmModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, message }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Confirm Delete"
    size="sm"
    footer={
      <>
        <button type="button" className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={styles.deleteConfirmBtn} onClick={onConfirm}>
          Delete
        </button>
      </>
    }
  >
    <p className={styles.confirmMessage}>{message}</p>
  </Modal>
);

export default DeleteConfirmModal;
