import React from 'react';
import Breadcrumb from '../../../components/common/Breadcrumb';
import VendorsTab from './VendorsTab';
import styles from './Vendors.module.css';

const Vendors: React.FC = () => {
  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters', href: '/masters' },
          { label: 'Vendors / Payees' },
        ]}
      />

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Vendors / Payees</h1>
          <p className={styles.pageSubtitle}>
            Manage payees — Beneficiary, Employee, Statutory, and Vendor — with associated
            PAN, bank, and GST details
          </p>
        </div>
      </div>

      <VendorsTab />
    </div>
  );
};

export default Vendors;
