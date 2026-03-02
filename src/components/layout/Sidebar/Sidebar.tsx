import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../../../context/AuthContext';
import type { Role } from '../../../context/AuthContext';

interface NavChild {
  label: string;
  path: string;
  roles: Role[];  // which roles can see this item
}

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavChild[];
}

const ALL_ROLES: Role[] = ['DMA_ADMIN', 'ULB_ADMIN'];
const DMA_ONLY: Role[]  = ['DMA_ADMIN'];
const AEE_ONLY: Role[]  = ['AEE_CREATOR'];

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    path: '/home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 7.5L9 2l6 5.5V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M7 17v-6h4v6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Masters',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    children: [
      { label: 'Charts of Accounts',          path: '/masters/charts-of-accounts',    roles: ALL_ROLES },
      { label: 'Function Code',               path: '/masters/function-code',          roles: DMA_ONLY  },
      { label: 'Services',                    path: '/masters/services',               roles: ALL_ROLES },
      { label: 'Add & Map Sub Services',      path: '/masters/add-map-sub-services',   roles: ALL_ROLES },
      { label: 'Account-Fund-SOF Mapping',    path: '/masters/account-fund-sof-mapping', roles: ALL_ROLES },
      { label: 'Budget Code',                 path: '/masters/budget-code',            roles: ALL_ROLES },
      { label: 'Bill Queue',                  path: '/masters/bill-queue',             roles: ALL_ROLES },
      { label: 'Add Bank Details',            path: '/masters/add-bank-details',       roles: ALL_ROLES },
      { label: 'Schemes for Beneficiary',     path: '/masters/schemes-beneficiary',    roles: DMA_ONLY  },
      { label: 'Work Bill Deductions',        path: '/masters/work-bill-deductions',   roles: DMA_ONLY  },
      { label: 'Vendors / Payees',            path: '/masters/vendors',                roles: ['DMA_ADMIN', 'AEE_CREATOR'] },
      { label: 'Procurement',                 path: '/masters/procurement',            roles: ['DMA_ADMIN', 'AEE_CREATOR'] },
      { label: 'File Setup',                  path: '/bill-accounting/file-setup',     roles: AEE_ONLY  },
    ],
  },
  {
    label: 'Bill Accounting',
    path: '/bill-accounting',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Transactions',
    path: '/transactions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 5h12M3 9h8M3 13h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M13 11l2 2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 13V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Budget',
    path: '/budget',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 5v4l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Audit',
    path: '/audit',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2l1.8 5.4H16L11.1 10.6l1.8 5.4L9 12.8l-3.9 3.2 1.8-5.4L2 7.4h5.2L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="9" width="5" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="5" width="5" height="11" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 14l3-4 3 2 3-5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    label: 'Help',
    path: '/help',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 13v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M7 7a2 2 0 0 1 4 0c0 2-2 2-2 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.6 3.6l1.4 1.4M13 13l1.4 1.4M3.6 14.4l1.4-1.4M13 5l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  orgName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
  orgName = 'Belgavi City Corporation',
}) => {
  const location = useLocation();
  const { role } = useAuth();

  const [expandedItem, setExpandedItem] = useState<string | null>(() => {
    for (const item of NAV_ITEMS) {
      if (item.children?.some((c) => location.pathname.startsWith(c.path))) {
        return item.label;
      }
    }
    return null;
  });

  const toggleExpand = (label: string) => {
    setExpandedItem((prev) => (prev === label ? null : label));
  };

  const renderItem = (item: NavItem) => {
    if (item.children) {
      const visibleChildren = item.children.filter(
        (c) => role && c.roles.includes(role),
      );
      if (visibleChildren.length === 0) return null;

      const isExpanded = expandedItem === item.label;
      const isActive = visibleChildren.some((c) => location.pathname.startsWith(c.path));
      return (
        <li key={item.label}>
          <button
            className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
            onClick={() => toggleExpand(item.label)}
            aria-expanded={isExpanded}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          {isExpanded && (
            <ul className={styles.subList}>
              {visibleChildren.map((child) => (
                <li key={child.path}>
                  <NavLink
                    to={child.path}
                    className={({ isActive }) =>
                      `${styles.subItem} ${isActive ? styles.subItemActive : ''}`
                    }
                    onClick={onClose}
                  >
                    {child.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.label}>
        <NavLink
          to={item.path!}
          className={({ isActive }) =>
            `${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`
          }
          onClick={onClose}
        >
          <span className={styles.navIcon}>{item.icon}</span>
          <span className={styles.navLabel}>{item.label}</span>
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        {/* Org header */}
        <div className={styles.orgHeader}>
          <div className={styles.orgAvatar}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7v11H2V7L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <rect x="7" y="11" width="6" height="7" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </div>
          <div className={styles.orgInfo}>
            <span className={styles.orgName}>{orgName}</span>
          </div>
          <button className={styles.collapseBtn} onClick={onClose} aria-label="Collapse sidebar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Main navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {NAV_ITEMS.map(renderItem)}
          </ul>
        </nav>

        {/* Bottom navigation */}
        <div className={styles.bottomNav}>
          <ul className={styles.navList}>
            {BOTTOM_ITEMS.map(renderItem)}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
