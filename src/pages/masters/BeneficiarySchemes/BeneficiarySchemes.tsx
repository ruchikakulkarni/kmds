import React from 'react';
import Breadcrumb from '../../../components/common/Breadcrumb';
import SchemesTab from './SchemesTab';
import styles from './BeneficiarySchemes.module.css';

const BeneficiarySchemes: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters',   href: '/masters' },
          { label: 'Schemes for Beneficiary' },
        ]}
      />

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Schemes for Beneficiary</h1>
          <p className={styles.pageSubtitle}>
            Manage beneficiary schemes — configure names, payment frequency, and availability status
          </p>
        </div>
      </div>

      {/* Content */}
      <SchemesTab />
    </div>
  );
};

export default BeneficiarySchemes;
