import React from 'react';
import Breadcrumb from '../../../components/common/Breadcrumb';
import BudgetCodeTab from './BudgetCodeTab';
import styles from './BudgetCode.module.css';

const BudgetCode: React.FC = () => {
  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters',   href: '/masters' },
          { label: 'Budget Code Master' },
        ]}
      />

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Budget Code Master</h1>
          <p className={styles.pageSubtitle}>
            Define and manage budget codes by linking account codes and function codes for ULB financial planning
          </p>
        </div>
      </div>

      <BudgetCodeTab />
    </div>
  );
};

export default BudgetCode;
