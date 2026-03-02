import React from 'react';
import Breadcrumb from '../../../components/common/Breadcrumb';
import SubServicesTab from './SubServicesTab';
import styles from './SubServices.module.css';

const SubServices: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters',   href: '/masters' },
          { label: 'Add & Map Sub-Services' },
        ]}
      />

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Add &amp; Map Sub-Services</h1>
          <p className={styles.pageSubtitle}>
            Configure sub-service codes, map them to account codes and funds, and assign bank accounts for ULB collections
          </p>
        </div>
      </div>

      {/* Content */}
      <SubServicesTab />
    </div>
  );
};

export default SubServices;
