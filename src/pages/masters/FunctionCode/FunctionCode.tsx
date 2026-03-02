import React from 'react';
import Breadcrumb from '../../../components/common/Breadcrumb';
import FunctionCodeTab from './FunctionCodeTab';
import styles from './FunctionCode.module.css';

const FunctionCode: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters',   href: '/masters' },
          { label: 'Function Code' },
        ]}
      />

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Function Code</h1>
          <p className={styles.pageSubtitle}>
            Manage function codes used to classify and categorise ULB activities and expenditure heads
          </p>
        </div>
      </div>

      {/* Content */}
      <FunctionCodeTab />
    </div>
  );
};

export default FunctionCode;
