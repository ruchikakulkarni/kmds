import React from 'react';
import Breadcrumb from '../../../components/common/Breadcrumb';
import BillQueueTab from './BillQueueTab';
import styles from './BillQueue.module.css';

const BillQueue: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters',   href: '/masters' },
          { label: 'Bill Queue' },
        ]}
      />

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bill Queue</h1>
          <p className={styles.pageSubtitle}>
            Manage bill queues — configure descriptions and availability status
          </p>
        </div>
      </div>

      {/* Content */}
      <BillQueueTab />
    </div>
  );
};

export default BillQueue;
