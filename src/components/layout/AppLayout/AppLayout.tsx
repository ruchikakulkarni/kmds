import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Sidebar';
import styles from './AppLayout.module.css';

const AppLayout: React.FC = () => {
  // On desktop the CSS always shows the sidebar via media query override.
  // This state controls the mobile drawer.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.root}>
      <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className={styles.body}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;