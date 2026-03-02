import React from 'react';
import Breadcrumb from '../../../components/common/Breadcrumb';
import ServicesTab from './ServicesTab';
import styles from './Services.module.css';

const Services: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters',   href: '/masters' },
          { label: 'Services' },
        ]}
      />

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Services</h1>
          <p className={styles.pageSubtitle}>
            Manage services offered by the ULB — configure codes, names, and availability status
          </p>
        </div>
      </div>

      {/* Content */}
      <ServicesTab />
    </div>
  );
};

export default Services;
